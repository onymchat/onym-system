import {
  createHash,
  createPrivateKey,
  createPublicKey,
  sign,
  verify,
} from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const here = dirname(fileURLToPath(import.meta.url));
const utf8 = new TextDecoder("utf-8", { fatal: true });

const assertUnicodeScalars = (value) => {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!Number.isInteger(next) || next < 0xdc00 || next > 0xdfff) {
        throw new SyntaxError("lone high surrogate");
      }
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw new SyntaxError("lone low surrogate");
    }
  }
};

const parseStrictJson = (text) => {
  let offset = 0;
  const fail = (message) => {
    throw new SyntaxError(`${message} at byte-oriented character offset ${offset}`);
  };
  const whitespace = () => {
    while (/[\u0009\u000a\u000d\u0020]/.test(text[offset] ?? "")) offset += 1;
  };
  const parseString = () => {
    if (text[offset] !== '"') fail("expected string");
    const start = offset;
    offset += 1;
    while (offset < text.length) {
      const code = text.charCodeAt(offset);
      if (code === 0x22) {
        offset += 1;
        const value = JSON.parse(text.slice(start, offset));
        assertUnicodeScalars(value);
        return value;
      }
      if (code === 0x5c) {
        offset += 1;
        const escape = text[offset];
        if (escape === "u") {
          if (!/^[0-9a-fA-F]{4}$/.test(text.slice(offset + 1, offset + 5))) {
            fail("invalid Unicode escape");
          }
          offset += 5;
        } else if ('"\\/bfnrt'.includes(escape ?? "")) {
          offset += 1;
        } else {
          fail("invalid string escape");
        }
      } else {
        if (code < 0x20) fail("unescaped control character");
        offset += 1;
      }
    }
    fail("unterminated string");
  };
  const parseNumber = () => {
    const match = text
      .slice(offset)
      .match(/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/);
    if (!match) fail("invalid number");
    offset += match[0].length;
    const value = Number(match[0]);
    if (!Number.isFinite(value)) fail("non-I-JSON number");
    return value;
  };
  const parseValue = () => {
    whitespace();
    if (text[offset] === '"') return parseString();
    if (text[offset] === "{") {
      offset += 1;
      const value = {};
      const keys = new Set();
      whitespace();
      if (text[offset] === "}") {
        offset += 1;
        return value;
      }
      while (true) {
        whitespace();
        const key = parseString();
        if (keys.has(key)) fail(`duplicate object key ${JSON.stringify(key)}`);
        keys.add(key);
        whitespace();
        if (text[offset] !== ":") fail("expected colon");
        offset += 1;
        value[key] = parseValue();
        whitespace();
        if (text[offset] === "}") {
          offset += 1;
          return value;
        }
        if (text[offset] !== ",") fail("expected comma");
        offset += 1;
      }
    }
    if (text[offset] === "[") {
      offset += 1;
      const value = [];
      whitespace();
      if (text[offset] === "]") {
        offset += 1;
        return value;
      }
      while (true) {
        value.push(parseValue());
        whitespace();
        if (text[offset] === "]") {
          offset += 1;
          return value;
        }
        if (text[offset] !== ",") fail("expected comma");
        offset += 1;
      }
    }
    for (const [token, value] of [
      ["true", true],
      ["false", false],
      ["null", null],
    ]) {
      if (text.startsWith(token, offset)) {
        offset += token.length;
        return value;
      }
    }
    return parseNumber();
  };

  const value = parseValue();
  whitespace();
  if (offset !== text.length) fail("trailing data");
  return value;
};

const readUtf8 = async (path) =>
  utf8.decode(await readFile(resolve(here, path)));
const loadJson = async (path) => parseStrictJson(await readUtf8(path));

const canonicalize = (value) => {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("non-finite JSON number");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`)
      .join(",")}}`;
  }
  throw new Error(`unsupported JSON value: ${typeof value}`);
};

const digest = (domain, schemaName, canonical) =>
  `sha256:${createHash("sha256")
    .update(`${domain}\0${schemaName}\0`, "utf8")
    .update(canonical, "utf8")
    .digest("hex")}`;

const omitProofField = (value) => {
  const proofFields = ["signature", "authorization"].filter((field) =>
    Object.hasOwn(value, field),
  );
  if (proofFields.length !== 1) {
    throw new Error(`expected exactly one top-level proof field, got ${proofFields}`);
  }
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => key !== proofFields[0]),
  );
};

const decimal = (value) => {
  const match = /^(0|[1-9][0-9]*)(?:\.([0-9]+))?$/.exec(value);
  if (!match) throw new Error(`invalid decimal amount: ${value}`);
  const fraction = match[2] ?? "";
  return { coefficient: BigInt(`${match[1]}${fraction}`), scale: fraction.length };
};

const equalDecimalSum = (gross, net, fees) => {
  const values = [decimal(gross), decimal(net), ...fees.map(decimal)];
  const scale = Math.max(...values.map((value) => value.scale));
  const normalize = (value) =>
    value.coefficient * 10n ** BigInt(scale - value.scale);
  return (
    normalize(values[0]) ===
    values.slice(1).reduce((sum, value) => sum + normalize(value), 0n)
  );
};

const STABLE_ID_FIELDS = new Map([
  ["DonationIntent", "intentId"],
  ["AidClaim", "claimId"],
]);

const schema = await loadJson("../schemas/charity-v1.schema.json");
const manifest = await loadJson("fixtures/manifest.json");
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
ajv.addKeyword({ keyword: "x-canonicalMaxBytes", schemaType: "number" });
ajv.addSchema(schema);
const validators = new Map();
const validator = (definition) => {
  if (!validators.has(definition)) {
    validators.set(
      definition,
      ajv.compile({ $ref: `${schema.$id}#/$defs/${definition}` }),
    );
  }
  return validators.get(definition);
};
for (const definition of Object.keys(schema.$defs)) validator(definition);

let failures = 0;
const fail = (message, details) => {
  failures += 1;
  console.error(message);
  if (details) console.error(details);
};

for (const fixture of manifest.schemaCases) {
  const value = await loadJson(`fixtures/${fixture.file}`);
  const validate = validator(fixture.schema);
  const actual = validate(value);
  if (actual !== fixture.valid) {
    fail(`${fixture.file}: expected valid=${fixture.valid}, got ${actual}`, validate.errors);
  }
}

for (const fixture of manifest.strictJsonCases) {
  let actual = true;
  try {
    await loadJson(`fixtures/${fixture.file}`);
  } catch {
    actual = false;
  }
  if (actual !== fixture.valid) {
    fail(`${fixture.file}: expected strict JSON valid=${fixture.valid}, got ${actual}`);
  }
}

for (const vector of manifest.canonicalizationCases) {
  const value = await loadJson(`fixtures/${vector.file}`);
  const canonical = canonicalize(value);
  const objectDigest = digest("onym:charity:object:v1", vector.schema, canonical);
  let authorizationDigest;
  if (vector.authorizationDigest) {
    authorizationDigest = digest(
      "onym:charity:authorization:v1",
      vector.schema,
      canonicalize(omitProofField(value)),
    );
  }
  const limit = schema.$defs[vector.schema]?.["x-canonicalMaxBytes"];
  if (limit && Buffer.byteLength(canonical, "utf8") > limit) {
    fail(`${vector.file}: exceeds ${limit} canonical bytes for ${vector.schema}`);
  }
  if (
    canonical !== vector.canonical ||
    objectDigest !== vector.objectDigest ||
    authorizationDigest !== vector.authorizationDigest
  ) {
    fail(`${vector.file}: canonicalization vector mismatch`, {
      canonical,
      objectDigest,
      authorizationDigest,
    });
  }
}

const publicKeyFromRaw = (raw) =>
  createPublicKey({
    key: Buffer.concat([
      Buffer.from("302a300506032b6570032100", "hex"),
      Buffer.from(raw, "hex"),
    ]),
    format: "der",
    type: "spki",
  });

for (const authorizationCase of manifest.authorizationCases) {
  const value = await loadJson(`fixtures/${authorizationCase.objectFile}`);
  const vector = await loadJson(`fixtures/${authorizationCase.signatureFile}`);
  const proofField = Object.hasOwn(value, "authorization")
    ? "authorization"
    : "signature";
  const authorizationDigest = digest(
    "onym:charity:authorization:v1",
    authorizationCase.schema,
    canonicalize(omitProofField(value)),
  );
  let verified = false;
  try {
    verified = verify(
      null,
      Buffer.from(authorizationDigest.slice("sha256:".length), "hex"),
      publicKeyFromRaw(vector.publicKey),
      Buffer.from(value[proofField].slice("ed25519:".length), "hex"),
    );
  } catch {
    verified = false;
  }
  if (
    value[proofField] !== vector.signature ||
    authorizationDigest !== vector.messageDigest ||
    !verified
  ) {
    fail(`${authorizationCase.objectFile}: authorization binding mismatch`);
  }
}

for (const signatureCase of manifest.signatureCases) {
  const vector = await loadJson(`fixtures/${signatureCase.file}`);
  let verified = false;
  try {
    if (vector.suite !== "onym:charity-signature:ed25519-v1") {
      throw new Error(`unsupported suite ${vector.suite}`);
    }
    if (!/^[0-9a-f]{64}$/.test(vector.publicKey)) {
      throw new Error("invalid raw Ed25519 public key encoding");
    }
    if (!/^sha256:[0-9a-f]{64}$/.test(vector.messageDigest)) {
      throw new Error("invalid message digest encoding");
    }
    if (!/^ed25519:[0-9a-f]{128}$/.test(vector.signature)) {
      throw new Error("invalid Ed25519 signature encoding");
    }
    const publicKey = publicKeyFromRaw(vector.publicKey);
    const message = Buffer.from(vector.messageDigest.slice("sha256:".length), "hex");
    const signature = Buffer.from(vector.signature.slice("ed25519:".length), "hex");
    verified = verify(null, message, publicKey, signature);

    if (signatureCase.reproduce) {
      const seed = Buffer.from(vector.privateSeed, "hex");
      const privateKey = createPrivateKey({
        key: Buffer.concat([
          Buffer.from("302e020100300506032b657004220420", "hex"),
          seed,
        ]),
        format: "der",
        type: "pkcs8",
      });
      const derivedPublicKey = createPublicKey(privateKey)
        .export({ format: "der", type: "spki" })
        .subarray(-32)
        .toString("hex");
      const reproduced = sign(null, message, privateKey).toString("hex");
      if (derivedPublicKey !== vector.publicKey || reproduced !== signature.toString("hex")) {
        fail(`${vector.name}: fixed-seed reproduction mismatch`);
      }
    }
  } catch (error) {
    if (signatureCase.valid) fail(`${vector.name}: ${error.message}`);
  }
  if (verified !== signatureCase.valid) {
    fail(`${vector.name}: expected signature valid=${signatureCase.valid}, got ${verified}`);
  }
}

for (const fixture of manifest.sizeCases) {
  const recipe = await loadJson(`fixtures/${fixture.file}`);
  const base = await loadJson(`fixtures/${recipe.baseFile}`);
  const value = {
    ...base,
    [recipe.repeatField]: Array.from({ length: recipe.repeatCount }, () => ({
      ...recipe.item,
    })),
  };
  const validate = validator(fixture.schema);
  if (!validate(value)) {
    fail(`${fixture.file}: generated size vector must remain schema-valid`, validate.errors);
    continue;
  }
  const limit = schema.$defs[fixture.schema]?.["x-canonicalMaxBytes"];
  if (!limit) {
    fail(`${fixture.file}: no normative size limit for ${fixture.schema}`);
    continue;
  }
  const actual = Buffer.byteLength(canonicalize(value), "utf8") <= limit;
  if (actual !== fixture.valid) {
    fail(`${fixture.file}: expected size-valid=${fixture.valid}, got ${actual}`);
  }
}

for (const replayCase of manifest.replayCases) {
  const idField = STABLE_ID_FIELDS.get(replayCase.schema);
  if (!idField) {
    fail(`no stable identifier rule for ${replayCase.schema}`);
    continue;
  }
  const seen = new Map();
  let actual = true;
  for (const file of replayCase.files) {
    const value = await loadJson(`fixtures/${file}`);
    const validate = validator(replayCase.schema);
    if (!validate(value)) {
      fail(`${file}: replay vector must remain schema-valid`, validate.errors);
      actual = false;
      break;
    }
    const canonical = canonicalize(value);
    if (seen.has(value[idField]) && seen.get(value[idField]) !== canonical) {
      actual = false;
      break;
    }
    seen.set(value[idField], canonical);
  }
  if (actual !== replayCase.valid) {
    fail(`replay case ${replayCase.files.join(", ")}: expected valid=${replayCase.valid}, got ${actual}`);
  }
}

for (const fixture of manifest.feeArithmeticCases) {
  const value = await loadJson(`fixtures/${fixture.file}`);
  const validate = validator("DonationQuote");
  const schemaValid = validate(value);
  if (schemaValid !== fixture.schemaValid) {
    fail(`${fixture.file}: expected schemaValid=${fixture.schemaValid}, got ${schemaValid}`, validate.errors);
    continue;
  }
  if (!schemaValid) continue;
  try {
    const arithmeticValid = equalDecimalSum(
      value.grossAmount,
      value.netAmount,
      value.fees.map((fee) => fee.amount),
    );
    if (arithmeticValid !== fixture.arithmeticValid) {
      fail(`${fixture.file}: expected arithmeticValid=${fixture.arithmeticValid}, got ${arithmeticValid}`);
    }
  } catch (error) {
    fail(`${fixture.file}: arithmetic check threw: ${error.message}`);
  }
}

if (failures > 0) process.exitCode = 1;
else {
  console.log(
    `verified ${manifest.schemaCases.length} schema, ` +
      `${manifest.strictJsonCases.length} strict JSON, ` +
      `${manifest.canonicalizationCases.length} canonicalization, ` +
      `${manifest.signatureCases.length} signature, ` +
      `${manifest.authorizationCases.length} authorization binding, ` +
      `${manifest.sizeCases.length} size, ` +
      `${manifest.replayCases.length} replay, and ` +
      `${manifest.feeArithmeticCases.length} fee vectors`,
  );
}

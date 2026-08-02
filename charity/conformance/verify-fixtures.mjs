import { createHash, createPrivateKey, createPublicKey, sign, verify } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const here = dirname(fileURLToPath(import.meta.url));
const loadJson = async (path) =>
  JSON.parse(await readFile(resolve(here, path), "utf8"));

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

const omitTopLevel = (value, fields) =>
  Object.fromEntries(Object.entries(value).filter(([key]) => !fields.includes(key)));

const decimal = (value) => {
  const [whole, fraction = ""] = value.split(".");
  return { coefficient: BigInt(`${whole}${fraction}`), scale: fraction.length };
};

const equalDecimalSum = (gross, net, fees) => {
  const values = [decimal(gross), decimal(net), ...fees.map(decimal)];
  const scale = Math.max(...values.map((value) => value.scale));
  const normalize = (value) => value.coefficient * 10n ** BigInt(scale - value.scale);
  return normalize(values[0]) === values.slice(1).reduce((sum, value) => sum + normalize(value), 0n);
};

const schema = await loadJson("../schemas/charity-v1.schema.json");
const manifest = await loadJson("fixtures/manifest.json");
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
ajv.addSchema(schema);
for (const definition of Object.keys(schema.$defs)) {
  ajv.compile({ $ref: `${schema.$id}#/$defs/${definition}` });
}

let failures = 0;
for (const fixture of manifest.schemaCases) {
  const value = await loadJson(`fixtures/${fixture.file}`);
  const validate = ajv.compile({ $ref: `${schema.$id}#/$defs/${fixture.schema}` });
  const actual = validate(value);
  if (actual !== fixture.valid) {
    failures += 1;
    console.error(`${fixture.file}: expected valid=${fixture.valid}, got ${actual}`);
    if (validate.errors) console.error(validate.errors);
  }
}

for (const vector of manifest.canonicalizationCases) {
  const value = await loadJson(`fixtures/${vector.file}`);
  const canonical = canonicalize(value);
  if (Buffer.byteLength(canonical, "utf8") > vector.maxBytes) {
    failures += 1;
    console.error(`${vector.file}: exceeds ${vector.maxBytes} canonical bytes`);
  }
  const unsignedCanonical = canonicalize(omitTopLevel(value, vector.omit));
  const objectDigest = digest("onym:charity:object:v1", vector.schema, canonical);
  const authorizationDigest = digest(
    "onym:charity:authorization:v1",
    vector.schema,
    unsignedCanonical,
  );
  if (canonical !== vector.canonical || objectDigest !== vector.objectDigest || authorizationDigest !== vector.authorizationDigest) {
    failures += 1;
    console.error(`${vector.file}: canonicalization vector mismatch`);
    console.error({ canonical, objectDigest, authorizationDigest });
  }
}

for (const signatureCase of manifest.signatureCases) {
  const vector = await loadJson(`fixtures/${signatureCase.file}`);
  const seed = Buffer.from(vector.privateSeed, "hex");
  const pkcs8 = Buffer.concat([
    Buffer.from("302e020100300506032b657004220420", "hex"),
    seed,
  ]);
  const privateKey = createPrivateKey({ key: pkcs8, format: "der", type: "pkcs8" });
  const publicKey = createPublicKey(privateKey);
  const rawPublicKey = publicKey.export({ format: "der", type: "spki" }).subarray(-32).toString("hex");
  const message = Buffer.from(vector.messageDigest.replace(/^sha256:/, ""), "hex");
  const actualSignature = sign(null, message, privateKey).toString("hex");
  const expectedSignature = vector.signature.replace(/^ed25519:/, "");
  const verified = verify(null, message, publicKey, Buffer.from(expectedSignature, "hex"));
  if (rawPublicKey !== vector.publicKey || actualSignature !== expectedSignature || !verified) {
    failures += 1;
    console.error(`${vector.name}: Ed25519 signature vector mismatch`);
  }
}

for (const fixture of manifest.feeArithmeticCases) {
  const value = await loadJson(`fixtures/${fixture.file}`);
  const actual = equalDecimalSum(value.grossAmount, value.netAmount, value.fees.map((fee) => fee.amount));
  if (actual !== fixture.valid) {
    failures += 1;
    console.error(`${fixture.file}: expected fee arithmetic valid=${fixture.valid}, got ${actual}`);
  }
}

if (failures > 0) process.exitCode = 1;
else console.log(`verified ${manifest.schemaCases.length} schema cases, ${manifest.canonicalizationCases.length} canonicalization vectors, ${manifest.signatureCases.length} signature vectors, and ${manifest.feeArithmeticCases.length} fee vectors`);

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const vectors = JSON.parse(readFileSync("vectors/v1/core.json", "utf8"));
for (const vector of vectors) {
  if (vector.schemaVersion !== 1 || !vector.description || !vector.provenance) {
    throw new Error(`Invalid vector metadata: ${vector.id}`);
  }
  if (vector.class === "proposal_payload_sha256") {
    const hash = createHash("sha256")
      .update(vector.input.canonical, "utf8")
      .digest("hex");
    if (hash !== vector.expected.sha256)
      throw new Error(`Hash mismatch: ${vector.id}`);
  }
  if (vector.class === "account_discriminator") {
    const prefix = createHash("sha256")
      .update(vector.input.preimage, "utf8")
      .digest("hex")
      .slice(0, 16);
    if (prefix !== vector.expected.sha256PrefixHex)
      throw new Error(`Discriminator mismatch: ${vector.id}`);
  }
  if (vector.class === "fee_cap_arithmetic") {
    const cap = BigInt(vector.input.capLamports);
    const actual = BigInt(vector.input.actualLamports);
    if (actual <= cap !== vector.expected.accepted)
      throw new Error(`Fee result mismatch: ${vector.id}`);
  }
  if (vector.class === "signer_set_version") {
    const accepted =
      vector.input.nextVersion === vector.input.currentVersion + 1;
    if (accepted !== vector.expected.accepted)
      throw new Error(`Version result mismatch: ${vector.id}`);
  }
}
console.log(`${vectors.length} vectors passed.`);

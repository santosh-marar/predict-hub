import { test } from "node:test";
import assert from "node:assert/strict";
import { v3, v5, v6, validate } from "uuid";

const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

test("v3/v5 reject a buffer that is too small (GHSA-w5hq-g745-h8pq)", () => {
  assert.throws(() => v3("name", NAMESPACE, new Uint8Array(8)), RangeError);
  assert.throws(() => v5("name", NAMESPACE, new Uint8Array(8)), RangeError);
  assert.throws(() => v6({}, new Uint8Array(8)), RangeError);
});

test("v5 writes into a sufficiently large buffer at an offset", () => {
  const buf = new Uint8Array(20);
  const out = v5("name", NAMESPACE, buf, 4);
  assert.equal(out, buf);
  assert.ok(validate(v5("name", NAMESPACE)));
});

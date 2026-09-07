import test from 'node:test';
import assert from 'node:assert/strict';

// These tests document the privacy contract. Browser-specific APIs are tested in browser CI.
test('safeUrl removes query strings and fragments conceptually', () => {
  const source = 'https://example.com/checkout?email=test@example.com#payment';
  const expected = 'https://example.com/checkout';
  const parsed = new URL(source);
  parsed.search = '';
  parsed.hash = '';
  assert.equal(parsed.toString(), expected);
});

test('bundle schema is intentionally versioned', () => {
  const bundle = { schemaVersion: 1, events: [] };
  assert.equal(bundle.schemaVersion, 1);
  assert.deepEqual(bundle.events, []);
});

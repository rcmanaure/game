import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateArt } from '../art.js';

// Mock fetch for test isolation (no real OpenRouter calls, no API cost)
const originalFetch = global.fetch;
let mockFetchFn: ((url: string, init?: RequestInit) => Promise<Response>) | null = null;

function setMockFetch(fn: (url: string, init?: RequestInit) => Promise<Response>) {
  mockFetchFn = fn;
  (global as any).fetch = (url: string, init?: RequestInit) =>
    mockFetchFn?.(url, init) ?? Promise.reject(new Error('No mock fetch'));
}

function restoreFetch() {
  global.fetch = originalFetch;
  mockFetchFn = null;
}

test('generateArt returns placeholder when DISABLE_IMAGE_GEN=true', async () => {
  const originalEnv = process.env.DISABLE_IMAGE_GEN;
  process.env.DISABLE_IMAGE_GEN = 'true';

  const result = await generateArt('test-archetype');

  assert.ok('url' in result);
  assert.ok((result as any).url.includes('picsum.photos'));
  assert.ok((result as any).url.includes('test-archetype'));

  process.env.DISABLE_IMAGE_GEN = originalEnv;
});

test('generateArt returns error on network failure', async () => {
  const originalEnv = process.env.DISABLE_IMAGE_GEN;
  process.env.DISABLE_IMAGE_GEN = 'false'; // Force real fetch path
  process.env.OPENROUTER_API_KEY = 'test-key';

  setMockFetch(() => Promise.reject(new Error('Network timeout')));

  const result = await generateArt('test-archetype');

  assert.ok('error' in result);
  assert.ok((result as any).error.includes('network error'));

  restoreFetch();
  process.env.DISABLE_IMAGE_GEN = originalEnv;
  delete process.env.OPENROUTER_API_KEY;
});

test('generateArt returns error on non-200 response', async () => {
  const originalEnv = process.env.DISABLE_IMAGE_GEN;
  process.env.DISABLE_IMAGE_GEN = 'false';
  process.env.OPENROUTER_API_KEY = 'test-key';

  setMockFetch(async () => {
    const response = new Response('Unauthorized', { status: 401 });
    return response;
  });

  const result = await generateArt('test-archetype');

  assert.ok('error' in result);
  assert.ok((result as any).error.includes('401'));

  restoreFetch();
  process.env.DISABLE_IMAGE_GEN = originalEnv;
  delete process.env.OPENROUTER_API_KEY;
});

test('generateArt returns error on unrecognized response shape', async () => {
  const originalEnv = process.env.DISABLE_IMAGE_GEN;
  process.env.DISABLE_IMAGE_GEN = 'false';
  process.env.OPENROUTER_API_KEY = 'test-key';

  setMockFetch(async () => {
    return new Response(JSON.stringify({ unexpected: 'shape' }), { status: 200 });
  });

  const result = await generateArt('test-archetype');

  assert.ok('error' in result);
  assert.ok((result as any).error.includes('unrecognized response shape'));

  restoreFetch();
  process.env.DISABLE_IMAGE_GEN = originalEnv;
  delete process.env.OPENROUTER_API_KEY;
});

test('generateArt returns url on valid OpenAI-style response', async () => {
  const originalEnv = process.env.DISABLE_IMAGE_GEN;
  process.env.DISABLE_IMAGE_GEN = 'false';
  process.env.OPENROUTER_API_KEY = 'test-key';

  setMockFetch(async () => {
    return new Response(
      JSON.stringify({
        data: [{ url: 'https://example.com/image.png' }],
      }),
      { status: 200 }
    );
  });

  const result = await generateArt('test-archetype');

  assert.ok('url' in result);
  assert.equal((result as any).url, 'https://example.com/image.png');

  restoreFetch();
  process.env.DISABLE_IMAGE_GEN = originalEnv;
  delete process.env.OPENROUTER_API_KEY;
});

test('generateArt returns b64_json as data URI on valid response', async () => {
  const originalEnv = process.env.DISABLE_IMAGE_GEN;
  process.env.DISABLE_IMAGE_GEN = 'false';
  process.env.OPENROUTER_API_KEY = 'test-key';

  setMockFetch(async () => {
    return new Response(
      JSON.stringify({
        images: [{ b64_json: 'ABC123' }],
      }),
      { status: 200 }
    );
  });

  const result = await generateArt('test-archetype');

  assert.ok('url' in result);
  assert.ok((result as any).url.startsWith('data:image/png;base64,'));
  assert.ok((result as any).url.includes('ABC123'));

  restoreFetch();
  process.env.DISABLE_IMAGE_GEN = originalEnv;
  delete process.env.OPENROUTER_API_KEY;
});

test('generateArt handles referenceImageUrls for edit chain (T27)', async () => {
  const originalEnv = process.env.DISABLE_IMAGE_GEN;
  process.env.DISABLE_IMAGE_GEN = 'false';
  process.env.OPENROUTER_API_KEY = 'test-key';

  let capturedBody: any = null;
  setMockFetch(async (url, init) => {
    capturedBody = JSON.parse((init?.body as string) || '{}');
    return new Response(
      JSON.stringify({
        data: [{ url: 'https://example.com/edited.png' }],
      }),
      { status: 200 }
    );
  });

  const result = await generateArt('test-archetype', [
    'https://example.com/reference.png',
  ]);

  assert.ok('url' in result);
  assert.ok(capturedBody.input_references);
  assert.equal(capturedBody.input_references.length, 1);
  assert.equal(capturedBody.input_references[0].type, 'image_url');

  restoreFetch();
  process.env.DISABLE_IMAGE_GEN = originalEnv;
  delete process.env.OPENROUTER_API_KEY;
});

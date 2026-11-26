import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiClient, resolveApiBaseUrl, extractApiErrorMessage } from '../src/services/api.js';

test('resolveApiBaseUrl usa /api em DEV quando VITE_API_URL está ausente', () => {
  assert.equal(resolveApiBaseUrl({ DEV: true, PROD: false }), '/api');
});

test('resolveApiBaseUrl retorna vazio em PROD quando VITE_API_URL está ausente (sem localhost)', () => {
  assert.equal(resolveApiBaseUrl({ DEV: false, PROD: true }), '');
});

test('resolveApiBaseUrl remove barra final de VITE_API_URL', () => {
  assert.equal(
    resolveApiBaseUrl({ DEV: false, PROD: true, VITE_API_URL: 'https://api.cfi.example/api/' }),
    'https://api.cfi.example/api'
  );
});

test('ApiClient falha explicitamente sem URL configurada em produção', async () => {
  const client = new ApiClient('');
  await assert.rejects(
    () => client.get('/transactions'),
    (err) => err.isConfigError === true && err.status === 0
  );
});

test('ApiClient trata 204 No Content em DELETE sem erro de JSON', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(null, { status: 204 });

  try {
    const client = new ApiClient('https://api.cfi.example/api');
    const result = await client.delete('/transactions/tx_1');
    assert.equal(result, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('ApiClient propaga status HTTP e detalhes de validação do backend', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        status: 400,
        error: 'VALIDATION_FAILED',
        message: 'Os dados da requisição contêm campos inválidos.',
        details: ['A descrição não pode estar em branco']
      }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );

  try {
    const client = new ApiClient('https://api.cfi.example/api');
    await assert.rejects(
      () => client.post('/transactions', {}),
      (err) => {
        assert.equal(err.status, 400);
        assert.match(extractApiErrorMessage(err), /A descrição não pode estar em branco/);
        return true;
      }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

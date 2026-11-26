import test from 'node:test';
import assert from 'node:assert/strict';
import { api } from '../src/services/api.js';
import { transactionService } from '../src/services/transactionService.js';

test('transactionService CRUD chama os endpoints REST corretos', async () => {
  const calls = [];
  const originalBaseUrl = api.baseUrl;
  const originalFetch = globalThis.fetch;

  api.baseUrl = 'https://api.cfi.example/api';
  globalThis.fetch = async (url, config) => {
    calls.push({ url, method: config.method, body: config.body ? JSON.parse(config.body) : null });
    if (config.method === 'DELETE') {
      return new Response(null, { status: 204 });
    }
    if (config.method === 'GET') {
      return new Response(JSON.stringify([{ id: 'tx_1', description: 'Salário', amount: 3000, type: 'income', category: 'salary', date: '2026-09-01' }]), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ id: 'tx_1', ...JSON.parse(config.body) }), {
      status: config.method === 'POST' ? 201 : 200,
      headers: { 'content-type': 'application/json' }
    });
  };

  try {
    const list = await transactionService.getAll();
    assert.equal(list.length, 1);

    const created = await transactionService.create({
      description: 'Almoço',
      amount: 45.5,
      type: 'expense',
      category: 'food',
      date: '2026-09-10'
    });
    assert.equal(created.id, 'tx_1');

    await transactionService.update('tx_1', {
      description: 'Almoço Editado',
      amount: 50,
      type: 'expense',
      category: 'food',
      date: '2026-09-10'
    });

    await transactionService.remove('tx_1');

    assert.deepEqual(
      calls.map((c) => `${c.method} ${c.url}`),
      [
        'GET https://api.cfi.example/api/transactions',
        'POST https://api.cfi.example/api/transactions',
        'PUT https://api.cfi.example/api/transactions/tx_1',
        'DELETE https://api.cfi.example/api/transactions/tx_1'
      ]
    );
  } finally {
    globalThis.fetch = originalFetch;
    api.baseUrl = originalBaseUrl;
  }
});

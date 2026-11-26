const DEFAULT_TIMEOUT_MS = 42000;

export function resolveApiBaseUrl(env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}) {
  const configured = typeof env?.VITE_API_URL === 'string'
    ? env.VITE_API_URL.trim().replace(/\/+$/, '')
    : '';

  if (configured) {
    return configured;
  }

  if (env?.DEV) {
    return '/api';
  }

  return '';
}

export function extractApiErrorMessage(err) {
  if (!err) {
    return 'Erro desconhecido ao comunicar com o servidor.';
  }
  if (Array.isArray(err.data?.details) && err.data.details.length > 0) {
    return `${err.message} (${err.data.details.join('; ')})`;
  }
  return err.message || 'Não foi possível completar a operação no servidor.';
}

export class ApiClient {
  constructor(baseUrl = resolveApiBaseUrl()) {
    this.baseUrl = typeof baseUrl === 'string' ? baseUrl.replace(/\/+$/, '') : '';
  }

  async request(endpoint, options = {}) {
    if (!this.baseUrl) {
      const configError = new Error('URL da API não configurada para produção (defina VITE_API_URL).');
      configError.status = 0;
      configError.isConfigError = true;
      throw configError;
    }

    const controller = new AbortController();
    const timeoutMs = options.timeout || DEFAULT_TIMEOUT_MS;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const { timeout: _ignoredTimeout, headers: customHeaders, ...fetchOptions } = options;

    const config = {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...customHeaders
      },
      signal: controller.signal
    };

    try {
      return await this._executeFetch(`${this.baseUrl}${endpoint}`, config, timeoutId);
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  async _executeFetch(url, config, timeoutId) {
    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (response.status === 204) {
        return null;
      }

      const contentType = response.headers.get('content-type');
      let data = null;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { message: text } : null;
      }

      if (!response.ok) {
        const error = new Error(data?.message || `Erro HTTP ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        const timeoutError = new Error('Tempo limite de resposta excedido. O servidor demorou mais que o esperado.');
        timeoutError.status = 504;
        throw timeoutError;
      }
      if (err.status === undefined && (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('NetworkError'))) {
        const networkError = new Error('Não foi possível conectar ao servidor da API. Verifique sua conexão ou se o serviço está disponível.');
        networkError.status = 0;
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw err;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

export const api = new ApiClient();

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const DEFAULT_TIMEOUT_MS = 25000;

class ApiClient {
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT_MS);

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers
      },
      signal: controller.signal,
      ...options
    };

    // Tenta primeiro através do endpoint base configurado (/api com proxy do Vite ou URL configurada)
    try {
      return await this._executeFetch(`${this.baseUrl}${endpoint}`, config, timeoutId);
    } catch (err) {
      // Se der falha de conexão usando a rota relativa /api, tenta fallback direto para http://localhost:8080/api
      if (this.baseUrl === '/api' && (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('NetworkError'))) {
        try {
          return await this._executeFetch(`http://localhost:8080/api${endpoint}`, config, timeoutId);
        } catch (fallbackErr) {
          clearTimeout(timeoutId);
          throw fallbackErr;
        }
      }
      clearTimeout(timeoutId);
      throw err;
    }
  }

  async _executeFetch(url, config, timeoutId) {
    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

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
      if (err.name === 'AbortError') {
        const timeoutError = new Error('Tempo limite de resposta excedido. A IA ou o servidor demoraram para responder.');
        timeoutError.status = 504;
        throw timeoutError;
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

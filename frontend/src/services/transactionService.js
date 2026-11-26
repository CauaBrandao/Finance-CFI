import { api } from './api.js';

const CRUD_TIMEOUT_MS = 15000;

const STORAGE_KEYS = {
  MONTHLY_GOAL: 'monthlyGoal',
  INVESTMENT_GOAL: 'investmentGoal',
  THEME: 'theme',
  PALETTE: 'palette',
  LAST_ANALYSIS: 'cfi_last_analysis'
};

export const transactionService = {
  async getAll() {
    const data = await api.get('/transactions', { timeout: CRUD_TIMEOUT_MS });
    return Array.isArray(data) ? data : [];
  },

  async create(transaction) {
    return api.post('/transactions', transaction, { timeout: CRUD_TIMEOUT_MS });
  },

  async update(id, transaction) {
    return api.put(`/transactions/${encodeURIComponent(id)}`, transaction, { timeout: CRUD_TIMEOUT_MS });
  },

  async remove(id) {
    return api.delete(`/transactions/${encodeURIComponent(id)}`, { timeout: CRUD_TIMEOUT_MS });
  },

  loadGoals() {
    try {
      const monthly = parseFloat(localStorage.getItem(STORAGE_KEYS.MONTHLY_GOAL) || '0');
      const investment = parseFloat(localStorage.getItem(STORAGE_KEYS.INVESTMENT_GOAL) || '0');
      return {
        monthlyGoal: isNaN(monthly) ? 0 : monthly,
        investmentGoal: isNaN(investment) ? 0 : investment
      };
    } catch (e) {
      return { monthlyGoal: 0, investmentGoal: 0 };
    }
  },

  saveMonthlyGoal(val) {
    localStorage.setItem(STORAGE_KEYS.MONTHLY_GOAL, String(val));
  },

  saveInvestmentGoal(val) {
    localStorage.setItem(STORAGE_KEYS.INVESTMENT_GOAL, String(val));
  },

  loadPreferences() {
    return {
      theme: localStorage.getItem(STORAGE_KEYS.THEME) || 'dark',
      palette: localStorage.getItem(STORAGE_KEYS.PALETTE) || ''
    };
  },

  saveTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  savePalette(palette) {
    if (palette) {
      localStorage.setItem(STORAGE_KEYS.PALETTE, palette);
    } else {
      localStorage.removeItem(STORAGE_KEYS.PALETTE);
    }
  },

  loadCachedAnalysis() {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.LAST_ANALYSIS);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  },

  saveCachedAnalysis(analysis) {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_ANALYSIS, JSON.stringify(analysis));
    } catch (e) {}
  }
};

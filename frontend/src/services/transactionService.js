import { api } from './api';

const STORAGE_KEYS = {
  TRANSACTIONS: 'transactions',
  MONTHLY_GOAL: 'monthlyGoal',
  INVESTMENT_GOAL: 'investmentGoal',
  THEME: 'theme',
  PALETTE: 'palette',
  LAST_ANALYSIS: 'cfi_last_analysis'
};

export const transactionService = {
  loadTransactions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Falha ao ler transações do LocalStorage:', e);
      return [];
    }
  },

  saveTransactions(transactions) {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Falha ao salvar transações no LocalStorage:', e);
    }
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

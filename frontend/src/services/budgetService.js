import { generateId } from '../utils/formatters.js';
import { validateBudgetInput } from '../utils/budgetCalculations.js';

const STORAGE_KEY = 'cfi_category_budgets';

function getDefaultStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

export function createBudgetService(storage = getDefaultStorage()) {
  const readAll = () => {
    if (!storage) return [];
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const writeAll = (budgets) => {
    if (!storage) return;
    storage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  };

  return {
    getAll() {
      return readAll();
    },

    getByPeriod(month, year) {
      return readAll().filter(
        (b) => Number(b.month) === Number(month) && Number(b.year) === Number(year)
      );
    },

    findDuplicate(category, month, year, excludeId = null) {
      return readAll().find(
        (b) =>
          b.category === category &&
          Number(b.month) === Number(month) &&
          Number(b.year) === Number(year) &&
          b.id !== excludeId
      ) || null;
    },

    create({ category, limitAmount, month, year }) {
      const existing = readAll();
      const errors = validateBudgetInput({ category, limitAmount, month, year }, existing, null);
      const firstError = Object.values(errors)[0];
      if (firstError) {
        const err = new Error(firstError);
        err.validationErrors = errors;
        throw err;
      }

      const now = new Date().toISOString();
      const newBudget = {
        id: generateId(),
        category: category.trim(),
        limitAmount: Number(parseFloat(limitAmount).toFixed(2)),
        month: Number(month),
        year: Number(year),
        createdAt: now,
        updatedAt: now
      };

      const next = [...existing, newBudget];
      writeAll(next);
      return newBudget;
    },

    update(id, { category, limitAmount, month, year }) {
      const existing = readAll();
      const targetIndex = existing.findIndex((b) => b.id === id);
      if (targetIndex === -1) {
        throw new Error('Orçamento não encontrado para atualização.');
      }

      const errors = validateBudgetInput({ category, limitAmount, month, year }, existing, id);
      const firstError = Object.values(errors)[0];
      if (firstError) {
        const err = new Error(firstError);
        err.validationErrors = errors;
        throw err;
      }

      const updated = {
        ...existing[targetIndex],
        category: category.trim(),
        limitAmount: Number(parseFloat(limitAmount).toFixed(2)),
        month: Number(month),
        year: Number(year),
        updatedAt: new Date().toISOString()
      };

      const next = existing.map((b, idx) => (idx === targetIndex ? updated : b));
      writeAll(next);
      return updated;
    },

    remove(id) {
      const existing = readAll();
      const exists = existing.some((b) => b.id === id);
      if (!exists) {
        throw new Error('Orçamento não encontrado para exclusão.');
      }
      const next = existing.filter((b) => b.id !== id);
      writeAll(next);
      return true;
    }
  };
}

export const budgetService = createBudgetService();


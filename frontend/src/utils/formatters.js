export const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

export const formatIsoDateOnly = (dateStr) => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  return dateStr.split('T')[0];
};

export const pluralize = (count) => `${count} transação${count !== 1 ? 'es' : ''}`;

export const randomItem = (arr) => {
  if (!arr || arr.length === 0) return '';
  return arr[Math.floor(Math.random() * arr.length)];
};

export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

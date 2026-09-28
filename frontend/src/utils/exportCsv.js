import { CATEGORIES } from './constants';

export const exportTransactionsToCSV = (transactions = []) => {
  if (!transactions || transactions.length === 0) {
    return false;
  }

  const header = 'Data,Descrição,Tipo,Categoria,Valor\n';
  const rows = transactions
    .map((t) => {
      const cat = CATEGORIES[t.category]?.label || t.category;
      const date = t.date ? new Date(t.date).toLocaleDateString('pt-BR') : '';
      const amountNum = Number(t.amount) || 0;
      return `${date},"${t.description.replace(/"/g, '""')}",${t.type === 'income' ? 'Entrada' : 'Saída'},${cat},${amountNum.toFixed(2)}`;
    })
    .join('\n');

  const blob = new Blob(['\ufeff' + header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cfi_finance_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  return true;
};

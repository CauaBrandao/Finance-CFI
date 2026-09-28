import { CATEGORIES } from './constants';

export const calculateTotals = (transactions = []) => {
  const totals = transactions.reduce(
    (acc, t) => {
      const amount = Number(t.amount) || 0;
      if (t.type === 'income') {
        return { ...acc, income: acc.income + amount, incomeCount: acc.incomeCount + 1 };
      }
      return { ...acc, expense: acc.expense + amount, expenseCount: acc.expenseCount + 1 };
    },
    { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 }
  );

  const balance = totals.income - totals.expense;
  const totalVolume = totals.income + totals.expense;
  const balancePercent = totalVolume > 0 ? ((totals.income / totalVolume) * 100).toFixed(1) : 0;
  const savingsRate = totals.income > 0 ? Math.max(0, ((balance / totals.income) * 100)).toFixed(1) : 0;

  return {
    ...totals,
    balance,
    balancePercent,
    savingsRate
  };
};

export const calculateStats = (transactions = []) => {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const biggest = expenses.length > 0
    ? expenses.reduce((max, t) => (Number(t.amount) > Number(max.amount) ? t : max))
    : null;

  const uniqueDays = [...new Set(transactions.map((t) => (t.date ? t.date.split('T')[0] : '')))].filter(Boolean);
  const expenseTotal = expenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const avgDaily = uniqueDays.length > 0 ? expenseTotal / uniqueDays.length : 0;

  return {
    biggestExpense: biggest ? Number(biggest.amount) : 0,
    biggestExpenseDescription: biggest ? biggest.description : '',
    avgDailyExpense: avgDaily,
    totalTransactions: transactions.length,
    daysTracked: uniqueDays.length
  };
};

export const calculateCategoryBreakdown = (transactions = []) => {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const categoryTotals = expenses.reduce((acc, t) => {
    const cat = t.category || 'other';
    acc[cat] = (acc[cat] || 0) + (Number(t.amount) || 0);
    return acc;
  }, {});

  return Object.entries(categoryTotals)
    .map(([catKey, total]) => {
      const catInfo = CATEGORIES[catKey] || CATEGORIES.other;
      const percent = totalExpense > 0 ? (total / totalExpense) * 100 : 0;
      return {
        categoryKey: catKey,
        label: catInfo.label,
        emoji: catInfo.emoji,
        total,
        percent: Number(percent.toFixed(1))
      };
    })
    .sort((a, b) => b.total - a.total);
};

export const buildFinancialContext = (transactions = [], monthlyGoal = 0, investmentGoal = 0) => {
  const totals = calculateTotals(transactions);
  const stats = calculateStats(transactions);
  const categories = calculateCategoryBreakdown(transactions);

  const investmentTxs = transactions.filter((t) => t.type === 'expense' && t.category === 'investment');
  const totalInvested = investmentTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const currentYearMonth = new Date().toISOString().slice(0, 7);

  return {
    periodo: currentYearMonth,
    receitaTotal: totals.income,
    despesaTotal: totals.expense,
    saldo: totals.balance,
    taxaPoupancaPercentual: Number(totals.savingsRate),
    gastoMedioDiario: Number(stats.avgDailyExpense.toFixed(2)),
    diasRastreados: stats.daysTracked,
    maiorDespesa: {
      descricao: stats.biggestExpenseDescription,
      valor: stats.biggestExpense
    },
    metaGastosMensal: {
      limite: monthlyGoal,
      gastoAtual: totals.expense,
      percentualAtingido: monthlyGoal > 0 ? Number(((totals.expense / monthlyGoal) * 100).toFixed(1)) : 0,
      restante: Math.max(0, monthlyGoal - totals.expense)
    },
    metaInvestimentoMensal: {
      meta: investmentGoal,
      totalAportado: totalInvested,
      quantidadeAportes: investmentTxs.length,
      percentualAtingido: investmentGoal > 0 ? Number(((totalInvested / investmentGoal) * 100).toFixed(1)) : 0,
      restante: Math.max(0, investmentGoal - totalInvested)
    },
    categoriasDespesa: categories.map((c) => ({
      categoria: c.label,
      chave: c.categoryKey,
      totalGasto: c.total,
      percentualDasDespesas: c.percent,
      percentualDaReceita: totals.income > 0 ? Number(((c.total / totals.income) * 100).toFixed(1)) : 0
    })),
    ultimasTransacoes: transactions.slice(0, 30).map((t) => ({
      id: t.id,
      descricao: t.description,
      valor: Number(t.amount),
      tipo: t.type,
      categoria: t.category,
      data: t.date ? t.date.split('T')[0] : ''
    }))
  };
};

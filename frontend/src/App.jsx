import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PalettePanel } from './components/PalettePanel';
import { MotivationalBanner } from './components/MotivationalBanner';
import { SummaryCards } from './components/SummaryCards';
import { TransactionForm } from './components/TransactionForm';
import { GoalsSection } from './components/GoalsSection';
import { InvestmentGoalSection } from './components/InvestmentGoalSection';
import { StatsSection } from './components/StatsSection';
import { ChartsSection } from './components/ChartsSection';
import { TransactionList } from './components/TransactionList';
import { DeleteModal } from './components/DeleteModal';
import { ToastContainer } from './components/ToastContainer';
import { ConfettiCanvas } from './components/ConfettiCanvas';
import { FinancialIntelligence } from './components/intelligence/FinancialIntelligence';

import { extractApiErrorMessage } from './services/api';
import { transactionService } from './services/transactionService';
import { calculateTotals, calculateStats } from './utils/calculations';
import { exportTransactionsToCSV } from './utils/exportCsv';
import { randomItem, formatCurrency } from './utils/formatters';
import { MOTIVATIONAL } from './utils/constants';

export const App = () => {
  // Estado principal das transações (fonte única: API REST) e metas
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(null);

  const [monthlyGoal, setMonthlyGoal] = useState(0);
  const [investmentGoal, setInvestmentGoal] = useState(0);

  // Estados de navegação e interface
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'intelligence'
  const [theme, setTheme] = useState('dark');
  const [palette, setPalette] = useState('');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState('Comece a registrar suas transações!');
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  // Estados de edição, exclusão e envio assíncrono
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);
  const [submitTxError, setSubmitTxError] = useState('');
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, id: null, description: '' });
  const [isDeletingTx, setIsDeletingTx] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  // Notificações Toast
  const [toasts, setToasts] = useState([]);

  // Análise de IA em cache
  const [cachedAnalysis, setCachedAnalysis] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const fetchTransactions = useCallback(async () => {
    setTransactionsLoading(true);
    setTransactionsError(null);
    try {
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (err) {
      const msg = extractApiErrorMessage(err);
      setTransactionsError(msg);
      showToast(msg, 'error');
    } finally {
      setTransactionsLoading(false);
    }
  }, [showToast]);

  // Carregamento inicial: preferências locais + transações via API REST
  useEffect(() => {
    const { monthlyGoal: mGoal, investmentGoal: iGoal } = transactionService.loadGoals();
    const { theme: savedTheme, palette: savedPalette } = transactionService.loadPreferences();
    const lastAnalysis = transactionService.loadCachedAnalysis();

    setMonthlyGoal(mGoal);
    setInvestmentGoal(iGoal);
    setTheme(savedTheme);
    setPalette(savedPalette);
    setCachedAnalysis(lastAnalysis);

    if (savedTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    if (savedPalette) {
      document.documentElement.setAttribute('data-palette', savedPalette);
    } else {
      document.documentElement.removeAttribute('data-palette');
    }

    fetchTransactions();
  }, [fetchTransactions]);

  const triggerConfetti = () => {
    setConfettiTrigger((prev) => prev + 1);
  };

  // Alternância de Tema
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    transactionService.saveTheme(nextTheme);

    if (nextTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    showToast(`Tema ${nextTheme === 'light' ? 'Claro' : 'Escuro'} aplicado!`, 'info');
  };

  // Alternância de Paleta
  const handleSelectPalette = (selectedPalette) => {
    const next = palette === selectedPalette ? '' : selectedPalette;
    setPalette(next);
    transactionService.savePalette(next);

    if (next) {
      document.documentElement.setAttribute('data-palette', next);
    } else {
      document.documentElement.removeAttribute('data-palette');
    }
    showToast('Paleta de cores atualizada!', 'success');
  };

  // Metas
  const handleSetMonthlyGoal = (val) => {
    setMonthlyGoal(val);
    transactionService.saveMonthlyGoal(val);
    showToast(`Média de gastos de ${formatCurrency(val)} definida!`, 'success');
    triggerConfetti();
  };

  const handleSetInvestmentGoal = (val) => {
    setInvestmentGoal(val);
    transactionService.saveInvestmentGoal(val);
    showToast(`Meta de investimento de ${formatCurrency(val)} definida!`, 'success');
    triggerConfetti();
  };

  // CRUD de Transações integrado ao Backend REST
  const handleAddOrUpdateTransaction = async (transactionData) => {
    if (isSubmittingTx) return false;
    setIsSubmittingTx(true);
    setSubmitTxError('');

    try {
      if (editingTransaction) {
        await transactionService.update(editingTransaction.id, transactionData);
        const refreshed = await transactionService.getAll();
        setTransactions(refreshed);
        setEditingTransaction(null);
        showToast('Transação atualizada!', 'info');
      } else {
        const created = await transactionService.create(transactionData);
        const refreshed = await transactionService.getAll();
        setTransactions(refreshed);

        const isIncome = created.type === 'income';
        setMotivationalMessage(randomItem(isIncome ? MOTIVATIONAL.income : MOTIVATIONAL.expense));
        showToast(isIncome ? 'Entrada adicionada!' : 'Saída registrada.', isIncome ? 'success' : 'info');

        // Verificação de estouro de gastos ou atingimento de investimento
        const expenses = refreshed.filter((t) => t.type === 'expense');
        const totalSpent = expenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        if (monthlyGoal > 0 && totalSpent >= monthlyGoal) {
          showToast('Média de gastos estourada! Revise seus gastos.', 'error');
        }

        const investmentTxs = refreshed.filter((t) => t.type === 'expense' && t.category === 'investment');
        const totalInvested = investmentTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        if (investmentGoal > 0 && totalInvested >= investmentGoal) {
          showToast('Meta de investimento atingida! 🎉', 'success');
          triggerConfetti();
        }
      }
      setTransactionsError(null);
      return true;
    } catch (err) {
      const msg = extractApiErrorMessage(err);
      setSubmitTxError(msg);
      showToast(msg, 'error');
      return false;
    } finally {
      setIsSubmittingTx(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.id || isDeletingTx) return;

    setIsDeletingTx(true);
    try {
      await transactionService.remove(deleteModalState.id);
      const refreshed = await transactionService.getAll();
      setTransactions(refreshed);
      if (editingTransaction?.id === deleteModalState.id) {
        setEditingTransaction(null);
      }
      showToast('Transação removida.', 'warning');
      setDeleteModalState({ isOpen: false, id: null, description: '' });
    } catch (err) {
      const msg = extractApiErrorMessage(err);
      showToast(msg, 'error');
      if (err.status === 404) {
        const refreshed = await transactionService.getAll().catch(() => null);
        if (refreshed) setTransactions(refreshed);
        setDeleteModalState({ isOpen: false, id: null, description: '' });
      }
    } finally {
      setIsDeletingTx(false);
    }
  };

  const handleExportCsv = () => {
    const success = exportTransactionsToCSV(transactions);
    if (success) {
      showToast('CSV exportado com sucesso!', 'success');
    } else {
      showToast('Nenhuma transação para exportar.', 'warning');
    }
  };

  const handleLoadDemoData = async () => {
    if (isLoadingDemo) return;
    setIsLoadingDemo(true);

    const demoTransactions = [
      { description: 'Salário Mensal', amount: 4200, type: 'income', category: 'salary', date: '2026-09-05' },
      { description: 'Freelance Web Design', amount: 800, type: 'income', category: 'other', date: '2026-09-15' },
      { description: 'Supermercado Mensal', amount: 980, type: 'expense', category: 'food', date: '2026-09-06' },
      { description: 'Aluguel & Condomínio', amount: 1350, type: 'expense', category: 'bills', date: '2026-09-08' },
      { description: 'Combustível do Mês', amount: 380, type: 'expense', category: 'transport', date: '2026-09-10' },
      { description: 'Restaurantes & Delivery', amount: 430, type: 'expense', category: 'food', date: '2026-09-12' },
      { description: 'Plano de Saúde & Farmácia', amount: 260, type: 'expense', category: 'health', date: '2026-09-14' },
      { description: 'Streaming & Lazer', amount: 190, type: 'expense', category: 'leisure', date: '2026-09-18' },
      { description: 'Curso Online Especialização', amount: 150, type: 'expense', category: 'education', date: '2026-09-20' },
      { description: 'Aporte Tesouro Direto Selic', amount: 350, type: 'expense', category: 'investment', date: '2026-09-22' }
    ];

    try {
      for (const tx of demoTransactions) {
        await transactionService.create(tx);
      }
      const refreshed = await transactionService.getAll();
      setTransactions(refreshed);
      setTransactionsError(null);

      if (!monthlyGoal) {
        setMonthlyGoal(3800);
        transactionService.saveMonthlyGoal(3800);
      }
      if (!investmentGoal) {
        setInvestmentGoal(500);
        transactionService.saveInvestmentGoal(500);
      }
      showToast('Cenário financeiro de demonstração carregado na API com sucesso!', 'success');
    } catch (err) {
      const msg = extractApiErrorMessage(err);
      showToast(`Falha ao carregar cenário na API: ${msg}`, 'error');
    } finally {
      setIsLoadingDemo(false);
    }
  };

  // Totais e Métricas
  const totals = calculateTotals(transactions);
  const stats = calculateStats(transactions);
  const investmentTxs = transactions.filter((t) => t.type === 'expense' && t.category === 'investment');
  const totalInvested = investmentTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <>
      {/* Background animado com Glassmorphism */}
      <div className="bg-animation" aria-hidden="true">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <ToastContainer toasts={toasts} />
      <ConfettiCanvas trigger={confettiTrigger} />

      <DeleteModal
        isOpen={deleteModalState.isOpen}
        transactionDescription={deleteModalState.description}
        isDeleting={isDeletingTx}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeletingTx) {
            setDeleteModalState({ isOpen: false, id: null, description: '' });
          }
        }}
      />

      <div className="container">
        {/* Header com Logo, Temas, Paletas e Exportação */}
        <Header
          currentTheme={theme}
          onToggleTheme={handleToggleTheme}
          onTogglePalette={() => setIsPaletteOpen((prev) => !prev)}
          onExportCsv={handleExportCsv}
        />

        {/* Painel expansível de paletas */}
        <PalettePanel
          isOpen={isPaletteOpen}
          activePalette={palette}
          onSelectPalette={handleSelectPalette}
        />

        {/* Banner motivacional */}
        <MotivationalBanner message={motivationalMessage} />

        {/* Abas de Navegação (Dashboard vs Inteligência Financeira) */}
        <nav className="nav-tabs" aria-label="Navegação da Aplicação">
          <button
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Dashboard Financeiro
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'intelligence' ? 'active' : ''}`}
            onClick={() => setActiveTab('intelligence')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Inteligência Financeira
            <span className="tab-badge">IA</span>
          </button>
        </nav>

        {activeTab === 'dashboard' ? (
          <>
            {/* Cards de Resumo: Entradas, Saídas e Saldo */}
            <SummaryCards totals={totals} />

            {/* Grid de 2 Colunas: Formulário e Metas/Estatísticas */}
            <div className="two-col">
              <TransactionForm
                editingTransaction={editingTransaction}
                isSubmitting={isSubmittingTx}
                submitError={submitTxError}
                onSubmit={handleAddOrUpdateTransaction}
                onCancelEdit={() => {
                  setEditingTransaction(null);
                  setSubmitTxError('');
                }}
              />

              <section className="goals-section glass">
                <GoalsSection
                  monthlyGoal={monthlyGoal}
                  totalSpent={totals.expense}
                  onSetGoal={handleSetMonthlyGoal}
                />

                <InvestmentGoalSection
                  investmentGoal={investmentGoal}
                  totalInvested={totalInvested}
                  investmentCount={investmentTxs.length}
                  onSetGoal={handleSetInvestmentGoal}
                />

                <StatsSection stats={stats} />
              </section>
            </div>

            {/* Gráficos em HTML5 Canvas Nativo (Barras e Rosca) */}
            <ChartsSection
              transactions={transactions}
              theme={theme}
              palette={palette}
            />

            {/* Lista de Transações com Busca, Filtros, Ordenação e Estados de API */}
            <TransactionList
              transactions={transactions}
              isLoading={transactionsLoading}
              error={transactionsError}
              onRetry={fetchTransactions}
              isBusy={isSubmittingTx || isDeletingTx || isLoadingDemo}
              onEdit={(tx) => {
                setSubmitTxError('');
                setEditingTransaction(tx);
              }}
              onDelete={(id) => {
                const tx = transactions.find((t) => t.id === id);
                setDeleteModalState({
                  isOpen: true,
                  id,
                  description: tx ? tx.description : ''
                });
              }}
            />
          </>
        ) : (
          /* Módulo de Inteligência Financeira Pessoal (Google Gemini) */
          <FinancialIntelligence
            transactions={transactions}
            monthlyGoal={monthlyGoal}
            investmentGoal={investmentGoal}
            cachedAnalysis={cachedAnalysis}
            onSaveAnalysis={(res) => {
              setCachedAnalysis(res);
              transactionService.saveCachedAnalysis(res);
            }}
            onLoadDemoData={handleLoadDemoData}
            isLoadingDemo={isLoadingDemo}
            showToast={showToast}
          />
        )}

        {/* Rodapé da Aplicação */}
        <footer className="footer">
          <p>
            CFI Finance — Inteligência Financeira Pessoal &bull; Cauã, Fernando &amp; Igor &bull; Projeto Integrado com Google Gemini
          </p>
        </footer>
      </div>
    </>
  );
};

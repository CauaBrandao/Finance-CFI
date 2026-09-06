// ============================================================
// CFI FINANCE — Controle de Gastos Pessoais
// Autores: Cauã, Fernando & Igor
// ============================================================
// Este arquivo contém toda a lógica da aplicação, organizada em
// funções com responsabilidades bem definidas. Os dados ficam em
// um ARRAY DE OBJETOS (transactions) e toda a interface é
// atualizada dinamicamente a partir dele.
//
// Técnicas JS utilizadas:
// - map()           → editar transação sem mutar o array original
// - filter()        → excluir transação / filtrar por tipo e categoria
// - reduce()        → calcular totais (entradas, saídas, saldo, por categoria)
// - Spread Operator → adicionar itens ao array de forma imutável
// - Arrow Functions → callbacks concisos em todo o código
// - Destructuring   → extrair propriedades de objetos
// - Template Literals → construir HTML dinâmico com dados
// - localStorage    → persistir dados no navegador
// ============================================================

// -------------------------------------------------------
// CONSTANTES — Objeto de categorias com emoji, label e cor
// Cada chave representa uma categoria. Usamos para exibir
// informações visuais (emoji, label, cor) de cada transação.
// -------------------------------------------------------
const CATEGORIES = {
    salary: { emoji: '💰', label: 'Salário', color: '#00b894' },
    food: { emoji: '🍔', label: 'Alimentação', color: '#ff6b6b' },
    transport: { emoji: '🚗', label: 'Transporte', color: '#fdcb6e' },
    health: { emoji: '🏥', label: 'Saúde', color: '#00cec9' },
    leisure: { emoji: '🎮', label: 'Lazer', color: '#a29bfe' },
    education: { emoji: '📚', label: 'Educação', color: '#6c5ce7' },
    bills: { emoji: '📄', label: 'Contas', color: '#fab1a0' },
    shopping: { emoji: '🛍️', label: 'Compras', color: '#fd79a8' },
    investment: { emoji: '📈', label: 'Investimento', color: '#55efc4' },
    other: { emoji: '✨', label: 'Outro', color: '#dfe6e9' }
};

// -------------------------------------------------------
// MENSAGENS MOTIVACIONAIS — Exibidas no banner conforme o contexto
// -------------------------------------------------------
const MOTIVATIONAL = {
    start: [
        'Comece a registrar suas transações!',
        'Controle financeiro é liberdade!',
        'Cada registro é um passo para o futuro!'
    ],
    income: [
        'Ótima entrada! Continue assim! 🎉',
        'Rentabilidade crescendo! 📈',
        'Cada vez mais perto da sua meta!'
    ],
    expense: [
        'Avalie se é necessário. Você consegue! 💪',
        'Cuidado com os gastos, mas viva!',
        'Organização é a chave do sucesso!'
    ],
    saving: [
        'Parabéns, você está economizando! 🌟',
        'Mantenha o foco na meta!',
        'Seu futuro eu vai agradecer!'
    ],
    overBudget: [
        'Atenção: gastos acima da média! ⚠️',
        'Revise seus gastos com cuidado.',
        'Tente reduzir gastos desnecessários.'
    ],
    goalReached: [
        'META ATINGIDA! Você é incrível! 🏆',
        'Objetivo cumprido! Continue assim! 🎊',
        'Sucesso total! Parabéns! 🥳'
    ],
    investment: [
        'Investindo no futuro! 🚀',
        'Seu patrimônio está crescendo! 💎',
        'Juros compostos são seus amigos! 📊'
    ],
    investmentGoal: [
        'META DE INVESTIMENTO ATINGIDA! 🏆',
        'Você é um expert em investimentos! 🎯',
        'Continue assim, seu futuro brilha! ✨'
    ]
};

// -------------------------------------------------------
// ESTADO DA APLICAÇÃO
// O array 'transactions' é a fonte única de verdade (single source of truth).
// Toda a interface é renderizada a partir dele.
// -------------------------------------------------------
let transactions = [];   // Array que guarda todas as movimentações
let monthlyGoal = 0;     // Limite mensal de gastos definido pelo usuário
let investmentGoal = 0;  // Meta de investimento mensal
let editingId = null;     // ID da transação sendo editada (null = nenhuma)
let deleteTargetId = null; // ID da transação a ser excluída (modal de confirmação)

// -------------------------------------------------------
// REFERÊNCIAS AO DOM — Captura dos elementos HTML uma vez só
// Isso evita buscas repetidas no DOM e melhora performance.
// -------------------------------------------------------
const form = document.getElementById('transactionForm');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('transactionDate');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');
const transactionList = document.getElementById('transactionList');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const totalBalanceEl = document.getElementById('totalBalance');
const incomeCountEl = document.getElementById('incomeCount');
const expenseCountEl = document.getElementById('expenseCount');
const balancePercentEl = document.getElementById('balancePercent');
const emptyMessage = document.getElementById('emptyMessage');
const searchInput = document.getElementById('searchInput');
const filterType = document.getElementById('filterType');
const filterCategory = document.getElementById('filterCategory');
const sortBy = document.getElementById('sortBy');
const monthlyGoalInput = document.getElementById('monthlyGoal');
const setGoalBtn = document.getElementById('setGoalBtn');
const goalBar = document.getElementById('goalBar');
const goalSpent = document.getElementById('goalSpent');
const goalRemaining = document.getElementById('goalRemaining');
const goalMessage = document.getElementById('goalMessage');
const biggestExpenseEl = document.getElementById('biggestExpense');
const avgDailyEl = document.getElementById('avgDaily');
const totalTransactionsEl = document.getElementById('totalTransactions');
const daysTrackedEl = document.getElementById('daysTracked');
const motivationalText = document.getElementById('motivationalText');
const themeToggle = document.getElementById('themeToggle');
const exportBtn = document.getElementById('exportBtn');
const confettiCanvas = document.getElementById('confettiCanvas');
const ctx = confettiCanvas.getContext('2d');

const investmentGoalInput = document.getElementById('investmentGoal');
const setInvestmentBtn = document.getElementById('setInvestmentBtn');
const investmentBar = document.getElementById('investmentBar');
const investedAmountEl = document.getElementById('investedAmount');
const investmentRemainingEl = document.getElementById('investmentRemaining');
const investmentPercentEl = document.getElementById('investmentPercent');
const investmentTotalEl = document.getElementById('investmentTotal');
const investmentCountEl = document.getElementById('investmentCount');
const investmentMessage = document.getElementById('investmentMessage');

// Modal de confirmação de exclusão
const deleteModal = document.getElementById('deleteModal');
const deleteModalText = document.getElementById('deleteModalText');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');


// ============================================================
// FUNÇÕES UTILITÁRIAS
// Funções pequenas e reutilizáveis usadas em várias partes do código.
// ============================================================

/**
 * generateId — Gera um ID único para cada transação.
 * Combina timestamp (Date.now) com número aleatório para evitar colisões.
 */
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

/**
 * formatCurrency — Formata um número como moeda brasileira (R$).
 * Usa toLocaleString com as opções de currency para BRL.
 */
const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * formatDate — Formata uma data ISO para exibição curta (ex: "31 de ago.").
 */
const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

/**
 * randomItem — Retorna um item aleatório de um array.
 * Usada para variar as mensagens motivacionais.
 */
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * pluralize — Retorna a forma correta de "transação" no singular ou plural.
 * Ex: pluralize(1) → "1 transação", pluralize(3) → "3 transações"
 */
const pluralize = (count) => `${count} transação${count !== 1 ? 'es' : ''}`;

/**
 * roundRect — Desenha um retângulo com cantos arredondados no Canvas.
 * Utiliza o método nativo ctx.roundRect() quando disponível (navegadores modernos),
 * ou faz fallback para curvas de Bézier/quadráticas em navegadores legados.
 */
const roundRect = (ctx, x, y, w, h, r) => {
    if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        return;
    }
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
};

// ============================================================
// SISTEMA DE NOTIFICAÇÕES (TOAST)
// Exibe mensagens temporárias no canto da tela.
// ============================================================

/**
 * showToast — Cria e exibe uma notificação temporária (toast).
 * @param {string} message - Texto a ser exibido
 * @param {string} type - Tipo: 'success', 'error', 'info', 'warning'
 */
const showToast = (message, type = 'success') => {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    toast.innerHTML = `<span>${icons[type]}</span> ${message}`;
    container.appendChild(toast);
    // Remove o toast automaticamente após 3 segundos
    setTimeout(() => toast.remove(), 3000);
};

/**
 * setMotivation — Atualiza o texto do banner motivacional.
 * Escolhe uma mensagem aleatória do tipo correspondente.
 */
const setMotivation = (type) => {
    motivationalText.textContent = randomItem(MOTIVATIONAL[type] || MOTIVATIONAL.start);
};

// ============================================================
// CRUD DE TRANSAÇÕES
// Funções para Criar (add), Ler (render), Atualizar (update) e Deletar (remove).
// ============================================================

/**
 * addTransaction — Cria uma nova transação e adiciona ao array.
 *
 * Usa o SPREAD OPERATOR (...) para criar um novo array contendo
 * todas as transações anteriores + a nova transação, sem mutar
 * o array original (princípio de imutabilidade).
 *
 * Estrutura de cada transação (OBJETO):
 * {
 *   id: "abc123",           // identificador único
 *   description: "Almoço",  // descrição informada pelo usuário
 *   amount: 25.00,          // valor numérico
 *   type: "expense",        // "income" (entrada) ou "expense" (saída)
 *   category: "food",       // chave da categoria
 *   date: "2026-09-06..."   // data em formato ISO
 * }
 */
const addTransaction = (description, amount, type, category, date) => {
    const newTransaction = {
        id: generateId(),
        description,
        amount: parseFloat(amount),
        type,
        category,
        date: date || new Date().toISOString()
    };
    // SPREAD OPERATOR: cria novo array com todos os itens anteriores + o novo
    transactions = [...transactions, newTransaction];
    saveToLocalStorage();
    render();
    setMotivation(type === 'income' ? 'income' : 'expense');
    showToast(
        type === 'income' ? 'Entrada adicionada!' : 'Saída registrada.',
        type === 'income' ? 'success' : 'info'
    );
    checkGoal();
    checkInvestment();
};

/**
 * updateTransaction — Edita uma transação existente.
 *
 * Usa MAP() para percorrer o array e retornar um NOVO array.
 * Quando encontra a transação com o ID correspondente, retorna
 * um novo objeto com os campos atualizados (via SPREAD OPERATOR).
 * As transações que não correspondem são mantidas intactas.
 */
const updateTransaction = (id, description, amount, type, category, date) => {
    // MAP: percorre cada transação e retorna um novo array
    transactions = transactions.map((t) =>
        t.id === id
            ? { ...t, description, amount: parseFloat(amount), type, category, date: date || t.date }
            : t  // transações que não correspondem são mantidas
    );
    saveToLocalStorage();
    render();
    showToast('Transação atualizada!', 'info');
};

/**
 * confirmRemoveTransaction — Abre o modal de confirmação antes de excluir.
 * Armazena o ID da transação-alvo e mostra o nome no modal.
 */
const confirmRemoveTransaction = (id) => {
    deleteTargetId = id;
    // Busca a transação pelo ID para exibir o nome no modal
    const transaction = transactions.find((t) => t.id === id);
    if (transaction) {
        deleteModalText.textContent = `Deseja realmente excluir "${transaction.description}"?`;
    }
    deleteModal.classList.remove('hidden');
};

/**
 * removeTransaction — Exclui uma transação do array.
 *
 * Usa FILTER() para criar um novo array contendo apenas as
 * transações cujo ID é DIFERENTE do ID informado. A transação
 * com o ID correspondente é removida.
 */
const removeTransaction = (id) => {
    const li = document.querySelector(`[data-id="${id}"]`);
    if (li) {
        li.classList.add('removing');
        setTimeout(() => {
            // FILTER: retorna novo array sem a transação excluída
            transactions = transactions.filter((t) => t.id !== id);
            saveToLocalStorage();
            render();
            showToast('Transação removida.', 'warning');
        }, 300);
    } else {
        transactions = transactions.filter((t) => t.id !== id);
        saveToLocalStorage();
        render();
    }
};

// ============================================================
// CÁLCULOS
// Funções que processam o array de transações para calcular
// totais, estatísticas e dados para os gráficos.
// ============================================================

/**
 * calculateTotals — Calcula totais de entradas, saídas e saldo.
 *
 * Usa REDUCE() para percorrer todas as transações e acumular
 * os valores em um único objeto resultado. O acumulador (acc)
 * começa com { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 }
 * e vai somando conforme o tipo de cada transação.
 *
 * O SPREAD OPERATOR é usado dentro do reduce para criar um
 * novo objeto acumulador a cada iteração (imutabilidade).
 */
const calculateTotals = () => {
    // REDUCE: acumula todos os valores em um único objeto
    const totals = transactions.reduce((acc, t) => {
        if (t.type === 'income') {
            return { ...acc, income: acc.income + t.amount, incomeCount: acc.incomeCount + 1 };
        }
        return { ...acc, expense: acc.expense + t.amount, expenseCount: acc.expenseCount + 1 };
    }, { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 });

    const balance = totals.income - totals.expense;
    const total = totals.income + totals.expense;
    const balancePercent = total > 0 ? ((totals.income / total) * 100).toFixed(1) : 0;

    // SPREAD OPERATOR + novas propriedades calculadas
    return { ...totals, balance, balancePercent };
};

/**
 * calculateStats — Calcula estatísticas avançadas.
 * Usa FILTER para separar despesas, REDUCE para encontrar o maior gasto,
 * SET + MAP para contar dias únicos.
 */
const calculateStats = () => {
    // FILTER: separa apenas as transações de saída
    const expenses = transactions.filter((t) => t.type === 'expense');

    // REDUCE: encontra a despesa com maior valor
    const biggest = expenses.length > 0
        ? expenses.reduce((max, t) => t.amount > max.amount ? t : max)
        : null;

    // SET + MAP: conta dias únicos (sem repetir) em que houve transações
    const uniqueDays = [...new Set(transactions.map((t) => t.date.split('T')[0]))];
    const expenseTotal = expenses.reduce((sum, t) => sum + t.amount, 0);
    const avgDaily = uniqueDays.length > 0 ? expenseTotal / uniqueDays.length : 0;

    return {
        biggestExpense: biggest ? formatCurrency(biggest.amount) : '-',
        biggestLabel: biggest ? biggest.description : '',
        avgDaily: formatCurrency(avgDaily),
        totalTransactions: transactions.length,
        daysTracked: uniqueDays.length
    };
};

// ============================================================
// FILTROS, BUSCA E ORDENAÇÃO
// Permite ao usuário buscar, filtrar e ordenar as transações
// exibidas na lista sem alterar o array original.
// ============================================================

/**
 * getFilteredTransactions — Aplica busca, filtros e ordenação.
 *
 * Usa o SPREAD OPERATOR para criar uma cópia do array original,
 * depois aplica FILTER para cada critério (busca, tipo, categoria)
 * e por fim ordena com sort().
 *
 * Assim o array original (transactions) nunca é modificado.
 */
const getFilteredTransactions = () => {
    // SPREAD OPERATOR: cria cópia para não alterar o array original
    let filtered = [...transactions];

    // FILTER por busca textual (descrição ou categoria)
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filtered = filtered.filter((t) =>
            t.description.toLowerCase().includes(searchTerm) ||
            CATEGORIES[t.category]?.label.toLowerCase().includes(searchTerm)
        );
    }

    // FILTER por tipo (entrada / saída)
    const typeVal = filterType.value;
    if (typeVal !== 'all') {
        filtered = filtered.filter((t) => t.type === typeVal);
    }

    // FILTER por categoria
    const catVal = filterCategory.value;
    if (catVal !== 'all') {
        filtered = filtered.filter((t) => t.category === catVal);
    }

    // SORT: ordenação por data ou valor
    const sortVal = sortBy.value;
    filtered.sort((a, b) => {
        switch (sortVal) {
            case 'date-desc': return new Date(b.date) - new Date(a.date);
            case 'date-asc': return new Date(a.date) - new Date(b.date);
            case 'amount-desc': return b.amount - a.amount;
            case 'amount-asc': return a.amount - b.amount;
            default: return 0;
        }
    });

    return filtered;
};

// ============================================================
// RENDERIZAÇÃO DA INTERFACE
// Funções que leem o estado (transactions) e atualizam o DOM.
// ============================================================

/**
 * renderTransactions — Exibe a lista de transações filtradas.
 *
 * Usa MAP() para transformar cada objeto transação em HTML (string).
 * Usa TEMPLATE LITERALS (crases + ${}) para interpolar dados dentro do HTML.
 * No final, junta tudo com join('') e insere no DOM via innerHTML.
 */
const renderTransactions = () => {
    const filtered = getFilteredTransactions();

    if (filtered.length === 0) {
        transactionList.innerHTML = '';
        emptyMessage.classList.remove('hidden');
        return;
    }

    emptyMessage.classList.add('hidden');

    // MAP: transforma cada transação em uma string de HTML
    const items = filtered.map((t) => {
        const cat = CATEGORIES[t.category] || CATEGORIES.other;
        // TEMPLATE LITERAL: constrói o HTML com dados dinâmicos
        return `
            <li data-id="${t.id}">
                <div class="transaction-category">${cat.emoji}</div>
                <div class="transaction-info">
                    <span class="description">${t.description}</span>
                    <div class="meta">
                        <span class="type-badge ${t.type}">${t.type === 'income' ? 'Entrada' : 'Saída'}</span>
                        <span>${cat.label}</span>
                        <span>${formatDate(t.date)}</span>
                    </div>
                </div>
                <span class="transaction-amount ${t.type}">
                    ${t.type === 'income' ? '+' : '-'} ${formatCurrency(t.amount)}
                </span>
                <div class="transaction-actions">
                    <button class="edit-btn" onclick="startEdit('${t.id}')" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="delete-btn" onclick="confirmRemoveTransaction('${t.id}')" title="Remover">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </li>
        `;
    }).join('');  // join: une todas as strings HTML em uma só

    transactionList.innerHTML = items;
};

/**
 * renderSummary — Atualiza os cards de resumo (Entradas, Saídas, Saldo).
 * Usa DESTRUCTURING para extrair as propriedades do objeto retornado por calculateTotals.
 */
const renderSummary = () => {
    // DESTRUCTURING: extrai propriedades do objeto de totais
    const { income, expense, balance, incomeCount, expenseCount, balancePercent } = calculateTotals();

    animateValue(totalIncomeEl, income);
    animateValue(totalExpenseEl, expense);
    animateValue(totalBalanceEl, balance);

    // Pluralização correta: "1 transação" vs "2 transações"
    incomeCountEl.textContent = pluralize(incomeCount);
    expenseCountEl.textContent = pluralize(expenseCount);
    balancePercentEl.textContent = `${balancePercent}% do total`;
};

/**
 * animateValue — Anima a contagem de um valor numérico no elemento.
 * Cria uma transição suave do valor anterior para o novo usando requestAnimationFrame.
 */
const animateValue = (el, target) => {
    const current = parseFloat(el.dataset.value || 0);
    const diff = target - current;
    const steps = 30;
    const stepValue = diff / steps;
    let step = 0;

    el.dataset.value = target;

    const update = () => {
        step++;
        const value = current + stepValue * step;
        el.textContent = formatCurrency(step >= steps ? target : value);
        if (step < steps) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
};

// ============================================================
// META DE GASTOS
// ============================================================

/**
 * renderGoal — Atualiza a barra de progresso da média de gastos.
 * Compara o total gasto com o limite definido pelo usuário.
 */
const renderGoal = () => {
    if (monthlyGoal <= 0) {
        goalBar.style.width = '0%';
        goalSpent.textContent = 'R$ 0,00 gasto';
        goalRemaining.textContent = 'R$ 0,00 restante';
        goalMessage.textContent = '';
        goalMessage.style.background = 'transparent';
        return;
    }

    const expenses = transactions.filter((t) => t.type === 'expense');
    const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
    const percent = Math.min((totalSpent / monthlyGoal) * 100, 100);
    const remaining = Math.max(monthlyGoal - totalSpent, 0);

    goalBar.style.width = `${percent}%`;
    goalSpent.textContent = `${formatCurrency(totalSpent)} gasto`;
    goalRemaining.textContent = `${formatCurrency(remaining)} restante`;

    // Muda a cor da barra conforme a proximidade do limite
    if (percent >= 100) {
        goalBar.style.background = 'linear-gradient(90deg, #ff6b6b, #fd79a8)';
        goalMessage.textContent = randomItem(MOTIVATIONAL.overBudget);
        goalMessage.style.background = 'rgba(255, 107, 107, 0.1)';
        goalMessage.style.color = '#ff6b6b';
    } else if (percent >= 80) {
        goalBar.style.background = 'linear-gradient(90deg, #fdcb6e, #e17055)';
        goalMessage.textContent = '⚠️ Quase no limite! Cuidado.';
        goalMessage.style.background = 'rgba(253, 203, 110, 0.1)';
        goalMessage.style.color = '#fdcb6e';
    } else {
        goalBar.style.background = 'linear-gradient(90deg, #00cec9, #6c5ce7)';
        goalMessage.textContent = randomItem(MOTIVATIONAL.saving);
        goalMessage.style.background = 'rgba(0, 206, 201, 0.1)';
        goalMessage.style.color = '#00cec9';
    }
};

/**
 * checkGoal — Verifica se o limite de gastos foi ultrapassado e exibe alerta.
 */
const checkGoal = () => {
    if (monthlyGoal <= 0) return;
    const expenses = transactions.filter((t) => t.type === 'expense');
    const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);

    if (totalSpent >= monthlyGoal) {
        showToast('Média de gastos estourada! Revise seus gastos.', 'error');
    }
};

// ============================================================
// META DE INVESTIMENTO
// ============================================================

/**
 * renderInvestment — Atualiza a barra e estatísticas de investimento.
 * Filtra transações de saída com categoria "investment".
 */
const renderInvestment = () => {
    const investmentTransactions = transactions.filter((t) => t.type === 'expense' && t.category === 'investment');
    const totalInvested = investmentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const count = investmentTransactions.length;

    if (investmentGoal <= 0) {
        investmentBar.style.width = '0%';
        investedAmountEl.textContent = 'R$ 0,00 investido';
        investmentRemainingEl.textContent = 'Defina sua meta de investimento';
        investmentPercentEl.textContent = '0%';
        investmentTotalEl.textContent = formatCurrency(totalInvested);
        investmentCountEl.textContent = count;
        investmentMessage.textContent = '';
        investmentMessage.style.background = 'transparent';
        return;
    }

    const percent = Math.min((totalInvested / investmentGoal) * 100, 100);
    const remaining = Math.max(investmentGoal - totalInvested, 0);

    investmentBar.style.width = `${percent}%`;
    investedAmountEl.textContent = `${formatCurrency(totalInvested)} investido`;
    investmentRemainingEl.textContent = `${formatCurrency(remaining)} restante`;
    investmentPercentEl.textContent = `${percent.toFixed(1)}%`;
    investmentTotalEl.textContent = formatCurrency(totalInvested);
    investmentCountEl.textContent = count;

    if (percent >= 100) {
        investmentBar.style.background = 'linear-gradient(90deg, #55efc4, #00b894)';
        investmentMessage.textContent = randomItem(MOTIVATIONAL.investmentGoal);
        investmentMessage.style.background = 'rgba(85, 239, 196, 0.1)';
        investmentMessage.style.color = '#55efc4';
    } else if (percent >= 50) {
        investmentBar.style.background = 'linear-gradient(90deg, #55efc4, #00cec9)';
        investmentMessage.textContent = '🚀 Mais da metade! Continue assim!';
        investmentMessage.style.background = 'rgba(85, 239, 196, 0.05)';
        investmentMessage.style.color = '#00cec9';
    } else {
        investmentBar.style.background = 'linear-gradient(90deg, #00b894, #55efc4)';
        investmentMessage.textContent = randomItem(MOTIVATIONAL.investment);
        investmentMessage.style.background = 'rgba(0, 184, 148, 0.1)';
        investmentMessage.style.color = '#00b894';
    }
};

/**
 * checkInvestment — Verifica se a meta de investimento foi atingida.
 * Se sim, mostra toast e lança confetti de celebração.
 */
const checkInvestment = () => {
    if (investmentGoal <= 0) return;
    const investmentTransactions = transactions.filter((t) => t.type === 'expense' && t.category === 'investment');
    const totalInvested = investmentTransactions.reduce((sum, t) => sum + t.amount, 0);

    if (totalInvested >= investmentGoal) {
        showToast('Meta de investimento atingida! 🎉', 'success');
        launchConfetti();
    }
};

/**
 * renderStats — Atualiza o painel de estatísticas.
 */
const renderStats = () => {
    const stats = calculateStats();
    biggestExpenseEl.textContent = stats.biggestLabel
        ? `${stats.biggestLabel} (${stats.biggestExpense})`
        : stats.biggestExpense;
    avgDailyEl.textContent = stats.avgDaily;
    totalTransactionsEl.textContent = stats.totalTransactions;
    daysTrackedEl.textContent = stats.daysTracked;
};

// ============================================================
// GRÁFICOS EM JAVASCRIPT PURO (HTML5 CANVAS API)
// Desenvolvidos 100% com JavaScript puro e Canvas 2D,
// sem nenhuma biblioteca externa (atendendo os requisitos da atividade).
// ============================================================

/**
 * renderChart — Renderiza o gráfico de barras horizontais (gastos por categoria).
 *
 * Técnicas JS e Canvas utilizadas:
 * - filter()        → filtra apenas movimentações do tipo 'expense' (saídas)
 * - reduce()        → agrupa e soma os valores por categoria
 * - Object.entries  → transforma o objeto em array de pares [categoria, total]
 * - sort()          → ordena as categorias do maior para o menor gasto
 * - Canvas 2D       → clearRect, createLinearGradient, fillText, roundRect
 * - devicePixelRatio → garante nitidez em telas de alta densidade (Retina/HiDPI)
 */
const renderChart = () => {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    const context = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Mede a largura real do elemento no layout
    const width = canvas.offsetWidth || 350;
    const expenses = transactions.filter((t) => t.type === 'expense');

    if (expenses.length === 0) {
        const height = 200;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.scale(dpr, dpr);
        context.clearRect(0, 0, width, height);

        context.fillStyle = '#8888aa';
        context.font = '14px Inter, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Adicione gastos para ver o gráfico', width / 2, height / 2);
        return;
    }

    // REDUCE: agrupa gastos por categoria { food: 150, transport: 80, ... }
    const categoryTotals = expenses.reduce((acc, t) => {
        return { ...acc, [t.category]: (acc[t.category] || 0) + t.amount };
    }, {});

    // Object.entries + sort: ordena do maior para o menor valor
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const maxVal = sorted[0][1] || 1;

    const barHeight = 32;
    const gap = 14;
    const leftPad = 130;
    const rightPad = 80;
    const topPad = 20;
    const bottomPad = 20;
    const height = Math.max(sorted.length * (barHeight + gap) - gap + topPad + bottomPad, 200);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.scale(dpr, dpr);
    context.clearRect(0, 0, width, height);

    const barWidth = Math.max(width - leftPad - rightPad, 20);
    const chartStyles = getComputedStyle(document.documentElement);
    const chartTextSecondary = chartStyles.getPropertyValue('--text-secondary').trim() || '#8888aa';
    const chartTextPrimary = chartStyles.getPropertyValue('--text-primary').trim() || '#f0f0ff';

    sorted.forEach(([cat, val], i) => {
        const y = topPad + i * (barHeight + gap);
        const catInfo = CATEGORIES[cat] || CATEGORIES.other;
        const w = Math.max((val / maxVal) * barWidth, 4);

        // Emoji e rótulo da categoria
        context.fillStyle = chartTextSecondary;
        context.font = '13px Inter, sans-serif';
        context.textAlign = 'right';
        context.textBaseline = 'middle';
        context.fillText(`${catInfo.emoji} ${catInfo.label}`, leftPad - 12, y + barHeight / 2);

        // Barra gradiente suave com cantos arredondados
        const grad = context.createLinearGradient(leftPad, 0, leftPad + w, 0);
        grad.addColorStop(0, catInfo.color);
        grad.addColorStop(1, catInfo.color + '88');
        context.fillStyle = grad;
        roundRect(context, leftPad, y, w, barHeight, 8);
        context.fill();

        // Valor monetário formatado à direita da barra
        context.fillStyle = chartTextPrimary;
        context.font = 'bold 12px Inter, sans-serif';
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillText(formatCurrency(val), leftPad + w + 10, y + barHeight / 2);
    });
};

/**
 * renderDonutChart — Renderiza o gráfico de rosca (distribuição percentual de gastos).
 *
 * Técnicas JS e Canvas utilizadas:
 * - filter()        → separa apenas despesas
 * - reduce()        → agrupa valores por categoria e calcula o total geral
 * - sort()          → ordena as fatias da maior para a menor
 * - Canvas 2D       → arc(), stroke(), fill(), textBaseline para anel circular
 * - Template Literals → constrói dinamicamente a legenda HTML com cores e %
 */
const renderDonutChart = () => {
    const canvas = document.getElementById('donutChart');
    if (!canvas) return;
    const context = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const displaySize = 220;
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    canvas.style.width = `${displaySize}px`;
    canvas.style.height = `${displaySize}px`;
    context.scale(dpr, dpr);

    const centerX = displaySize / 2;
    const centerY = displaySize / 2;
    const radius = 80;
    const lineWidth = 28;

    context.clearRect(0, 0, displaySize, displaySize);

    const expenses = transactions.filter((t) => t.type === 'expense');
    const legendEl = document.getElementById('donutLegend');

    if (expenses.length === 0) {
        // Círculo neutro quando não há dados
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        context.strokeStyle = 'rgba(136, 136, 170, 0.15)';
        context.lineWidth = lineWidth;
        context.stroke();

        context.fillStyle = '#8888aa';
        context.font = '12px Inter, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Sem dados', centerX, centerY - 8);
        context.font = '10px Inter, sans-serif';
        context.fillText('para exibir', centerX, centerY + 8);

        if (legendEl) legendEl.innerHTML = '';
        return;
    }

    // REDUCE: agrupa gastos por categoria
    const categoryTotals = expenses.reduce((acc, t) => {
        return { ...acc, [t.category]: (acc[t.category] || 0) + t.amount };
    }, {});

    // REDUCE: calcula total geral de despesas
    const totalExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

    let currentAngle = -Math.PI / 2; // Começa no topo (12 horas)

    // Desenha cada arco proporcional da rosca
    sorted.forEach(([cat, val]) => {
        const catInfo = CATEGORIES[cat] || CATEGORIES.other;
        const sliceAngle = (val / totalExpenses) * Math.PI * 2;

        context.beginPath();
        context.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        context.strokeStyle = catInfo.color;
        context.lineWidth = lineWidth;
        context.lineCap = 'butt';
        context.stroke();

        currentAngle += sliceAngle;
    });

    // Círculo central recortado
    const innerRadius = radius - lineWidth / 2 - 2;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const styles = getComputedStyle(document.documentElement);

    context.beginPath();
    context.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    context.fillStyle = styles.getPropertyValue('--bg-secondary').trim() || (isLight ? '#f0f2ff' : '#12122a');
    context.fill();

    // Texto no centro: valor total
    context.fillStyle = styles.getPropertyValue('--text-primary').trim() || (isLight ? '#1a1a3e' : '#f0f0ff');
    context.font = 'bold 18px Inter, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(formatCurrency(totalExpenses), centerX, centerY - 8);

    context.fillStyle = styles.getPropertyValue('--text-secondary').trim() || (isLight ? '#6b6b8d' : '#8888aa');
    context.font = '11px Inter, sans-serif';
    context.fillText('total gasto', centerX, centerY + 12);

    // Constrói a legenda com percentuais via Template Literals
    if (legendEl) {
        let legendHTML = '';
        sorted.forEach(([cat, val]) => {
            const catInfo = CATEGORIES[cat] || CATEGORIES.other;
            const pct = ((val / totalExpenses) * 100).toFixed(1);
            legendHTML += `
                <div class="legend-item">
                    <span class="legend-dot" style="background:${catInfo.color}"></span>
                    <span class="legend-label">${catInfo.emoji} ${catInfo.label}</span>
                    <span class="legend-value">${formatCurrency(val)}</span>
                    <span class="legend-percent">${pct}%</span>
                </div>
            `;
        });
        legendEl.innerHTML = legendHTML;
    }
};

// ============================================================
// RENDERIZAÇÃO PRINCIPAL
// ============================================================

/**
 * render — Função principal que atualiza TODA a interface.
 * É chamada sempre que o array de transações muda.
 * Chama cada função de renderização específica.
 */
const render = () => {
    renderSummary();
    renderTransactions();
    renderGoal();
    renderInvestment();
    renderStats();
    renderChart();
    renderDonutChart();
};

// ============================================================
// EDIÇÃO DE TRANSAÇÕES
// ============================================================

/**
 * startEdit — Preenche o formulário com os dados de uma transação
 * para permitir a edição. Altera o título e botão para modo "editar".
 */
const startEdit = (id) => {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;

    editingId = id;
    descriptionInput.value = transaction.description;
    amountInput.value = transaction.amount;
    typeInput.value = transaction.type;
    categoryInput.value = transaction.category;
    // Preenche o campo de data com a data da transação
    dateInput.value = transaction.date.split('T')[0];

    formTitle.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Editar Transação
    `;
    submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
        Salvar
    `;
    cancelBtn.classList.remove('hidden');
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

/**
 * cancelEdit — Cancela o modo de edição e limpa o formulário.
 */
const cancelEdit = () => {
    editingId = null;
    form.reset();
    // Define a data padrão como hoje
    dateInput.value = new Date().toISOString().split('T')[0];
    formTitle.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nova Transação
    `;
    submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Adicionar
    `;
    cancelBtn.classList.add('hidden');
};

// ============================================================
// EXPORTAÇÃO CSV
// ============================================================

/**
 * exportCSV — Exporta todas as transações para arquivo CSV.
 * Usa MAP para transformar cada transação em uma linha CSV.
 * O arquivo gerado é compatível com Excel.
 */
const exportCSV = () => {
    if (transactions.length === 0) {
        showToast('Nenhuma transação para exportar.', 'warning');
        return;
    }

    const header = 'Data,Descrição,Tipo,Categoria,Valor\n';
    // MAP: transforma cada transação em uma linha de texto CSV
    const rows = transactions.map((t) => {
        const cat = CATEGORIES[t.category]?.label || t.category;
        const date = new Date(t.date).toLocaleDateString('pt-BR');
        return `${date},"${t.description}",${t.type === 'income' ? 'Entrada' : 'Saída'},${cat},${t.amount.toFixed(2)}`;
    }).join('\n');

    // Cria um Blob (arquivo em memória) e gera o download
    const blob = new Blob(['\ufeff' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cfi_finance_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('CSV exportado com sucesso!', 'success');
};

// ============================================================
// TEMA (DARK MODE / LIGHT MODE)
// ============================================================

/**
 * toggleTheme — Alterna entre tema claro e escuro.
 * Salva a preferência no localStorage.
 */
const toggleTheme = () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    document.documentElement.setAttribute('data-theme', isLight ? '' : 'light');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');
    sunIcon.style.display = isLight ? 'block' : 'none';
    moonIcon.style.display = isLight ? 'none' : 'block';
    localStorage.setItem('theme', isLight ? 'dark' : 'light');
    // Re-renderiza os gráficos para ajustar as cores ao tema
    setTimeout(() => {
        renderChart();
        renderDonutChart();
    }, 100);
};

/**
 * loadTheme — Carrega o tema salvo no localStorage ao iniciar a aplicação.
 */
const loadTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        const sunIcon = themeToggle.querySelector('.sun-icon');
        const moonIcon = themeToggle.querySelector('.moon-icon');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
};

// ============================================================
// PALETA DE CORES
// ============================================================

const paletteToggle = document.getElementById('paletteToggle');
const palettePanel = document.getElementById('palettePanel');
const paletteOptions = document.querySelectorAll('.palette-option');

/**
 * setActivePaletteOption — Marca visualmente a paleta ativa no painel.
 */
const setActivePaletteOption = () => {
    const current = document.documentElement.getAttribute('data-palette');
    paletteOptions.forEach((opt) => {
        if (opt.dataset.palette === current) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
};

/**
 * applyPalette — Aplica uma paleta de cores ao documento e salva no localStorage.
 */
const applyPalette = (palette) => {
    const html = document.documentElement;
    if (palette) {
        html.setAttribute('data-palette', palette);
        localStorage.setItem('palette', palette);
    } else {
        html.removeAttribute('data-palette');
        localStorage.removeItem('palette');
    }
    setActivePaletteOption();
    setTimeout(() => {
        renderChart();
        renderDonutChart();
    }, 100);
};

/**
 * loadPalette — Carrega a paleta salva no localStorage.
 */
const loadPalette = () => {
    const saved = localStorage.getItem('palette');
    if (saved) {
        document.documentElement.setAttribute('data-palette', saved);
    }
    setActivePaletteOption();
};

// Event listener para abrir/fechar o painel de paletas
paletteToggle.addEventListener('click', () => {
    palettePanel.classList.toggle('hidden');
});

// Event listener para cada opção de paleta
paletteOptions.forEach((opt) => {
    opt.addEventListener('click', () => {
        applyPalette(opt.dataset.palette);
        const name = opt.querySelector('.palette-name').textContent;
        showToast(`Paleta "${name}" aplicada!`, 'success');
    });
});

// ============================================================
// CONFETTI — Efeito visual de celebração
// ============================================================
let confettiParticles = [];
let confettiActive = false;

/**
 * launchConfetti — Lança partículas de confetti na tela.
 * Usa Canvas API para desenhar as partículas com animação.
 */
const launchConfetti = () => {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    confettiActive = true;
    confettiParticles = [];

    const colors = ['#6c5ce7', '#00cec9', '#fd79a8', '#fdcb6e', '#55efc4', '#ff6b6b', '#a29bfe'];

    for (let i = 0; i < 150; i++) {
        confettiParticles.push({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * confettiCanvas.height - confettiCanvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.2,
            drift: (Math.random() - 0.5) * 2
        });
    }

    animateConfetti();
};

/**
 * animateConfetti — Anima as partículas de confetti frame a frame.
 */
const animateConfetti = () => {
    if (!confettiActive) return;

    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    let alive = 0;
    confettiParticles.forEach((p) => {
        p.y += p.speed;
        p.x += p.drift;
        p.angle += p.spin;

        if (p.y < confettiCanvas.height + 20) {
            alive++;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        }
    });

    if (alive > 0) {
        requestAnimationFrame(animateConfetti);
    } else {
        confettiActive = false;
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
};

// ============================================================
// EVENT LISTENERS — Conexão entre elementos HTML e funções JS
// ============================================================

/**
 * Evento de submit do formulário — Valida e cria/atualiza transação.
 * A validação garante que todos os campos estejam preenchidos corretamente
 * ANTES de salvar no array (requisito do professor).
 */
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const description = descriptionInput.value.trim();
    const amount = amountInput.value;
    const type = typeInput.value;
    const category = categoryInput.value;
    const dateVal = dateInput.value;

    // Converte a data selecionada em ISO. Se vazio, usa a data atual.
    const date = dateVal ? new Date(dateVal + 'T12:00:00').toISOString() : new Date().toISOString();

    // === VALIDAÇÃO DOS DADOS ===
    if (!description) {
        showToast('Informe uma descrição válida.', 'error');
        descriptionInput.focus();
        return;
    }
    if (!amount || amount <= 0) {
        showToast('Informe um valor maior que zero.', 'error');
        amountInput.focus();
        return;
    }
    if (!CATEGORIES[category]) {
        showToast('Selecione uma categoria válida.', 'error');
        categoryInput.focus();
        return;
    }

    // Se editingId existe, atualiza; senão, cria nova transação
    if (editingId) {
        updateTransaction(editingId, description, amount, type, category, date);
        cancelEdit();
    } else {
        addTransaction(description, amount, type, category, date);
    }

    form.reset();
    // Redefine a data para hoje após o reset
    dateInput.value = new Date().toISOString().split('T')[0];
});

// Botão cancelar edição
cancelBtn.addEventListener('click', cancelEdit);

// Filtros e busca — cada mudança re-renderiza a lista
searchInput.addEventListener('input', renderTransactions);
filterType.addEventListener('change', renderTransactions);
filterCategory.addEventListener('change', renderTransactions);
sortBy.addEventListener('change', renderTransactions);

// Tema e exportação
themeToggle.addEventListener('click', toggleTheme);
exportBtn.addEventListener('click', exportCSV);

// Meta de gastos — define o limite e salva no localStorage
setGoalBtn.addEventListener('click', () => {
    const val = parseFloat(monthlyGoalInput.value);
    if (!val || val <= 0) {
        showToast('Defina uma média válida.', 'warning');
        return;
    }
    monthlyGoal = val;
    localStorage.setItem('monthlyGoal', monthlyGoal);
    renderGoal();
    showToast(`Média de gastos de ${formatCurrency(monthlyGoal)} definida!`, 'success');
    launchConfetti();
});

// Meta de investimento — define e salva no localStorage
setInvestmentBtn.addEventListener('click', () => {
    const val = parseFloat(investmentGoalInput.value);
    if (!val || val <= 0) {
        showToast('Defina uma meta de investimento válida.', 'warning');
        return;
    }
    investmentGoal = val;
    localStorage.setItem('investmentGoal', investmentGoal);
    renderInvestment();
    showToast(`Meta de investimento de ${formatCurrency(investmentGoal)} definida!`, 'success');
    launchConfetti();
});

// Modal de exclusão — confirmar
confirmDeleteBtn.addEventListener('click', () => {
    if (deleteTargetId) {
        removeTransaction(deleteTargetId);
        deleteTargetId = null;
    }
    deleteModal.classList.add('hidden');
});

// Modal de exclusão — cancelar
cancelDeleteBtn.addEventListener('click', () => {
    deleteTargetId = null;
    deleteModal.classList.add('hidden');
});

// Fechar modal ao clicar fora da caixa
deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
        deleteTargetId = null;
        deleteModal.classList.add('hidden');
    }
});

// ============================================================
// PERSISTÊNCIA — localStorage
// Salva e carrega dados do navegador para manter as transações
// entre sessões (mesmo fechando e abrindo o navegador).
// ============================================================

/**
 * saveToLocalStorage — Converte o array de transações para JSON e salva.
 * JSON.stringify transforma o array/objeto em uma string para armazenar.
 */
const saveToLocalStorage = () => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
};

/**
 * loadFromLocalStorage — Carrega os dados salvos ao iniciar a aplicação.
 * JSON.parse converte a string JSON de volta para array/objeto.
 */
const loadFromLocalStorage = () => {
    const data = localStorage.getItem('transactions');
    if (data) {
        transactions = JSON.parse(data);
    }
    const goal = localStorage.getItem('monthlyGoal');
    if (goal) {
        monthlyGoal = parseFloat(goal);
        monthlyGoalInput.value = monthlyGoal;
    }
    const invGoal = localStorage.getItem('investmentGoal');
    if (invGoal) {
        investmentGoal = parseFloat(invGoal);
        investmentGoalInput.value = investmentGoal;
    }
};

// Re-renderiza gráficos ao redimensionar a janela
window.addEventListener('resize', () => {
    if (transactions.some((t) => t.type === 'expense')) {
        renderChart();
        renderDonutChart();
    }
});

// ============================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// Executa ao carregar a página: carrega tema, paleta, dados e renderiza.
// ============================================================
loadTheme();
loadPalette();
loadFromLocalStorage();
// Define a data padrão como hoje no campo de data
dateInput.value = new Date().toISOString().split('T')[0];
render();
setMotivation('start');

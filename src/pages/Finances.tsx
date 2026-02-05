import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  DollarSign, TrendingUp, TrendingDown, Plus, Trash2, Edit2, Save, X,
  Calendar, Tag, PieChart, BarChart3, ArrowUpRight, ArrowDownRight,
  Download, Search, Wallet, AlertTriangle, CheckCircle, RefreshCw,
  Heart
} from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  recurring?: boolean;
}

interface Budget {
  id: string;
  category: string;
  budgeted: number;
  spent: number;
  isCustom?: boolean;
}

const PRESET_CATEGORIES = [
  'Rent', 'Utilities', 'Payroll', 'Marketing', 'Software',
  'Supplies', 'Insurance', 'Travel', 'Meals', 'Professional Services',
  'Equipment', 'Subscriptions', 'Phone & Internet', 'Office', 'Other'
];

const incomeCategories = ['Sales', 'Services', 'Consulting', 'Investments', 'Refunds', 'Other Income'];
const expenseCategories = ['Rent', 'Utilities', 'Payroll', 'Marketing', 'Software', 'Supplies', 'Insurance', 'Travel', 'Meals', 'Professional Services', 'Equipment', 'Subscriptions', 'Phone & Internet', 'Office', 'Other'];

const Finances: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);

  const [transactionForm, setTransactionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    recurring: false
  });

  useEffect(() => {
    const savedTransactions = localStorage.getItem(`expedium_transactions_${user?.id}`);
    const savedBudgets = localStorage.getItem(`expedium_budgets_${user?.id}`);

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }

    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const saveTransactions = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    localStorage.setItem(`expedium_transactions_${user?.id}`, JSON.stringify(newTransactions));
  };

  const saveBudgets = (newBudgets: Budget[]) => {
    setBudgets(newBudgets);
    localStorage.setItem(`expedium_budgets_${user?.id}`, JSON.stringify(newBudgets));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // ── Calculations ──
  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(filterMonth));
  const totalIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = totalIncome - totalExpenses;

  // Last month comparison
  const lastMonthDate = new Date(filterMonth + '-01');
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonthKey = lastMonthDate.toISOString().slice(0, 7);
  const lastMonthTransactions = transactions.filter(t => t.date.startsWith(lastMonthKey));
  const lastMonthIncome = lastMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const lastMonthExpenses = lastMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const incomeChange = lastMonthIncome > 0 ? ((totalIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;
  const expenseChange = lastMonthExpenses > 0 ? ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

  // Savings rate
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  // Expense breakdown
  const expensesByCategory = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Budget progress
  const budgetsWithSpent = budgets.map(b => ({
    ...b,
    spent: expensesByCategory[b.category] || 0
  }));

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.budgeted, 0);

  // Upcoming recurring expenses
  const recurringExpenses = transactions
    .filter(t => t.recurring && t.type === 'expense')
    .reduce((acc, t) => {
      if (!acc.find(a => a.description === t.description && a.category === t.category)) {
        acc.push(t);
      }
      return acc;
    }, [] as Transaction[]);

  const unpaidRecurring = recurringExpenses.filter(recurring => {
    return !currentMonthTransactions.some(
      t => t.description === recurring.description && t.category === recurring.category
    );
  });

  // Monthly trends
  const monthlyTrends = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().slice(0, 7);
    const monthTransactions = transactions.filter(t => t.date.startsWith(monthKey));
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    monthlyTrends.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      income,
      expenses,
      net: income - expenses
    });
  }
  const maxTrendValue = Math.max(...monthlyTrends.flatMap(m => [m.income, m.expenses])) || 1;

  // ── Handlers ──
  const saveTransaction = () => {
    const newTransaction: Transaction = {
      id: editingTransaction?.id || Date.now().toString(),
      date: transactionForm.date,
      description: transactionForm.description,
      amount: parseFloat(transactionForm.amount) || 0,
      type: transactionForm.type,
      category: transactionForm.category,
      recurring: transactionForm.recurring
    };

    if (editingTransaction) {
      saveTransactions(transactions.map(t => t.id === editingTransaction.id ? newTransaction : t));
    } else {
      saveTransactions([...transactions, newTransaction]);
    }

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setTransactionForm({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      type: 'expense',
      category: '',
      recurring: false
    });
    setEditingTransaction(null);
  };

  const editTransaction = (transaction: Transaction) => {
    setTransactionForm({
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      recurring: transaction.recurring || false
    });
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const deleteTransaction = (id: string) => {
    if (window.confirm('Delete this transaction?')) {
      saveTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // Budget handlers
  const toggleBudgetCategory = (category: string) => {
    const exists = budgets.find(b => b.category === category);
    if (exists) {
      saveBudgets(budgets.filter(b => b.category !== category));
    } else {
      saveBudgets([...budgets, {
        id: category.toLowerCase().replace(/\s+/g, '-'),
        category,
        budgeted: 0,
        spent: 0,
        isCustom: false
      }]);
    }
  };

  const addCustomCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (budgets.find(b => b.category.toLowerCase() === name.toLowerCase())) return;

    saveBudgets([...budgets, {
      id: 'custom-' + Date.now(),
      category: name,
      budgeted: 0,
      spent: 0,
      isCustom: true
    }]);
    setNewCategoryName('');
    setShowCategoryInput(false);
  };

  const removeBudgetCategory = (category: string) => {
    saveBudgets(budgets.filter(b => b.category !== category));
  };

  const updateBudgetAmount = (category: string, amount: number) => {
    saveBudgets(budgets.map(b =>
      b.category === category ? { ...b, budgeted: amount } : b
    ));
  };

  const filteredTransactions = currentMonthTransactions
    .filter(t => filterType === 'all' || t.type === filterType)
    .filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 t.category.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Type', 'Category', 'Amount'];
    const rows = transactions.map(t => [t.date, t.description, t.type, t.category, t.amount]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Active budget categories (for display in the category chips)
  const activeBudgetCategories = new Set(budgets.map(b => b.category));

  // All categories including custom ones (for transaction form)
  const allExpenseCategories = Array.from(new Set([...expenseCategories, ...budgets.filter(b => b.isCustom).map(b => b.category)]));

  return (
    <div className="finances-page">
      <div className="page-header">
        <DollarSign size={32} />
        <h1>Financial Tracking</h1>
        <p>See where your money goes and plan your spending</p>
      </div>

      {/* Month Picker */}
      <div className="fin-month-picker">
        <Calendar size={16} />
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="finance-tabs">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <PieChart size={18} /> Overview
        </button>
        <button className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
          <BarChart3 size={18} /> Transactions
        </button>
        <button className={`tab-btn ${activeTab === 'budget' ? 'active' : ''}`} onClick={() => setActiveTab('budget')}>
          <Wallet size={18} /> Budget
        </button>
      </div>

      {/* ════ Overview Tab ════ */}
      {activeTab === 'overview' && (
        <div className="overview-section">
          {/* Financial Health */}
          <div className="fin-health">
            <div className="fin-health-card">
              <div className="fin-health-icon">
                <Heart size={20} />
              </div>
              <div className="fin-health-body">
                <span className="fin-health-label">Savings Rate</span>
                {totalIncome > 0 ? (
                  <>
                    <span className={`fin-health-value ${savingsRate >= 20 ? 'good' : savingsRate >= 0 ? 'warning' : 'bad'}`}>
                      {savingsRate.toFixed(0)}%
                    </span>
                    <span className="fin-health-hint">
                      {savingsRate >= 20
                        ? "You're keeping more than you spend"
                        : savingsRate >= 0
                        ? 'Try to save at least 20% of what you earn'
                        : "You're spending more than you earn"}
                    </span>
                  </>
                ) : (
                  <span className="fin-health-hint">Add income to see how much you're saving</span>
                )}
              </div>
            </div>

            <div className="fin-health-card">
              <div className="fin-health-icon fin-health-icon--income">
                <TrendingUp size={20} />
              </div>
              <div className="fin-health-body">
                <span className="fin-health-label">Income vs Last Month</span>
                {lastMonthIncome > 0 ? (
                  <>
                    <span className={`fin-health-value ${incomeChange >= 0 ? 'good' : 'bad'}`}>
                      {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(0)}%
                    </span>
                    <span className="fin-health-hint">
                      {incomeChange >= 0
                        ? `You earned ${formatCurrency(totalIncome - lastMonthIncome)} more`
                        : `You earned ${formatCurrency(lastMonthIncome - totalIncome)} less`}
                    </span>
                  </>
                ) : (
                  <span className="fin-health-hint">Add last month's income to compare</span>
                )}
              </div>
            </div>

            <div className="fin-health-card">
              <div className="fin-health-icon fin-health-icon--expense">
                <TrendingDown size={20} />
              </div>
              <div className="fin-health-body">
                <span className="fin-health-label">Spending vs Last Month</span>
                {lastMonthExpenses > 0 ? (
                  <>
                    <span className={`fin-health-value ${expenseChange <= 0 ? 'good' : 'bad'}`}>
                      {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(0)}%
                    </span>
                    <span className="fin-health-hint">
                      {expenseChange <= 0
                        ? `You spent ${formatCurrency(lastMonthExpenses - totalExpenses)} less`
                        : `You spent ${formatCurrency(totalExpenses - lastMonthExpenses)} more`}
                    </span>
                  </>
                ) : (
                  <span className="fin-health-hint">Add last month's expenses to compare</span>
                )}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card income">
              <div className="card-icon">
                <ArrowUpRight size={24} />
              </div>
              <div className="card-content">
                <span className="card-label">Money In</span>
                <span className="card-value">{formatCurrency(totalIncome)}</span>
              </div>
            </div>
            <div className="summary-card expenses">
              <div className="card-icon">
                <ArrowDownRight size={24} />
              </div>
              <div className="card-content">
                <span className="card-label">Money Out</span>
                <span className="card-value">{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
            <div className={`summary-card net ${netCashFlow >= 0 ? 'positive' : 'negative'}`}>
              <div className="card-icon">
                <DollarSign size={24} />
              </div>
              <div className="card-content">
                <span className="card-label">What's Left</span>
                <span className="card-value">{formatCurrency(netCashFlow)}</span>
              </div>
            </div>
          </div>

          {/* Upcoming Bills */}
          {unpaidRecurring.length > 0 && (
            <div className="fin-upcoming">
              <h3><RefreshCw size={18} /> Upcoming Bills This Month</h3>
              <p className="fin-upcoming-hint">
                These recurring expenses haven't been recorded yet this month.
              </p>
              <div className="fin-upcoming-list">
                {unpaidRecurring.map((item, idx) => (
                  <div key={idx} className="fin-upcoming-item">
                    <div className="fin-upcoming-info">
                      <AlertTriangle size={16} className="fin-upcoming-warn" />
                      <div>
                        <span className="fin-upcoming-name">{item.description}</span>
                        <span className="fin-upcoming-cat">{item.category}</span>
                      </div>
                    </div>
                    <span className="fin-upcoming-amount">{formatCurrency(item.amount)}</span>
                    <button
                      className="fin-upcoming-add"
                      onClick={() => {
                        setTransactionForm({
                          date: new Date().toISOString().split('T')[0],
                          description: item.description,
                          amount: item.amount.toString(),
                          type: 'expense',
                          category: item.category,
                          recurring: true
                        });
                        setShowModal(true);
                      }}
                    >
                      <Plus size={14} /> Record
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6-Month Trend */}
          <div className="chart-card">
            <h3>6-Month Trend</h3>
            <div className="bar-chart">
              {monthlyTrends.map((month, idx) => (
                <div key={idx} className="chart-column">
                  <div className="bars-container">
                    <div
                      className="bar income-bar"
                      style={{ height: `${(month.income / maxTrendValue) * 150}px` }}
                      title={`Income: ${formatCurrency(month.income)}`}
                    />
                    <div
                      className="bar expense-bar"
                      style={{ height: `${(month.expenses / maxTrendValue) * 150}px` }}
                      title={`Expenses: ${formatCurrency(month.expenses)}`}
                    />
                  </div>
                  <span className="chart-label">{month.month}</span>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-color income" /> Money In</span>
              <span className="legend-item"><span className="legend-color expense" /> Money Out</span>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="breakdown-card">
            <h3>Where Your Money Goes</h3>
            {Object.keys(expensesByCategory).length > 0 ? (
              <div className="breakdown-list">
                {Object.entries(expensesByCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => (
                    <div key={category} className="breakdown-item">
                      <div className="breakdown-info">
                        <span className="breakdown-category">{category}</span>
                        <span className="breakdown-amount">{formatCurrency(amount)}</span>
                      </div>
                      <div className="breakdown-bar">
                        <div
                          className="breakdown-fill"
                          style={{ width: `${(amount / totalExpenses) * 100}%` }}
                        />
                      </div>
                      <span className="breakdown-percent">{((amount / totalExpenses) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="empty-breakdown">
                <p>No expenses recorded for this month yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════ Transactions Tab ════ */}
      {activeTab === 'transactions' && (
        <div className="transactions-section">
          <div className="section-header">
            <div className="filters-row">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
                  <option value="all">All Types</option>
                  <option value="income">Money In</option>
                  <option value="expense">Money Out</option>
                </select>
              </div>
            </div>
            <div className="action-buttons">
              <button className="btn-secondary" onClick={exportToCSV}>
                <Download size={18} /> Export
              </button>
              <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                <Plus size={18} /> Add Transaction
              </button>
            </div>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="transactions-list">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
                  <div className="transaction-icon">
                    {transaction.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div className="transaction-details">
                    <span className="transaction-description">{transaction.description}</span>
                    <span className="transaction-meta">
                      <Calendar size={14} /> {transaction.date}
                      <Tag size={14} /> {transaction.category}
                      {transaction.recurring && <span className="recurring-badge">Recurring</span>}
                    </span>
                  </div>
                  <span className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                  <div className="transaction-actions">
                    <button className="icon-btn" onClick={() => editTransaction(transaction)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="icon-btn" onClick={() => deleteTransaction(transaction.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <DollarSign size={48} />
              <h3>No transactions yet</h3>
              <p>Record your first transaction - it only takes a few seconds.</p>
              <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                <Plus size={18} /> Add Transaction
              </button>
            </div>
          )}
        </div>
      )}

      {/* ════ Budget Tab ════ */}
      {activeTab === 'budget' && (
        <div className="budget-section">
          {/* Category Picker */}
          <div className="fin-budget-setup">
            <h3><Wallet size={18} /> Set Up Your Budget</h3>
            <p className="fin-budget-hint">
              Pick the categories you spend money on. You can also create your own.
            </p>

            <div className="fin-cat-chips">
              {PRESET_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`fin-cat-chip ${activeBudgetCategories.has(cat) ? 'fin-cat-chip--active' : ''}`}
                  onClick={() => toggleBudgetCategory(cat)}
                >
                  {activeBudgetCategories.has(cat) && <CheckCircle size={14} />}
                  {cat}
                </button>
              ))}

              {/* Custom categories */}
              {budgets.filter(b => b.isCustom).map(b => (
                <button
                  key={b.id}
                  className="fin-cat-chip fin-cat-chip--active fin-cat-chip--custom"
                  onClick={() => removeBudgetCategory(b.category)}
                >
                  <CheckCircle size={14} />
                  {b.category}
                  <X size={12} />
                </button>
              ))}

              {/* Add custom */}
              {showCategoryInput ? (
                <div className="fin-cat-input">
                  <input
                    type="text"
                    placeholder="Category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomCategory()}
                    autoFocus
                  />
                  <button className="fin-cat-input-add" onClick={addCustomCategory}>
                    <Plus size={14} />
                  </button>
                  <button className="fin-cat-input-cancel" onClick={() => { setShowCategoryInput(false); setNewCategoryName(''); }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  className="fin-cat-chip fin-cat-chip--add"
                  onClick={() => setShowCategoryInput(true)}
                >
                  <Plus size={14} /> Add Your Own
                </button>
              )}
            </div>
          </div>

          {/* Budget Summary Bar */}
          {budgets.length > 0 && (
            <div className="fin-budget-summary">
              <div className="fin-budget-summary-row">
                <div className="fin-budget-summary-item">
                  <span className="fin-budget-summary-label">Total Budget</span>
                  <span className="fin-budget-summary-value">{formatCurrency(totalBudgeted)}</span>
                </div>
                <div className="fin-budget-summary-item">
                  <span className="fin-budget-summary-label">Total Spent</span>
                  <span className="fin-budget-summary-value">{formatCurrency(totalExpenses)}</span>
                </div>
                <div className="fin-budget-summary-item">
                  <span className="fin-budget-summary-label">Remaining</span>
                  <span className={`fin-budget-summary-value ${totalBudgeted - totalExpenses >= 0 ? 'good' : 'bad'}`}>
                    {formatCurrency(totalBudgeted - totalExpenses)}
                  </span>
                </div>
              </div>
              {totalBudgeted > 0 && (
                <div className="fin-budget-summary-bar">
                  <div
                    className={`fin-budget-summary-fill ${totalExpenses / totalBudgeted > 1 ? 'over' : totalExpenses / totalBudgeted > 0.75 ? 'warning' : 'good'}`}
                    style={{ width: `${Math.min((totalExpenses / totalBudgeted) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Budget Cards */}
          {budgetsWithSpent.length > 0 ? (
            <div className="budget-grid">
              {budgetsWithSpent.map((budget) => {
                const percentage = budget.budgeted > 0 ? (budget.spent / budget.budgeted) * 100 : 0;
                const isOverBudget = percentage > 100;
                const remaining = budget.budgeted - budget.spent;

                return (
                  <div key={budget.id} className={`budget-card ${isOverBudget ? 'over-budget' : ''}`}>
                    <div className="budget-header">
                      <h4>{budget.category}</h4>
                      <button
                        className="fin-budget-remove"
                        onClick={() => removeBudgetCategory(budget.category)}
                        title="Remove from budget"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="budget-amounts">
                      <span>Spent: {formatCurrency(budget.spent)}</span>
                      {budget.budgeted > 0 && (
                        <span className={remaining >= 0 ? 'good' : 'bad'}>
                          {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(Math.abs(remaining))} over`}
                        </span>
                      )}
                    </div>

                    <div className="budget-bar">
                      <div
                        className={`budget-fill ${isOverBudget ? 'over' : percentage > 75 ? 'warning' : 'good'}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>

                    {budget.budgeted > 0 && (
                      <div className="fin-budget-status">
                        {isOverBudget ? (
                          <span className="fin-budget-status-text bad">
                            <AlertTriangle size={14} /> Over budget by {(percentage - 100).toFixed(0)}%
                          </span>
                        ) : percentage > 75 ? (
                          <span className="fin-budget-status-text warning">
                            <AlertTriangle size={14} /> Almost at your limit
                          </span>
                        ) : (
                          <span className="fin-budget-status-text good">
                            <CheckCircle size={14} /> On track
                          </span>
                        )}
                      </div>
                    )}

                    <div className="budget-input-group">
                      <label>Monthly limit</label>
                      <div className="fin-budget-input-wrap">
                        <span className="fin-budget-input-prefix">$</span>
                        <input
                          type="number"
                          value={budget.budgeted || ''}
                          onChange={(e) => updateBudgetAmount(budget.category, parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <Wallet size={48} />
              <h3>No budget categories selected</h3>
              <p>Pick some categories above to start planning your monthly spending.</p>
            </div>
          )}
        </div>
      )}

      {/* Transaction Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="transaction-form">
              <div className="type-toggle">
                <button
                  className={`type-btn ${transactionForm.type === 'income' ? 'active income' : ''}`}
                  onClick={() => setTransactionForm({ ...transactionForm, type: 'income', category: '' })}
                >
                  <ArrowUpRight size={18} /> Money In
                </button>
                <button
                  className={`type-btn ${transactionForm.type === 'expense' ? 'active expense' : ''}`}
                  onClick={() => setTransactionForm({ ...transactionForm, type: 'expense', category: '' })}
                >
                  <ArrowDownRight size={18} /> Money Out
                </button>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={transactionForm.date}
                  onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>What was it for?</label>
                <input
                  type="text"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                  placeholder="e.g. Monthly rent, Client payment..."
                />
              </div>

              <div className="form-group">
                <label>How much?</label>
                <input
                  type="number"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={transactionForm.category}
                  onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
                >
                  <option value="">Pick a category</option>
                  {(transactionForm.type === 'income' ? incomeCategories : allExpenseCategories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={transactionForm.recurring}
                    onChange={(e) => setTransactionForm({ ...transactionForm, recurring: e.target.checked })}
                  />
                  This happens every month
                </label>
              </div>

              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={saveTransaction}>
                  <Save size={18} /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finances;

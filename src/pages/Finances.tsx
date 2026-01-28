import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  DollarSign, TrendingUp, TrendingDown, Plus, Trash2, Edit2, Save, X,
  Calendar, Tag, PieChart, BarChart3, ArrowUpRight, ArrowDownRight,
  Download, Filter, Search
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
}

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

  const [transactionForm, setTransactionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    recurring: false
  });

  const incomeCategories = ['Sales', 'Services', 'Consulting', 'Investments', 'Refunds', 'Other Income'];
  const expenseCategories = ['Rent', 'Utilities', 'Payroll', 'Marketing', 'Software', 'Supplies', 'Insurance', 'Travel', 'Meals', 'Professional Services', 'Equipment', 'Other'];

  useEffect(() => {
    const savedTransactions = localStorage.getItem(`expedium_transactions_${user?.id}`);
    const savedBudgets = localStorage.getItem(`expedium_budgets_${user?.id}`);

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }

    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    } else {
      // Initialize default budgets
      const defaultBudgets: Budget[] = expenseCategories.map(cat => ({
        id: cat.toLowerCase().replace(' ', '-'),
        category: cat,
        budgeted: 0,
        spent: 0
      }));
      setBudgets(defaultBudgets);
    }
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

  // Calculate summaries
  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(filterMonth));
  const totalIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = totalIncome - totalExpenses;

  // Calculate expense breakdown by category
  const expensesByCategory = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Calculate budget progress
  const budgetsWithSpent = budgets.map(b => ({
    ...b,
    spent: expensesByCategory[b.category] || 0
  }));

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

  const updateBudget = (category: string, amount: number) => {
    const newBudgets = budgets.map(b =>
      b.category === category ? { ...b, budgeted: amount } : b
    );
    saveBudgets(newBudgets);
  };

  const filteredTransactions = currentMonthTransactions
    .filter(t => filterType === 'all' || t.type === filterType)
    .filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 t.category.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate monthly trends (last 6 months)
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

  return (
    <div className="finances-page">
      <div className="page-header">
        <DollarSign size={32} />
        <h1>Financial Tracking</h1>
        <p>Track income, expenses, and manage your budget</p>
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
          <Tag size={18} /> Budget
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="overview-section">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card income">
              <div className="card-icon">
                <TrendingUp size={24} />
              </div>
              <div className="card-content">
                <span className="card-label">Income</span>
                <span className="card-value">{formatCurrency(totalIncome)}</span>
              </div>
              <ArrowUpRight size={20} className="trend-icon positive" />
            </div>

            <div className="summary-card expenses">
              <div className="card-icon">
                <TrendingDown size={24} />
              </div>
              <div className="card-content">
                <span className="card-label">Expenses</span>
                <span className="card-value">{formatCurrency(totalExpenses)}</span>
              </div>
              <ArrowDownRight size={20} className="trend-icon negative" />
            </div>

            <div className={`summary-card net ${netCashFlow >= 0 ? 'positive' : 'negative'}`}>
              <div className="card-icon">
                <DollarSign size={24} />
              </div>
              <div className="card-content">
                <span className="card-label">Net Cash Flow</span>
                <span className="card-value">{formatCurrency(netCashFlow)}</span>
              </div>
              {netCashFlow >= 0 ? <ArrowUpRight size={20} className="trend-icon positive" /> : <ArrowDownRight size={20} className="trend-icon negative" />}
            </div>
          </div>

          {/* Monthly Trends Chart */}
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
              <span className="legend-item"><span className="legend-color income" /> Income</span>
              <span className="legend-item"><span className="legend-color expense" /> Expenses</span>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="breakdown-card">
            <h3>Expense Breakdown</h3>
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
                <p>No expenses recorded for this month</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transactions Tab */}
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
                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expenses</option>
                </select>
              </div>
            </div>
            <div className="action-buttons">
              <button className="btn-secondary" onClick={exportToCSV}>
                <Download size={18} /> Export CSV
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
                    {transaction.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
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
              <h3>No transactions found</h3>
              <p>Add your first transaction to start tracking</p>
              <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                <Plus size={18} /> Add Transaction
              </button>
            </div>
          )}
        </div>
      )}

      {/* Budget Tab */}
      {activeTab === 'budget' && (
        <div className="budget-section">
          <div className="section-header">
            <h2>Monthly Budget</h2>
            <div className="budget-summary">
              <span>Total Budgeted: {formatCurrency(budgets.reduce((sum, b) => sum + b.budgeted, 0))}</span>
              <span>Total Spent: {formatCurrency(totalExpenses)}</span>
            </div>
          </div>

          <div className="budget-grid">
            {budgetsWithSpent.map((budget) => {
              const percentage = budget.budgeted > 0 ? (budget.spent / budget.budgeted) * 100 : 0;
              const isOverBudget = percentage > 100;

              return (
                <div key={budget.id} className={`budget-card ${isOverBudget ? 'over-budget' : ''}`}>
                  <div className="budget-header">
                    <h4>{budget.category}</h4>
                    <span className={`budget-status ${isOverBudget ? 'over' : percentage > 75 ? 'warning' : 'good'}`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="budget-amounts">
                    <span>Spent: {formatCurrency(budget.spent)}</span>
                    <span>of {formatCurrency(budget.budgeted)}</span>
                  </div>
                  <div className="budget-bar">
                    <div
                      className={`budget-fill ${isOverBudget ? 'over' : percentage > 75 ? 'warning' : 'good'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="budget-input-group">
                    <label>Budget Amount</label>
                    <input
                      type="number"
                      value={budget.budgeted || ''}
                      onChange={(e) => updateBudget(budget.category, parseFloat(e.target.value) || 0)}
                      placeholder="Set budget"
                    />
                  </div>
                </div>
              );
            })}
          </div>
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
                  <TrendingUp size={18} /> Income
                </button>
                <button
                  className={`type-btn ${transactionForm.type === 'expense' ? 'active expense' : ''}`}
                  onClick={() => setTransactionForm({ ...transactionForm, type: 'expense', category: '' })}
                >
                  <TrendingDown size={18} /> Expense
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
                <label>Description</label>
                <input
                  type="text"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                  placeholder="What was this for?"
                />
              </div>

              <div className="form-group">
                <label>Amount</label>
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
                  <option value="">Select category</option>
                  {(transactionForm.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
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
                  Recurring transaction
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

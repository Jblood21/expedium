import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Customer, Interaction, MonthlyGoal } from '../types';
import {
  Users, Plus, Search, Phone, Mail, Calendar, Target,
  TrendingUp, CheckCircle, XCircle, Clock, Edit2, Trash2,
  MessageSquare, Send, Award, BarChart2
} from 'lucide-react';

const CustomerManagement: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [goals, setGoals] = useState<MonthlyGoal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'customers' | 'goals' | 'analytics'>('customers');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
    nextFollowUp: ''
  });

  const [interactionData, setInteractionData] = useState({
    type: 'call' as 'call' | 'email' | 'meeting' | 'promotion',
    outcome: 'neutral' as 'positive' | 'negative' | 'neutral' | 'no-response',
    notes: ''
  });

  const [goalData, setGoalData] = useState({
    month: new Date().toISOString().slice(0, 7),
    targetOutreach: ''
  });

  useEffect(() => {
    if (!user) return;
    const savedCustomers = localStorage.getItem(`expedium_customers_${user.id}`);
    const savedGoals = localStorage.getItem(`expedium_goals_${user.id}`);
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`expedium_customers_${user.id}`, JSON.stringify(customers));
  }, [customers, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`expedium_goals_${user.id}`, JSON.stringify(goals));
  }, [goals, user]);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addCustomer = () => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      notes: formData.notes,
      lastContact: new Date().toISOString(),
      nextFollowUp: formData.nextFollowUp || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'lead',
      interactions: []
    };
    setCustomers([...customers, newCustomer]);
    setShowAddModal(false);
    resetForm();
  };

  const updateCustomer = () => {
    if (!selectedCustomer) return;
    const updated = customers.map(c =>
      c.id === selectedCustomer.id
        ? { ...c, ...formData }
        : c
    );
    setCustomers(updated);
    setShowAddModal(false);
    setSelectedCustomer(null);
    resetForm();
  };

  const deleteCustomer = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const addInteraction = () => {
    if (!selectedCustomer) return;

    const newInteraction: Interaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: interactionData.type,
      outcome: interactionData.outcome,
      notes: interactionData.notes
    };

    const updated = customers.map(c =>
      c.id === selectedCustomer.id
        ? {
          ...c,
          interactions: [...c.interactions, newInteraction],
          lastContact: new Date().toISOString(),
          status: interactionData.outcome === 'positive' ? 'active' as const : c.status
        }
        : c
    );

    setCustomers(updated);
    updateGoalProgress(interactionData.outcome);
    setShowInteractionModal(false);
    setSelectedCustomer(null);
    setInteractionData({ type: 'call', outcome: 'neutral', notes: '' });
  };

  const updateGoalProgress = (outcome: string) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const existingGoal = goals.find(g => g.month === currentMonth);

    if (existingGoal) {
      const updated = goals.map(g =>
        g.month === currentMonth
          ? {
            ...g,
            completed: g.completed + 1,
            responses: outcome !== 'no-response' ? g.responses + 1 : g.responses,
            positiveResponses: outcome === 'positive' ? g.positiveResponses + 1 : g.positiveResponses,
            negativeResponses: outcome === 'negative' ? g.negativeResponses + 1 : g.negativeResponses
          }
          : g
      );
      setGoals(updated);
    }
  };

  const addGoal = () => {
    const newGoal: MonthlyGoal = {
      month: goalData.month,
      targetOutreach: parseInt(goalData.targetOutreach) || 0,
      completed: 0,
      responses: 0,
      positiveResponses: 0,
      negativeResponses: 0
    };

    const existingIndex = goals.findIndex(g => g.month === goalData.month);
    if (existingIndex >= 0) {
      const updated = [...goals];
      updated[existingIndex] = { ...updated[existingIndex], targetOutreach: newGoal.targetOutreach };
      setGoals(updated);
    } else {
      setGoals([...goals, newGoal]);
    }

    setShowGoalModal(false);
    setGoalData({ month: new Date().toISOString().slice(0, 7), targetOutreach: '' });
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', company: '', notes: '', nextFollowUp: '' });
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company || '',
      notes: customer.notes,
      nextFollowUp: customer.nextFollowUp
    });
    setShowAddModal(true);
  };

  const openInteractionModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowInteractionModal(true);
  };

  const getUpcomingFollowUps = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return customers.filter(c => {
      const followUp = new Date(c.nextFollowUp);
      return followUp >= today && followUp <= nextWeek;
    }).sort((a, b) => new Date(a.nextFollowUp).getTime() - new Date(b.nextFollowUp).getTime());
  };

  const getCurrentMonthGoal = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return goals.find(g => g.month === currentMonth);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const currentGoal = getCurrentMonthGoal();
  const upcomingFollowUps = getUpcomingFollowUps();

  // Analytics calculations
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalInteractions = customers.reduce((sum, c) => sum + c.interactions.length, 0);
  const positiveRate = totalInteractions > 0
    ? Math.round((customers.reduce((sum, c) =>
      sum + c.interactions.filter(i => i.outcome === 'positive').length, 0) / totalInteractions) * 100)
    : 0;

  return (
    <div className="customer-management-page">
      <div className="crm-header">
        <div className="header-left">
          <Users size={32} />
          <div>
            <h1>Customer Management</h1>
            <p>Track customers, schedule follow-ups, and monitor your outreach goals</p>
          </div>
        </div>
        <button className="add-btn" onClick={() => { resetForm(); setSelectedCustomer(null); setShowAddModal(true); }}>
          <Plus size={20} /> Add Customer
        </button>
      </div>

      {/* Quick Stats */}
      <div className="stats-bar">
        <div className="stat-card">
          <Users size={24} />
          <div>
            <span className="stat-value">{totalCustomers}</span>
            <span className="stat-label">Total Customers</span>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle size={24} />
          <div>
            <span className="stat-value">{activeCustomers}</span>
            <span className="stat-label">Active</span>
          </div>
        </div>
        <div className="stat-card">
          <MessageSquare size={24} />
          <div>
            <span className="stat-value">{totalInteractions}</span>
            <span className="stat-label">Total Interactions</span>
          </div>
        </div>
        <div className="stat-card highlight">
          <TrendingUp size={24} />
          <div>
            <span className="stat-value">{positiveRate}%</span>
            <span className="stat-label">Positive Response Rate</span>
          </div>
        </div>
      </div>

      {/* Current Goal Progress */}
      {currentGoal && (
        <div className="goal-progress-bar">
          <div className="goal-info">
            <Target size={20} />
            <span>Monthly Goal: {currentGoal.completed} / {currentGoal.targetOutreach} outreach contacts</span>
          </div>
          <div className="progress-container">
            <div
              className="progress-fill"
              style={{ width: `${Math.min((currentGoal.completed / currentGoal.targetOutreach) * 100, 100)}%` }}
            />
          </div>
          <span className="goal-percent">
            {Math.round((currentGoal.completed / currentGoal.targetOutreach) * 100)}%
          </span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="crm-tabs">
        <button
          className={`tab ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <Users size={18} /> Customers
        </button>
        <button
          className={`tab ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          <Target size={18} /> Monthly Goals
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart2 size={18} /> Analytics
        </button>
      </div>

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="customers-section">
          <div className="customers-main">
            <div className="search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="customers-list">
              {filteredCustomers.length === 0 ? (
                <div className="empty-state">
                  <Users size={48} />
                  <p>No customers yet. Add your first customer to get started!</p>
                </div>
              ) : (
                filteredCustomers.map(customer => (
                  <div key={customer.id} className={`customer-card ${customer.status}`}>
                    <div className="customer-main-info">
                      <div className="customer-avatar">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="customer-details">
                        <h3>{customer.name}</h3>
                        {customer.company && <span className="company">{customer.company}</span>}
                        <div className="contact-info">
                          <span><Mail size={14} /> {customer.email}</span>
                          <span><Phone size={14} /> {customer.phone}</span>
                        </div>
                      </div>
                      <span className={`status-badge ${customer.status}`}>
                        {customer.status}
                      </span>
                    </div>

                    <div className="customer-meta">
                      <div className="meta-item">
                        <Clock size={14} />
                        <span>Last Contact: {formatDate(customer.lastContact)}</span>
                      </div>
                      <div className="meta-item">
                        <Calendar size={14} />
                        <span>Follow-up: {formatDate(customer.nextFollowUp)}</span>
                      </div>
                      <div className="meta-item">
                        <MessageSquare size={14} />
                        <span>{customer.interactions.length} interactions</span>
                      </div>
                    </div>

                    {customer.notes && (
                      <div className="customer-notes">
                        <p>{customer.notes}</p>
                      </div>
                    )}

                    {customer.interactions.length > 0 && (
                      <div className="recent-interactions">
                        <h4>Recent Interactions</h4>
                        {customer.interactions.slice(-3).reverse().map(interaction => (
                          <div key={interaction.id} className={`interaction-item ${interaction.outcome}`}>
                            <span className="interaction-type">{interaction.type}</span>
                            <span className="interaction-outcome">{interaction.outcome}</span>
                            <span className="interaction-date">{formatDate(interaction.date)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="customer-actions">
                      <button onClick={() => openInteractionModal(customer)} className="action-btn primary">
                        <Send size={16} /> Log Interaction
                      </button>
                      <button onClick={() => openEditModal(customer)} className="action-btn">
                        <Edit2 size={16} /> Edit
                      </button>
                      <button onClick={() => deleteCustomer(customer.id)} className="action-btn danger">
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="sidebar">
            <div className="sidebar-section">
              <h3><Calendar size={18} /> Upcoming Follow-ups</h3>
              {upcomingFollowUps.length === 0 ? (
                <p className="empty-text">No follow-ups scheduled this week</p>
              ) : (
                <div className="followup-list">
                  {upcomingFollowUps.map(customer => (
                    <div key={customer.id} className="followup-item">
                      <span className="followup-name">{customer.name}</span>
                      <span className="followup-date">{formatDate(customer.nextFollowUp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="goals-section">
          <div className="goals-header">
            <h2>Monthly Outreach Goals</h2>
            <button className="add-btn" onClick={() => setShowGoalModal(true)}>
              <Plus size={20} /> Set Goal
            </button>
          </div>

          <div className="goals-grid">
            {goals.sort((a, b) => b.month.localeCompare(a.month)).map(goal => {
              const progressPercent = goal.targetOutreach > 0
                ? Math.round((goal.completed / goal.targetOutreach) * 100)
                : 0;
              const responseRate = goal.completed > 0
                ? Math.round((goal.responses / goal.completed) * 100)
                : 0;
              const positiveResponseRate = goal.responses > 0
                ? Math.round((goal.positiveResponses / goal.responses) * 100)
                : 0;

              return (
                <div key={goal.month} className={`goal-card ${progressPercent >= 100 ? 'completed' : ''}`}>
                  <div className="goal-month">
                    {progressPercent >= 100 && <Award size={20} className="achievement-icon" />}
                    {getMonthName(goal.month)}
                  </div>

                  <div className="goal-progress">
                    <div className="progress-circle">
                      <svg viewBox="0 0 36 36">
                        <path
                          className="circle-bg"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="circle-fill"
                          strokeDasharray={`${Math.min(progressPercent, 100)}, 100`}
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="progress-percent">{progressPercent}%</span>
                    </div>
                    <div className="progress-text">
                      <span className="big">{goal.completed}</span>
                      <span className="small">/ {goal.targetOutreach} contacts</span>
                    </div>
                  </div>

                  <div className="goal-stats">
                    <div className="goal-stat">
                      <span className="label">Response Rate</span>
                      <span className="value">{responseRate}%</span>
                    </div>
                    <div className="goal-stat positive">
                      <CheckCircle size={16} />
                      <span className="label">Positive</span>
                      <span className="value">{goal.positiveResponses} ({positiveResponseRate}%)</span>
                    </div>
                    <div className="goal-stat negative">
                      <XCircle size={16} />
                      <span className="label">Negative</span>
                      <span className="value">{goal.negativeResponses}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {goals.length === 0 && (
              <div className="empty-state">
                <Target size={48} />
                <p>No goals set yet. Set your first monthly outreach goal!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="analytics-section">
          <h2>Performance Analytics</h2>

          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>Customer Status Distribution</h3>
              <div className="status-breakdown">
                <div className="status-bar">
                  <div
                    className="bar-segment lead"
                    style={{ width: `${totalCustomers > 0 ? (customers.filter(c => c.status === 'lead').length / totalCustomers) * 100 : 0}%` }}
                  />
                  <div
                    className="bar-segment active"
                    style={{ width: `${totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0}%` }}
                  />
                  <div
                    className="bar-segment inactive"
                    style={{ width: `${totalCustomers > 0 ? (customers.filter(c => c.status === 'inactive').length / totalCustomers) * 100 : 0}%` }}
                  />
                </div>
                <div className="status-legend">
                  <span className="legend-item lead">Leads: {customers.filter(c => c.status === 'lead').length}</span>
                  <span className="legend-item active">Active: {activeCustomers}</span>
                  <span className="legend-item inactive">Inactive: {customers.filter(c => c.status === 'inactive').length}</span>
                </div>
              </div>
            </div>

            <div className="analytics-card">
              <h3>Interaction Outcomes</h3>
              <div className="outcomes-grid">
                <div className="outcome-item positive">
                  <CheckCircle size={24} />
                  <span className="outcome-count">
                    {customers.reduce((sum, c) => sum + c.interactions.filter(i => i.outcome === 'positive').length, 0)}
                  </span>
                  <span className="outcome-label">Positive</span>
                </div>
                <div className="outcome-item neutral">
                  <MessageSquare size={24} />
                  <span className="outcome-count">
                    {customers.reduce((sum, c) => sum + c.interactions.filter(i => i.outcome === 'neutral').length, 0)}
                  </span>
                  <span className="outcome-label">Neutral</span>
                </div>
                <div className="outcome-item negative">
                  <XCircle size={24} />
                  <span className="outcome-count">
                    {customers.reduce((sum, c) => sum + c.interactions.filter(i => i.outcome === 'negative').length, 0)}
                  </span>
                  <span className="outcome-label">Negative</span>
                </div>
                <div className="outcome-item no-response">
                  <Clock size={24} />
                  <span className="outcome-count">
                    {customers.reduce((sum, c) => sum + c.interactions.filter(i => i.outcome === 'no-response').length, 0)}
                  </span>
                  <span className="outcome-label">No Response</span>
                </div>
              </div>
            </div>

            <div className="analytics-card full-width">
              <h3>Goal Achievement History</h3>
              <div className="goal-history">
                {goals.sort((a, b) => a.month.localeCompare(b.month)).map(goal => {
                  const achieved = goal.targetOutreach > 0 ? (goal.completed / goal.targetOutreach) * 100 : 0;
                  return (
                    <div key={goal.month} className="history-bar-container">
                      <span className="history-month">{getMonthName(goal.month).split(' ')[0].slice(0, 3)}</span>
                      <div className="history-bar">
                        <div
                          className={`history-fill ${achieved >= 100 ? 'complete' : achieved >= 50 ? 'half' : 'low'}`}
                          style={{ width: `${Math.min(achieved, 100)}%` }}
                        />
                      </div>
                      <span className="history-percent">{Math.round(achieved)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>

            <div className="modal-form">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Customer name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company name (optional)"
                />
              </div>
              <div className="form-group">
                <label>Next Follow-up Date</label>
                <input
                  type="date"
                  value={formData.nextFollowUp}
                  onChange={(e) => setFormData({ ...formData, nextFollowUp: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this customer..."
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button
                className="save-btn"
                onClick={selectedCustomer ? updateCustomer : addCustomer}
                disabled={!formData.name || !formData.email || !formData.phone}
              >
                {selectedCustomer ? 'Update' : 'Add'} Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Interaction Modal */}
      {showInteractionModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowInteractionModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Log Interaction with {selectedCustomer.name}</h2>

            <div className="modal-form">
              <div className="form-group">
                <label>Interaction Type</label>
                <select
                  value={interactionData.type}
                  onChange={(e) => setInteractionData({ ...interactionData, type: e.target.value as any })}
                >
                  <option value="call">Phone Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                  <option value="promotion">Promotional Outreach</option>
                </select>
              </div>
              <div className="form-group">
                <label>Outcome</label>
                <div className="outcome-buttons">
                  <button
                    className={`outcome-btn positive ${interactionData.outcome === 'positive' ? 'selected' : ''}`}
                    onClick={() => setInteractionData({ ...interactionData, outcome: 'positive' })}
                  >
                    <CheckCircle size={18} /> Positive
                  </button>
                  <button
                    className={`outcome-btn neutral ${interactionData.outcome === 'neutral' ? 'selected' : ''}`}
                    onClick={() => setInteractionData({ ...interactionData, outcome: 'neutral' })}
                  >
                    <MessageSquare size={18} /> Neutral
                  </button>
                  <button
                    className={`outcome-btn negative ${interactionData.outcome === 'negative' ? 'selected' : ''}`}
                    onClick={() => setInteractionData({ ...interactionData, outcome: 'negative' })}
                  >
                    <XCircle size={18} /> Negative
                  </button>
                  <button
                    className={`outcome-btn no-response ${interactionData.outcome === 'no-response' ? 'selected' : ''}`}
                    onClick={() => setInteractionData({ ...interactionData, outcome: 'no-response' })}
                  >
                    <Clock size={18} /> No Response
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={interactionData.notes}
                  onChange={(e) => setInteractionData({ ...interactionData, notes: e.target.value })}
                  placeholder="Details about this interaction..."
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowInteractionModal(false)}>Cancel</button>
              <button className="save-btn" onClick={addInteraction}>
                Log Interaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Goal Modal */}
      {showGoalModal && (
        <div className="modal-overlay" onClick={() => setShowGoalModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Set Monthly Outreach Goal</h2>

            <div className="modal-form">
              <div className="form-group">
                <label>Month</label>
                <input
                  type="month"
                  value={goalData.month}
                  onChange={(e) => setGoalData({ ...goalData, month: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Target Outreach Contacts</label>
                <input
                  type="number"
                  value={goalData.targetOutreach}
                  onChange={(e) => setGoalData({ ...goalData, targetOutreach: e.target.value })}
                  placeholder="e.g., 50"
                  min="1"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowGoalModal(false)}>Cancel</button>
              <button
                className="save-btn"
                onClick={addGoal}
                disabled={!goalData.targetOutreach}
              >
                Set Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;

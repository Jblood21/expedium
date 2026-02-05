import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Target, Grid, Users, Plus, Trash2, Edit2, Save, X,
  CheckCircle, Circle, Flag, Calendar, AlertTriangle, Shield, Lightbulb,
  Zap
} from 'lucide-react';

interface SWOTItem {
  id: string;
  text: string;
}

interface SWOTAnalysis {
  id: string;
  name: string;
  date: string;
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
}

interface Competitor {
  id: string;
  name: string;
  website: string;
  strengths: string;
  weaknesses: string;
  pricing: string;
  marketShare: string;
  notes: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'quarterly' | 'yearly' | 'custom';
  deadline: string;
  progress: number;
  keyResults: KeyResult[];
  status: 'not-started' | 'in-progress' | 'completed' | 'at-risk';
}

interface KeyResult {
  id: string;
  text: string;
  target: number;
  current: number;
  unit: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  category: string;
}

const Strategy: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('swot');
  const [swotAnalyses, setSWOTAnalyses] = useState<SWOTAnalysis[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'swot' | 'competitor' | 'goal' | 'milestone'>('swot');
  const [currentSWOT, setCurrentSWOT] = useState<SWOTAnalysis | null>(null);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  // Form states
  const [swotName, setSWOTName] = useState('');
  const [swotItems, setSWOTItems] = useState({
    strengths: [''],
    weaknesses: [''],
    opportunities: [''],
    threats: ['']
  });

  const [competitorForm, setCompetitorForm] = useState({
    name: '', website: '', strengths: '', weaknesses: '', pricing: '', marketShare: '', notes: ''
  });

  const [goalForm, setGoalForm] = useState({
    title: '', description: '', type: 'quarterly' as Goal['type'], deadline: '', keyResults: [{ text: '', target: 0, current: 0, unit: '' }]
  });

  const [milestoneForm, setMilestoneForm] = useState({
    title: '', description: '', date: '', category: 'Business'
  });

  useEffect(() => {
    const savedSWOT = localStorage.getItem(`expedium_swot_${user?.id}`);
    const savedCompetitors = localStorage.getItem(`expedium_competitors_${user?.id}`);
    const savedGoals = localStorage.getItem(`expedium_goals_strategy_${user?.id}`);
    const savedMilestones = localStorage.getItem(`expedium_milestones_${user?.id}`);

    if (savedSWOT) setSWOTAnalyses(JSON.parse(savedSWOT));
    if (savedCompetitors) setCompetitors(JSON.parse(savedCompetitors));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    if (savedMilestones) setMilestones(JSON.parse(savedMilestones));
  }, [user]);

  const saveSWOT = (data: SWOTAnalysis[]) => {
    setSWOTAnalyses(data);
    localStorage.setItem(`expedium_swot_${user?.id}`, JSON.stringify(data));
  };

  const saveCompetitors = (data: Competitor[]) => {
    setCompetitors(data);
    localStorage.setItem(`expedium_competitors_${user?.id}`, JSON.stringify(data));
  };

  const saveGoals = (data: Goal[]) => {
    setGoals(data);
    localStorage.setItem(`expedium_goals_strategy_${user?.id}`, JSON.stringify(data));
  };

  const saveMilestones = (data: Milestone[]) => {
    setMilestones(data);
    localStorage.setItem(`expedium_milestones_${user?.id}`, JSON.stringify(data));
  };

  const openModal = (type: typeof modalType) => {
    setModalType(type);
    setShowModal(true);
  };

  // SWOT Functions
  const addSWOTItem = (category: keyof typeof swotItems) => {
    setSWOTItems({ ...swotItems, [category]: [...swotItems[category], ''] });
  };

  const updateSWOTItem = (category: keyof typeof swotItems, index: number, value: string) => {
    const newItems = [...swotItems[category]];
    newItems[index] = value;
    setSWOTItems({ ...swotItems, [category]: newItems });
  };

  const removeSWOTItem = (category: keyof typeof swotItems, index: number) => {
    if (swotItems[category].length > 1) {
      setSWOTItems({ ...swotItems, [category]: swotItems[category].filter((_, i) => i !== index) });
    }
  };

  const saveSWOTAnalysis = () => {
    const analysis: SWOTAnalysis = {
      id: currentSWOT?.id || Date.now().toString(),
      name: swotName || 'SWOT Analysis',
      date: new Date().toISOString().split('T')[0],
      strengths: swotItems.strengths.filter(s => s.trim()).map(s => ({ id: Date.now().toString() + Math.random(), text: s })),
      weaknesses: swotItems.weaknesses.filter(s => s.trim()).map(s => ({ id: Date.now().toString() + Math.random(), text: s })),
      opportunities: swotItems.opportunities.filter(s => s.trim()).map(s => ({ id: Date.now().toString() + Math.random(), text: s })),
      threats: swotItems.threats.filter(s => s.trim()).map(s => ({ id: Date.now().toString() + Math.random(), text: s }))
    };

    if (currentSWOT) {
      saveSWOT(swotAnalyses.map(s => s.id === currentSWOT.id ? analysis : s));
    } else {
      saveSWOT([...swotAnalyses, analysis]);
    }

    resetSWOTForm();
    setShowModal(false);
  };

  const editSWOT = (swot: SWOTAnalysis) => {
    setCurrentSWOT(swot);
    setSWOTName(swot.name);
    setSWOTItems({
      strengths: swot.strengths.map(s => s.text),
      weaknesses: swot.weaknesses.map(s => s.text),
      opportunities: swot.opportunities.map(s => s.text),
      threats: swot.threats.map(s => s.text)
    });
    openModal('swot');
  };

  const resetSWOTForm = () => {
    setSWOTName('');
    setSWOTItems({ strengths: [''], weaknesses: [''], opportunities: [''], threats: [''] });
    setCurrentSWOT(null);
  };

  // Competitor Functions
  const saveCompetitorData = () => {
    const competitor: Competitor = {
      id: editingCompetitor?.id || Date.now().toString(),
      ...competitorForm
    };

    if (editingCompetitor) {
      saveCompetitors(competitors.map(c => c.id === editingCompetitor.id ? competitor : c));
    } else {
      saveCompetitors([...competitors, competitor]);
    }

    resetCompetitorForm();
    setShowModal(false);
  };

  const resetCompetitorForm = () => {
    setCompetitorForm({ name: '', website: '', strengths: '', weaknesses: '', pricing: '', marketShare: '', notes: '' });
    setEditingCompetitor(null);
  };

  // Goal Functions
  const addKeyResult = () => {
    setGoalForm({
      ...goalForm,
      keyResults: [...goalForm.keyResults, { text: '', target: 0, current: 0, unit: '' }]
    });
  };

  const updateKeyResult = (index: number, field: string, value: string | number) => {
    const newKRs = goalForm.keyResults.map((kr, i) =>
      i === index ? { ...kr, [field]: value } : kr
    );
    setGoalForm({ ...goalForm, keyResults: newKRs });
  };

  const saveGoalData = () => {
    const goal: Goal = {
      id: editingGoal?.id || Date.now().toString(),
      title: goalForm.title,
      description: goalForm.description,
      type: goalForm.type,
      deadline: goalForm.deadline,
      progress: editingGoal?.progress || 0,
      keyResults: goalForm.keyResults.filter(kr => kr.text.trim()).map(kr => ({
        id: Date.now().toString() + Math.random(),
        ...kr
      })),
      status: 'not-started'
    };

    if (editingGoal) {
      saveGoals(goals.map(g => g.id === editingGoal.id ? goal : g));
    } else {
      saveGoals([...goals, goal]);
    }

    resetGoalForm();
    setShowModal(false);
  };

  const resetGoalForm = () => {
    setGoalForm({ title: '', description: '', type: 'quarterly', deadline: '', keyResults: [{ text: '', target: 0, current: 0, unit: '' }] });
    setEditingGoal(null);
  };

  const updateGoalProgress = (goalId: string, krId: string, current: number) => {
    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        const updatedKRs = g.keyResults.map(kr =>
          kr.id === krId ? { ...kr, current } : kr
        );
        const totalProgress = updatedKRs.reduce((sum, kr) => sum + (kr.current / kr.target) * 100, 0) / updatedKRs.length;
        return { ...g, keyResults: updatedKRs, progress: Math.round(totalProgress) };
      }
      return g;
    });
    saveGoals(updatedGoals);
  };

  // Milestone Functions
  const saveMilestoneData = () => {
    const milestone: Milestone = {
      id: editingMilestone?.id || Date.now().toString(),
      ...milestoneForm,
      completed: editingMilestone?.completed || false
    };

    if (editingMilestone) {
      saveMilestones(milestones.map(m => m.id === editingMilestone.id ? milestone : m));
    } else {
      saveMilestones([...milestones, milestone]);
    }

    resetMilestoneForm();
    setShowModal(false);
  };

  const toggleMilestone = (id: string) => {
    saveMilestones(milestones.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  const resetMilestoneForm = () => {
    setMilestoneForm({ title: '', description: '', date: '', category: 'Business' });
    setEditingMilestone(null);
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'at-risk': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const milestoneCategories = ['Business', 'Product', 'Marketing', 'Sales', 'Team', 'Financial'];

  return (
    <div className="strategy-page">
      <div className="page-header">
        <Target size={32} />
        <h1>Strategy Tools</h1>
        <p>SWOT analysis, competitor tracking, goals, and milestones</p>
      </div>

      {/* Tabs */}
      <div className="strategy-tabs">
        <button className={`tab-btn ${activeTab === 'swot' ? 'active' : ''}`} onClick={() => setActiveTab('swot')}>
          <Grid size={18} /> SWOT Analysis
        </button>
        <button className={`tab-btn ${activeTab === 'competitors' ? 'active' : ''}`} onClick={() => setActiveTab('competitors')}>
          <Users size={18} /> Competitors
        </button>
        <button className={`tab-btn ${activeTab === 'goals' ? 'active' : ''}`} onClick={() => setActiveTab('goals')}>
          <Target size={18} /> Goals (OKRs)
        </button>
        <button className={`tab-btn ${activeTab === 'milestones' ? 'active' : ''}`} onClick={() => setActiveTab('milestones')}>
          <Flag size={18} /> Milestones
        </button>
      </div>

      {/* SWOT Tab */}
      {activeTab === 'swot' && (
        <div className="swot-section">
          <div className="section-header">
            <h2>SWOT Analyses</h2>
            <button className="btn-primary" onClick={() => { resetSWOTForm(); openModal('swot'); }}>
              <Plus size={18} /> New Analysis
            </button>
          </div>

          {swotAnalyses.length > 0 ? (
            <div className="swot-list">
              {swotAnalyses.map((swot) => (
                <div key={swot.id} className="swot-card">
                  <div className="swot-card-header">
                    <h3>{swot.name}</h3>
                    <span className="swot-date">{swot.date}</span>
                    <div className="swot-actions">
                      <button className="icon-btn" onClick={() => editSWOT(swot)}><Edit2 size={16} /></button>
                      <button className="icon-btn" onClick={() => saveSWOT(swotAnalyses.filter(s => s.id !== swot.id))}><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="swot-grid">
                    <div className="swot-quadrant strengths">
                      <h4><Shield size={16} /> Strengths</h4>
                      <ul>{swot.strengths.map(s => <li key={s.id}>{s.text}</li>)}</ul>
                    </div>
                    <div className="swot-quadrant weaknesses">
                      <h4><AlertTriangle size={16} /> Weaknesses</h4>
                      <ul>{swot.weaknesses.map(w => <li key={w.id}>{w.text}</li>)}</ul>
                    </div>
                    <div className="swot-quadrant opportunities">
                      <h4><Lightbulb size={16} /> Opportunities</h4>
                      <ul>{swot.opportunities.map(o => <li key={o.id}>{o.text}</li>)}</ul>
                    </div>
                    <div className="swot-quadrant threats">
                      <h4><Zap size={16} /> Threats</h4>
                      <ul>{swot.threats.map(t => <li key={t.id}>{t.text}</li>)}</ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Grid size={48} />
              <h3>No SWOT analyses yet</h3>
              <p>Create your first SWOT analysis to evaluate your business position</p>
              <button className="btn-primary" onClick={() => { resetSWOTForm(); openModal('swot'); }}>
                <Plus size={18} /> Create SWOT Analysis
              </button>
            </div>
          )}
        </div>
      )}

      {/* Competitors Tab */}
      {activeTab === 'competitors' && (
        <div className="competitors-section">
          <div className="section-header">
            <h2>Competitor Analysis</h2>
            <button className="btn-primary" onClick={() => { resetCompetitorForm(); openModal('competitor'); }}>
              <Plus size={18} /> Add Competitor
            </button>
          </div>

          {competitors.length > 0 ? (
            <div className="competitors-grid">
              {competitors.map((competitor) => (
                <div key={competitor.id} className="competitor-card">
                  <div className="competitor-header">
                    <h3>{competitor.name}</h3>
                    <div className="competitor-actions">
                      <button className="icon-btn" onClick={() => {
                        setCompetitorForm(competitor);
                        setEditingCompetitor(competitor);
                        openModal('competitor');
                      }}><Edit2 size={16} /></button>
                      <button className="icon-btn" onClick={() => saveCompetitors(competitors.filter(c => c.id !== competitor.id))}><Trash2 size={16} /></button>
                    </div>
                  </div>
                  {competitor.website && <a href={competitor.website} target="_blank" rel="noopener noreferrer" className="competitor-website">{competitor.website}</a>}
                  <div className="competitor-details">
                    {competitor.strengths && <div className="detail-item"><strong>Strengths:</strong> {competitor.strengths}</div>}
                    {competitor.weaknesses && <div className="detail-item"><strong>Weaknesses:</strong> {competitor.weaknesses}</div>}
                    {competitor.pricing && <div className="detail-item"><strong>Pricing:</strong> {competitor.pricing}</div>}
                    {competitor.marketShare && <div className="detail-item"><strong>Market Share:</strong> {competitor.marketShare}</div>}
                    {competitor.notes && <div className="detail-item"><strong>Notes:</strong> {competitor.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Users size={48} />
              <h3>No competitors added yet</h3>
              <p>Track your competitors to stay ahead</p>
              <button className="btn-primary" onClick={() => { resetCompetitorForm(); openModal('competitor'); }}>
                <Plus size={18} /> Add Competitor
              </button>
            </div>
          )}
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="goals-section">
          <div className="section-header">
            <h2>Goals & OKRs</h2>
            <button className="btn-primary" onClick={() => { resetGoalForm(); openModal('goal'); }}>
              <Plus size={18} /> Add Goal
            </button>
          </div>

          {goals.length > 0 ? (
            <div className="goals-list">
              {goals.map((goal) => (
                <div key={goal.id} className="goal-card">
                  <div className="goal-header">
                    <div className="goal-title">
                      <h3>{goal.title}</h3>
                      <span className="goal-type">{goal.type}</span>
                    </div>
                    <div className="goal-meta">
                      <span className="goal-deadline"><Calendar size={14} /> {goal.deadline}</span>
                      <span className="goal-status" style={{ color: getStatusColor(goal.status) }}>{goal.status.replace('-', ' ')}</span>
                    </div>
                  </div>
                  {goal.description && <p className="goal-description">{goal.description}</p>}
                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${goal.progress}%` }} />
                    </div>
                    <span className="progress-text">{goal.progress}%</span>
                  </div>
                  {goal.keyResults.length > 0 && (
                    <div className="key-results">
                      <h4>Key Results</h4>
                      {goal.keyResults.map((kr) => (
                        <div key={kr.id} className="kr-item">
                          <span className="kr-text">{kr.text}</span>
                          <div className="kr-progress">
                            <input
                              type="number"
                              value={kr.current}
                              onChange={(e) => updateGoalProgress(goal.id, kr.id, parseFloat(e.target.value) || 0)}
                              className="kr-input"
                            />
                            <span>/ {kr.target} {kr.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="goal-actions">
                    <button className="icon-btn" onClick={() => {
                      setGoalForm({
                        title: goal.title,
                        description: goal.description,
                        type: goal.type,
                        deadline: goal.deadline,
                        keyResults: goal.keyResults.map(kr => ({ text: kr.text, target: kr.target, current: kr.current, unit: kr.unit }))
                      });
                      setEditingGoal(goal);
                      openModal('goal');
                    }}><Edit2 size={16} /></button>
                    <button className="icon-btn" onClick={() => saveGoals(goals.filter(g => g.id !== goal.id))}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Target size={48} />
              <h3>No goals set yet</h3>
              <p>Set SMART goals and track your progress with OKRs</p>
              <button className="btn-primary" onClick={() => { resetGoalForm(); openModal('goal'); }}>
                <Plus size={18} /> Set Your First Goal
              </button>
            </div>
          )}
        </div>
      )}

      {/* Milestones Tab */}
      {activeTab === 'milestones' && (
        <div className="milestones-section">
          <div className="section-header">
            <h2>Business Milestones</h2>
            <button className="btn-primary" onClick={() => { resetMilestoneForm(); openModal('milestone'); }}>
              <Plus size={18} /> Add Milestone
            </button>
          </div>

          {milestones.length > 0 ? (
            <div className="milestones-timeline">
              {milestones
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((milestone) => (
                  <div key={milestone.id} className={`milestone-item ${milestone.completed ? 'completed' : ''}`}>
                    <div className="milestone-marker" onClick={() => toggleMilestone(milestone.id)}>
                      {milestone.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                    </div>
                    <div className="milestone-content">
                      <div className="milestone-header">
                        <h4>{milestone.title}</h4>
                        <span className="milestone-category">{milestone.category}</span>
                      </div>
                      <p>{milestone.description}</p>
                      <span className="milestone-date"><Calendar size={14} /> {milestone.date}</span>
                    </div>
                    <div className="milestone-actions">
                      <button className="icon-btn" onClick={() => {
                        setMilestoneForm({ title: milestone.title, description: milestone.description, date: milestone.date, category: milestone.category });
                        setEditingMilestone(milestone);
                        openModal('milestone');
                      }}><Edit2 size={16} /></button>
                      <button className="icon-btn" onClick={() => saveMilestones(milestones.filter(m => m.id !== milestone.id))}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="empty-state">
              <Flag size={48} />
              <h3>No milestones yet</h3>
              <p>Track important business milestones and achievements</p>
              <button className="btn-primary" onClick={() => { resetMilestoneForm(); openModal('milestone'); }}>
                <Plus size={18} /> Add First Milestone
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalType === 'swot' && (currentSWOT ? 'Edit SWOT Analysis' : 'New SWOT Analysis')}
                {modalType === 'competitor' && (editingCompetitor ? 'Edit Competitor' : 'Add Competitor')}
                {modalType === 'goal' && (editingGoal ? 'Edit Goal' : 'Add Goal')}
                {modalType === 'milestone' && (editingMilestone ? 'Edit Milestone' : 'Add Milestone')}
              </h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>

            {/* SWOT Form */}
            {modalType === 'swot' && (
              <div className="swot-form">
                <div className="form-group">
                  <label>Analysis Name</label>
                  <input type="text" value={swotName} onChange={(e) => setSWOTName(e.target.value)} placeholder="e.g., Q1 2024 Analysis" />
                </div>
                <div className="swot-form-grid">
                  {(['strengths', 'weaknesses', 'opportunities', 'threats'] as const).map((category) => (
                    <div key={category} className={`swot-form-section ${category}`}>
                      <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                      {swotItems[category].map((item, idx) => (
                        <div key={idx} className="swot-input-row">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateSWOTItem(category, idx, e.target.value)}
                            placeholder={`Add ${category.slice(0, -1)}...`}
                          />
                          <button className="remove-btn" onClick={() => removeSWOTItem(category, idx)}><X size={16} /></button>
                        </div>
                      ))}
                      <button className="add-item-btn" onClick={() => addSWOTItem(category)}><Plus size={16} /> Add</button>
                    </div>
                  ))}
                </div>
                <div className="form-actions">
                  <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn-primary" onClick={saveSWOTAnalysis}><Save size={18} /> Save</button>
                </div>
              </div>
            )}

            {/* Competitor Form */}
            {modalType === 'competitor' && (
              <div className="competitor-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Competitor Name</label>
                    <input type="text" value={competitorForm.name} onChange={(e) => setCompetitorForm({ ...competitorForm, name: e.target.value })} placeholder="Company name" />
                  </div>
                  <div className="form-group">
                    <label>Website</label>
                    <input type="url" value={competitorForm.website} onChange={(e) => setCompetitorForm({ ...competitorForm, website: e.target.value })} placeholder="https://" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Their Strengths</label>
                    <textarea value={competitorForm.strengths} onChange={(e) => setCompetitorForm({ ...competitorForm, strengths: e.target.value })} placeholder="What do they do well?" rows={3} />
                  </div>
                  <div className="form-group">
                    <label>Their Weaknesses</label>
                    <textarea value={competitorForm.weaknesses} onChange={(e) => setCompetitorForm({ ...competitorForm, weaknesses: e.target.value })} placeholder="Where do they fall short?" rows={3} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Pricing</label>
                    <input type="text" value={competitorForm.pricing} onChange={(e) => setCompetitorForm({ ...competitorForm, pricing: e.target.value })} placeholder="Their pricing model" />
                  </div>
                  <div className="form-group">
                    <label>Market Share</label>
                    <input type="text" value={competitorForm.marketShare} onChange={(e) => setCompetitorForm({ ...competitorForm, marketShare: e.target.value })} placeholder="Estimated market share" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea value={competitorForm.notes} onChange={(e) => setCompetitorForm({ ...competitorForm, notes: e.target.value })} placeholder="Additional observations..." rows={3} />
                </div>
                <div className="form-actions">
                  <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn-primary" onClick={saveCompetitorData}><Save size={18} /> Save</button>
                </div>
              </div>
            )}

            {/* Goal Form */}
            {modalType === 'goal' && (
              <div className="goal-form">
                <div className="form-group">
                  <label>Goal Title</label>
                  <input type="text" value={goalForm.title} onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} placeholder="What do you want to achieve?" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={goalForm.description} onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })} placeholder="Why is this goal important?" rows={3} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select value={goalForm.type} onChange={(e) => setGoalForm({ ...goalForm, type: e.target.value as Goal['type'] })}>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Deadline</label>
                    <input type="date" value={goalForm.deadline} onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })} />
                  </div>
                </div>
                <div className="key-results-section">
                  <h4>Key Results</h4>
                  {goalForm.keyResults.map((kr, idx) => (
                    <div key={idx} className="kr-form-row">
                      <input type="text" value={kr.text} onChange={(e) => updateKeyResult(idx, 'text', e.target.value)} placeholder="Key result description" className="kr-text-input" />
                      <input type="number" value={kr.target || ''} onChange={(e) => updateKeyResult(idx, 'target', parseFloat(e.target.value) || 0)} placeholder="Target" className="kr-num-input" />
                      <input type="text" value={kr.unit} onChange={(e) => updateKeyResult(idx, 'unit', e.target.value)} placeholder="Unit" className="kr-unit-input" />
                    </div>
                  ))}
                  <button className="add-item-btn" onClick={addKeyResult}><Plus size={16} /> Add Key Result</button>
                </div>
                <div className="form-actions">
                  <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn-primary" onClick={saveGoalData}><Save size={18} /> Save</button>
                </div>
              </div>
            )}

            {/* Milestone Form */}
            {modalType === 'milestone' && (
              <div className="milestone-form">
                <div className="form-group">
                  <label>Milestone Title</label>
                  <input type="text" value={milestoneForm.title} onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })} placeholder="What's the milestone?" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={milestoneForm.description} onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })} placeholder="Describe this milestone..." rows={3} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Target Date</label>
                    <input type="date" value={milestoneForm.date} onChange={(e) => setMilestoneForm({ ...milestoneForm, date: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={milestoneForm.category} onChange={(e) => setMilestoneForm({ ...milestoneForm, category: e.target.value })}>
                      {milestoneCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn-primary" onClick={saveMilestoneData}><Save size={18} /> Save</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Strategy;

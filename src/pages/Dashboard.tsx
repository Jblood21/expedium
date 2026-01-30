import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, TrendingUp, Users, Target, DollarSign,
  CheckCircle, Zap, BarChart3, Calculator,
  FileText, Lightbulb, ArrowRight, BookOpen, Megaphone,
  ChevronRight, ChevronDown, Star, Shield, Hammer, User
} from 'lucide-react';
import { BusinessPlanAnswers } from '../types';
import { getPhaseProgress, getPhases } from '../utils/phaseTracker';

// Map icon names to components
const iconMap: Record<string, React.ElementType> = {
  Lightbulb, Hammer, TrendingUp, Shield, ClipboardList: LayoutDashboard,
  User, Target, BookOpen, DollarSign, Calculator, Users, FileText,
  Megaphone, BarChart3,
};

const getIcon = (name: string): React.ElementType => iconMap[name] || Target;

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<BusinessPlanAnswers>({});
  const [planCompleted, setPlanCompleted] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const savedAnswers = localStorage.getItem(`expedium_answers_${user.id}`);
    const savedPlanCompleted = localStorage.getItem(`expedium_plan_completed_${user.id}`);
    const savedCompletedSteps = localStorage.getItem(`expedium_completed_steps_${user.id}`);

    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
    if (savedPlanCompleted) setPlanCompleted(true);
    if (savedCompletedSteps) setCompletedSteps(JSON.parse(savedCompletedSteps));
  }, [user]);

  const progress = useMemo(() => {
    if (!user) return null;
    return getPhaseProgress(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, planCompleted, completedSteps]);

  const markStepComplete = (stepId: string) => {
    if (!user) return;
    const updated = [...completedSteps, stepId];
    setCompletedSteps(updated);
    localStorage.setItem(`expedium_completed_steps_${user.id}`, JSON.stringify(updated));
  };

  // Auto-expand current phase
  useEffect(() => {
    if (progress) {
      const currentPhase = progress.phaseStatuses[progress.currentPhaseIndex];
      setExpandedPhase(currentPhase.phase.id);
    }
  }, [progress]);

  const togglePhase = (phaseId: string) => {
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
  };

  // Welcome screen before business plan
  if (!planCompleted) {
    return (
      <div className="dashboard-page">
        <div className="welcome-screen">
          <div className="welcome-icon">
            <Zap size={64} />
          </div>
          <h1>Welcome to Expedium, {user?.name}!</h1>
          <p>Your guided journey through building a successful business.</p>

          <div className="journey-preview">
            <h3>Your Business Journey</h3>
            <div className="journey-phases-preview">
              {getPhases().map((phase, i) => {
                const PhaseIcon = getIcon(phase.iconName);
                return (
                  <div key={phase.id} className="journey-phase-preview">
                    <div className="preview-phase-icon">
                      <PhaseIcon size={24} />
                    </div>
                    <div className="preview-phase-info">
                      <span className="preview-phase-number">Phase {i + 1}</span>
                      <span className="preview-phase-name">{phase.name}</span>
                      <span className="preview-phase-subtitle">{phase.subtitle}</span>
                    </div>
                    {i < 3 && <div className="preview-connector" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="welcome-steps">
            <div className="welcome-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Tell Us About Your Business</h3>
                <p>Answer a few questions about your business, goals, and challenges.</p>
              </div>
            </div>
            <div className="welcome-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Get Your Personalized Roadmap</h3>
                <p>We'll create a 4-phase journey tailored to your specific needs.</p>
              </div>
            </div>
            <div className="welcome-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Build & Grow Step by Step</h3>
                <p>Follow your roadmap from foundation to optimization.</p>
              </div>
            </div>
          </div>

          <button className="start-journey-btn" onClick={() => navigate('/business-plan')}>
            <Lightbulb size={24} />
            Start Your Business Profile
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (!progress) return null;

  return (
    <div className="dashboard-page">
      {/* Journey Header */}
      <div className="journey-header">
        <div className="journey-header-left">
          <h1><LayoutDashboard size={28} /> Your Business Journey</h1>
          <p>{answers.business_name || 'Your Business'} &middot; {answers.business_stage || 'Getting Started'}</p>
        </div>
        <div className="journey-header-right">
          <div className="overall-progress-info">
            <span className="progress-percent">{progress.overallPercent}%</span>
            <span className="progress-detail">{progress.completedTasks} of {progress.totalTasks} tasks</span>
          </div>
          <div className="overall-progress-bar">
            <div className="overall-progress-fill" style={{ width: `${progress.overallPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Phase Roadmap */}
      <div className="phase-roadmap">
        {progress.phaseStatuses.map((ps, index) => {
          const PhaseIcon = getIcon(ps.phase.iconName);
          const statusClass = ps.isComplete ? 'completed' : ps.isCurrent ? 'active' : 'upcoming';
          return (
            <React.Fragment key={ps.phase.id}>
              <button
                className={`phase-node ${statusClass}`}
                onClick={() => togglePhase(ps.phase.id)}
              >
                <div className="phase-node-circle">
                  {ps.isComplete ? (
                    <CheckCircle size={20} />
                  ) : (
                    <PhaseIcon size={20} />
                  )}
                </div>
                <div className="phase-node-label">
                  <span className="phase-node-name">{ps.phase.name}</span>
                  <span className="phase-node-count">{ps.completedTasks}/{ps.totalTasks}</span>
                </div>
              </button>
              {index < progress.phaseStatuses.length - 1 && (
                <div className={`phase-connector ${ps.isComplete ? 'completed' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Phase Sections */}
      <div className="phase-sections">
        {progress.phaseStatuses.map((ps, phaseIndex) => {
          const isExpanded = expandedPhase === ps.phase.id;
          const PhaseIcon = getIcon(ps.phase.iconName);
          const statusClass = ps.isComplete ? 'completed' : ps.isCurrent ? 'active' : 'upcoming';

          return (
            <div key={ps.phase.id} className={`phase-section ${statusClass} ${isExpanded ? 'expanded' : ''}`}>
              <button className="phase-section-header" onClick={() => togglePhase(ps.phase.id)}>
                <div className="phase-section-left">
                  <div className={`phase-badge ${statusClass}`}>
                    {ps.isComplete ? <CheckCircle size={18} /> : <PhaseIcon size={18} />}
                  </div>
                  <div className="phase-section-title">
                    <h2>
                      <span className="phase-number">Phase {phaseIndex + 1}:</span> {ps.phase.name}
                      <span className="phase-subtitle"> &mdash; {ps.phase.subtitle}</span>
                    </h2>
                    <p>{ps.phase.description}</p>
                  </div>
                </div>
                <div className="phase-section-right">
                  <div className="phase-progress-mini">
                    <span>{ps.completedTasks}/{ps.totalTasks}</span>
                    <div className="phase-progress-dots">
                      {ps.phase.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`phase-dot ${user && task.checkComplete(user.id) ? 'done' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </button>

              {isExpanded && (
                <div className="phase-task-grid">
                  {ps.phase.tasks.map((task, taskIndex) => {
                    const isDone = user ? task.checkComplete(user.id) : false;
                    const TaskIcon = getIcon(task.iconName);
                    return (
                      <div key={task.id} className={`phase-task-card ${isDone ? 'done' : ''}`}>
                        <div className="task-card-header">
                          <div className="task-step-number">{taskIndex + 1}</div>
                          {isDone && <CheckCircle size={18} className="task-check" />}
                        </div>
                        <div className="task-card-icon">
                          <TaskIcon size={28} />
                        </div>
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>
                        <div className="task-card-actions">
                          {isDone ? (
                            <Link to={task.path} className="task-btn done">
                              Review <ChevronRight size={16} />
                            </Link>
                          ) : (
                            <>
                              <Link to={task.path} className="task-btn primary">
                                Start <ArrowRight size={16} />
                              </Link>
                              <button
                                className="task-btn secondary"
                                onClick={() => markStepComplete(task.id)}
                              >
                                <CheckCircle size={14} /> Done
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Business Profile Summary */}
      <div className="business-summary-card">
        <div className="summary-header">
          <h3><Star size={20} /> Your Business Profile</h3>
          <Link to="/business-plan" className="edit-link">Edit Profile</Link>
        </div>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">Business</span>
            <span className="value">{answers.business_name || 'Not set'}</span>
          </div>
          <div className="summary-item">
            <span className="label">Industry</span>
            <span className="value">{Array.isArray(answers.industry) ? answers.industry.slice(0, 2).join(', ') : 'Not set'}</span>
          </div>
          <div className="summary-item">
            <span className="label">Stage</span>
            <span className="value">{answers.business_stage || 'Not set'}</span>
          </div>
          <div className="summary-item">
            <span className="label">Revenue</span>
            <span className="value">{answers.current_revenue || 'Not set'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

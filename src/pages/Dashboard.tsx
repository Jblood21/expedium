import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, TrendingUp, Users, Target, DollarSign,
  CheckCircle, Zap, BarChart3, Calculator,
  FileText, Lightbulb, ArrowRight, BookOpen, Megaphone,
  ChevronRight, ChevronDown, Star, Shield, Hammer, User,
  Clock
} from 'lucide-react';
import { BusinessPlanAnswers } from '../types';
import { getPhaseProgress, getPhases } from '../utils/phaseTracker';

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

  useEffect(() => {
    if (progress) {
      const currentPhase = progress.phaseStatuses[progress.currentPhaseIndex];
      setExpandedPhase(currentPhase.phase.id);
    }
  }, [progress]);

  const togglePhase = (phaseId: string) => {
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
  };

  /* ── Welcome screen (before business plan) ── */
  if (!planCompleted) {
    return (
      <div className="db-page">
        <div className="db-welcome">
          <div className="db-welcome-badge">
            <Zap size={32} />
          </div>
          <h1>Welcome, {user?.name}</h1>
          <p className="db-welcome-sub">
            Let's build your personalized business roadmap.
          </p>

          <div className="db-journey-preview">
            <div className="db-journey-label">Your 4-Phase Journey</div>
            <div className="db-journey-steps">
              {getPhases().map((phase, i) => {
                const PhaseIcon = getIcon(phase.iconName);
                return (
                  <React.Fragment key={phase.id}>
                    <div className="db-journey-step">
                      <div className="db-journey-icon">
                        <PhaseIcon size={18} />
                      </div>
                      <span className="db-journey-num">Phase {i + 1}</span>
                      <span className="db-journey-name">{phase.name}</span>
                    </div>
                    {i < 3 && <div className="db-journey-connector" />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="db-onboard">
            <div className="db-onboard-step">
              <div className="db-onboard-num">1</div>
              <div>
                <h4>Tell Us About Your Business</h4>
                <p>Answer a few questions about your goals and challenges.</p>
              </div>
            </div>
            <div className="db-onboard-step">
              <div className="db-onboard-num">2</div>
              <div>
                <h4>Get Your Personalized Roadmap</h4>
                <p>We'll create a 4-phase journey tailored to your needs.</p>
              </div>
            </div>
            <div className="db-onboard-step">
              <div className="db-onboard-num">3</div>
              <div>
                <h4>Build &amp; Grow Step by Step</h4>
                <p>Follow your roadmap from foundation to optimization.</p>
              </div>
            </div>
          </div>

          <button className="db-cta" onClick={() => navigate('/business-plan')}>
            <Lightbulb size={20} />
            Start Your Business Profile
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (!progress) return null;

  /* ── Main dashboard ── */
  return (
    <div className="db-page">
      {/* Page Header */}
      <div className="db-page-header">
        <LayoutDashboard size={28} />
        <h1>Your Business Journey</h1>
        <p>{answers.business_name || 'Your Business'} &middot; {answers.business_stage || 'Getting Started'}</p>
      </div>

      {/* Stats Overview */}
      <div className="db-stats">
        <div className="db-stat db-stat--primary">
          <div className="db-stat-icon">
            <TrendingUp size={22} />
          </div>
          <div className="db-stat-body">
            <span className="db-stat-label">Overall Progress</span>
            <span className="db-stat-value">{progress.overallPercent}%</span>
          </div>
          <div className="db-stat-bar">
            <div className="db-stat-bar-fill" style={{ width: `${progress.overallPercent}%` }} />
          </div>
        </div>
        <div className="db-stat">
          <div className="db-stat-icon db-stat-icon--success">
            <CheckCircle size={22} />
          </div>
          <div className="db-stat-body">
            <span className="db-stat-label">Completed</span>
            <span className="db-stat-value">
              {progress.completedTasks}
              <span className="db-stat-muted"> / {progress.totalTasks}</span>
            </span>
          </div>
        </div>
        <div className="db-stat">
          <div className="db-stat-icon db-stat-icon--warning">
            <Clock size={22} />
          </div>
          <div className="db-stat-body">
            <span className="db-stat-label">Current Phase</span>
            <span className="db-stat-value">
              {progress.phaseStatuses[progress.currentPhaseIndex].phase.name}
            </span>
          </div>
        </div>
      </div>

      {/* Phase Stepper */}
      <div className="db-stepper">
        {progress.phaseStatuses.map((ps, index) => {
          const PhaseIcon = getIcon(ps.phase.iconName);
          const status = ps.isComplete ? 'done' : ps.isCurrent ? 'active' : 'upcoming';
          return (
            <React.Fragment key={ps.phase.id}>
              <button
                className={`db-step db-step--${status}`}
                onClick={() => togglePhase(ps.phase.id)}
              >
                <div className="db-step-circle">
                  {ps.isComplete ? <CheckCircle size={18} /> : <PhaseIcon size={18} />}
                </div>
                <span className="db-step-name">{ps.phase.name}</span>
                <span className="db-step-count">{ps.completedTasks}/{ps.totalTasks}</span>
              </button>
              {index < progress.phaseStatuses.length - 1 && (
                <div className={`db-step-line ${ps.isComplete ? 'db-step-line--done' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Phase Sections */}
      <div className="db-sections">
        {progress.phaseStatuses.map((ps, phaseIndex) => {
          const isOpen = expandedPhase === ps.phase.id;
          const PhaseIcon = getIcon(ps.phase.iconName);
          const status = ps.isComplete ? 'done' : ps.isCurrent ? 'active' : 'upcoming';

          return (
            <div key={ps.phase.id} className={`db-section db-section--${status}`}>
              <button className="db-section-toggle" onClick={() => togglePhase(ps.phase.id)}>
                <div className="db-section-left">
                  <div className={`db-section-badge db-section-badge--${status}`}>
                    {ps.isComplete ? <CheckCircle size={18} /> : <PhaseIcon size={18} />}
                  </div>
                  <div className="db-section-info">
                    <h2>
                      <span className="db-section-num">Phase {phaseIndex + 1}:</span>{' '}
                      {ps.phase.name}
                      <span className="db-section-sub"> &mdash; {ps.phase.subtitle}</span>
                    </h2>
                    <p>{ps.phase.description}</p>
                  </div>
                </div>
                <div className="db-section-right">
                  <span className="db-section-count">{ps.completedTasks}/{ps.totalTasks}</span>
                  <div className="db-section-dots">
                    {ps.phase.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`db-dot ${user && task.checkComplete(user.id) ? 'db-dot--done' : ''}`}
                      />
                    ))}
                  </div>
                  {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
              </button>

              {isOpen && (
                <div className="db-cards">
                  {ps.phase.tasks.map((task, taskIndex) => {
                    const isDone = user ? task.checkComplete(user.id) : false;
                    const TaskIcon = getIcon(task.iconName);
                    return (
                      <div key={task.id} className={`db-card ${isDone ? 'db-card--done' : ''}`}>
                        <div className="db-card-top">
                          <div className={`db-card-icon ${isDone ? 'db-card-icon--done' : ''}`}>
                            <TaskIcon size={20} />
                          </div>
                          {isDone && <CheckCircle size={16} className="db-card-check" />}
                        </div>
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>
                        <div className="db-card-actions">
                          {isDone ? (
                            <Link to={task.path} className="db-btn db-btn--review">
                              Review <ChevronRight size={14} />
                            </Link>
                          ) : (
                            <>
                              <Link to={task.path} className="db-btn db-btn--go">
                                Start <ArrowRight size={14} />
                              </Link>
                              <button
                                className="db-btn db-btn--mark"
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

      {/* Business Profile */}
      <div className="db-profile">
        <div className="db-profile-top">
          <h3><Star size={16} /> Business Profile</h3>
          <Link to="/business-plan" className="db-profile-link">Edit Profile</Link>
        </div>
        <div className="db-profile-grid">
          <div className="db-profile-item">
            <span className="db-profile-label">Business</span>
            <span className="db-profile-val">{answers.business_name || 'Not set'}</span>
          </div>
          <div className="db-profile-item">
            <span className="db-profile-label">Industry</span>
            <span className="db-profile-val">
              {Array.isArray(answers.industry) ? answers.industry.slice(0, 2).join(', ') : 'Not set'}
            </span>
          </div>
          <div className="db-profile-item">
            <span className="db-profile-label">Stage</span>
            <span className="db-profile-val">{answers.business_stage || 'Not set'}</span>
          </div>
          <div className="db-profile-item">
            <span className="db-profile-label">Revenue</span>
            <span className="db-profile-val">{answers.current_revenue || 'Not set'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

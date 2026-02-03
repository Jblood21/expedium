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

  // Welcome screen before business plan
  if (!planCompleted) {
    return (
      <div className="db-page">
        <div className="db-welcome">
          <div className="db-welcome-icon">
            <Zap size={48} />
          </div>
          <h1>Welcome to Expedium, {user?.name}!</h1>
          <p className="db-welcome-subtitle">Your guided journey through building a successful business.</p>

          <div className="db-welcome-phases">
            <h3>Your Business Journey</h3>
            <div className="db-phase-preview-row">
              {getPhases().map((phase, i) => {
                const PhaseIcon = getIcon(phase.iconName);
                return (
                  <React.Fragment key={phase.id}>
                    <div className="db-phase-preview">
                      <div className="db-phase-preview-icon">
                        <PhaseIcon size={20} />
                      </div>
                      <span className="db-phase-preview-num">Phase {i + 1}</span>
                      <span className="db-phase-preview-name">{phase.name}</span>
                    </div>
                    {i < 3 && <div className="db-phase-preview-line" />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="db-welcome-steps">
            <div className="db-welcome-step">
              <div className="db-step-num">1</div>
              <div>
                <h4>Tell Us About Your Business</h4>
                <p>Answer a few questions about your goals and challenges.</p>
              </div>
            </div>
            <div className="db-welcome-step">
              <div className="db-step-num">2</div>
              <div>
                <h4>Get Your Personalized Roadmap</h4>
                <p>We'll create a 4-phase journey tailored to your needs.</p>
              </div>
            </div>
            <div className="db-welcome-step">
              <div className="db-step-num">3</div>
              <div>
                <h4>Build & Grow Step by Step</h4>
                <p>Follow your roadmap from foundation to optimization.</p>
              </div>
            </div>
          </div>

          <button className="db-start-btn" onClick={() => navigate('/business-plan')}>
            <Lightbulb size={22} />
            Start Your Business Profile
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  if (!progress) return null;

  return (
    <div className="db-page">
      {/* Header */}
      <div className="db-header">
        <div className="db-header-info">
          <h1><LayoutDashboard size={26} /> Your Business Journey</h1>
          <p>{answers.business_name || 'Your Business'} &middot; {answers.business_stage || 'Getting Started'}</p>
        </div>
        <div className="db-header-progress">
          <div className="db-progress-stats">
            <span className="db-progress-pct">{progress.overallPercent}%</span>
            <span className="db-progress-label">{progress.completedTasks} of {progress.totalTasks} tasks</span>
          </div>
          <div className="db-progress-track">
            <div className="db-progress-fill" style={{ width: `${progress.overallPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Phase Roadmap */}
      <div className="db-roadmap">
        {progress.phaseStatuses.map((ps, index) => {
          const PhaseIcon = getIcon(ps.phase.iconName);
          const status = ps.isComplete ? 'done' : ps.isCurrent ? 'active' : 'upcoming';
          return (
            <React.Fragment key={ps.phase.id}>
              <button className={`db-roadmap-node db-roadmap-node--${status}`} onClick={() => togglePhase(ps.phase.id)}>
                <div className="db-roadmap-circle">
                  {ps.isComplete ? <CheckCircle size={20} /> : <PhaseIcon size={20} />}
                </div>
                <span className="db-roadmap-name">{ps.phase.name}</span>
                <span className="db-roadmap-count">{ps.completedTasks}/{ps.totalTasks}</span>
              </button>
              {index < progress.phaseStatuses.length - 1 && (
                <div className={`db-roadmap-line ${ps.isComplete ? 'db-roadmap-line--done' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Phase Cards */}
      <div className="db-phases">
        {progress.phaseStatuses.map((ps, phaseIndex) => {
          const isOpen = expandedPhase === ps.phase.id;
          const PhaseIcon = getIcon(ps.phase.iconName);
          const status = ps.isComplete ? 'done' : ps.isCurrent ? 'active' : 'upcoming';

          return (
            <div key={ps.phase.id} className={`db-phase db-phase--${status}`}>
              <button className="db-phase-header" onClick={() => togglePhase(ps.phase.id)}>
                <div className="db-phase-badge-wrap">
                  <div className={`db-phase-badge db-phase-badge--${status}`}>
                    {ps.isComplete ? <CheckCircle size={18} /> : <PhaseIcon size={18} />}
                  </div>
                  <div className="db-phase-titles">
                    <h2>
                      <span className="db-phase-num">Phase {phaseIndex + 1}:</span> {ps.phase.name}
                      <span className="db-phase-sub"> &mdash; {ps.phase.subtitle}</span>
                    </h2>
                    <p>{ps.phase.description}</p>
                  </div>
                </div>
                <div className="db-phase-meta">
                  <span className="db-phase-count">{ps.completedTasks}/{ps.totalTasks}</span>
                  <div className="db-phase-dots">
                    {ps.phase.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`db-phase-dot ${user && task.checkComplete(user.id) ? 'db-phase-dot--done' : ''}`}
                      />
                    ))}
                  </div>
                  {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </button>

              {isOpen && (
                <div className="db-tasks">
                  {ps.phase.tasks.map((task, taskIndex) => {
                    const isDone = user ? task.checkComplete(user.id) : false;
                    const TaskIcon = getIcon(task.iconName);
                    return (
                      <div key={task.id} className={`db-task ${isDone ? 'db-task--done' : ''}`}>
                        <div className="db-task-top">
                          <div className="db-task-step">{taskIndex + 1}</div>
                          {isDone && <CheckCircle size={16} className="db-task-check" />}
                        </div>
                        <div className="db-task-icon">
                          <TaskIcon size={26} />
                        </div>
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>
                        <div className="db-task-actions">
                          {isDone ? (
                            <Link to={task.path} className="db-task-btn db-task-btn--review">
                              Review <ChevronRight size={14} />
                            </Link>
                          ) : (
                            <>
                              <Link to={task.path} className="db-task-btn db-task-btn--go">
                                Start <ArrowRight size={14} />
                              </Link>
                              <button className="db-task-btn db-task-btn--mark" onClick={() => markStepComplete(task.id)}>
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
        <div className="db-profile-head">
          <h3><Star size={18} /> Your Business Profile</h3>
          <Link to="/business-plan" className="db-profile-edit">Edit Profile</Link>
        </div>
        <div className="db-profile-grid">
          <div className="db-profile-item">
            <span className="db-profile-label">Business</span>
            <span className="db-profile-value">{answers.business_name || 'Not set'}</span>
          </div>
          <div className="db-profile-item">
            <span className="db-profile-label">Industry</span>
            <span className="db-profile-value">{Array.isArray(answers.industry) ? answers.industry.slice(0, 2).join(', ') : 'Not set'}</span>
          </div>
          <div className="db-profile-item">
            <span className="db-profile-label">Stage</span>
            <span className="db-profile-value">{answers.business_stage || 'Not set'}</span>
          </div>
          <div className="db-profile-item">
            <span className="db-profile-label">Revenue</span>
            <span className="db-profile-value">{answers.current_revenue || 'Not set'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

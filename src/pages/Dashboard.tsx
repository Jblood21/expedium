import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, TrendingUp, Users, Target, Calendar, DollarSign,
  CheckCircle, Clock, AlertCircle, Zap, BarChart3, Calculator,
  FileText, Lightbulb, ArrowRight, BookOpen, Megaphone, Settings,
  ChevronRight, Star, Play, Lock
} from 'lucide-react';
import { Customer, MonthlyGoal, BusinessPlanAnswers } from '../types';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ElementType;
  priority: 'high' | 'medium' | 'low';
  category: string;
  completed?: boolean;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [goals, setGoals] = useState<MonthlyGoal[]>([]);
  const [answers, setAnswers] = useState<BusinessPlanAnswers>({});
  const [planCompleted, setPlanCompleted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const savedCustomers = localStorage.getItem(`expedium_customers_${user.id}`);
    const savedGoals = localStorage.getItem(`expedium_goals_${user.id}`);
    const savedAnswers = localStorage.getItem(`expedium_answers_${user.id}`);
    const savedPlanCompleted = localStorage.getItem(`expedium_plan_completed_${user.id}`);
    const savedCompletedSteps = localStorage.getItem(`expedium_completed_steps_${user.id}`);

    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
    if (savedPlanCompleted) setPlanCompleted(true);
    if (savedCompletedSteps) setCompletedSteps(JSON.parse(savedCompletedSteps));
  }, [user]);

  const markStepComplete = (stepId: string) => {
    if (!user) return;
    const updated = [...completedSteps, stepId];
    setCompletedSteps(updated);
    localStorage.setItem(`expedium_completed_steps_${user.id}`, JSON.stringify(updated));
  };

  // Generate personalized recommendations based on business plan answers
  const generateRecommendations = (): Recommendation[] => {
    const recs: Recommendation[] = [];
    const challenges = Array.isArray(answers.main_challenges) ? answers.main_challenges : [];
    const helpNeeded = Array.isArray(answers.help_needed) ? answers.help_needed : [];
    const stage = answers.business_stage as string || '';
    const revenue = answers.current_revenue as string || '';
    const revenueModel = Array.isArray(answers.revenue_model) ? answers.revenue_model : [];

    // Always recommend based on stage
    if (stage.includes('Idea') || stage.includes('Startup')) {
      recs.push({
        id: 'pricing',
        title: 'Set Your Pricing Strategy',
        description: 'Use our calculators to find the right price point for your products/services.',
        path: '/calculators',
        icon: DollarSign,
        priority: 'high',
        category: 'Finance'
      });
      recs.push({
        id: 'breakeven',
        title: 'Calculate Your Break-Even Point',
        description: 'Know exactly how many sales you need to cover costs.',
        path: '/calculators',
        icon: Calculator,
        priority: 'high',
        category: 'Finance'
      });
    }

    // Customer acquisition challenges
    if (challenges.includes('Customer Acquisition') || helpNeeded.includes('Sales') || helpNeeded.includes('Marketing')) {
      recs.push({
        id: 'customers',
        title: 'Build Your Customer Pipeline',
        description: 'Start tracking leads and managing customer relationships.',
        path: '/customers',
        icon: Users,
        priority: 'high',
        category: 'Sales'
      });
      recs.push({
        id: 'cac',
        title: 'Calculate Customer Acquisition Cost',
        description: 'Understand how much it costs to acquire each customer.',
        path: '/calculators',
        icon: Calculator,
        priority: 'medium',
        category: 'Finance'
      });
    }

    // Marketing help
    if (challenges.includes('Marketing') || helpNeeded.includes('Marketing') || helpNeeded.includes('Branding')) {
      recs.push({
        id: 'marketing',
        title: 'Plan Your Marketing Strategy',
        description: 'Create campaigns and track your marketing efforts.',
        path: '/marketing',
        icon: Megaphone,
        priority: 'high',
        category: 'Marketing'
      });
      recs.push({
        id: 'roi',
        title: 'Calculate Marketing ROI',
        description: 'Measure the return on your marketing investments.',
        path: '/calculators',
        icon: TrendingUp,
        priority: 'medium',
        category: 'Finance'
      });
    }

    // Cash flow challenges
    if (challenges.includes('Cash Flow') || helpNeeded.includes('Finance/Accounting')) {
      recs.push({
        id: 'finances',
        title: 'Track Your Cash Flow',
        description: 'Monitor income, expenses, and maintain financial health.',
        path: '/finances',
        icon: DollarSign,
        priority: 'high',
        category: 'Finance'
      });
      recs.push({
        id: 'profit',
        title: 'Analyze Profit Margins',
        description: 'Understand your profitability and optimize pricing.',
        path: '/calculators',
        icon: BarChart3,
        priority: 'medium',
        category: 'Finance'
      });
    }

    // Strategy & Competition
    if (challenges.includes('Competition') || helpNeeded.includes('Business Strategy')) {
      recs.push({
        id: 'strategy',
        title: 'Develop Your Strategy',
        description: 'Create SWOT analysis and competitive positioning.',
        path: '/strategy',
        icon: Target,
        priority: 'high',
        category: 'Strategy'
      });
    }

    // Scaling challenges
    if (challenges.includes('Scaling') || challenges.includes('Operations')) {
      recs.push({
        id: 'scaling',
        title: 'Plan for Growth',
        description: 'Use strategy tools to plan sustainable scaling.',
        path: '/strategy',
        icon: TrendingUp,
        priority: 'medium',
        category: 'Strategy'
      });
    }

    // SaaS/Subscription specific
    if (revenueModel.includes('Subscription Model') || revenueModel.includes('Freemium')) {
      recs.push({
        id: 'ltv',
        title: 'Calculate Customer Lifetime Value',
        description: 'Essential metric for subscription businesses.',
        path: '/calculators',
        icon: Calculator,
        priority: 'high',
        category: 'Finance'
      });
      recs.push({
        id: 'churn',
        title: 'Track Churn & Retention',
        description: 'Monitor customer retention metrics.',
        path: '/calculators',
        icon: Users,
        priority: 'medium',
        category: 'Finance'
      });
    }

    // Learning resources for everyone
    recs.push({
      id: 'resources',
      title: 'Learn From Experts',
      description: 'Access curated guides and resources from SBA, SCORE, and more.',
      path: '/resources',
      icon: BookOpen,
      priority: 'low',
      category: 'Learning'
    });

    // Default recommendations if nothing specific
    if (recs.length < 3) {
      if (!recs.find(r => r.id === 'customers')) {
        recs.push({
          id: 'customers',
          title: 'Start Tracking Customers',
          description: 'Build relationships and track follow-ups.',
          path: '/customers',
          icon: Users,
          priority: 'medium',
          category: 'Sales'
        });
      }
      if (!recs.find(r => r.id === 'finances')) {
        recs.push({
          id: 'finances',
          title: 'Set Up Financial Tracking',
          description: 'Monitor your business finances.',
          path: '/finances',
          icon: DollarSign,
          priority: 'medium',
          category: 'Finance'
        });
      }
    }

    // Mark completed steps
    return recs.map(rec => ({
      ...rec,
      completed: completedSteps.includes(rec.id)
    })).sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const recommendations = planCompleted ? generateRecommendations() : [];
  const completedCount = recommendations.filter(r => r.completed).length;
  const progressPercent = recommendations.length > 0 ? Math.round((completedCount / recommendations.length) * 100) : 0;

  // If business plan not completed, show prompt to complete it
  if (!planCompleted) {
    return (
      <div className="dashboard-page">
        <div className="welcome-screen">
          <div className="welcome-icon">
            <Zap size={64} />
          </div>
          <h1>Welcome to Expedium, {user?.name}!</h1>
          <p>Let's create your personalized business journey.</p>

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
                <h3>Get Personalized Recommendations</h3>
                <p>We'll create a custom path with tools and resources for your specific needs.</p>
              </div>
            </div>
            <div className="welcome-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Grow Your Business</h3>
                <p>Follow your personalized journey and track your progress.</p>
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

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1><LayoutDashboard size={32} /> Your Business Journey</h1>
          <p>Personalized path for {answers.business_name || 'your business'}</p>
        </div>
        <div className="header-progress">
          <span className="progress-label">{completedCount} of {recommendations.length} steps completed</span>
          <div className="mini-progress-bar">
            <div className="mini-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Business Summary Card */}
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

      {/* Personalized Recommendations */}
      <div className="recommendations-section">
        <h2><Target size={24} /> Your Recommended Next Steps</h2>
        <p className="section-subtitle">Based on your business profile and goals, here's your personalized path:</p>

        <div className="recommendations-grid">
          {recommendations.map((rec, index) => (
            <div
              key={rec.id}
              className={`recommendation-card ${rec.priority} ${rec.completed ? 'completed' : ''}`}
            >
              <div className="rec-header">
                <div className="rec-number">{index + 1}</div>
                <span className={`rec-category ${rec.category.toLowerCase()}`}>{rec.category}</span>
                {rec.completed && <CheckCircle size={20} className="completed-check" />}
              </div>
              <div className="rec-icon">
                <rec.icon size={32} />
              </div>
              <h3>{rec.title}</h3>
              <p>{rec.description}</p>
              <div className="rec-actions">
                {!rec.completed ? (
                  <>
                    <Link to={rec.path} className="rec-btn primary">
                      Start <ArrowRight size={16} />
                    </Link>
                    <button
                      className="rec-btn secondary"
                      onClick={() => markStepComplete(rec.id)}
                    >
                      <CheckCircle size={16} /> Mark Done
                    </button>
                  </>
                ) : (
                  <Link to={rec.path} className="rec-btn completed">
                    Review <ChevronRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats if they have data */}
      {(customers.length > 0 || goals.length > 0) && (
        <div className="quick-stats-section">
          <h3><BarChart3 size={20} /> Your Progress</h3>
          <div className="stats-row">
            <div className="stat-box">
              <Users size={24} />
              <div className="stat-info">
                <span className="stat-value">{customers.length}</span>
                <span className="stat-label">Customers</span>
              </div>
            </div>
            <div className="stat-box">
              <CheckCircle size={24} />
              <div className="stat-info">
                <span className="stat-value">{customers.filter(c => c.status === 'active').length}</span>
                <span className="stat-label">Active</span>
              </div>
            </div>
            {goals.length > 0 && (
              <div className="stat-box">
                <Target size={24} />
                <div className="stat-info">
                  <span className="stat-value">{goals[goals.length - 1]?.completed || 0}</span>
                  <span className="stat-label">Outreach</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tip based on their challenges */}
      <div className="personalized-tip">
        <Lightbulb size={24} />
        <div className="tip-content">
          <h4>Tip for {Array.isArray(answers.industry) ? answers.industry[0] : 'Your'} Business</h4>
          <p>
            {answers.business_stage?.includes('Idea') || answers.business_stage?.includes('Startup')
              ? 'Focus on validating your product with real customers before scaling. Get your first 10 paying customers and learn from their feedback.'
              : answers.business_stage?.includes('Growth')
                ? 'Document your successful processes now. What works for 10 customers needs systems to work for 100.'
                : 'Consider what makes your business valuable. Track metrics that would matter to a potential buyer or investor.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

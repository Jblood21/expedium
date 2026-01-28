import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validatePasswordStrength, validateEmail } from '../utils/security';
import {
  Zap, Mail, Lock, User, Building, ArrowRight, CheckCircle,
  BarChart3, Users, Calculator, FileText, Target, TrendingUp,
  Shield, Clock, Star, Quote, AlertCircle
} from 'lucide-react';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[] });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (!isLogin) {
      const strength = validatePasswordStrength(value);
      setPasswordStrength({ score: strength.score, feedback: strength.feedback });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate email format
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.message);
        }
      } else {
        if (!name.trim()) {
          setError('Name is required');
          setIsLoading(false);
          return;
        }

        // Validate password strength for registration
        const strength = validatePasswordStrength(password);
        if (!strength.isValid) {
          setError('Please choose a stronger password: ' + strength.feedback.slice(0, 2).join(', '));
          setIsLoading(false);
          return;
        }

        const result = await register(email, password, name, company);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 1) return '#ef4444';
    if (score === 2) return '#f59e0b';
    if (score === 3) return '#10b981';
    return '#059669';
  };

  const getPasswordStrengthLabel = (score: number) => {
    if (score <= 1) return 'Weak';
    if (score === 2) return 'Fair';
    if (score === 3) return 'Good';
    return 'Strong';
  };

  const features = [
    {
      icon: BarChart3,
      title: 'Smart Dashboard',
      description: 'Get a complete overview of your business metrics at a glance'
    },
    {
      icon: FileText,
      title: 'Business Planning',
      description: 'AI-powered guidance to build your perfect business model'
    },
    {
      icon: Calculator,
      title: '14+ Calculators',
      description: 'Pricing, ROI, break-even, cash flow and more financial tools'
    },
    {
      icon: Users,
      title: 'Customer CRM',
      description: 'Track customers, follow-ups, and monthly outreach goals'
    },
    {
      icon: Target,
      title: 'Strategy Tools',
      description: 'SWOT analysis, competitor tracking, and goal management'
    },
    {
      icon: TrendingUp,
      title: 'Marketing Suite',
      description: 'Campaign tracking, content calendar, and email templates'
    }
  ];

  const testimonials = [
    {
      quote: "Expedium helped me organize my entire business in one place. The calculators alone saved me hours of work.",
      author: "Sarah M.",
      role: "Freelance Designer"
    },
    {
      quote: "Finally, a tool that understands what small business owners actually need. Simple yet powerful.",
      author: "James K.",
      role: "E-commerce Owner"
    },
    {
      quote: "The customer management features transformed how I handle client relationships.",
      author: "Maria L.",
      role: "Consultant"
    }
  ];

  const stats = [
    { value: '10K+', label: 'Businesses Streamlined' },
    { value: '50+', label: 'Tools & Features' },
    { value: '4.9', label: 'User Rating' },
    { value: '100%', label: 'Free to Use' }
  ];

  return (
    <div className="login-page-redesign">
      {/* Left Side - Features Showcase */}
      <div className="login-showcase">
        <div className="showcase-content">
          <div className="showcase-header">
            <div className="logo-large">
              <Zap size={48} />
              <span>Expedium</span>
            </div>
            <h1>Streamline Your Business Success</h1>
            <p>The all-in-one platform to plan, manage, and grow your business with confidence.</p>
          </div>

          {/* Stats */}
          <div className="showcase-stats">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-item">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="features-grid">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-item">
                <div className="feature-icon">
                  <feature.icon size={24} />
                </div>
                <div className="feature-text">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="testimonials-section">
            <h2><Quote size={20} /> What Our Users Say</h2>
            <div className="testimonials-grid">
              {testimonials.map((testimonial, idx) => (
                <div key={idx} className="testimonial-card">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  <p>"{testimonial.quote}"</p>
                  <div className="testimonial-author">
                    <strong>{testimonial.author}</strong>
                    <span>{testimonial.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="trust-badges">
            <div className="badge">
              <Shield size={18} />
              <span>Secure & Private</span>
            </div>
            <div className="badge">
              <Clock size={18} />
              <span>Setup in 2 Minutes</span>
            </div>
            <div className="badge">
              <CheckCircle size={18} />
              <span>No Credit Card Required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-form-section">
        <div className="login-form-container">
          <div className="form-header">
            <h2>{isLogin ? 'Welcome Back' : 'Get Started Free'}</h2>
            <p>{isLogin ? 'Sign in to continue to your dashboard' : 'Create your account in seconds'}</p>
          </div>

          <div className="tab-buttons">
            <button
              className={`tab-btn ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button
              className={`tab-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <>
                <div className="form-field">
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <User size={18} />
                    <input
                      type="text"
                      placeholder="John Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>Company Name <span className="optional">(Optional)</span></label>
                  <div className="input-wrapper">
                    <Building size={18} />
                    <input
                      type="text"
                      placeholder="Your Business Name"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-field">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock size={18} />
                <input
                  type="password"
                  placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              {!isLogin && password.length > 0 && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(passwordStrength.score / 4) * 100}%`,
                        backgroundColor: getPasswordStrengthColor(passwordStrength.score)
                      }}
                    />
                  </div>
                  <span className="strength-label" style={{ color: getPasswordStrengthColor(passwordStrength.score) }}>
                    {getPasswordStrengthLabel(passwordStrength.score)}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="error-alert">
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? (
                <span className="loading-dots">
                  <span></span><span></span><span></span>
                </span>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Free Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="form-footer">
            <p>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                className="switch-btn"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Create one free' : 'Sign in instead'}
              </button>
            </p>
          </div>

          {!isLogin && (
            <div className="register-benefits">
              <h4>What you'll get:</h4>
              <ul>
                <li><CheckCircle size={16} /> Dashboard with business overview</li>
                <li><CheckCircle size={16} /> 14+ financial calculators</li>
                <li><CheckCircle size={16} /> Customer management (CRM)</li>
                <li><CheckCircle size={16} /> Strategy & marketing tools</li>
                <li><CheckCircle size={16} /> All features, completely free</li>
              </ul>
            </div>
          )}
        </div>

        <div className="login-footer-text">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

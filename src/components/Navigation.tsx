import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap, LayoutDashboard, ClipboardList, Calculator, Users, LogOut,
  Menu, X, User, BookOpen, FileText, DollarSign, Target, Megaphone,
  Settings, Search, Bell, Check
} from 'lucide-react';
import { getPhaseProgress } from '../utils/phaseTracker';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Welcome!', message: 'Start by exploring your dashboard', time: 'Just now', read: false, type: 'success' },
    { id: '2', title: 'Tip', message: 'Use Ctrl+K to search pages', time: '1 hour ago', read: false, type: 'info' },
  ]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Phase progress
  const phaseProgress = useMemo(() => {
    if (!user) return null;
    const planCompleted = localStorage.getItem(`expedium_plan_completed_${user.id}`);
    if (!planCompleted) return null;
    return getPhaseProgress(user.id);
  }, [user]);

  const allNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/business-plan', label: 'Business Plan', icon: ClipboardList },
    { path: '/calculators', label: 'Calculators & Strategy', icon: Calculator },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/employees', label: 'Employees', icon: Target },
    { path: '/finances', label: 'Finances', icon: DollarSign },
    { path: '/marketing', label: 'Marketing', icon: Megaphone },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/resources', label: 'Resources', icon: BookOpen },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const filteredPages = searchQuery.trim()
    ? allNavItems.filter(page =>
        page.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearchSelect = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setShowSearch(false);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowNotifications(false);
        setShowMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <nav className="main-nav">
      <div className="nav-container">
        {/* Logo */}
        <NavLink to="/dashboard" className="nav-brand">
          <Zap size={24} className="brand-icon" />
          <span className="brand-name">Expedium</span>
        </NavLink>

        {/* Center - Menu Dropdown */}
        <div className="nav-menu-wrapper">
          <button
            className={`menu-toggle-btn ${showMenu ? 'active' : ''}`}
            onClick={() => setShowMenu(!showMenu)}
          >
            {showMenu ? <X size={20} /> : <Menu size={20} />}
            <span>Menu</span>
          </button>

          {showMenu && (
            <div className="nav-dropdown">
              {allNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-dropdown-link ${isActive ? 'active' : ''}`}
                  onClick={() => setShowMenu(false)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="nav-right">
          {/* Search */}
          <button
            className="nav-icon-btn"
            onClick={() => { setShowSearch(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
            title="Search (Ctrl+K)"
          >
            <Search size={20} />
          </button>

          {/* Notifications */}
          <div className="notification-wrapper">
            <button
              className={`nav-icon-btn ${unreadCount > 0 ? 'has-badge' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h4>Notifications</h4>
                  {unreadCount > 0 && (
                    <button className="mark-read-btn" onClick={markAllAsRead}>
                      <Check size={14} /> Mark all read
                    </button>
                  )}
                </div>
                <div className="notification-list">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`notification-item ${!notification.read ? 'unread' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className={`dot ${notification.type}`} />
                      <div className="notification-text">
                        <strong>{notification.title}</strong>
                        <p>{notification.message}</p>
                        <span className="time">{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User */}
          <div className="nav-user">
            <User size={18} />
            <span>{user?.name}</span>
          </div>

          {/* Logout */}
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Overlays */}
      {(showMenu || showNotifications) && (
        <div className="overlay" onClick={() => { setShowMenu(false); setShowNotifications(false); }} />
      )}

      {/* Search Modal */}
      {showSearch && (
        <div className="search-overlay" onClick={() => setShowSearch(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>
            <div className="search-input-box">
              <Search size={20} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
              />
              <kbd>Esc</kbd>
            </div>
            {filteredPages.length > 0 && (
              <div className="search-results">
                {filteredPages.map(page => (
                  <button
                    key={page.path}
                    className="search-result"
                    onClick={() => handleSearchSelect(page.path)}
                  >
                    <page.icon size={18} />
                    <span>{page.label}</span>
                  </button>
                ))}
              </div>
            )}
            {searchQuery && filteredPages.length === 0 && (
              <div className="search-empty">No pages found</div>
            )}
          </div>
        </div>
      )}

      {/* Phase Progress Bar */}
      {phaseProgress && (
        <div className="nav-phase-bar">
          <NavLink to="/dashboard" className="nav-phase-indicator">
            <span className="nav-phase-label">
              Phase {phaseProgress.currentPhaseIndex + 1}: {phaseProgress.phaseStatuses[phaseProgress.currentPhaseIndex].phase.name}
            </span>
            <div className="nav-phase-dots">
              {phaseProgress.phaseStatuses.map((ps) => (
                <div
                  key={ps.phase.id}
                  className={`nav-phase-dot ${ps.isComplete ? 'done' : ps.isCurrent ? 'active' : ''}`}
                />
              ))}
            </div>
            <span className="nav-phase-percent">{phaseProgress.overallPercent}%</span>
          </NavLink>
        </div>
      )}
    </nav>
  );
};

export default Navigation;

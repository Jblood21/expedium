import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { validateImportData, sanitizeInput } from '../utils/security';
import {
  Settings as SettingsIcon, Moon, Sun, Download, Upload, Trash2,
  User, Building, Bell, Shield, Database, HelpCircle,
  Check, AlertTriangle, FileText, RefreshCw
} from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    emailReminders: true,
    followUpAlerts: true,
    goalReminders: true,
    weeklyDigest: false
  });
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
    phone: '',
    website: '',
    address: ''
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('expedium_darkMode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    }

    // Load profile
    const savedProfile = localStorage.getItem(`expedium_profile_${user?.id}`);
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    // Load notifications
    const savedNotifications = localStorage.getItem(`expedium_notifications_${user?.id}`);
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, [user]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('expedium_darkMode', String(newMode));
    if (newMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  const saveProfile = () => {
    localStorage.setItem(`expedium_profile_${user?.id}`, JSON.stringify(profile));
    setSaveMessage('Profile saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const saveNotifications = () => {
    localStorage.setItem(`expedium_notifications_${user?.id}`, JSON.stringify(notifications));
    setSaveMessage('Notification preferences saved!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const exportData = () => {
    const data: { [key: string]: any } = {};
    const prefix = `expedium_`;

    // Gather all user data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix) && key.includes(user?.id || '')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }

    let content: string;
    let filename: string;
    let type: string;

    if (exportFormat === 'json') {
      content = JSON.stringify(data, null, 2);
      filename = `expedium_backup_${new Date().toISOString().split('T')[0]}.json`;
      type = 'application/json';
    } else {
      // Convert to CSV (simplified)
      const rows: string[] = ['Key,Value'];
      Object.entries(data).forEach(([key, value]) => {
        rows.push(`"${key}","${JSON.stringify(value).replace(/"/g, '""')}"`);
      });
      content = rows.join('\n');
      filename = `expedium_backup_${new Date().toISOString().split('T')[0]}.csv`;
      type = 'text/csv';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    setShowExportModal(false);
    setSaveMessage('Data exported successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum size is 5MB.');
      return;
    }

    // Validate file type
    if (!file.name.endsWith('.json')) {
      alert('Only JSON files are allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rawData = e.target?.result as string;

        // Basic size check on parsed content
        if (rawData.length > 10 * 1024 * 1024) {
          alert('File content too large.');
          return;
        }

        const data = JSON.parse(rawData);

        // Validate the import data structure and content
        const validation = validateImportData(data);
        if (!validation.valid) {
          alert(`Import failed: ${validation.error}`);
          return;
        }

        // Only import data that belongs to the current user
        const userIdPattern = user?.id || '';
        let importedCount = 0;

        Object.entries(data).forEach(([key, value]) => {
          // Only allow importing data for current user or general settings
          if (key.includes(userIdPattern) || key === 'expedium_darkMode') {
            // Sanitize string values before storing
            const sanitizedValue = typeof value === 'string'
              ? sanitizeInput(value)
              : JSON.stringify(value);
            localStorage.setItem(key, sanitizedValue);
            importedCount++;
          }
        });

        if (importedCount > 0) {
          setSaveMessage(`Successfully imported ${importedCount} items. Refresh to see changes.`);
        } else {
          setSaveMessage('No matching data found to import.');
        }
        setTimeout(() => setSaveMessage(''), 5000);
      } catch (error) {
        alert('Error importing data. Please check the file format is valid JSON.');
      }
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };
    reader.readAsText(file);

    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const deleteAllData = () => {
    const prefix = `expedium_`;
    const keysToDelete: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix) && key.includes(user?.id || '')) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => localStorage.removeItem(key));
    setShowDeleteModal(false);
    setSaveMessage('All data deleted. You may want to log out and back in.');
    setTimeout(() => setSaveMessage(''), 5000);
  };

  const getStorageUsage = () => {
    let total = 0;
    const prefix = `expedium_`;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix) && key.includes(user?.id || '')) {
        total += (localStorage.getItem(key)?.length || 0) * 2; // UTF-16 = 2 bytes per char
      }
    }

    return (total / 1024).toFixed(2); // Convert to KB
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'help', label: 'Help & Support', icon: HelpCircle }
  ];

  return (
    <div className="settings-page">
      <div className="page-header">
        <SettingsIcon size={32} />
        <h1>Settings</h1>
        <p>Manage your account and preferences</p>
      </div>

      {saveMessage && (
        <div className="save-message">
          <Check size={18} />
          {saveMessage}
        </div>
      )}

      <div className="settings-container">
        {/* Sidebar */}
        <div className="settings-sidebar">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <section.icon size={18} />
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="settings-section">
              <h2><User size={24} /> Profile Settings</h2>
              <p className="section-description">Update your personal and business information</p>

              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Company Name</label>
                    <input
                      type="text"
                      value={profile.company}
                      onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                      placeholder="Your business name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="form-group">
                  <label>Business Address</label>
                  <textarea
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="123 Business St, City, State, ZIP"
                    rows={2}
                  />
                </div>

                <button className="btn-primary" onClick={saveProfile}>
                  <Check size={18} /> Save Profile
                </button>
              </div>
            </div>
          )}

          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <div className="settings-section">
              <h2>{darkMode ? <Moon size={24} /> : <Sun size={24} />} Appearance</h2>
              <p className="section-description">Customize how Expedium looks</p>

              <div className="appearance-options">
                <div className="option-card">
                  <div className="option-info">
                    <h4>Dark Mode</h4>
                    <p>Switch between light and dark themes</p>
                  </div>
                  <button
                    className={`toggle-btn ${darkMode ? 'active' : ''}`}
                    onClick={toggleDarkMode}
                  >
                    <span className="toggle-slider" />
                  </button>
                </div>

                <div className="theme-preview">
                  <h4>Preview</h4>
                  <div className={`preview-box ${darkMode ? 'dark' : 'light'}`}>
                    <div className="preview-header">
                      <div className="preview-dot" />
                      <div className="preview-dot" />
                      <div className="preview-dot" />
                    </div>
                    <div className="preview-content">
                      <div className="preview-nav" />
                      <div className="preview-card" />
                      <div className="preview-card small" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="settings-section">
              <h2><Bell size={24} /> Notification Preferences</h2>
              <p className="section-description">Control what notifications you receive</p>

              <div className="notification-options">
                <div className="option-card">
                  <div className="option-info">
                    <h4>Email Reminders</h4>
                    <p>Receive email reminders for important tasks</p>
                  </div>
                  <button
                    className={`toggle-btn ${notifications.emailReminders ? 'active' : ''}`}
                    onClick={() => setNotifications({ ...notifications, emailReminders: !notifications.emailReminders })}
                  >
                    <span className="toggle-slider" />
                  </button>
                </div>

                <div className="option-card">
                  <div className="option-info">
                    <h4>Follow-up Alerts</h4>
                    <p>Get notified when customer follow-ups are due</p>
                  </div>
                  <button
                    className={`toggle-btn ${notifications.followUpAlerts ? 'active' : ''}`}
                    onClick={() => setNotifications({ ...notifications, followUpAlerts: !notifications.followUpAlerts })}
                  >
                    <span className="toggle-slider" />
                  </button>
                </div>

                <div className="option-card">
                  <div className="option-info">
                    <h4>Goal Reminders</h4>
                    <p>Remind you about monthly goal progress</p>
                  </div>
                  <button
                    className={`toggle-btn ${notifications.goalReminders ? 'active' : ''}`}
                    onClick={() => setNotifications({ ...notifications, goalReminders: !notifications.goalReminders })}
                  >
                    <span className="toggle-slider" />
                  </button>
                </div>

                <div className="option-card">
                  <div className="option-info">
                    <h4>Weekly Digest</h4>
                    <p>Receive a weekly summary of your business metrics</p>
                  </div>
                  <button
                    className={`toggle-btn ${notifications.weeklyDigest ? 'active' : ''}`}
                    onClick={() => setNotifications({ ...notifications, weeklyDigest: !notifications.weeklyDigest })}
                  >
                    <span className="toggle-slider" />
                  </button>
                </div>

                <button className="btn-primary" onClick={saveNotifications}>
                  <Check size={18} /> Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Data Management Section */}
          {activeSection === 'data' && (
            <div className="settings-section">
              <h2><Database size={24} /> Data Management</h2>
              <p className="section-description">Export, import, or delete your data</p>

              <div className="data-info">
                <div className="storage-usage">
                  <Database size={20} />
                  <span>Storage Used: {getStorageUsage()} KB</span>
                </div>
              </div>

              <div className="data-options">
                <div className="data-card">
                  <div className="data-card-icon export">
                    <Download size={24} />
                  </div>
                  <div className="data-card-content">
                    <h4>Export Data</h4>
                    <p>Download all your data as a backup file</p>
                  </div>
                  <button className="btn-secondary" onClick={() => setShowExportModal(true)}>
                    Export
                  </button>
                </div>

                <div className="data-card">
                  <div className="data-card-icon import">
                    <Upload size={24} />
                  </div>
                  <div className="data-card-content">
                    <h4>Import Data</h4>
                    <p>Restore data from a backup file</p>
                  </div>
                  <label className="btn-secondary">
                    Import
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                <div className="data-card danger">
                  <div className="data-card-icon delete">
                    <Trash2 size={24} />
                  </div>
                  <div className="data-card-content">
                    <h4>Delete All Data</h4>
                    <p>Permanently delete all your data from this device</p>
                  </div>
                  <button className="btn-danger" onClick={() => setShowDeleteModal(true)}>
                    Delete
                  </button>
                </div>
              </div>

              <div className="backup-reminder">
                <RefreshCw size={18} />
                <span>Tip: Export your data regularly to keep a backup</span>
              </div>
            </div>
          )}

          {/* Help Section */}
          {activeSection === 'help' && (
            <div className="settings-section">
              <h2><HelpCircle size={24} /> Help & Support</h2>
              <p className="section-description">Get help with using Expedium</p>

              <div className="help-cards">
                <div className="help-card">
                  <FileText size={24} />
                  <h4>Getting Started Guide</h4>
                  <p>Learn the basics of using Expedium</p>
                  <ul>
                    <li>Complete your business plan survey</li>
                    <li>Add your first customers</li>
                    <li>Set monthly outreach goals</li>
                    <li>Use calculators for pricing decisions</li>
                    <li>Track expenses and budget</li>
                  </ul>
                </div>

                <div className="help-card">
                  <Shield size={24} />
                  <h4>Data & Privacy</h4>
                  <p>How your data is handled</p>
                  <ul>
                    <li>All data stored locally in your browser</li>
                    <li>No data sent to external servers</li>
                    <li>Export anytime for backups</li>
                    <li>Delete all data from Settings</li>
                  </ul>
                </div>

                <div className="help-card">
                  <Building size={24} />
                  <h4>Features Overview</h4>
                  <p>What you can do with Expedium</p>
                  <ul>
                    <li><strong>Dashboard:</strong> Business overview at a glance</li>
                    <li><strong>Business Plan:</strong> AI-assisted planning</li>
                    <li><strong>Calculators:</strong> 14+ financial tools</li>
                    <li><strong>Customers:</strong> CRM with goal tracking</li>
                    <li><strong>Strategy:</strong> SWOT, goals, milestones</li>
                    <li><strong>Marketing:</strong> Campaigns & calendar</li>
                    <li><strong>Finances:</strong> Expense tracking</li>
                    <li><strong>Documents:</strong> Invoices & contracts</li>
                  </ul>
                </div>
              </div>

              <div className="keyboard-shortcuts">
                <h4>Keyboard Shortcuts</h4>
                <div className="shortcuts-grid">
                  <div className="shortcut">
                    <kbd>Alt</kbd> + <kbd>D</kbd>
                    <span>Go to Dashboard</span>
                  </div>
                  <div className="shortcut">
                    <kbd>Alt</kbd> + <kbd>C</kbd>
                    <span>Go to Calculators</span>
                  </div>
                  <div className="shortcut">
                    <kbd>Alt</kbd> + <kbd>K</kbd>
                    <span>Go to Customers</span>
                  </div>
                  <div className="shortcut">
                    <kbd>Ctrl</kbd> + <kbd>S</kbd>
                    <span>Save current form</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <h3>Export Data</h3>
            <p>Choose export format:</p>
            <div className="export-options">
              <label className={`export-option ${exportFormat === 'json' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={() => setExportFormat('json')}
                />
                <span>JSON (recommended)</span>
              </label>
              <label className={`export-option ${exportFormat === 'csv' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={() => setExportFormat('csv')}
                />
                <span>CSV</span>
              </label>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowExportModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={exportData}>
                <Download size={18} /> Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content small danger" onClick={(e) => e.stopPropagation()}>
            <div className="danger-icon">
              <AlertTriangle size={48} />
            </div>
            <h3>Delete All Data?</h3>
            <p>This action cannot be undone. All your data including:</p>
            <ul>
              <li>Customer information</li>
              <li>Business plan answers</li>
              <li>Financial records</li>
              <li>Goals and milestones</li>
              <li>Documents and templates</li>
            </ul>
            <p>will be permanently deleted.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={deleteAllData}>
                <Trash2 size={18} /> Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

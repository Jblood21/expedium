import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <Zap size={24} />
            <span>Expedium</span>
          </div>
          <p>Streamline Your Business Success</p>
        </div>

        <div className="footer-links">
          <div className="footer-section">
            <h4>Tools</h4>
            <ul>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/calculators">Calculators</Link></li>
              <li><Link to="/finances">Finances</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Plan</h4>
            <ul>
              <li><Link to="/business-plan">Business Plan</Link></li>
              <li><Link to="/strategy">Strategy</Link></li>
              <li><Link to="/documents">Documents</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Manage</h4>
            <ul>
              <li><Link to="/customers">Customers</Link></li>
              <li><Link to="/employees">Employees</Link></li>
              <li><Link to="/marketing">Marketing</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Expedium. All rights reserved.</p>
        <p className="made-with">
          Made with <Heart size={14} fill="#ef4444" color="#ef4444" /> for small businesses
        </p>
        <div className="footer-legal">
          <Link to="/resources">Resources</Link>
          <span>&middot;</span>
          <Link to="/settings">Settings</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

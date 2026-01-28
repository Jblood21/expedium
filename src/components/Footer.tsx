import React from 'react';
import { Zap, Heart, Github, Twitter, Linkedin } from 'lucide-react';

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
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#updates">Updates</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="#guides">Guides</a></li>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#careers">Careers</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-social">
          <a href="#twitter" className="social-link" aria-label="Twitter">
            <Twitter size={20} />
          </a>
          <a href="#linkedin" className="social-link" aria-label="LinkedIn">
            <Linkedin size={20} />
          </a>
          <a href="#github" className="social-link" aria-label="GitHub">
            <Github size={20} />
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Expedium. All rights reserved.</p>
        <p className="made-with">
          Made with <Heart size={14} fill="#ef4444" color="#ef4444" /> for small businesses
        </p>
        <div className="footer-legal">
          <a href="#privacy">Privacy Policy</a>
          <span>·</span>
          <a href="#terms">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

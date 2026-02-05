import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Megaphone, Mail, MessageSquare, Share2, Plus, Trash2, Edit2, Save, X,
  Instagram, Twitter, Linkedin, Facebook, Send, Users, Sparkles, Copy,
  Link, Zap, Globe, Upload, Search, RefreshCw,
  AlertCircle, CheckCircle, Clock, Bot, Wand2
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  tags: string[];
  source: string;
  createdAt: string;
}

interface Integration {
  id: string;
  type: 'email' | 'sms' | 'social';
  provider: string;
  apiKey: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
}

interface MessageTemplate {
  id: string;
  name: string;
  channel: 'email' | 'sms' | 'social';
  subject?: string;
  body: string;
  variables: string[];
}

interface OutreachHistory {
  id: string;
  channel: 'email' | 'sms' | 'social';
  recipient: string;
  subject?: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  sentAt: string;
  platform?: string;
}

const Marketing: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('compose');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [history, setHistory] = useState<OutreachHistory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'contact' | 'template' | 'integration'>('contact');

  // Compose state
  const [channel, setChannel] = useState<'email' | 'sms' | 'social'>('email');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [socialPlatform, setSocialPlatform] = useState('linkedin');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Contact form
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', company: '', tags: '' });
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Template form
  const [templateForm, setTemplateForm] = useState<{ name: string; channel: 'email' | 'sms' | 'social'; subject: string; body: string }>({ name: '', channel: 'email', subject: '', body: '' });
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  // Integration form
  const [integrationForm, setIntegrationForm] = useState<{ type: 'email' | 'sms' | 'social'; provider: string; apiKey: string }>({ type: 'email', provider: '', apiKey: '' });
  const [contactSearch, setContactSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    const savedContacts = localStorage.getItem(`expedium_outreach_contacts_${user.id}`);
    const savedIntegrations = localStorage.getItem(`expedium_integrations_${user.id}`);
    const savedTemplates = localStorage.getItem(`expedium_outreach_templates_${user.id}`);
    const savedHistory = localStorage.getItem(`expedium_outreach_history_${user.id}`);

    if (savedContacts) setContacts(JSON.parse(savedContacts));
    if (savedIntegrations) setIntegrations(JSON.parse(savedIntegrations));
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
    else setTemplates(defaultTemplates);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, [user]);

  const defaultTemplates: MessageTemplate[] = [
    {
      id: '1',
      name: 'Introduction Email',
      channel: 'email',
      subject: 'Quick intro from [Your Company]',
      body: `Hi [Name],

I hope this message finds you well! My name is [Your Name] from [Your Company].

I noticed [personalized observation] and thought you might be interested in how we help businesses like yours [benefit].

Would you be open to a quick 15-minute call this week to explore if we might be a good fit?

Best regards,
[Your Name]`,
      variables: ['Name', 'Your Name', 'Your Company']
    },
    {
      id: '2',
      name: 'Follow-up SMS',
      channel: 'sms',
      body: `Hi [Name]! Just following up on my email about [topic]. Would love to connect briefly. When works best for you? - [Your Name]`,
      variables: ['Name', 'Your Name']
    },
    {
      id: '3',
      name: 'LinkedIn Connection',
      channel: 'social',
      body: `Hi [Name], I came across your profile and was impressed by your work in [industry]. I'd love to connect and share ideas. Looking forward to connecting!`,
      variables: ['Name']
    }
  ];

  const saveContacts = (data: Contact[]) => {
    setContacts(data);
    localStorage.setItem(`expedium_outreach_contacts_${user?.id}`, JSON.stringify(data));
  };

  const saveIntegrations = (data: Integration[]) => {
    setIntegrations(data);
    localStorage.setItem(`expedium_integrations_${user?.id}`, JSON.stringify(data));
  };

  const saveTemplates = (data: MessageTemplate[]) => {
    setTemplates(data);
    localStorage.setItem(`expedium_outreach_templates_${user?.id}`, JSON.stringify(data));
  };

  const saveHistory = (data: OutreachHistory[]) => {
    setHistory(data);
    localStorage.setItem(`expedium_outreach_history_${user?.id}`, JSON.stringify(data));
  };

  // AI Message Generation - Uses business profile for personalized messages
  const generateAiMessage = () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const savedAnswers = localStorage.getItem(`expedium_answers_${user?.id}`);
      const answers = savedAnswers ? JSON.parse(savedAnswers) : {};

      // Get all business profile data
      const company = answers.business_name || 'our company';
      const industry = Array.isArray(answers.industry) ? answers.industry.join('/') : (answers.industry || 'business');
      const valueProposition = answers.value_proposition || '';
      const targetMarket = answers.target_market || '';
      const revenueModel = Array.isArray(answers.revenue_model) ? answers.revenue_model : [];
      // Extract what they sell/provide from value proposition or revenue model
      let whatWeOffer = '';
      if (valueProposition) {
        // Use the first sentence or key part of value proposition
        whatWeOffer = valueProposition.split('.')[0] || valueProposition.substring(0, 100);
      } else if (revenueModel.length > 0) {
        if (revenueModel.includes('Product Sales')) whatWeOffer = 'high-quality products';
        else if (revenueModel.includes('Service Fees') || revenueModel.includes('Consulting')) whatWeOffer = 'expert services';
        else if (revenueModel.includes('Subscription Model')) whatWeOffer = 'subscription-based solutions';
        else whatWeOffer = 'solutions tailored to your needs';
      } else {
        whatWeOffer = 'solutions that can help your business grow';
      }

      // Determine customer type from target market
      let customerType = 'businesses like yours';
      if (targetMarket) {
        if (targetMarket.toLowerCase().includes('small business')) customerType = 'small business owners';
        else if (targetMarket.toLowerCase().includes('entrepreneur')) customerType = 'entrepreneurs';
        else if (targetMarket.toLowerCase().includes('startup')) customerType = 'startup founders';
        else if (targetMarket.toLowerCase().includes('enterprise') || targetMarket.toLowerCase().includes('corporate')) customerType = 'enterprise teams';
        else customerType = targetMarket.split('.')[0].substring(0, 50) || 'professionals like you';
      }

      const prompt = aiPrompt.toLowerCase();

      const templates: { [key: string]: string } = {
        email: prompt.includes('follow') ?
          `Subject: Following up on our conversation

Hi [Name],

I hope you're doing well! I wanted to follow up on our recent conversation about ${company}.

As a reminder, we specialize in helping ${customerType} by providing ${whatWeOffer}. I'd love to hear if you've had a chance to think about how we might work together.

Do you have any questions I can answer? I'm happy to jump on a quick call whenever works for you.

Looking forward to hearing from you!

Best regards,
[Your Name]
${company}` :

          prompt.includes('intro') ?
          `Subject: ${company} - Helping ${customerType} succeed

Hi [Name],

I hope this message finds you well! My name is [Your Name], and I'm reaching out from ${company}.

We work with ${customerType} in the ${industry} space, and ${whatWeOffer}.

${valueProposition ? `Specifically, ${valueProposition.substring(0, 150)}${valueProposition.length > 150 ? '...' : ''}` : `We've helped many ${customerType} achieve their goals and I believe we could do the same for you.`}

Would you be open to a brief 15-minute call to explore if there's a fit? I'd love to learn more about what you're working on.

Best regards,
[Your Name]
${company}` :

          prompt.includes('promo') ?
          `Subject: Special offer from ${company} - just for you!

Hi [Name],

I wanted to reach out with an exclusive opportunity for ${customerType} like yourself.

At ${company}, we provide ${whatWeOffer}, and right now we're offering a special deal for new clients.

${revenueModel.includes('Subscription Model') ? 'Get your first month free when you sign up this week!' :
  revenueModel.includes('Service Fees') || revenueModel.includes('Consulting') ? 'Book a free consultation session - no strings attached!' :
  'Take advantage of our limited-time introductory pricing!'}

This offer is only available for a short time, so I didn't want you to miss out.

Interested? Just reply to this email and I'll send you the details.

Best,
[Your Name]
${company}` :

          prompt.includes('thank') ?
          `Subject: Thank you from ${company}!

Hi [Name],

I just wanted to take a moment to thank you for your time today.

It was great learning about your goals, and I'm excited about the possibility of ${company} helping you succeed. As we discussed, we specialize in ${whatWeOffer} for ${customerType}.

I'll follow up with the information we discussed. In the meantime, please don't hesitate to reach out if you have any questions.

Thanks again!

Best regards,
[Your Name]
${company}` :

          // Default intro email
          `Subject: Can ${company} help you?

Hi [Name],

I'm [Your Name] from ${company}, and I work with ${customerType} in the ${industry} industry.

${whatWeOffer.charAt(0).toUpperCase() + whatWeOffer.slice(1)} - that's what we do best. ${valueProposition ? valueProposition.substring(0, 120) + (valueProposition.length > 120 ? '...' : '') : ''}

I'd love to learn more about your business and see if there's a way we can help you achieve your goals.

Would you have 15 minutes for a quick chat this week?

Best regards,
[Your Name]
${company}`,

        sms: prompt.includes('follow') ?
          `Hi [Name]! It's [Your Name] from ${company}. Just following up on our chat about ${whatWeOffer.substring(0, 30)}. Any questions? Let me know! - [Your Name]` :

          prompt.includes('remind') ?
          `Hi [Name]! Quick reminder about our meeting tomorrow. Looking forward to discussing how ${company} can help you. See you soon! - [Your Name]` :

          prompt.includes('thank') ?
          `Hi [Name]! Thanks for your time today! Excited about potentially working together. ${company} is here whenever you need us. - [Your Name]` :

          prompt.includes('promo') ?
          `Hi [Name]! ${company} has a special offer for you! ${revenueModel.includes('Subscription Model') ? 'First month FREE!' : 'Limited time discount!'} Reply for details. - [Your Name]` :

          `Hi [Name]! This is [Your Name] from ${company}. We help ${customerType} with ${whatWeOffer.substring(0, 40)}. Would love to connect! When works? - [Your Name]`,

        social: prompt.includes('connect') ?
          `Hi [Name]! 👋

I came across your profile and noticed you're in the ${industry} space. I'm the founder of ${company} - we work with ${customerType} providing ${whatWeOffer.substring(0, 60)}.

Would love to connect and share ideas! Always great to network with others in the industry.` :

          prompt.includes('congrat') ?
          `Hi [Name]! 👏

Congratulations on your recent success! It's always inspiring to see ${customerType} achieving great things.

I'm with ${company} - we help businesses like yours with ${whatWeOffer.substring(0, 50)}. Would love to connect!` :

          prompt.includes('share') ?
          `Hi [Name]!

Thought you might find this interesting since you're in ${industry}. At ${company}, we've been working on ${whatWeOffer.substring(0, 60)} for ${customerType}.

Would love to hear your thoughts and connect! 🚀` :

          `Hi [Name]! 👋

I'm the founder of ${company}, and we're on a mission to help ${customerType} succeed with ${whatWeOffer.substring(0, 50)}.

Always love connecting with others in the ${industry} space. Let's chat! 🚀`
      };

      if (channel === 'email') {
        const lines = templates.email.split('\n');
        setSubject(lines[0].replace('Subject: ', ''));
        setMessage(lines.slice(2).join('\n'));
      } else {
        setMessage(templates[channel]);
      }

      setIsGenerating(false);
      setShowAiPanel(false);
      setAiPrompt('');
    }, 1500);
  };

  const sendMessage = () => {
    if (!message.trim() || selectedContacts.length === 0) return;

    const newHistory: OutreachHistory[] = selectedContacts.map(contactId => {
      const contact = contacts.find(c => c.id === contactId);
      return {
        id: Date.now().toString() + Math.random(),
        channel,
        recipient: channel === 'email' ? (contact?.email || '') : (channel === 'sms' ? (contact?.phone || '') : (contact?.name || '')),
        subject: channel === 'email' ? subject : undefined,
        message,
        status: 'pending' as const,
        sentAt: new Date().toISOString(),
        platform: channel === 'social' ? socialPlatform : undefined
      };
    });

    // Simulate sending
    setTimeout(() => {
      const updatedHistory = newHistory.map(h => ({ ...h, status: 'sent' as const }));
      saveHistory([...updatedHistory, ...history]);
    }, 1000);

    saveHistory([...newHistory, ...history]);
    setSelectedContacts([]);
    setSubject('');
    setMessage('');
    alert(`${selectedContacts.length} message(s) queued for sending!`);
  };

  const saveContact = () => {
    const contact: Contact = {
      id: editingContact?.id || Date.now().toString(),
      name: contactForm.name,
      email: contactForm.email,
      phone: contactForm.phone,
      company: contactForm.company,
      tags: contactForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      source: 'manual',
      createdAt: editingContact?.createdAt || new Date().toISOString()
    };

    if (editingContact) {
      saveContacts(contacts.map(c => c.id === editingContact.id ? contact : c));
    } else {
      saveContacts([...contacts, contact]);
    }

    setContactForm({ name: '', email: '', phone: '', company: '', tags: '' });
    setEditingContact(null);
    setShowModal(false);
  };

  const saveTemplate = () => {
    const variables = (templateForm.body.match(/\[([^\]]+)\]/g) || []).map(v => v.slice(1, -1));
    const template: MessageTemplate = {
      id: editingTemplate?.id || Date.now().toString(),
      name: templateForm.name,
      channel: templateForm.channel,
      subject: templateForm.channel === 'email' ? templateForm.subject : undefined,
      body: templateForm.body,
      variables
    };

    if (editingTemplate) {
      saveTemplates(templates.map(t => t.id === editingTemplate.id ? template : t));
    } else {
      saveTemplates([...templates, template]);
    }

    setTemplateForm({ name: '', channel: 'email', subject: '', body: '' });
    setEditingTemplate(null);
    setShowModal(false);
  };

  const saveIntegration = () => {
    const integration: Integration = {
      id: Date.now().toString(),
      type: integrationForm.type,
      provider: integrationForm.provider,
      apiKey: integrationForm.apiKey,
      status: 'connected',
      lastSync: new Date().toISOString()
    };

    saveIntegrations([...integrations, integration]);
    setIntegrationForm({ type: 'email', provider: '', apiKey: '' });
    setShowModal(false);
  };

  const applyTemplate = (template: MessageTemplate) => {
    setChannel(template.channel);
    if (template.subject) setSubject(template.subject);
    setMessage(template.body);
    setActiveTab('compose');
  };

  const toggleContactSelection = (id: string) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const selectAllContacts = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.company?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      case 'social': return Share2;
      default: return Mail;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered': return <CheckCircle size={16} className="status-icon success" />;
      case 'failed': return <AlertCircle size={16} className="status-icon error" />;
      case 'pending': return <Clock size={16} className="status-icon pending" />;
      default: return null;
    }
  };

  const emailProviders = [
    { id: 'sendgrid', name: 'SendGrid', desc: 'Reliable email delivery at scale' },
    { id: 'mailchimp', name: 'Mailchimp', desc: 'Email marketing platform' },
    { id: 'mailgun', name: 'Mailgun', desc: 'Developer-friendly email API' },
    { id: 'gmail', name: 'Gmail API', desc: 'Send through your Gmail account' }
  ];

  const smsProviders = [
    { id: 'twilio', name: 'Twilio', desc: 'Industry-leading SMS API' },
    { id: 'messagebird', name: 'MessageBird', desc: 'Global messaging platform' },
    { id: 'vonage', name: 'Vonage', desc: 'Communications API platform' }
  ];

  const socialProviders = [
    { id: 'linkedin', name: 'LinkedIn', desc: 'Professional networking' },
    { id: 'facebook', name: 'Facebook/Meta', desc: 'Social media marketing' },
    { id: 'twitter', name: 'Twitter/X', desc: 'Real-time engagement' },
    { id: 'instagram', name: 'Instagram', desc: 'Visual content marketing' }
  ];

  return (
    <div className="outreach-page">
      <div className="page-header">
        <Megaphone size={32} />
        <h1>Outreach Hub</h1>
        <p>Reach customers via email, SMS, and social media with AI-powered messaging</p>
      </div>

      {/* Tabs */}
      <div className="outreach-tabs">
        <button className={`tab-btn ${activeTab === 'compose' ? 'active' : ''}`} onClick={() => setActiveTab('compose')}>
          <Send size={18} /> Compose
        </button>
        <button className={`tab-btn ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => setActiveTab('contacts')}>
          <Users size={18} /> Contacts ({contacts.length})
        </button>
        <button className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
          <Copy size={18} /> Templates
        </button>
        <button className={`tab-btn ${activeTab === 'integrations' ? 'active' : ''}`} onClick={() => setActiveTab('integrations')}>
          <Link size={18} /> Integrations
        </button>
        <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <Clock size={18} /> History
        </button>
      </div>

      {/* Compose Tab */}
      {activeTab === 'compose' && (
        <div className="compose-section">
          <div className="compose-layout">
            {/* Left: Contact Selection */}
            <div className="contact-selector">
              <h3><Users size={18} /> Select Recipients</h3>
              <div className="contact-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                />
              </div>
              <div className="select-all-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                    onChange={selectAllContacts}
                  />
                  Select All ({filteredContacts.length})
                </label>
                <span className="selected-count">{selectedContacts.length} selected</span>
              </div>
              <div className="contact-list">
                {filteredContacts.length > 0 ? filteredContacts.map(contact => (
                  <label key={contact.id} className={`contact-item ${selectedContacts.includes(contact.id) ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => toggleContactSelection(contact.id)}
                    />
                    <div className="contact-info">
                      <span className="contact-name">{contact.name}</span>
                      <span className="contact-detail">{contact.email}</span>
                    </div>
                  </label>
                )) : (
                  <div className="no-contacts">
                    <Users size={32} />
                    <p>No contacts yet</p>
                    <button className="btn-secondary small" onClick={() => { setModalType('contact'); setShowModal(true); }}>
                      <Plus size={14} /> Add Contact
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Message Composer */}
            <div className="message-composer">
              <div className="channel-selector">
                <button
                  className={`channel-btn ${channel === 'email' ? 'active' : ''}`}
                  onClick={() => setChannel('email')}
                >
                  <Mail size={18} /> Email
                </button>
                <button
                  className={`channel-btn ${channel === 'sms' ? 'active' : ''}`}
                  onClick={() => setChannel('sms')}
                >
                  <MessageSquare size={18} /> SMS
                </button>
                <button
                  className={`channel-btn ${channel === 'social' ? 'active' : ''}`}
                  onClick={() => setChannel('social')}
                >
                  <Share2 size={18} /> Social
                </button>
              </div>

              {channel === 'social' && (
                <div className="platform-selector">
                  {['linkedin', 'facebook', 'twitter', 'instagram'].map(p => (
                    <button
                      key={p}
                      className={`platform-btn ${socialPlatform === p ? 'active' : ''}`}
                      onClick={() => setSocialPlatform(p)}
                    >
                      {p === 'linkedin' && <Linkedin size={16} />}
                      {p === 'facebook' && <Facebook size={16} />}
                      {p === 'twitter' && <Twitter size={16} />}
                      {p === 'instagram' && <Instagram size={16} />}
                      <span>{p.charAt(0).toUpperCase() + p.slice(1)}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="ai-generate-bar">
                <button
                  className="ai-generate-btn"
                  onClick={() => setShowAiPanel(!showAiPanel)}
                >
                  <Sparkles size={18} />
                  <span>Generate with AI</span>
                  <Wand2 size={16} />
                </button>
              </div>

              {showAiPanel && (
                <div className="ai-panel-inline">
                  <div className="ai-panel-header">
                    <Bot size={20} />
                    <span>AI Message Assistant</span>
                  </div>
                  <div className="ai-suggestions">
                    <p>Quick prompts:</p>
                    <div className="suggestion-chips">
                      <button onClick={() => setAiPrompt('intro email for new prospect')}>Intro email</button>
                      <button onClick={() => setAiPrompt('follow up on previous conversation')}>Follow up</button>
                      <button onClick={() => setAiPrompt('promotional offer announcement')}>Promotion</button>
                      <button onClick={() => setAiPrompt('thank you message')}>Thank you</button>
                      <button onClick={() => setAiPrompt('connection request')}>Connect</button>
                    </div>
                  </div>
                  <div className="ai-input-row">
                    <input
                      type="text"
                      placeholder="Describe the message you want to create..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && generateAiMessage()}
                    />
                    <button
                      className="btn-primary"
                      onClick={generateAiMessage}
                      disabled={isGenerating || !aiPrompt.trim()}
                    >
                      {isGenerating ? <RefreshCw size={16} className="spinning" /> : <Sparkles size={16} />}
                      {isGenerating ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                </div>
              )}

              {channel === 'email' && (
                <div className="form-group">
                  <label>Subject Line</label>
                  <input
                    type="text"
                    placeholder="Enter email subject..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Message</label>
                <textarea
                  placeholder={`Write your ${channel} message here... Use [Name], [Company] as placeholders for personalization.`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={channel === 'sms' ? 4 : 10}
                />
                {channel === 'sms' && (
                  <span className="char-count">{message.length}/160 characters</span>
                )}
              </div>

              <div className="compose-actions">
                <button className="btn-secondary" onClick={() => { setSubject(''); setMessage(''); }}>
                  <X size={16} /> Clear
                </button>
                <button
                  className="btn-primary"
                  onClick={sendMessage}
                  disabled={!message.trim() || selectedContacts.length === 0}
                >
                  <Send size={16} /> Send to {selectedContacts.length} recipient{selectedContacts.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <div className="contacts-section">
          <div className="section-header">
            <h2>Contact List</h2>
            <div className="header-actions">
              <button className="btn-secondary">
                <Upload size={16} /> Import CSV
              </button>
              <button className="btn-primary" onClick={() => { setModalType('contact'); setContactForm({ name: '', email: '', phone: '', company: '', tags: '' }); setEditingContact(null); setShowModal(true); }}>
                <Plus size={16} /> Add Contact
              </button>
            </div>
          </div>

          {contacts.length > 0 ? (
            <div className="contacts-table">
              <div className="table-header">
                <span>Name</span>
                <span>Email</span>
                <span>Phone</span>
                <span>Company</span>
                <span>Tags</span>
                <span>Actions</span>
              </div>
              {contacts.map(contact => (
                <div key={contact.id} className="table-row">
                  <span className="contact-name">{contact.name}</span>
                  <span>{contact.email}</span>
                  <span>{contact.phone}</span>
                  <span>{contact.company || '-'}</span>
                  <span className="tags">
                    {contact.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </span>
                  <span className="actions">
                    <button className="icon-btn" onClick={() => {
                      setContactForm({
                        name: contact.name,
                        email: contact.email,
                        phone: contact.phone,
                        company: contact.company || '',
                        tags: contact.tags.join(', ')
                      });
                      setEditingContact(contact);
                      setModalType('contact');
                      setShowModal(true);
                    }}><Edit2 size={14} /></button>
                    <button className="icon-btn" onClick={() => saveContacts(contacts.filter(c => c.id !== contact.id))}><Trash2 size={14} /></button>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Users size={48} />
              <h3>No contacts yet</h3>
              <p>Add contacts manually or import from CSV to start your outreach</p>
              <button className="btn-primary" onClick={() => { setModalType('contact'); setShowModal(true); }}>
                <Plus size={16} /> Add First Contact
              </button>
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="templates-section">
          <div className="section-header">
            <h2>Message Templates</h2>
            <button className="btn-primary" onClick={() => { setModalType('template'); setTemplateForm({ name: '', channel: 'email', subject: '', body: '' }); setEditingTemplate(null); setShowModal(true); }}>
              <Plus size={16} /> Create Template
            </button>
          </div>

          <div className="templates-grid">
            {templates.map(template => {
              const Icon = getChannelIcon(template.channel);
              return (
                <div key={template.id} className="template-card">
                  <div className="template-header">
                    <Icon size={20} />
                    <h4>{template.name}</h4>
                    <span className={`channel-tag ${template.channel}`}>{template.channel}</span>
                  </div>
                  {template.subject && (
                    <div className="template-subject">
                      <strong>Subject:</strong> {template.subject}
                    </div>
                  )}
                  <div className="template-preview">
                    {template.body.slice(0, 150)}...
                  </div>
                  <div className="template-variables">
                    {template.variables.map(v => (
                      <span key={v} className="variable-tag">[{v}]</span>
                    ))}
                  </div>
                  <div className="template-actions">
                    <button className="btn-primary small" onClick={() => applyTemplate(template)}>
                      <Send size={14} /> Use
                    </button>
                    <button className="btn-secondary small" onClick={() => {
                      setTemplateForm({
                        name: template.name,
                        channel: template.channel,
                        subject: template.subject || '',
                        body: template.body
                      });
                      setEditingTemplate(template);
                      setModalType('template');
                      setShowModal(true);
                    }}>
                      <Edit2 size={14} /> Edit
                    </button>
                    {!['1', '2', '3'].includes(template.id) && (
                      <button className="icon-btn" onClick={() => saveTemplates(templates.filter(t => t.id !== template.id))}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="integrations-section">
          <div className="section-header">
            <h2>Connect Your Channels</h2>
            <p>Set up integrations to automate your outreach</p>
          </div>

          <div className="integrations-grid">
            {/* Email Integrations */}
            <div className="integration-category">
              <div className="category-header">
                <Mail size={24} />
                <h3>Email</h3>
              </div>
              <div className="providers-list">
                {emailProviders.map(provider => {
                  const connected = integrations.find(i => i.provider === provider.id);
                  return (
                    <div key={provider.id} className={`provider-card ${connected ? 'connected' : ''}`}>
                      <div className="provider-info">
                        <h4>{provider.name}</h4>
                        <p>{provider.desc}</p>
                      </div>
                      {connected ? (
                        <div className="connected-status">
                          <CheckCircle size={16} /> Connected
                          <button className="btn-secondary small" onClick={() => saveIntegrations(integrations.filter(i => i.provider !== provider.id))}>
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <button className="btn-primary small" onClick={() => {
                          setIntegrationForm({ type: 'email', provider: provider.id, apiKey: '' });
                          setModalType('integration');
                          setShowModal(true);
                        }}>
                          <Zap size={14} /> Connect
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SMS Integrations */}
            <div className="integration-category">
              <div className="category-header">
                <MessageSquare size={24} />
                <h3>SMS</h3>
              </div>
              <div className="providers-list">
                {smsProviders.map(provider => {
                  const connected = integrations.find(i => i.provider === provider.id);
                  return (
                    <div key={provider.id} className={`provider-card ${connected ? 'connected' : ''}`}>
                      <div className="provider-info">
                        <h4>{provider.name}</h4>
                        <p>{provider.desc}</p>
                      </div>
                      {connected ? (
                        <div className="connected-status">
                          <CheckCircle size={16} /> Connected
                          <button className="btn-secondary small" onClick={() => saveIntegrations(integrations.filter(i => i.provider !== provider.id))}>
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <button className="btn-primary small" onClick={() => {
                          setIntegrationForm({ type: 'sms', provider: provider.id, apiKey: '' });
                          setModalType('integration');
                          setShowModal(true);
                        }}>
                          <Zap size={14} /> Connect
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Social Integrations */}
            <div className="integration-category">
              <div className="category-header">
                <Globe size={24} />
                <h3>Social Media</h3>
              </div>
              <div className="providers-list">
                {socialProviders.map(provider => {
                  const connected = integrations.find(i => i.provider === provider.id);
                  return (
                    <div key={provider.id} className={`provider-card ${connected ? 'connected' : ''}`}>
                      <div className="provider-info">
                        <h4>{provider.name}</h4>
                        <p>{provider.desc}</p>
                      </div>
                      {connected ? (
                        <div className="connected-status">
                          <CheckCircle size={16} /> Connected
                          <button className="btn-secondary small" onClick={() => saveIntegrations(integrations.filter(i => i.provider !== provider.id))}>
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <button className="btn-primary small" onClick={() => {
                          setIntegrationForm({ type: 'social', provider: provider.id, apiKey: '' });
                          setModalType('integration');
                          setShowModal(true);
                        }}>
                          <Zap size={14} /> Connect
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="integration-note">
            <AlertCircle size={16} />
            <span>Note: To actually send messages, you'll need to configure these integrations with your API keys from each provider. Messages are currently simulated.</span>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="history-section">
          <div className="section-header">
            <h2>Outreach History</h2>
            <button className="btn-secondary" onClick={() => saveHistory([])}>
              <Trash2 size={16} /> Clear History
            </button>
          </div>

          {history.length > 0 ? (
            <div className="history-list">
              {history.map(item => {
                const Icon = getChannelIcon(item.channel);
                return (
                  <div key={item.id} className="history-item">
                    <div className="history-icon">
                      <Icon size={20} />
                    </div>
                    <div className="history-content">
                      <div className="history-header">
                        <span className="recipient">{item.recipient}</span>
                        {getStatusIcon(item.status)}
                        <span className={`status-text ${item.status}`}>{item.status}</span>
                      </div>
                      {item.subject && <div className="history-subject">{item.subject}</div>}
                      <div className="history-message">{item.message.slice(0, 100)}...</div>
                      <div className="history-meta">
                        <span className="channel-badge">{item.channel}</span>
                        {item.platform && <span className="platform-badge">{item.platform}</span>}
                        <span className="timestamp">{new Date(item.sentAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <Clock size={48} />
              <h3>No outreach history</h3>
              <p>Messages you send will appear here</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalType === 'contact' && (editingContact ? 'Edit Contact' : 'Add Contact')}
                {modalType === 'template' && (editingTemplate ? 'Edit Template' : 'Create Template')}
                {modalType === 'integration' && 'Connect Integration'}
              </h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>

            {/* Contact Form */}
            {modalType === 'contact' && (
              <div className="contact-form">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    value={contactForm.company}
                    onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                    placeholder="Company name"
                  />
                </div>
                <div className="form-group">
                  <label>Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={contactForm.tags}
                    onChange={(e) => setContactForm({ ...contactForm, tags: e.target.value })}
                    placeholder="lead, prospect, vip"
                  />
                </div>
                <div className="form-actions">
                  <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn-primary" onClick={saveContact} disabled={!contactForm.name || !contactForm.email}>
                    <Save size={16} /> {editingContact ? 'Update' : 'Add'} Contact
                  </button>
                </div>
              </div>
            )}

            {/* Template Form */}
            {modalType === 'template' && (
              <div className="template-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Template Name</label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      placeholder="e.g., Cold Outreach"
                    />
                  </div>
                  <div className="form-group">
                    <label>Channel</label>
                    <select
                      value={templateForm.channel}
                      onChange={(e) => setTemplateForm({ ...templateForm, channel: e.target.value as any })}
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="social">Social Media</option>
                    </select>
                  </div>
                </div>
                {templateForm.channel === 'email' && (
                  <div className="form-group">
                    <label>Subject Line</label>
                    <input
                      type="text"
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                      placeholder="Email subject"
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Message Body</label>
                  <textarea
                    value={templateForm.body}
                    onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                    placeholder="Write your message... Use [Name], [Company] for personalization"
                    rows={8}
                  />
                  <span className="form-help">Use brackets for variables: [Name], [Company], [Your Name]</span>
                </div>
                <div className="form-actions">
                  <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn-primary" onClick={saveTemplate} disabled={!templateForm.name || !templateForm.body}>
                    <Save size={16} /> {editingTemplate ? 'Update' : 'Create'} Template
                  </button>
                </div>
              </div>
            )}

            {/* Integration Form */}
            {modalType === 'integration' && (
              <div className="integration-form">
                <div className="integration-info">
                  <Zap size={24} />
                  <h3>Connect {integrationForm.provider.charAt(0).toUpperCase() + integrationForm.provider.slice(1)}</h3>
                </div>
                <div className="form-group">
                  <label>API Key</label>
                  <input
                    type="password"
                    value={integrationForm.apiKey}
                    onChange={(e) => setIntegrationForm({ ...integrationForm, apiKey: e.target.value })}
                    placeholder="Enter your API key"
                  />
                  <span className="form-help">You can find your API key in your {integrationForm.provider} dashboard</span>
                </div>
                <div className="form-actions">
                  <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn-primary" onClick={saveIntegration} disabled={!integrationForm.apiKey}>
                    <Link size={16} /> Connect
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketing;

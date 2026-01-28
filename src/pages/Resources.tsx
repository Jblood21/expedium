import React, { useState } from 'react';
import {
  BookOpen, Play, FileText, Download, ExternalLink, Search,
  TrendingUp, Users, DollarSign, Target, Lightbulb, CheckCircle,
  ChevronRight, Star, Clock, Filter, Award
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'article' | 'video' | 'guide' | 'template' | 'checklist' | 'course';
  readTime?: string;
  featured?: boolean;
  url: string;
  source: string;
}

interface Guide {
  id: string;
  title: string;
  description: string;
  steps: { text: string; link?: string; source?: string }[];
  icon: React.ElementType;
}

const Resources: React.FC = () => {
  const [activeTab, setActiveTab] = useState('guides');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Resources' },
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'finance', label: 'Finance' },
    { id: 'operations', label: 'Operations' },
    { id: 'growth', label: 'Growth' },
  ];

  const guides: Guide[] = [
    {
      id: '1',
      title: 'Starting Your Business',
      description: 'A complete guide to launching your business from idea to operation.',
      icon: Lightbulb,
      steps: [
        { text: 'Validate your business idea with market research', link: 'https://www.sba.gov/business-guide/plan-your-business/market-research-competitive-analysis', source: 'SBA.gov' },
        { text: 'Create a detailed business plan', link: 'https://www.score.org/resource/business-plan-template-startup-business', source: 'SCORE' },
        { text: 'Register your business and get necessary licenses', link: 'https://www.sba.gov/business-guide/launch-your-business/register-your-business', source: 'SBA.gov' },
        { text: 'Set up your finances and banking', link: 'https://www.nerdwallet.com/article/small-business/best-small-business-bank-account', source: 'NerdWallet' },
        { text: 'Get an EIN (Employer Identification Number)', link: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online', source: 'IRS.gov' },
        { text: 'Understand your tax obligations', link: 'https://www.irs.gov/businesses/small-businesses-self-employed/business-taxes', source: 'IRS.gov' },
        { text: 'Launch and gather customer feedback', link: 'https://www.entrepreneur.com/starting-a-business/how-to-launch-your-business-a-step-by-step-guide/436447', source: 'Entrepreneur' }
      ]
    },
    {
      id: '2',
      title: 'Financial Management 101',
      description: 'Essential financial practices every business owner should know.',
      icon: DollarSign,
      steps: [
        { text: 'Separate personal and business finances', link: 'https://www.sba.gov/business-guide/launch-your-business/open-business-bank-account', source: 'SBA.gov' },
        { text: 'Set up proper bookkeeping from day one', link: 'https://quickbooks.intuit.com/r/bookkeeping/small-business-bookkeeping-basics/', source: 'QuickBooks' },
        { text: 'Understand your cash flow cycle', link: 'https://www.score.org/resource/12-month-cash-flow-statement', source: 'SCORE' },
        { text: 'Create and stick to a budget', link: 'https://www.sba.gov/business-guide/manage-your-business/manage-your-finances', source: 'SBA.gov' },
        { text: 'Build an emergency fund (3-6 months expenses)', link: 'https://www.forbes.com/advisor/business/how-to-build-business-emergency-fund/', source: 'Forbes' },
        { text: 'Track key financial metrics', link: 'https://hbr.org/2020/03/a-refresher-on-financial-ratios', source: 'Harvard Business Review' },
        { text: 'Plan for taxes quarterly', link: 'https://www.irs.gov/businesses/small-businesses-self-employed/estimated-taxes', source: 'IRS.gov' }
      ]
    },
    {
      id: '3',
      title: 'Customer Acquisition',
      description: 'Proven strategies to find and convert your first 100 customers.',
      icon: Users,
      steps: [
        { text: 'Define your ideal customer profile', link: 'https://blog.hubspot.com/marketing/buyer-persona-research', source: 'HubSpot' },
        { text: 'Identify where your customers spend time', link: 'https://www.thinkwithgoogle.com/consumer-insights/', source: 'Think with Google' },
        { text: 'Create a compelling value proposition', link: 'https://hbr.org/2016/09/know-your-customers-jobs-to-be-done', source: 'Harvard Business Review' },
        { text: 'Build a lead generation system', link: 'https://blog.hubspot.com/marketing/beginner-inbound-lead-generation-guide-ht', source: 'HubSpot' },
        { text: 'Develop a follow-up sequence', link: 'https://mailchimp.com/resources/email-marketing-strategy/', source: 'Mailchimp' },
        { text: 'Ask for referrals systematically', link: 'https://www.forbes.com/sites/forbesbusinesscouncil/2021/03/15/how-to-build-a-referral-program-that-actually-works/', source: 'Forbes' },
        { text: 'Track conversion rates and optimize', link: 'https://www.google.com/analytics/analytics-academy/', source: 'Google Analytics Academy' }
      ]
    },
    {
      id: '4',
      title: 'Pricing Strategy',
      description: 'How to price your products and services for maximum profit.',
      icon: Target,
      steps: [
        { text: 'Calculate your true costs (direct + indirect)', link: 'https://www.score.org/resource/breakeven-analysis', source: 'SCORE' },
        { text: 'Research competitor pricing', link: 'https://www.sba.gov/business-guide/plan-your-business/market-research-competitive-analysis', source: 'SBA.gov' },
        { text: 'Understand value-based pricing', link: 'https://hbr.org/2016/08/a-quick-guide-to-value-based-pricing', source: 'Harvard Business Review' },
        { text: 'Test different price points', link: 'https://www.priceintelligently.com/blog/ab-test-pricing-page', source: 'Price Intelligently' },
        { text: 'Consider psychological pricing', link: 'https://www.entrepreneur.com/article/279464', source: 'Entrepreneur' },
        { text: 'Create pricing tiers if applicable', link: 'https://www.forbes.com/sites/forbesbusinesscouncil/2020/11/17/how-to-create-a-pricing-strategy-that-works/', source: 'Forbes' },
        { text: 'Review and adjust quarterly', link: 'https://www.inc.com/guides/price-your-products.html', source: 'Inc.' }
      ]
    },
    {
      id: '5',
      title: 'Marketing on a Budget',
      description: 'Effective marketing tactics that don\'t require big budgets.',
      icon: TrendingUp,
      steps: [
        { text: 'Leverage social media organically', link: 'https://blog.hootsuite.com/social-media-marketing-strategy/', source: 'Hootsuite' },
        { text: 'Start content marketing', link: 'https://contentmarketinginstitute.com/getting-started/', source: 'Content Marketing Institute' },
        { text: 'Build an email list from day one', link: 'https://mailchimp.com/resources/email-marketing-strategy/', source: 'Mailchimp' },
        { text: 'Optimize for local SEO', link: 'https://moz.com/learn/seo/local', source: 'Moz' },
        { text: 'Claim your Google Business Profile', link: 'https://www.google.com/business/', source: 'Google' },
        { text: 'Encourage and showcase reviews', link: 'https://www.yelp.com/business/claim', source: 'Yelp for Business' },
        { text: 'Use free tools and platforms', link: 'https://www.canva.com/designschool/', source: 'Canva' }
      ]
    },
    {
      id: '6',
      title: 'Scaling Your Business',
      description: 'When and how to grow your business sustainably.',
      icon: TrendingUp,
      steps: [
        { text: 'Ensure your foundation is solid first', link: 'https://hbr.org/2012/06/six-common-mistakes-entreprene', source: 'Harvard Business Review' },
        { text: 'Document and systematize processes', link: 'https://www.score.org/resource/standard-operating-procedures-template', source: 'SCORE' },
        { text: 'Identify bottlenecks and constraints', link: 'https://www.lean.org/lexicon-terms/bottleneck/', source: 'Lean Enterprise Institute' },
        { text: 'Hire strategically, not reactively', link: 'https://www.sba.gov/business-guide/manage-your-business/hire-manage-employees', source: 'SBA.gov' },
        { text: 'Maintain quality while growing', link: 'https://asq.org/quality-resources/total-quality-management', source: 'ASQ' },
        { text: 'Monitor unit economics closely', link: 'https://www.ycombinator.com/library/6j-unit-economics', source: 'Y Combinator' },
        { text: 'Plan for sustainable funding', link: 'https://www.sba.gov/funding-programs', source: 'SBA.gov' }
      ]
    }
  ];

  const resources: Resource[] = [
    // Getting Started
    { id: '1', title: 'Business Structure Comparison', description: 'LLC, S-Corp, C-Corp, or Sole Proprietorship - compare all options', category: 'getting-started', type: 'guide', readTime: '15 min', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/business-structures', source: 'IRS.gov' },
    { id: '2', title: 'State Business Registration Guide', description: 'Find requirements for registering in your state', category: 'getting-started', type: 'guide', readTime: '10 min', url: 'https://www.sba.gov/business-guide/launch-your-business/register-your-business', source: 'SBA.gov' },

    // Marketing
    { id: '5', title: 'Google Digital Marketing Courses', description: 'Free certified courses on digital marketing fundamentals', category: 'marketing', type: 'course', featured: true, url: 'https://skillshop.withgoogle.com/', source: 'Google Skillshop' },
    { id: '6', title: 'HubSpot Marketing Certification', description: 'Free comprehensive marketing certification program', category: 'marketing', type: 'course', readTime: '4 hours', url: 'https://academy.hubspot.com/courses/inbound-marketing', source: 'HubSpot Academy' },
    { id: '7', title: 'Social Media Calendar Template', description: 'Plan your content with this free template', category: 'marketing', type: 'template', url: 'https://blog.hootsuite.com/how-to-create-a-social-media-content-calendar/', source: 'Hootsuite' },
    { id: '8', title: 'SEO Starter Guide', description: 'Official guide to search engine optimization', category: 'marketing', type: 'guide', readTime: '30 min', url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide', source: 'Google' },
    { id: '9', title: 'Email Marketing Best Practices', description: 'Build and engage your email list effectively', category: 'marketing', type: 'guide', readTime: '20 min', url: 'https://mailchimp.com/resources/email-marketing-field-guide/', source: 'Mailchimp' },

    // Finance
    { id: '10', title: 'Cash Flow Forecast Template', description: '12-month cash flow projection spreadsheet', category: 'finance', type: 'template', url: 'https://www.score.org/resource/12-month-cash-flow-statement', source: 'SCORE' },
    { id: '11', title: 'Small Business Tax Guide', description: 'Comprehensive tax guide for small business owners', category: 'finance', type: 'guide', readTime: '25 min', featured: true, url: 'https://www.irs.gov/businesses/small-businesses-self-employed/small-business-and-self-employed-tax-center', source: 'IRS.gov' },
    { id: '12', title: 'Financial Statements Templates', description: 'Income statement, balance sheet, and cash flow templates', category: 'finance', type: 'template', url: 'https://www.score.org/resource/financial-projections-template', source: 'SCORE' },
    { id: '13', title: 'Break-Even Analysis Calculator', description: 'Calculate your break-even point', category: 'finance', type: 'template', url: 'https://www.score.org/resource/breakeven-analysis', source: 'SCORE' },
    { id: '14', title: 'QuickBooks Tutorials', description: 'Free accounting software tutorials', category: 'finance', type: 'course', url: 'https://quickbooks.intuit.com/tutorials/', source: 'QuickBooks' },

    // Operations
    { id: '15', title: 'SOP Template Library', description: 'Standard Operating Procedures templates', category: 'operations', type: 'template', url: 'https://www.score.org/resource/standard-operating-procedures-template', source: 'SCORE' },
    { id: '16', title: 'Hiring Guide & Checklist', description: 'Everything you need to know about hiring employees', category: 'operations', type: 'checklist', readTime: '15 min', url: 'https://www.sba.gov/business-guide/manage-your-business/hire-manage-employees', source: 'SBA.gov' },
    { id: '17', title: 'Employee Handbook Template', description: 'Create policies for your team', category: 'operations', type: 'template', url: 'https://www.shrm.org/resourcesandtools/tools-and-samples/hr-forms/pages/cms_003090.aspx', source: 'SHRM' },
    { id: '18', title: 'Workplace Safety Guide', description: 'OSHA guidelines for small businesses', category: 'operations', type: 'guide', url: 'https://www.osha.gov/smallbusiness', source: 'OSHA.gov' },

    // Growth
    { id: '19', title: 'SBA Funding Programs', description: 'Explore loans, grants, and funding options', category: 'growth', type: 'guide', featured: true, url: 'https://www.sba.gov/funding-programs', source: 'SBA.gov' },
    { id: '20', title: 'Partnership Agreement Template', description: 'Legal template for business partnerships', category: 'growth', type: 'template', url: 'https://www.score.org/resource/partnership-agreement', source: 'SCORE' },
    { id: '21', title: 'Scaling Strategy Framework', description: 'Harvard Business Review guide on scaling', category: 'growth', type: 'article', readTime: '20 min', url: 'https://hbr.org/2021/11/how-to-scale-a-successful-business', source: 'Harvard Business Review' },
    { id: '22', title: 'Exit Strategy Planning', description: 'Plan your business exit from day one', category: 'growth', type: 'guide', readTime: '18 min', url: 'https://www.score.org/resource/exit-strategy-planning', source: 'SCORE' },
    { id: '23', title: 'Franchise Opportunities Guide', description: 'Explore franchising your business', category: 'growth', type: 'guide', url: 'https://www.ftc.gov/business-guidance/resources/franchise-rule-compliance-guide', source: 'FTC.gov' },
  ];

  const bestPractices = [
    {
      category: 'Customer Service',
      source: 'Harvard Business Review',
      tips: [
        { text: 'Respond to inquiries within 24 hours', link: 'https://hbr.org/2010/07/stop-trying-to-delight-your-customers' },
        { text: 'Always under-promise and over-deliver' },
        { text: 'Ask for feedback after every interaction', link: 'https://www.surveymonkey.com/mp/customer-feedback-guide/' },
        { text: 'Handle complaints as opportunities', link: 'https://hbr.org/2018/01/the-right-way-to-respond-to-negative-feedback' },
        { text: 'Personalize your communication' }
      ]
    },
    {
      category: 'Time Management',
      source: 'Forbes & Entrepreneur',
      tips: [
        { text: 'Block time for deep work', link: 'https://www.calnewport.com/books/deep-work/' },
        { text: 'Use the 80/20 rule (Pareto Principle)', link: 'https://www.entrepreneur.com/article/229813' },
        { text: 'Batch similar tasks together' },
        { text: 'Set boundaries with your schedule' },
        { text: 'Review and plan weekly', link: 'https://www.forbes.com/sites/kevinkruse/2016/10/03/weekly-review/' }
      ]
    },
    {
      category: 'Financial Health',
      source: 'SBA & SCORE',
      tips: [
        { text: 'Review finances weekly', link: 'https://www.score.org/resource/financial-review-checklist' },
        { text: 'Maintain 3-6 months of reserves', link: 'https://www.sba.gov/blog/managing-business-cash-flow' },
        { text: 'Invoice promptly and follow up', link: 'https://quickbooks.intuit.com/r/invoicing/invoice-payment-terms/' },
        { text: 'Know your numbers (CAC, LTV, margins)', link: 'https://www.investopedia.com/terms/k/kpi.asp' },
        { text: 'Separate business and personal', link: 'https://www.sba.gov/business-guide/launch-your-business/open-business-bank-account' }
      ]
    },
    {
      category: 'Marketing',
      source: 'HubSpot & Google',
      tips: [
        { text: 'Be consistent in your messaging', link: 'https://blog.hubspot.com/marketing/brand-consistency' },
        { text: 'Focus on one channel before expanding' },
        { text: 'Track what works and double down', link: 'https://analytics.google.com/' },
        { text: 'Build relationships, not just sales' },
        { text: 'Content is a long-term investment', link: 'https://contentmarketinginstitute.com/what-is-content-marketing/' }
      ]
    }
  ];

  const getTypeIcon = (type: Resource['type']) => {
    switch (type) {
      case 'article': return FileText;
      case 'video': return Play;
      case 'guide': return BookOpen;
      case 'template': return Download;
      case 'checklist': return CheckCircle;
      case 'course': return Award;
      default: return FileText;
    }
  };

  const filteredResources = resources.filter(r => {
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         r.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredResources = resources.filter(r => r.featured);

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="resources-page">
      <div className="page-header">
        <BookOpen size={32} />
        <h1>Resources & Learning Center</h1>
        <p>Curated guides, templates, and courses from trusted sources like SBA, SCORE, IRS, and more</p>
      </div>

      {/* Tabs */}
      <div className="resource-tabs">
        <button
          className={`tab-btn ${activeTab === 'guides' ? 'active' : ''}`}
          onClick={() => setActiveTab('guides')}
        >
          <BookOpen size={18} /> Step-by-Step Guides
        </button>
        <button
          className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          <FileText size={18} /> Templates & Articles
        </button>
        <button
          className={`tab-btn ${activeTab === 'best-practices' ? 'active' : ''}`}
          onClick={() => setActiveTab('best-practices')}
        >
          <Star size={18} /> Best Practices
        </button>
      </div>

      {/* Guides Tab */}
      {activeTab === 'guides' && (
        <div className="guides-section">
          <div className="guides-grid">
            {guides.map((guide) => (
              <div key={guide.id} className="guide-card">
                <div className="guide-header">
                  <div className="guide-icon">
                    <guide.icon size={24} />
                  </div>
                  <h3>{guide.title}</h3>
                </div>
                <p className="guide-description">{guide.description}</p>
                <div className="guide-steps">
                  <h4>Key Steps:</h4>
                  <ol>
                    {guide.steps.map((step, idx) => (
                      <li key={idx}>
                        <CheckCircle size={14} />
                        {step.link ? (
                          <a href={step.link} target="_blank" rel="noopener noreferrer" className="step-link">
                            {step.text}
                            <span className="step-source">({step.source})</span>
                          </a>
                        ) : (
                          <span>{step.text}</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="resources-section">
          {/* Search and Filter */}
          <div className="search-filter-bar">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <Filter size={18} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Featured Resources */}
          {selectedCategory === 'all' && !searchTerm && (
            <div className="featured-section">
              <h3><Star size={20} /> Featured Resources</h3>
              <div className="featured-grid">
                {featuredResources.map((resource) => {
                  const Icon = getTypeIcon(resource.type);
                  return (
                    <div key={resource.id} className="featured-card" onClick={() => openLink(resource.url)}>
                      <div className="featured-badge">Featured</div>
                      <Icon size={24} />
                      <h4>{resource.title}</h4>
                      <p>{resource.description}</p>
                      <span className="resource-source">{resource.source}</span>
                      <button className="resource-btn">
                        {resource.type === 'template' ? 'Download' : 'View Resource'}
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resource List */}
          <div className="resources-list">
            {filteredResources.map((resource) => {
              const Icon = getTypeIcon(resource.type);
              return (
                <div key={resource.id} className="resource-item" onClick={() => openLink(resource.url)}>
                  <div className="resource-icon">
                    <Icon size={20} />
                  </div>
                  <div className="resource-content">
                    <h4>{resource.title}</h4>
                    <p>{resource.description}</p>
                    <div className="resource-meta">
                      <span className="resource-type">{resource.type}</span>
                      <span className="resource-source">{resource.source}</span>
                      {resource.readTime && (
                        <span className="resource-time">
                          <Clock size={14} /> {resource.readTime}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="resource-action">
                    <ExternalLink size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          {filteredResources.length === 0 && (
            <div className="no-results">
              <Search size={48} />
              <p>No resources found matching your criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Best Practices Tab */}
      {activeTab === 'best-practices' && (
        <div className="best-practices-section">
          <div className="practices-grid">
            {bestPractices.map((practice, idx) => (
              <div key={idx} className="practice-card">
                <h3>{practice.category}</h3>
                <span className="practice-source">Source: {practice.source}</span>
                <ul>
                  {practice.tips.map((tip, tipIdx) => (
                    <li key={tipIdx}>
                      <CheckCircle size={16} />
                      {tip.link ? (
                        <a href={tip.link} target="_blank" rel="noopener noreferrer">
                          {tip.text} <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span>{tip.text}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Industry Benchmarks */}
          <div className="benchmarks-section">
            <h3><TrendingUp size={20} /> Industry Benchmarks</h3>
            <p className="benchmarks-intro">
              Compare your metrics to industry standards.
              <a href="https://www.sba.gov/business-guide/plan-your-business/market-research-competitive-analysis" target="_blank" rel="noopener noreferrer"> Learn more about benchmarking (SBA.gov)</a>
            </p>
            <div className="benchmarks-grid">
              <div className="benchmark-card">
                <h4>Customer Acquisition Cost</h4>
                <a href="https://www.profitwell.com/recur/all/customer-acquisition-cost" target="_blank" rel="noopener noreferrer" className="benchmark-source">Source: ProfitWell</a>
                <div className="benchmark-values">
                  <div className="benchmark-item">
                    <span className="label">SaaS</span>
                    <span className="value">$200-$500</span>
                  </div>
                  <div className="benchmark-item">
                    <span className="label">E-commerce</span>
                    <span className="value">$10-$50</span>
                  </div>
                  <div className="benchmark-item">
                    <span className="label">Services</span>
                    <span className="value">$50-$200</span>
                  </div>
                </div>
              </div>
              <div className="benchmark-card">
                <h4>Profit Margins by Industry</h4>
                <a href="https://www.investopedia.com/ask/answers/071615/what-profit-margin-indicative-retail-sector.asp" target="_blank" rel="noopener noreferrer" className="benchmark-source">Source: Investopedia</a>
                <div className="benchmark-values">
                  <div className="benchmark-item">
                    <span className="label">Retail</span>
                    <span className="value">2-5%</span>
                  </div>
                  <div className="benchmark-item">
                    <span className="label">Services</span>
                    <span className="value">15-30%</span>
                  </div>
                  <div className="benchmark-item">
                    <span className="label">Software</span>
                    <span className="value">20-40%</span>
                  </div>
                </div>
              </div>
              <div className="benchmark-card">
                <h4>CLV:CAC Ratio</h4>
                <a href="https://www.ycombinator.com/library/6j-unit-economics" target="_blank" rel="noopener noreferrer" className="benchmark-source">Source: Y Combinator</a>
                <div className="benchmark-values">
                  <div className="benchmark-item">
                    <span className="label">Good</span>
                    <span className="value">3:1</span>
                  </div>
                  <div className="benchmark-item">
                    <span className="label">Great</span>
                    <span className="value">4:1+</span>
                  </div>
                  <div className="benchmark-item">
                    <span className="label">Needs Work</span>
                    <span className="value">&lt;3:1</span>
                  </div>
                </div>
              </div>
              <div className="benchmark-card">
                <h4>Email Marketing</h4>
                <a href="https://mailchimp.com/resources/email-marketing-benchmarks/" target="_blank" rel="noopener noreferrer" className="benchmark-source">Source: Mailchimp</a>
                <div className="benchmark-values">
                  <div className="benchmark-item">
                    <span className="label">Open Rate</span>
                    <span className="value">15-25%</span>
                  </div>
                  <div className="benchmark-item">
                    <span className="label">Click Rate</span>
                    <span className="value">2-5%</span>
                  </div>
                  <div className="benchmark-item">
                    <span className="label">Conversion</span>
                    <span className="value">1-3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;

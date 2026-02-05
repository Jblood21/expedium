import React, { useState, useEffect } from 'react';
import {
  BookOpen, Play, FileText, Download, ExternalLink, Search,
  TrendingUp, Users, DollarSign, Target, Lightbulb, CheckCircle,
  ChevronRight, Star, Clock, Filter, Award, Building2, Sparkles,
  RefreshCw, Plus, ArrowUpRight, ArrowDownRight, Equal,
  Loader, Trash2, Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

interface Competitor {
  id: string;
  name: string;
  description: string;
  website: string;
  industry: string;
  products: { name: string; price: string; description: string }[];
  strengths: string[];
  weaknesses: string[];
  comparison: {
    pricing: 'higher' | 'lower' | 'similar';
    marketShare: 'larger' | 'smaller' | 'similar';
    features: 'more' | 'fewer' | 'similar';
  };
  threatLevel: 'high' | 'medium' | 'low';
}

// Database of real-world competitors by business type keywords
interface CompetitorTemplate {
  keywords: string[];
  competitors: {
    name: string;
    website: string;
    description: string;
    products: { name: string; price: string; description: string }[];
    strengths: string[];
    weaknesses: string[];
  }[];
}

const competitorDatabase: CompetitorTemplate[] = [
  {
    keywords: ['business', 'startup', 'entrepreneur', 'build business', 'launch business', 'start business', 'business plan', 'business building', 'business platform'],
    competitors: [
      { name: 'LivePlan', website: 'www.liveplan.com', description: 'Business planning software that helps entrepreneurs create professional business plans with financial forecasting tools.', products: [{ name: 'Standard', price: '$20/mo', description: 'Business plan creation tools' }, { name: 'Premium', price: '$40/mo', description: 'Full features + pitch builder' }], strengths: ['Well-known brand', 'SBA recommended', 'Financial forecasting'], weaknesses: ['Limited customization', 'Dated interface'] },
      { name: 'Enloop', website: 'www.enloop.com', description: 'Automated business plan writing software with financial projections and performance scoring.', products: [{ name: 'Free', price: '$0', description: 'Basic plan creation' }, { name: 'Detailed', price: '$19.95/mo', description: 'Full features' }], strengths: ['Auto-generated text', 'Performance score', 'Affordable'], weaknesses: ['Generic content', 'Limited industries'] },
      { name: 'Bizplan', website: 'www.bizplan.com', description: 'Modern business planning platform with drag-and-drop builder and investor-ready templates.', products: [{ name: 'Monthly', price: '$29/mo', description: 'All features' }, { name: 'Lifetime', price: '$349', description: 'One-time payment' }], strengths: ['Modern interface', 'Investor network', 'Easy to use'], weaknesses: ['Newer platform', 'Less established'] },
      { name: 'IdeaBuddy', website: 'www.ideabuddy.com', description: 'Business idea validation and planning tool for early-stage entrepreneurs.', products: [{ name: 'Dreamer', price: '$0', description: 'Idea development' }, { name: 'Founder', price: '$15/mo', description: 'Full business planning' }], strengths: ['Idea validation', 'Step-by-step guidance', 'Low cost'], weaknesses: ['Less comprehensive', 'Smaller user base'] },
      { name: 'Upmetrics', website: 'www.upmetrics.co', description: 'AI-powered business planning software with collaborative features and pitch deck creation.', products: [{ name: 'Starter', price: '$9/mo', description: 'Solo planning' }, { name: 'Premium', price: '$19/mo', description: 'Team collaboration' }], strengths: ['AI assistance', 'Collaboration', 'Affordable'], weaknesses: ['Newer company', 'Limited integrations'] },
    ]
  },
  {
    keywords: ['app', 'application', 'software', 'saas', 'platform', 'tool', 'mobile app', 'web app', 'tech'],
    competitors: [
      { name: 'Bubble', website: 'www.bubble.io', description: 'No-code platform for building web applications without programming knowledge.', products: [{ name: 'Free', price: '$0', description: 'Learning & testing' }, { name: 'Starter', price: '$29/mo', description: 'Launch apps' }, { name: 'Growth', price: '$119/mo', description: 'Scale apps' }], strengths: ['No-code', 'Large community', 'Powerful features'], weaknesses: ['Learning curve', 'Performance limits'] },
      { name: 'Webflow', website: 'www.webflow.com', description: 'Visual web development platform combining design and CMS capabilities.', products: [{ name: 'Starter', price: '$14/mo', description: 'Basic sites' }, { name: 'CMS', price: '$23/mo', description: 'Dynamic content' }], strengths: ['Beautiful design', 'No-code', 'Professional output'], weaknesses: ['Complex pricing', 'Limited backend'] },
      { name: 'Adalo', website: 'www.adalo.com', description: 'No-code mobile and web app builder with native app publishing.', products: [{ name: 'Free', price: '$0', description: 'Testing' }, { name: 'Starter', price: '$45/mo', description: 'Publish apps' }], strengths: ['Native apps', 'Easy to use', 'Quick launch'], weaknesses: ['Limited features', 'Performance issues'] },
      { name: 'Glide', website: 'www.glideapps.com', description: 'Build apps from spreadsheets with a simple drag-and-drop interface.', products: [{ name: 'Free', price: '$0', description: 'Personal use' }, { name: 'Pro', price: '$25/mo', description: 'Business features' }], strengths: ['Spreadsheet-based', 'Very easy', 'Fast deployment'], weaknesses: ['Limited customization', 'Spreadsheet dependency'] },
    ]
  },
  {
    keywords: ['ecommerce', 'online store', 'sell online', 'shop', 'retail', 'products', 'dropshipping', 'marketplace'],
    competitors: [
      { name: 'Shopify', website: 'www.shopify.com', description: 'Leading e-commerce platform powering millions of online stores worldwide.', products: [{ name: 'Basic', price: '$39/mo', description: 'New businesses' }, { name: 'Shopify', price: '$105/mo', description: 'Growing businesses' }, { name: 'Advanced', price: '$399/mo', description: 'Scaling businesses' }], strengths: ['Market leader', 'Huge app store', 'Reliable'], weaknesses: ['Transaction fees', 'Expensive at scale'] },
      { name: 'WooCommerce', website: 'www.woocommerce.com', description: 'Open-source e-commerce plugin for WordPress with extensive customization.', products: [{ name: 'Core', price: 'Free', description: 'Basic store' }, { name: 'Extensions', price: '$49-299', description: 'Add-ons' }], strengths: ['Free core', 'Highly customizable', 'WordPress integration'], weaknesses: ['Technical knowledge needed', 'Hosting costs'] },
      { name: 'BigCommerce', website: 'www.bigcommerce.com', description: 'Enterprise e-commerce solution with built-in features and multi-channel selling.', products: [{ name: 'Standard', price: '$39/mo', description: 'Essential features' }, { name: 'Plus', price: '$105/mo', description: 'Marketing tools' }], strengths: ['No transaction fees', 'Built-in features', 'Multi-channel'], weaknesses: ['Sales limits', 'Less flexible'] },
      { name: 'Squarespace', website: 'www.squarespace.com', description: 'Beautiful website builder with integrated e-commerce capabilities.', products: [{ name: 'Business', price: '$27/mo', description: 'Basic commerce' }, { name: 'Commerce', price: '$42/mo', description: 'Full e-commerce' }], strengths: ['Stunning templates', 'All-in-one', 'Easy to use'], weaknesses: ['Limited e-commerce features', 'Transaction fees'] },
    ]
  },
  {
    keywords: ['consulting', 'coach', 'coaching', 'advisor', 'consultant', 'mentor', 'training', 'course', 'education'],
    competitors: [
      { name: 'Kajabi', website: 'www.kajabi.com', description: 'All-in-one platform for coaches and course creators to sell knowledge products.', products: [{ name: 'Basic', price: '$149/mo', description: '3 products' }, { name: 'Growth', price: '$199/mo', description: '15 products' }, { name: 'Pro', price: '$399/mo', description: 'Unlimited' }], strengths: ['All-in-one', 'No transaction fees', 'Polished'], weaknesses: ['Expensive', 'Learning curve'] },
      { name: 'Teachable', website: 'www.teachable.com', description: 'Course creation platform with marketing tools and student management.', products: [{ name: 'Free', price: '$0 + fees', description: 'Basic courses' }, { name: 'Basic', price: '$59/mo', description: 'Custom domain' }, { name: 'Pro', price: '$159/mo', description: 'Advanced features' }], strengths: ['Easy to use', 'Good free tier', 'Reliable'], weaknesses: ['Transaction fees', 'Limited customization'] },
      { name: 'Thinkific', website: 'www.thinkific.com', description: 'Course platform focused on creating and selling online learning experiences.', products: [{ name: 'Free', price: '$0', description: '1 course' }, { name: 'Basic', price: '$49/mo', description: 'Unlimited courses' }], strengths: ['No transaction fees', 'Good free plan', 'Flexible'], weaknesses: ['Marketing tools limited', 'Less community'] },
      { name: 'Podia', website: 'www.podia.com', description: 'Simple platform for selling courses, memberships, and digital downloads.', products: [{ name: 'Mover', price: '$39/mo', description: 'Core features' }, { name: 'Shaker', price: '$89/mo', description: 'Full features' }], strengths: ['Simple pricing', 'Easy to use', 'Good support'], weaknesses: ['Fewer features', 'Less customization'] },
    ]
  },
  {
    keywords: ['marketing', 'advertising', 'social media', 'seo', 'digital marketing', 'content', 'agency', 'brand', 'ads'],
    competitors: [
      { name: 'HubSpot', website: 'www.hubspot.com', description: 'Comprehensive inbound marketing, sales, and CRM platform for growing businesses.', products: [{ name: 'Starter', price: '$50/mo', description: 'Basic tools' }, { name: 'Professional', price: '$890/mo', description: 'Full marketing suite' }], strengths: ['All-in-one', 'Free CRM', 'Great education'], weaknesses: ['Expensive', 'Complex'] },
      { name: 'Mailchimp', website: 'www.mailchimp.com', description: 'Email marketing platform with automation and audience management tools.', products: [{ name: 'Free', price: '$0', description: 'Basic email' }, { name: 'Essentials', price: '$13/mo', description: 'Email templates' }, { name: 'Standard', price: '$20/mo', description: 'Automation' }], strengths: ['Easy to use', 'Good free tier', 'Reliable'], weaknesses: ['Limited at scale', 'Price increases'] },
      { name: 'Hootsuite', website: 'www.hootsuite.com', description: 'Social media management platform for scheduling and analytics.', products: [{ name: 'Professional', price: '$99/mo', description: '10 accounts' }, { name: 'Team', price: '$249/mo', description: '20 accounts' }], strengths: ['Multi-platform', 'Team features', 'Analytics'], weaknesses: ['Expensive', 'Can be buggy'] },
      { name: 'Semrush', website: 'www.semrush.com', description: 'SEO and competitive research toolkit for digital marketers.', products: [{ name: 'Pro', price: '$129/mo', description: 'Essential tools' }, { name: 'Guru', price: '$249/mo', description: 'Full toolkit' }], strengths: ['Comprehensive data', 'Trusted', 'Detailed insights'], weaknesses: ['Expensive', 'Overwhelming'] },
    ]
  },
  {
    keywords: ['fitness', 'gym', 'health', 'wellness', 'workout', 'personal training', 'nutrition', 'weight loss', 'exercise'],
    competitors: [
      { name: 'Mindbody', website: 'www.mindbodyonline.com', description: 'Booking and business management software for fitness and wellness businesses.', products: [{ name: 'Starter', price: '$129/mo', description: 'Basic booking' }, { name: 'Accelerate', price: '$279/mo', description: 'Marketing tools' }], strengths: ['Industry standard', 'Consumer app', 'Full featured'], weaknesses: ['Expensive', 'Complex setup'] },
      { name: 'Trainerize', website: 'www.trainerize.com', description: 'Personal training software for delivering workouts and nutrition plans.', products: [{ name: 'Grow', price: '$5/mo per client', description: 'Core training tools' }, { name: 'Pro', price: '$20/mo per client', description: 'Full features' }], strengths: ['Client-focused', 'Good app', 'Workout library'], weaknesses: ['Per-client pricing', 'Limited customization'] },
      { name: 'My PT Hub', website: 'www.mypthub.net', description: 'Online personal training platform with workout and nutrition tracking.', products: [{ name: 'Free', price: '$0', description: '2 clients' }, { name: 'Standard', price: '$40/mo', description: 'Unlimited clients' }], strengths: ['Affordable', 'Good features', 'Nutrition tools'], weaknesses: ['Dated interface', 'Limited integrations'] },
      { name: 'TrueCoach', website: 'www.truecoach.co', description: 'Programming and client management for personal trainers and coaches.', products: [{ name: 'Starter', price: '$19/mo', description: '5 clients' }, { name: 'Standard', price: '$49/mo', description: '20 clients' }], strengths: ['Clean interface', 'Easy programming', 'Good support'], weaknesses: ['Limited marketing', 'Basic analytics'] },
    ]
  },
  {
    keywords: ['food', 'restaurant', 'catering', 'meal', 'delivery', 'kitchen', 'chef', 'cooking', 'recipes'],
    competitors: [
      { name: 'Toast', website: 'www.toasttab.com', description: 'Restaurant management platform with POS, online ordering, and delivery.', products: [{ name: 'Starter Kit', price: '$0 + fees', description: 'Basic POS' }, { name: 'Essentials', price: '$165/mo', description: 'Full restaurant suite' }], strengths: ['Restaurant-focused', 'Hardware included', 'Reliable'], weaknesses: ['Long contracts', 'Add-on costs'] },
      { name: 'Square for Restaurants', website: 'www.squareup.com/restaurants', description: 'POS and restaurant management system with integrated payments.', products: [{ name: 'Free', price: '$0 + fees', description: 'Basic POS' }, { name: 'Plus', price: '$60/mo', description: 'Advanced features' }], strengths: ['No monthly fee option', 'Easy setup', 'Good ecosystem'], weaknesses: ['Processing fees', 'Limited features'] },
      { name: 'ChowNow', website: 'www.chownow.com', description: 'Commission-free online ordering system for restaurants.', products: [{ name: 'Basic', price: '$149/mo', description: 'Online ordering' }, { name: 'Pro', price: '$249/mo', description: 'Marketing tools' }], strengths: ['No commissions', 'Branded experience', 'Marketing tools'], weaknesses: ['Monthly fee', 'Limited integrations'] },
    ]
  },
  {
    keywords: ['real estate', 'property', 'homes', 'houses', 'realtor', 'broker', 'rental', 'landlord', 'mortgage', 'housing'],
    competitors: [
      { name: 'Zillow', website: 'www.zillow.com', description: 'Real estate marketplace with listings, Zestimates, and agent connections.', products: [{ name: 'Premier Agent', price: '$300-1000+/mo', description: 'Lead generation' }], strengths: ['Massive traffic', 'Brand recognition', 'Comprehensive data'], weaknesses: ['Expensive leads', 'Competition'] },
      { name: 'Realtor.com', website: 'www.realtor.com', description: 'Official real estate listings site of the National Association of Realtors.', products: [{ name: 'Connections Plus', price: '$200-500/mo', description: 'Leads & marketing' }], strengths: ['Official listings', 'Accurate data', 'Trusted brand'], weaknesses: ['High competition', 'Lead quality varies'] },
      { name: 'Redfin', website: 'www.redfin.com', description: 'Tech-powered real estate brokerage with lower commission rates.', products: [{ name: 'Listing Service', price: '1-1.5% commission', description: 'Full service' }], strengths: ['Lower fees', 'Tech-forward', 'Good UX'], weaknesses: ['Less personal service', 'Limited markets'] },
    ]
  },
  {
    keywords: ['finance', 'accounting', 'bookkeeping', 'tax', 'investment', 'banking', 'money', 'financial', 'budget'],
    competitors: [
      { name: 'QuickBooks', website: 'www.quickbooks.intuit.com', description: 'Small business accounting software with invoicing, expenses, and payroll.', products: [{ name: 'Simple Start', price: '$30/mo', description: 'Basic accounting' }, { name: 'Essentials', price: '$60/mo', description: 'Bill pay & time' }, { name: 'Plus', price: '$90/mo', description: 'Inventory & projects' }], strengths: ['Industry standard', 'Full-featured', 'Integrations'], weaknesses: ['Expensive', 'Steep learning curve'] },
      { name: 'FreshBooks', website: 'www.freshbooks.com', description: 'Cloud accounting designed for service-based small businesses.', products: [{ name: 'Lite', price: '$17/mo', description: '5 clients' }, { name: 'Plus', price: '$30/mo', description: '50 clients' }], strengths: ['Easy invoicing', 'Great UX', 'Time tracking'], weaknesses: ['Limited accounting', 'Client limits'] },
      { name: 'Wave', website: 'www.waveapps.com', description: 'Free accounting and invoicing software for small businesses.', products: [{ name: 'Accounting', price: 'Free', description: 'Full accounting' }, { name: 'Payroll', price: '$40/mo base', description: 'Payroll services' }], strengths: ['Free accounting', 'Easy to use', 'Unlimited invoicing'], weaknesses: ['Limited support', 'Payment fees'] },
      { name: 'Xero', website: 'www.xero.com', description: 'Cloud-based accounting platform with strong bank connections and features.', products: [{ name: 'Early', price: '$15/mo', description: 'Basic features' }, { name: 'Growing', price: '$42/mo', description: 'Full features' }], strengths: ['Modern interface', 'Bank feeds', 'Multi-currency'], weaknesses: ['Learning curve', 'US payroll limited'] },
    ]
  },
  {
    keywords: ['crm', 'sales', 'leads', 'customers', 'client management', 'pipeline', 'sales team', 'customer relationship'],
    competitors: [
      { name: 'Salesforce', website: 'www.salesforce.com', description: 'Enterprise CRM platform powering sales teams at companies of all sizes.', products: [{ name: 'Essentials', price: '$25/user/mo', description: 'Basic CRM' }, { name: 'Professional', price: '$80/user/mo', description: 'Full CRM' }], strengths: ['Industry leader', 'Highly customizable', 'Ecosystem'], weaknesses: ['Expensive', 'Complex'] },
      { name: 'HubSpot CRM', website: 'www.hubspot.com/crm', description: 'Free CRM with sales, marketing, and customer service tools.', products: [{ name: 'Free', price: '$0', description: 'Basic CRM' }, { name: 'Starter', price: '$50/mo', description: 'Essential tools' }], strengths: ['Free tier', 'Easy to use', 'All-in-one'], weaknesses: ['Limited free features', 'Expensive upgrades'] },
      { name: 'Pipedrive', website: 'www.pipedrive.com', description: 'Sales-focused CRM designed for small sales teams.', products: [{ name: 'Essential', price: '$14.90/user/mo', description: 'Basic pipeline' }, { name: 'Advanced', price: '$27.90/user/mo', description: 'Email & automation' }], strengths: ['Visual pipeline', 'Easy to use', 'Affordable'], weaknesses: ['Limited marketing', 'Basic reporting'] },
      { name: 'Zoho CRM', website: 'www.zoho.com/crm', description: 'Comprehensive CRM with AI assistant and automation features.', products: [{ name: 'Free', price: '$0', description: '3 users' }, { name: 'Standard', price: '$20/user/mo', description: 'Core features' }], strengths: ['Affordable', 'Feature-rich', 'Zoho ecosystem'], weaknesses: ['Dated UI', 'Learning curve'] },
    ]
  },
];

const Resources: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('guides');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingCount, setGeneratingCount] = useState(0);
  const [businessData, setBusinessData] = useState<any>(null);
  const [noMatchesFound, setNoMatchesFound] = useState(false);
  const [matchedCategory, setMatchedCategory] = useState<string>('');

  // Load business plan data and saved competitors
  useEffect(() => {
    if (!user) return;
    const savedAnswers = localStorage.getItem(`expedium_answers_${user.id}`);
    const savedCompetitors = localStorage.getItem(`expedium_competitors_${user.id}`);

    if (savedAnswers) {
      setBusinessData(JSON.parse(savedAnswers));
    }
    if (savedCompetitors) {
      setCompetitors(JSON.parse(savedCompetitors));
    }
  }, [user]);

  // Save competitors when they change
  useEffect(() => {
    if (!user || competitors.length === 0) return;
    localStorage.setItem(`expedium_competitors_${user.id}`, JSON.stringify(competitors));
  }, [competitors, user]);

  // Analyze business and find matching competitor category
  const analyzeBusinessType = (): { category: CompetitorTemplate | null; matchScore: number; matchedKeywords: string[] } => {
    if (!businessData) return { category: null, matchScore: 0, matchedKeywords: [] };

    const businessName = (businessData.business_name || '').toLowerCase();
    const valueProposition = (businessData.value_proposition || '').toLowerCase();
    const targetMarket = (businessData.target_market || '').toLowerCase();
    const industries = Array.isArray(businessData.industry) ? businessData.industry.join(' ').toLowerCase() : (businessData.industry || '').toLowerCase();

    // Combine all text for analysis
    const fullText = `${businessName} ${valueProposition} ${targetMarket} ${industries}`;

    let bestMatch: CompetitorTemplate | null = null;
    let highestScore = 0;
    let matchedKeywords: string[] = [];

    for (const template of competitorDatabase) {
      let score = 0;
      const matched: string[] = [];

      for (const keyword of template.keywords) {
        if (fullText.includes(keyword.toLowerCase())) {
          score += keyword.split(' ').length; // Multi-word keywords score higher
          matched.push(keyword);
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = template;
        matchedKeywords = matched;
      }
    }

    return { category: bestMatch, matchScore: highestScore, matchedKeywords };
  };

  // AI competitor generation based on specific business type
  const generateCompetitor = (): Competitor | null => {
    const { category } = analyzeBusinessType();

    if (!category || category.competitors.length === 0) {
      return null;
    }

    const stage = businessData?.business_stage || 'Startup';
    const usedNames = competitors.map(c => c.name);
    const availableCompetitors = category.competitors.filter(c => !usedNames.includes(c.name));

    if (availableCompetitors.length === 0) {
      return null;
    }

    const template = availableCompetitors[Math.floor(Math.random() * availableCompetitors.length)];

    const pricing: 'higher' | 'lower' | 'similar' = ['higher', 'lower', 'similar'][Math.floor(Math.random() * 3)] as any;
    const marketShare: 'larger' | 'smaller' | 'similar' = stage === 'Idea Stage' || stage === 'Startup (0-1 years)'
      ? ['larger', 'larger', 'similar'][Math.floor(Math.random() * 3)] as any
      : ['larger', 'smaller', 'similar'][Math.floor(Math.random() * 3)] as any;
    const features: 'more' | 'fewer' | 'similar' = ['more', 'fewer', 'similar'][Math.floor(Math.random() * 3)] as any;

    const threatLevel: 'high' | 'medium' | 'low' =
      marketShare === 'larger' && pricing === 'lower' ? 'high' :
      marketShare === 'smaller' && pricing === 'higher' ? 'low' : 'medium';

    return {
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: template.name,
      description: template.description,
      website: template.website,
      industry: category.keywords[0],
      products: template.products,
      strengths: template.strengths,
      weaknesses: template.weaknesses,
      comparison: { pricing, marketShare, features },
      threatLevel
    };
  };

  const handleGenerateCompetitors = async (count: number) => {
    if (!businessData) {
      alert('Please complete your Business Plan first to generate relevant competitors.');
      return;
    }

    const { category, matchScore, matchedKeywords } = analyzeBusinessType();

    if (!category || matchScore < 1) {
      setNoMatchesFound(true);
      setMatchedCategory('');
      return;
    }

    setMatchedCategory(matchedKeywords.join(', '));
    setNoMatchesFound(false);

    if (competitors.length + count > 10) {
      alert(`You can only have up to 10 competitors. You have ${competitors.length} currently.`);
      return;
    }

    const usedNames = competitors.map(c => c.name);
    const availableCount = category.competitors.filter(c => !usedNames.includes(c.name)).length;

    if (availableCount === 0) {
      alert('All available competitors for your business type have been added.');
      return;
    }

    const actualCount = Math.min(count, availableCount);

    setIsGenerating(true);
    setGeneratingCount(actualCount);

    for (let i = 0; i < actualCount; i++) {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      const newCompetitor = generateCompetitor();
      if (newCompetitor) {
        setCompetitors(prev => [...prev, newCompetitor]);
      }
      setGeneratingCount(prev => prev - 1);
    }

    setIsGenerating(false);
    setGeneratingCount(0);
  };

  const removeCompetitor = (id: string) => {
    setCompetitors(prev => prev.filter(c => c.id !== id));
    if (user) {
      const updated = competitors.filter(c => c.id !== id);
      localStorage.setItem(`expedium_competitors_${user.id}`, JSON.stringify(updated));
    }
  };

  const clearAllCompetitors = () => {
    setCompetitors([]);
    if (user) {
      localStorage.removeItem(`expedium_competitors_${user.id}`);
    }
  };

  const regenerateCompetitor = async (id: string) => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newCompetitor = generateCompetitor();
    if (newCompetitor) {
      newCompetitor.id = id; // Keep same ID
      setCompetitors(prev => prev.map(c => c.id === id ? newCompetitor : c));
    }
    setIsGenerating(false);
  };

  const getComparisonIcon = (type: string, value: string) => {
    if (type === 'pricing') {
      return value === 'higher' ? <ArrowUpRight size={14} className="comp-icon higher" /> :
             value === 'lower' ? <ArrowDownRight size={14} className="comp-icon lower" /> :
             <Equal size={14} className="comp-icon similar" />;
    }
    if (type === 'marketShare' || type === 'features') {
      return value === 'larger' || value === 'more' ? <ArrowUpRight size={14} className="comp-icon higher" /> :
             value === 'smaller' || value === 'fewer' ? <ArrowDownRight size={14} className="comp-icon lower" /> :
             <Equal size={14} className="comp-icon similar" />;
    }
    return null;
  };

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
        <button
          className={`tab-btn ${activeTab === 'competitors' ? 'active' : ''}`}
          onClick={() => setActiveTab('competitors')}
        >
          <Building2 size={18} /> Competitor Analysis
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

      {/* Competitor Analysis Tab */}
      {activeTab === 'competitors' && (
        <div className="competitors-section">
          <div className="competitors-header">
            <div className="competitors-intro">
              <h3><Building2 size={24} /> AI-Powered Competitor Analysis</h3>
              <p>
                Generate up to 10 competitors based on your business profile. AI analyzes your industry,
                revenue model, and business stage to identify relevant competitors with pricing and feature comparisons.
              </p>
            </div>

            {!businessData ? (
              <div className="no-business-plan">
                <Lightbulb size={48} />
                <h4>Complete Your Business Plan First</h4>
                <p>To generate relevant competitors, we need to understand your business. Complete your Business Plan survey to unlock this feature.</p>
                <a href="/business-plan" className="btn-primary">
                  Create Business Plan <ChevronRight size={16} />
                </a>
              </div>
            ) : (
              <>
                <div className="generate-controls">
                  <div className="competitor-count">
                    <span className="count-label">{competitors.length}/10 Competitors</span>
                    <div className="count-bar">
                      <div className="count-fill" style={{ width: `${(competitors.length / 10) * 100}%` }} />
                    </div>
                  </div>

                  <div className="generate-buttons">
                    <button
                      className="generate-btn"
                      onClick={() => handleGenerateCompetitors(1)}
                      disabled={isGenerating || competitors.length >= 10}
                    >
                      {isGenerating ? <Loader size={16} className="spinning" /> : <Plus size={16} />}
                      Add 1 Competitor
                    </button>
                    <button
                      className="generate-btn primary"
                      onClick={() => handleGenerateCompetitors(Math.min(3, 10 - competitors.length))}
                      disabled={isGenerating || competitors.length >= 10}
                    >
                      {isGenerating ? <Loader size={16} className="spinning" /> : <Sparkles size={16} />}
                      Generate 3
                    </button>
                    {competitors.length > 0 && (
                      <button
                        className="generate-btn danger"
                        onClick={clearAllCompetitors}
                        disabled={isGenerating}
                      >
                        <Trash2 size={16} /> Clear All
                      </button>
                    )}
                  </div>
                </div>

                {/* Show matched category when competitors exist */}
                {matchedCategory && competitors.length > 0 && (
                  <div className="matched-category-info">
                    <Sparkles size={16} />
                    <span>Matched business type: <strong>{matchedCategory}</strong></span>
                  </div>
                )}

                {isGenerating && generatingCount > 0 && (
                  <div className="generating-status">
                    <Loader size={20} className="spinning" />
                    <span>Analyzing market and generating {generatingCount} competitor{generatingCount > 1 ? 's' : ''}...</span>
                  </div>
                )}

                {/* No matches found state */}
                {noMatchesFound && !isGenerating && (
                  <div className="no-matches-found">
                    <div className="no-matches-icon">
                      <Search size={48} />
                    </div>
                    <h4>No Close Matches Found</h4>
                    <p>
                      We couldn't find competitors that closely match your specific business type.
                      This could mean you're in a unique niche market with limited direct competition,
                      which can be an advantage!
                    </p>
                    <div className="no-matches-suggestions">
                      <h5>Suggestions:</h5>
                      <ul>
                        <li>Update your business plan with more industry keywords</li>
                        <li>Research indirect competitors in adjacent markets</li>
                        <li>Consider your unique positioning as a competitive advantage</li>
                      </ul>
                    </div>
                    <button
                      className="reset-search-btn"
                      onClick={() => setNoMatchesFound(false)}
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {competitors.length === 0 && !isGenerating && !noMatchesFound && (
                  <div className="no-competitors">
                    <Building2 size={48} />
                    <h4>No Competitors Yet</h4>
                    <p>Click "Generate" to have AI analyze your market and create competitor profiles based on your business plan.</p>
                  </div>
                )}

                <div className="competitors-grid">
                  {competitors.map((competitor) => (
                    <div key={competitor.id} className={`competitor-card threat-${competitor.threatLevel}`}>
                      <div className="competitor-header">
                        <div className="competitor-name">
                          <Building2 size={20} />
                          <h4>{competitor.name}</h4>
                        </div>
                        <div className="competitor-actions">
                          <button
                            className="comp-action-btn"
                            onClick={() => regenerateCompetitor(competitor.id)}
                            title="Regenerate"
                            disabled={isGenerating}
                          >
                            <RefreshCw size={14} />
                          </button>
                          <button
                            className="comp-action-btn delete"
                            onClick={() => removeCompetitor(competitor.id)}
                            title="Remove"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <p className="competitor-description">{competitor.description}</p>

                      <div className="competitor-website">
                        <Globe size={14} />
                        <span>{competitor.website}</span>
                      </div>

                      <div className="threat-badge">
                        Threat Level: <span className={competitor.threatLevel}>{competitor.threatLevel.charAt(0).toUpperCase() + competitor.threatLevel.slice(1)}</span>
                      </div>

                      <div className="competitor-products">
                        <h5>Products & Pricing</h5>
                        {competitor.products.map((product, idx) => (
                          <div key={idx} className="product-item">
                            <div className="product-info">
                              <span className="product-name">{product.name}</span>
                              <span className="product-desc">{product.description}</span>
                            </div>
                            <span className="product-price">{product.price}</span>
                          </div>
                        ))}
                      </div>

                      <div className="competitor-comparison">
                        <h5>Comparison to Your Business</h5>
                        <div className="comparison-grid">
                          <div className="comparison-item">
                            <span className="comp-label">Pricing</span>
                            <span className="comp-value">
                              {getComparisonIcon('pricing', competitor.comparison.pricing)}
                              {competitor.comparison.pricing.charAt(0).toUpperCase() + competitor.comparison.pricing.slice(1)}
                            </span>
                          </div>
                          <div className="comparison-item">
                            <span className="comp-label">Market Share</span>
                            <span className="comp-value">
                              {getComparisonIcon('marketShare', competitor.comparison.marketShare)}
                              {competitor.comparison.marketShare.charAt(0).toUpperCase() + competitor.comparison.marketShare.slice(1)}
                            </span>
                          </div>
                          <div className="comparison-item">
                            <span className="comp-label">Features</span>
                            <span className="comp-value">
                              {getComparisonIcon('features', competitor.comparison.features)}
                              {competitor.comparison.features.charAt(0).toUpperCase() + competitor.comparison.features.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="competitor-analysis">
                        <div className="analysis-section">
                          <h5><ArrowUpRight size={14} /> Their Strengths</h5>
                          <ul>
                            {competitor.strengths.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="analysis-section weaknesses">
                          <h5><ArrowDownRight size={14} /> Their Weaknesses</h5>
                          <ul>
                            {competitor.weaknesses.map((w, idx) => (
                              <li key={idx}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {competitors.length > 0 && (
                  <div className="competitors-summary">
                    <h3><Target size={20} /> Competitive Landscape Summary</h3>
                    <div className="summary-stats">
                      <div className="summary-stat">
                        <span className="stat-value">{competitors.filter(c => c.threatLevel === 'high').length}</span>
                        <span className="stat-label">High Threat</span>
                      </div>
                      <div className="summary-stat">
                        <span className="stat-value">{competitors.filter(c => c.threatLevel === 'medium').length}</span>
                        <span className="stat-label">Medium Threat</span>
                      </div>
                      <div className="summary-stat">
                        <span className="stat-value">{competitors.filter(c => c.threatLevel === 'low').length}</span>
                        <span className="stat-label">Low Threat</span>
                      </div>
                      <div className="summary-stat">
                        <span className="stat-value">{competitors.filter(c => c.comparison.pricing === 'lower').length}</span>
                        <span className="stat-label">Lower Priced</span>
                      </div>
                    </div>
                    <div className="summary-insight">
                      <Lightbulb size={18} />
                      <p>
                        {competitors.filter(c => c.threatLevel === 'high').length > 2
                          ? 'You have significant competition. Focus on differentiating through superior customer service, unique features, or niche targeting.'
                          : competitors.filter(c => c.comparison.pricing === 'lower').length > competitors.length / 2
                          ? 'Many competitors are pricing lower. Consider emphasizing value-added services or premium positioning.'
                          : 'Your competitive landscape is manageable. Focus on building brand recognition and customer loyalty.'}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;

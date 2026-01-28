import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SurveyQuestion, BusinessPlanAnswers } from '../types';
import { Send, Lightbulb, ChevronRight, ChevronLeft, Save, Bot, Sparkles, Check, ArrowRight, HelpCircle, X, RefreshCw, AlertTriangle, Edit3, RotateCcw, Loader } from 'lucide-react';

// Section IDs for tracking edits
type SectionId = 'executive' | 'overview' | 'value' | 'market' | 'revenue' | 'marketing' | 'goals' | 'challenges' | 'financial' | 'focus';

interface SectionEdits {
  [key: string]: string;
}

// Term definitions for help tooltips
const termDefinitions: { [key: string]: string } = {
  'Subscription Model': 'Customers pay a recurring fee (monthly/yearly) for ongoing access to your product or service. Example: Netflix, Spotify.',
  'Freemium': 'Basic features are free, but premium features require payment. Example: Dropbox, LinkedIn.',
  'Commission/Marketplace': 'You take a percentage of each transaction between buyers and sellers. Example: Airbnb, Etsy.',
  'Licensing': 'You allow others to use your intellectual property (patents, brand, content) for a fee.',
  'Affiliate Revenue': 'You earn commissions by promoting other companies\' products/services.',
  'Customer Acquisition': 'The process and cost of getting new customers to buy from you.',
  'Cash Flow': 'The movement of money in and out of your business. Positive = more coming in than going out.',
  'Scaling': 'Growing your business while maintaining or improving efficiency and quality.',
  'SEO': 'Search Engine Optimization - improving your website to rank higher in Google search results.',
  'Content Marketing': 'Creating valuable content (blogs, videos, guides) to attract and engage customers.',
  'Angel Investment': 'Wealthy individuals who invest their own money in early-stage startups, usually $25K-$500K.',
  'Venture Capital': 'Firms that invest large amounts ($1M+) in high-growth startups in exchange for equity.',
  'Revenue-Based Financing': 'Loans where you repay a percentage of your monthly revenue instead of fixed payments.',
  'Crowdfunding': 'Raising small amounts from many people, usually through platforms like Kickstarter or Indiegogo.',
  'Bootstrapped': 'Building your business using only personal savings and revenue, without outside investment.',
  'Value Proposition': 'The unique benefit or value that makes customers choose you over competitors.',
  'Target Market': 'The specific group of people most likely to buy your product or service.',
};

const surveyQuestions: SurveyQuestion[] = [
  {
    id: 'business_name',
    question: 'What is the name of your business or business idea?',
    type: 'text',
    placeholder: 'Enter your business name',
    helpText: 'This can be your official business name or a working title for your idea.'
  },
  {
    id: 'industry',
    question: 'What industry does your business operate in?',
    type: 'multiselect',
    options: ['Retail', 'Technology', 'Healthcare', 'Food & Beverage', 'Professional Services', 'Manufacturing', 'E-commerce', 'Real Estate', 'Education', 'Entertainment', 'Finance', 'Other'],
    helpText: 'Select all industries that apply. This helps us tailor recommendations to your market.'
  },
  {
    id: 'business_stage',
    question: 'What stage is your business currently in?',
    type: 'select',
    options: ['Idea Stage', 'Startup (0-1 years)', 'Growth (1-3 years)', 'Established (3-5 years)', 'Mature (5+ years)'],
    helpText: 'Idea Stage: Still planning. Startup: Just launched. Growth: Gaining traction. Established: Stable operations. Mature: Well-known in market.'
  },
  {
    id: 'target_market',
    question: 'Who is your ideal customer?',
    type: 'textarea',
    placeholder: 'Example: Small business owners aged 30-50 who struggle with managing finances...',
    helpText: 'TARGET MARKET: The specific group most likely to buy from you. Think about their age, location, income, problems, and what they care about.'
  },
  {
    id: 'value_proposition',
    question: 'What makes your business unique? What problem do you solve?',
    type: 'textarea',
    placeholder: 'Example: We help busy parents save 5 hours per week by delivering fresh meal kits...',
    helpText: 'VALUE PROPOSITION: The main reason customers should choose you. Focus on the specific benefit or outcome you provide.'
  },
  {
    id: 'revenue_model',
    question: 'How does your business make money?',
    type: 'multiselect',
    options: ['Product Sales', 'Service Fees', 'Subscription Model', 'Freemium', 'Commission/Marketplace', 'Advertising', 'Licensing', 'Consulting', 'Affiliate Revenue'],
    helpText: 'Select all that apply. Tap any term you don\'t understand to see its definition.'
  },
  {
    id: 'current_revenue',
    question: 'What is your current monthly revenue?',
    type: 'select',
    options: ['Pre-revenue (not making money yet)', '$0 - $1,000', '$1,000 - $5,000', '$5,000 - $10,000', '$10,000 - $50,000', '$50,000 - $100,000', '$100,000+'],
    helpText: 'Be honest - this helps us give you relevant advice for your stage. Pre-revenue is perfectly normal for new businesses.'
  },
  {
    id: 'team_size',
    question: 'How many people work in your business?',
    type: 'select',
    options: ['Just me (solo founder)', '2-5 people', '6-10 people', '11-25 people', '26-50 people', '50+ people'],
    helpText: 'Include yourself, co-founders, employees, and regular contractors.'
  },
  {
    id: 'main_challenges',
    question: 'What are your biggest challenges right now?',
    type: 'multiselect',
    options: ['Finding Customers', 'Managing Money/Cash Flow', 'Day-to-Day Operations', 'Growing/Scaling', 'Hiring Good People', 'Technology/Tools', 'Beating Competition', 'Marketing/Visibility', 'Building the Product', 'Legal/Paperwork'],
    helpText: 'Select all that apply. We\'ll prioritize recommendations based on what you\'re struggling with most.'
  },
  {
    id: 'marketing_channels',
    question: 'How do you reach customers? (current or planned)',
    type: 'multiselect',
    options: ['Social Media', 'Blog/Content', 'Paid Ads (Google, Facebook)', 'Email Marketing', 'SEO/Google Search', 'Word of Mouth/Referrals', 'Partnerships', 'Influencers', 'Events/Trade Shows', 'PR/Media', 'Direct Outreach/Sales'],
    helpText: 'Select channels you\'re using or planning to use. We\'ll help you optimize these.'
  },
  {
    id: 'goals_6month',
    question: 'What do you want to achieve in the next 6 months?',
    type: 'textarea',
    placeholder: 'Example: Get 100 paying customers, launch my website, hire first employee, reach $5K/month revenue...',
    helpText: 'Be specific with numbers when possible. Good goals are measurable.'
  },
  {
    id: 'funding',
    question: 'How are you funding your business?',
    type: 'multiselect',
    options: ['My Own Savings (Bootstrapped)', 'Friends & Family', 'Angel Investors', 'Venture Capital', 'Bank Loan', 'Grants', 'Crowdfunding', 'Revenue from Sales', 'Looking for Funding'],
    helpText: 'Tap any term to learn what it means. Most businesses start bootstrapped - that\'s completely normal!'
  },
  {
    id: 'help_needed',
    question: 'What areas do you need the most guidance with?',
    type: 'multiselect',
    options: ['Overall Strategy', 'Marketing & Ads', 'Sales & Closing', 'Operations & Systems', 'Money & Accounting', 'Hiring & Team', 'Tech & Tools', 'Legal & Contracts', 'Product Development', 'Customer Support', 'Brand & Design'],
    helpText: 'We\'ll use this to create your personalized path and recommend the right tools.'
  }
];

const businessModels = [
  {
    name: 'Amazon FBA Model',
    description: 'Leverage Amazon\'s fulfillment network to sell products without inventory management.',
    success: 'Low overhead, massive customer reach, hands-off logistics.'
  },
  {
    name: 'SaaS Subscription Model',
    description: 'Recurring revenue through software subscriptions like Salesforce or HubSpot.',
    success: 'Predictable revenue, high customer lifetime value, scalable.'
  },
  {
    name: 'Freemium Model',
    description: 'Offer basic features free with premium upgrades like Spotify or Dropbox.',
    success: 'Low barrier to entry, viral growth potential, upsell opportunities.'
  },
  {
    name: 'Marketplace Model',
    description: 'Connect buyers and sellers taking a commission like Airbnb or Uber.',
    success: 'Network effects, low inventory risk, high scalability.'
  },
  {
    name: 'Direct-to-Consumer (DTC)',
    description: 'Sell directly to customers cutting out middlemen like Warby Parker.',
    success: 'Higher margins, direct customer relationships, brand control.'
  },
  {
    name: 'Franchise Model',
    description: 'License your business model for rapid expansion like McDonald\'s.',
    success: 'Fast growth, reduced capital requirements, motivated operators.'
  }
];

const BusinessPlan: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<BusinessPlanAnswers>({});
  const [aiChat, setAiChat] = useState<{role: string; content: string}[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showDefinition, setShowDefinition] = useState<string | null>(null);
  const [showRedoConfirm, setShowRedoConfirm] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionId | null>(null);
  const [sectionEdits, setSectionEdits] = useState<SectionEdits>({});
  const [regeneratingSection, setRegeneratingSection] = useState<SectionId | null>(null);
  const [editDraft, setEditDraft] = useState('');

  // Check if plan is already completed on load
  useEffect(() => {
    if (!user) return;
    const currentAnswers = localStorage.getItem(`expedium_answers_${user.id}`);
    const planCompleted = localStorage.getItem(`expedium_plan_completed_${user.id}`);
    const savedEdits = localStorage.getItem(`expedium_section_edits_${user.id}`);

    if (currentAnswers) {
      const parsedAnswers = JSON.parse(currentAnswers);
      setAnswers(parsedAnswers);

      // If plan was previously completed and has substantial data, show the completed view
      if (planCompleted === 'true' && parsedAnswers.business_name) {
        setShowComplete(true);
      }
    }

    if (savedEdits) {
      setSectionEdits(JSON.parse(savedEdits));
    }
  }, [user]);

  // Save section edits to localStorage
  useEffect(() => {
    if (!user || Object.keys(sectionEdits).length === 0) return;
    localStorage.setItem(`expedium_section_edits_${user.id}`, JSON.stringify(sectionEdits));
  }, [sectionEdits, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`expedium_answers_${user.id}`, JSON.stringify(answers));
  }, [answers, user]);

  const handleAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [surveyQuestions[currentQuestion].id]: value
    });
  };

  const handleMultiSelect = (option: string) => {
    const qId = surveyQuestions[currentQuestion].id;
    const currentValues = (answers[qId] as string[]) || [];

    if (currentValues.includes(option)) {
      setAnswers({
        ...answers,
        [qId]: currentValues.filter(v => v !== option)
      });
    } else {
      setAnswers({
        ...answers,
        [qId]: [...currentValues, option]
      });
    }
  };

  const isMultiSelected = (option: string): boolean => {
    const qId = surveyQuestions[currentQuestion].id;
    const currentValues = answers[qId];
    if (Array.isArray(currentValues)) {
      return currentValues.includes(option);
    }
    return false;
  };

  const nextQuestion = () => {
    if (currentQuestion < surveyQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const savePlan = () => {
    if (!user) return;
    localStorage.setItem(`expedium_answers_${user.id}`, JSON.stringify(answers));
    localStorage.setItem(`expedium_plan_completed_${user.id}`, 'true');
    setShowComplete(true);
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  const handleRedoPlan = () => {
    if (!user) return;
    // Clear the completed flag and reset everything
    localStorage.removeItem(`expedium_plan_completed_${user.id}`);
    localStorage.removeItem(`expedium_answers_${user.id}`);
    localStorage.removeItem(`expedium_section_edits_${user.id}`);
    setAnswers({});
    setSectionEdits({});
    setCurrentQuestion(0);
    setShowComplete(false);
    setShowRedoConfirm(false);
    setAiChat([]);
  };

  // Start editing a section
  const startEditing = (sectionId: SectionId, currentContent: string) => {
    setEditingSection(sectionId);
    setEditDraft(sectionEdits[sectionId] || currentContent);
  };

  // Save section edit
  const saveEdit = (sectionId: SectionId) => {
    setSectionEdits(prev => ({
      ...prev,
      [sectionId]: editDraft
    }));
    setEditingSection(null);
    setEditDraft('');
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingSection(null);
    setEditDraft('');
  };

  // Reset section to original AI-generated content
  const resetSection = (sectionId: SectionId) => {
    setSectionEdits(prev => {
      const newEdits = { ...prev };
      delete newEdits[sectionId];
      return newEdits;
    });
  };

  // Regenerate section content with AI
  const regenerateSection = (sectionId: SectionId) => {
    setRegeneratingSection(sectionId);

    // Simulate AI generation with a delay
    setTimeout(() => {
      const newContent = generateSectionContent(sectionId);
      setSectionEdits(prev => ({
        ...prev,
        [sectionId]: newContent
      }));
      setRegeneratingSection(null);
    }, 1500);
  };

  // Generate new content for a specific section
  const generateSectionContent = (sectionId: SectionId): string => {
    const businessName = String(answers.business_name || 'Your Business');
    const industry = Array.isArray(answers.industry) ? answers.industry.join(', ') : String(answers.industry || 'General');
    const stage = String(answers.business_stage || 'Startup');
    const targetMarket = String(answers.target_market || '');
    const valueProposition = String(answers.value_proposition || '');
    const revenueModel = Array.isArray(answers.revenue_model) ? answers.revenue_model : [];
    const currentRevenue = String(answers.current_revenue || 'Pre-revenue');
    const challenges = Array.isArray(answers.main_challenges) ? answers.main_challenges : [];
    const marketingChannels = Array.isArray(answers.marketing_channels) ? answers.marketing_channels : [];
    const goals = String(answers.goals_6month || '');
    const funding = Array.isArray(answers.funding) ? answers.funding : [];
    const helpNeeded = Array.isArray(answers.help_needed) ? answers.help_needed : [];

    const variations = {
      executive: [
        `${businessName} represents a compelling opportunity in the ${industry} sector. As a ${stage.toLowerCase()} venture, the company is positioned to capitalize on growing market demand. The core value proposition centers on delivering exceptional outcomes for customers through innovative approaches. With a clear revenue strategy and strong market positioning, ${businessName} is poised for sustainable growth.`,
        `In the competitive ${industry} landscape, ${businessName} stands out by focusing on customer-centric solutions. Currently at the ${stage.toLowerCase()} phase, the company combines industry expertise with innovative thinking to address real market needs. The business model is designed for scalability while maintaining the quality and personal touch that customers value.`,
        `${businessName} is building the future of ${industry}. Founded with a vision to transform how customers experience products and services in this space, the company leverages modern strategies and proven business principles. At the ${stage.toLowerCase()} stage, ${businessName} is focused on establishing strong foundations for long-term success.`
      ],
      market: [
        `The target market for ${businessName} represents a significant opportunity. ${targetMarket ? `Primary customers include ${targetMarket}.` : 'The company is identifying and validating its ideal customer segments.'} Market research indicates strong demand for the solutions offered, with customers actively seeking alternatives that deliver better value. ${marketingChannels.length > 0 ? `The go-to-market strategy leverages ${marketingChannels.slice(0, 2).join(' and ')} to reach and engage potential customers.` : 'A multi-channel marketing approach will be developed to maximize reach.'}`,
        `Understanding customer needs is central to ${businessName}'s strategy. ${targetMarket ? `The ideal customer profile includes ${targetMarket}.` : 'Ongoing customer research is refining the target market definition.'} Competition analysis reveals opportunities for differentiation through superior customer experience and value delivery. ${marketingChannels.length > 0 ? `Key marketing channels include ${marketingChannels.join(', ')}.` : 'Marketing channel strategy is being developed based on customer behavior analysis.'}`,
        `${businessName} operates in a dynamic market with evolving customer expectations. ${targetMarket ? `Target customers are ${targetMarket}, who seek solutions that save time, reduce costs, or improve outcomes.` : 'Customer research is ongoing to validate market assumptions.'} The competitive landscape presents opportunities for brands that can deliver authentic value and build trust. ${marketingChannels.length > 0 ? `Customer acquisition focuses on ${marketingChannels.slice(0, 3).join(', ')}.` : ''}`
      ],
      value: [
        `What sets ${businessName} apart is a relentless focus on customer outcomes. ${valueProposition || 'The company delivers solutions that address real pain points in ways that competitors cannot match.'} This value proposition resonates with customers who are tired of one-size-fits-all solutions and seek partners who understand their unique needs.`,
        `${businessName}'s unique value lies in combining ${industry} expertise with innovative delivery. ${valueProposition || 'Customers choose us because we solve their problems more effectively and efficiently than alternatives.'} This differentiation creates sustainable competitive advantage and drives customer loyalty.`,
        `The core promise of ${businessName} is simple: deliver exceptional value that customers can measure. ${valueProposition || 'Our approach combines deep understanding of customer needs with innovative solutions that exceed expectations.'} This customer-first philosophy permeates every aspect of the business.`
      ],
      financial: [
        `${businessName}'s financial strategy is built on sustainable unit economics and disciplined growth. Currently at ${currentRevenue} revenue stage, the focus is on achieving profitability while building for scale. ${funding.length > 0 ? `Funding through ${funding.join(', ').toLowerCase()} provides the runway needed to execute on growth initiatives.` : 'The company is exploring funding options that align with growth objectives.'} ${revenueModel.length > 0 ? `Revenue streams include ${revenueModel.join(', ').toLowerCase()}, providing diversification and stability.` : ''}`,
        `Financial prudence guides ${businessName}'s approach to growth. At the ${currentRevenue} stage, every dollar is invested strategically to maximize returns. ${funding.length > 0 ? `The business is funded through ${funding.join(', ').toLowerCase()}.` : 'Funding strategy is aligned with growth milestones.'} Key financial metrics are tracked rigorously to ensure the business remains on path to profitability.`,
        `${businessName} maintains a disciplined approach to financial management. ${currentRevenue !== 'Pre-revenue' ? `With ${currentRevenue} in monthly revenue, the business demonstrates product-market fit and customer willingness to pay.` : 'As a pre-revenue venture, the focus is on validating the business model and achieving first sales.'} ${funding.length > 0 ? `Funding sources include ${funding.join(', ').toLowerCase()}, providing stability as the business scales.` : ''}`
      ],
      goals: [
        `In the next six months, ${businessName} will focus on: ${goals || 'establishing strong market presence, acquiring initial customers, and refining operations based on real-world feedback.'} These goals are designed to be ambitious yet achievable, creating momentum for long-term success. Key milestones include product/service refinement, customer acquisition targets, and operational efficiency improvements.`,
        `The 6-month roadmap for ${businessName} prioritizes: ${goals || 'customer acquisition, revenue growth, and operational excellence.'} Each goal connects to the larger vision while remaining grounded in practical execution. Success metrics are defined for each objective to ensure accountability and progress tracking.`,
        `Near-term priorities for ${businessName}: ${goals || 'validate product-market fit, build customer base, and establish scalable processes.'} These objectives balance growth ambitions with the need for sustainable operations. Regular review cycles will assess progress and enable course corrections as needed.`
      ],
      marketing: [
        `${businessName}'s marketing strategy combines proven tactics with innovative approaches. ${marketingChannels.length > 0 ? `Primary channels include ${marketingChannels.join(', ')}, each optimized for customer acquisition and engagement.` : 'A comprehensive marketing plan is being developed to reach target customers effectively.'} The focus is on building authentic connections with customers through valuable content and exceptional experiences. Marketing ROI is tracked meticulously to ensure efficient use of resources.`,
        `Customer acquisition at ${businessName} is driven by a multi-channel approach. ${marketingChannels.length > 0 ? `Key marketing channels are ${marketingChannels.slice(0, 3).join(', ')}, chosen based on where target customers spend their time.` : 'Marketing channels are being tested to identify the most effective customer acquisition paths.'} Brand building and direct response work together to create awareness, generate leads, and convert customers.`,
        `Marketing for ${businessName} focuses on reaching the right customers with the right message at the right time. ${marketingChannels.length > 0 ? `The channel mix includes ${marketingChannels.join(', ')}.` : 'Channel strategy is being optimized based on customer behavior and competitive analysis.'} Content marketing, social proof, and strategic partnerships form the foundation of customer acquisition efforts.`
      ],
      focus: [
        `${businessName}'s growth priorities are focused on areas with the highest potential impact. ${helpNeeded.length > 0 ? `Key focus areas include ${helpNeeded.join(', ')}, each representing an opportunity for significant improvement.` : 'Strategic priorities are aligned with the most pressing business needs.'} Resources are allocated to these priorities to ensure meaningful progress while maintaining day-to-day operations.`,
        `Strategic focus areas for ${businessName} have been identified based on business needs and growth potential. ${helpNeeded.length > 0 ? `Priority areas are ${helpNeeded.slice(0, 3).join(', ')}.` : 'Focus areas are being refined through ongoing analysis.'} Each area has specific improvement targets and is tracked through regular reviews.`,
        `${businessName} concentrates resources on high-impact initiatives. ${helpNeeded.length > 0 ? `Current priorities span ${helpNeeded.join(', ')}, representing the most important areas for near-term development.` : 'Focus areas are determined by business stage and strategic objectives.'} This focused approach ensures meaningful progress rather than spreading efforts too thin.`
      ]
    };

    const options = variations[sectionId as keyof typeof variations];
    if (options) {
      return options[Math.floor(Math.random() * options.length)];
    }
    return 'Content regenerated. Edit this section to customize further.';
  };

  const generateAiResponse = (userMessage: string): string => {
    const context = answers;
    const industryVal = context.industry;
    const industry = Array.isArray(industryVal) ? industryVal.join(', ') : (industryVal || 'your industry');
    const stage = (context.business_stage as string) || 'your current stage';
    const challengeVal = context.main_challenges;
    const challenge = Array.isArray(challengeVal) ? challengeVal.join(', ') : (challengeVal || '');

    const responses: {[key: string]: string} = {
      'pricing': `Based on successful ${industry} businesses, I recommend a value-based pricing strategy. Consider these proven approaches:\n\n1. **Cost-Plus Pricing**: Calculate your costs and add a margin (typically 30-50% for products, 100-200% for services).\n\n2. **Competitive Pricing**: Research 3-5 competitors and position yourself strategically.\n\n3. **Value-Based Pricing**: Price based on the value you deliver, not just costs. If you save customers $1000/month, pricing at $200/month is a bargain.\n\n💡 Pro tip: Test different price points with A/B testing before committing.`,

      'marketing': `For a ${stage} business in ${industry}, here are proven marketing strategies:\n\n1. **Content Marketing**: Create valuable content that solves customer problems. Companies like HubSpot grew to billions using this approach.\n\n2. **Social Proof**: Collect and showcase testimonials. 92% of consumers read reviews before purchasing.\n\n3. **Referral Programs**: Dropbox grew 3900% with their referral program.\n\n4. **Email Marketing**: Still delivers $42 ROI for every $1 spent.\n\n📊 Start with one channel, master it, then expand.`,

      'scaling': `To scale your ${industry} business effectively:\n\n1. **Systematize Operations**: Document every process. McDonald's success comes from consistent systems.\n\n2. **Automate Repetitive Tasks**: Use tools like Zapier to connect workflows.\n\n3. **Build a Strong Team**: Hire for culture fit and train for skills.\n\n4. **Focus on Unit Economics**: Ensure each sale is profitable before scaling.\n\n🚀 The key is scaling what works, not trying to fix what's broken at a larger scale.`,

      'funding': `For ${stage} businesses seeking funding:\n\n1. **Bootstrapping First**: Prove your concept with revenue before seeking investment.\n\n2. **Angel Investors**: Good for $25K-$500K, often provide mentorship.\n\n3. **Venture Capital**: Best for high-growth businesses needing $1M+.\n\n4. **Revenue-Based Financing**: Keep equity, repay from revenue.\n\n💰 Investors invest in traction. Focus on metrics: MRR, growth rate, customer acquisition cost, lifetime value.`,

      'default': `Great question! Based on your ${industry} business at the ${stage} stage, here's my advice:\n\n1. **Focus on Customer Feedback**: The most successful businesses obsess over customer needs.\n\n2. **Lean Operations**: Keep overhead low and iterate quickly.\n\n3. **Track Key Metrics**: What gets measured gets managed.\n\n4. **Build Strategic Partnerships**: Collaborate with complementary businesses.\n\n${challenge ? `\nRegarding your challenges (${challenge.substring(0, 50)}...): Consider breaking them into smaller, actionable steps and tackling the highest-impact item first.` : ''}\n\n🎯 Would you like specific advice on pricing, marketing, scaling, or funding?`
    };

    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('price') || lowerMessage.includes('pricing') || lowerMessage.includes('charge')) {
      return responses['pricing'];
    } else if (lowerMessage.includes('market') || lowerMessage.includes('advertis') || lowerMessage.includes('customer')) {
      return responses['marketing'];
    } else if (lowerMessage.includes('scale') || lowerMessage.includes('grow') || lowerMessage.includes('expand')) {
      return responses['scaling'];
    } else if (lowerMessage.includes('fund') || lowerMessage.includes('invest') || lowerMessage.includes('money') || lowerMessage.includes('capital')) {
      return responses['funding'];
    }
    return responses['default'];
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMessage = aiInput;
    setAiChat([...aiChat, { role: 'user', content: userMessage }]);
    setAiInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAiResponse(userMessage);
      setAiChat(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const currentQ = surveyQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / surveyQuestions.length) * 100;

  // Generate AI-powered business plan content based on answers
  const generateBusinessPlan = () => {
    const businessName = String(answers.business_name || 'Your Business');
    const industry = Array.isArray(answers.industry) ? answers.industry.join(', ') : String(answers.industry || 'General');
    const stage = String(answers.business_stage || 'Startup');
    const targetMarket = String(answers.target_market || 'Not specified');
    const valueProposition = String(answers.value_proposition || 'Not specified');
    const revenueModel = Array.isArray(answers.revenue_model) ? answers.revenue_model : [];
    const currentRevenue = String(answers.current_revenue || 'Not specified');
    const teamSize = String(answers.team_size || 'Solo founder');
    const challenges = Array.isArray(answers.main_challenges) ? answers.main_challenges : [];
    const marketingChannels = Array.isArray(answers.marketing_channels) ? answers.marketing_channels : [];
    const goals = String(answers.goals_6month || 'Not specified');
    const funding = Array.isArray(answers.funding) ? answers.funding : [];
    const helpNeeded = Array.isArray(answers.help_needed) ? answers.help_needed : [];

    // AI-generated executive summary based on inputs
    const executiveSummary = `${businessName} is a ${stage.toLowerCase()} business operating in the ${industry} industry. ${
      valueProposition && valueProposition !== 'Not specified' ? `The company's core mission is to ${valueProposition.toLowerCase().startsWith('we') ? valueProposition.substring(3) : valueProposition}` : 'The company aims to provide valuable products/services to its target market.'
    } ${
      targetMarket && targetMarket !== 'Not specified' ? `The primary focus is serving ${targetMarket.split('.')[0].toLowerCase()}.` : ''
    } ${
      revenueModel.length > 0 ? `Revenue is generated through ${revenueModel.slice(0, 2).join(' and ').toLowerCase()}.` : ''
    }`;

    // AI-generated market analysis
    const marketAnalysis = targetMarket && targetMarket !== 'Not specified' ?
      `The target market consists of ${targetMarket}. ${
        marketingChannels.length > 0 ? `To reach this audience, ${businessName} utilizes ${marketingChannels.slice(0, 3).join(', ').toLowerCase()} as primary marketing channels.` : ''
      } Understanding the needs and pain points of this market segment is crucial for ${businessName}'s success.` :
      'Market analysis will be conducted to identify the ideal customer profile and market opportunities.';

    // AI-generated financial overview
    const financialOverview = `${businessName} is currently at the ${currentRevenue.toLowerCase()} revenue stage. ${
      funding.length > 0 ? `The business is funded through ${funding.join(', ').toLowerCase()}.` : 'Funding strategy is being developed.'
    } ${
      revenueModel.length > 0 ? `The business model relies on ${revenueModel.join(', ').toLowerCase()} as revenue streams.` : ''
    }`;

    // AI-generated strategy based on challenges
    const strategyRecommendations = challenges.length > 0 ? challenges.map(challenge => {
      const strategies: { [key: string]: string } = {
        'Finding Customers': 'Focus on building a strong online presence, leveraging social proof through testimonials, and implementing a referral program to acquire new customers cost-effectively.',
        'Managing Money/Cash Flow': 'Implement robust financial tracking systems, create cash flow projections, maintain a 3-month emergency fund, and consider invoice factoring for immediate cash needs.',
        'Day-to-Day Operations': 'Document all processes, use project management tools, automate repetitive tasks, and consider outsourcing non-core activities.',
        'Growing/Scaling': 'Identify your most profitable products/services, systematize operations before scaling, and focus on customer retention alongside acquisition.',
        'Hiring Good People': 'Define clear job descriptions, implement a structured interview process, offer competitive packages, and build a strong company culture.',
        'Technology/Tools': 'Audit current tech stack, prioritize tools that integrate well, invest in training, and consider all-in-one platforms to reduce complexity.',
        'Beating Competition': 'Focus on your unique value proposition, build strong customer relationships, and continuously innovate based on customer feedback.',
        'Marketing/Visibility': 'Develop a content strategy, optimize for SEO, leverage social media consistently, and track marketing ROI meticulously.',
        'Building the Product': 'Use MVP approach, gather customer feedback early and often, iterate quickly, and focus on solving one problem exceptionally well.',
        'Legal/Paperwork': 'Consult with a business attorney, use contract templates, ensure proper business structure, and stay compliant with industry regulations.'
      };
      return { challenge, strategy: strategies[challenge] || 'Develop a focused action plan to address this challenge.' };
    }) : [];

    return {
      executiveSummary,
      marketAnalysis,
      financialOverview,
      strategyRecommendations,
      businessName,
      industry,
      stage,
      targetMarket,
      valueProposition,
      revenueModel,
      currentRevenue,
      teamSize,
      challenges,
      marketingChannels,
      goals,
      funding,
      helpNeeded
    };
  };

  // Show generated business plan
  if (showComplete) {
    const plan = generateBusinessPlan();

    return (
      <div className="business-plan-page">
        <div className="generated-plan">
          <div className="plan-header">
            <Sparkles size={32} />
            <h1>{plan.businessName}</h1>
            <p className="plan-subtitle">Business Plan & Strategy Guide</p>
            <div className="plan-meta">
              <span className="meta-tag">{plan.industry}</span>
              <span className="meta-tag">{plan.stage}</span>
              <span className="meta-tag">{plan.teamSize}</span>
            </div>
          </div>

          <div className="plan-actions-bar">
            <button className="btn-secondary" onClick={() => window.print()}>
              Print Plan
            </button>
            <button className="btn-primary" onClick={goToDashboard}>
              Go to Dashboard <ArrowRight size={16} />
            </button>
          </div>

          <div className="plan-content">
            {/* Executive Summary */}
            <section className="plan-section">
              <div className="section-header-row">
                <h2>1. Executive Summary</h2>
                <div className="section-actions">
                  {editingSection !== 'executive' && (
                    <>
                      <button
                        className="section-action-btn edit"
                        onClick={() => startEditing('executive', sectionEdits.executive || plan.executiveSummary)}
                        title="Edit this section"
                      >
                        <Edit3 size={16} /> Edit
                      </button>
                      <button
                        className="section-action-btn regenerate"
                        onClick={() => regenerateSection('executive')}
                        disabled={regeneratingSection === 'executive'}
                        title="Generate new AI content"
                      >
                        {regeneratingSection === 'executive' ? <Loader size={16} className="spinning" /> : <Sparkles size={16} />}
                        {regeneratingSection === 'executive' ? 'Generating...' : 'AI Regenerate'}
                      </button>
                      {sectionEdits.executive && (
                        <button
                          className="section-action-btn reset"
                          onClick={() => resetSection('executive')}
                          title="Reset to original"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              {editingSection === 'executive' ? (
                <div className="section-edit-mode">
                  <textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    className="section-edit-textarea"
                    rows={6}
                  />
                  <div className="section-edit-actions">
                    <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                    <button className="btn-primary" onClick={() => saveEdit('executive')}>
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <p>{sectionEdits.executive || plan.executiveSummary}</p>
              )}
            </section>

            {/* Business Overview */}
            <section className="plan-section">
              <h2>2. Business Overview</h2>
              <div className="plan-grid">
                <div className="plan-item">
                  <h4>Business Name</h4>
                  <p>{plan.businessName}</p>
                </div>
                <div className="plan-item">
                  <h4>Industry</h4>
                  <p>{plan.industry}</p>
                </div>
                <div className="plan-item">
                  <h4>Business Stage</h4>
                  <p>{plan.stage}</p>
                </div>
                <div className="plan-item">
                  <h4>Team Size</h4>
                  <p>{plan.teamSize}</p>
                </div>
              </div>
            </section>

            {/* Value Proposition */}
            <section className="plan-section">
              <div className="section-header-row">
                <h2>3. Value Proposition</h2>
                <div className="section-actions">
                  {editingSection !== 'value' && (
                    <>
                      <button
                        className="section-action-btn edit"
                        onClick={() => startEditing('value', sectionEdits.value || plan.valueProposition || '')}
                        title="Edit this section"
                      >
                        <Edit3 size={16} /> Edit
                      </button>
                      <button
                        className="section-action-btn regenerate"
                        onClick={() => regenerateSection('value')}
                        disabled={regeneratingSection === 'value'}
                        title="Generate new AI content"
                      >
                        {regeneratingSection === 'value' ? <Loader size={16} className="spinning" /> : <Sparkles size={16} />}
                        {regeneratingSection === 'value' ? 'Generating...' : 'AI Regenerate'}
                      </button>
                      {sectionEdits.value && (
                        <button
                          className="section-action-btn reset"
                          onClick={() => resetSection('value')}
                          title="Reset to original"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              {editingSection === 'value' ? (
                <div className="section-edit-mode">
                  <textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    className="section-edit-textarea"
                    rows={4}
                  />
                  <div className="section-edit-actions">
                    <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                    <button className="btn-primary" onClick={() => saveEdit('value')}>
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="highlight-box">
                  <p>{sectionEdits.value || plan.valueProposition || 'Define what makes your business unique and why customers should choose you over competitors.'}</p>
                </div>
              )}
            </section>

            {/* Target Market */}
            <section className="plan-section">
              <div className="section-header-row">
                <h2>4. Target Market & Customers</h2>
                <div className="section-actions">
                  {editingSection !== 'market' && (
                    <>
                      <button
                        className="section-action-btn edit"
                        onClick={() => startEditing('market', sectionEdits.market || plan.marketAnalysis)}
                        title="Edit this section"
                      >
                        <Edit3 size={16} /> Edit
                      </button>
                      <button
                        className="section-action-btn regenerate"
                        onClick={() => regenerateSection('market')}
                        disabled={regeneratingSection === 'market'}
                        title="Generate new AI content"
                      >
                        {regeneratingSection === 'market' ? <Loader size={16} className="spinning" /> : <Sparkles size={16} />}
                        {regeneratingSection === 'market' ? 'Generating...' : 'AI Regenerate'}
                      </button>
                      {sectionEdits.market && (
                        <button
                          className="section-action-btn reset"
                          onClick={() => resetSection('market')}
                          title="Reset to original"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              {editingSection === 'market' ? (
                <div className="section-edit-mode">
                  <textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    className="section-edit-textarea"
                    rows={6}
                  />
                  <div className="section-edit-actions">
                    <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                    <button className="btn-primary" onClick={() => saveEdit('market')}>
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p>{sectionEdits.market || plan.marketAnalysis}</p>
                  {plan.targetMarket && plan.targetMarket !== 'Not specified' && !sectionEdits.market && (
                    <div className="detail-box">
                      <h4>Ideal Customer Profile</h4>
                      <p>{plan.targetMarket}</p>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Revenue Model */}
            <section className="plan-section">
              <h2>5. Revenue Model</h2>
              {plan.revenueModel.length > 0 ? (
                <div className="revenue-streams">
                  {plan.revenueModel.map((model, idx) => (
                    <div key={idx} className="revenue-item">
                      <span className="revenue-number">{idx + 1}</span>
                      <span>{model}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Revenue model to be defined. Consider options like product sales, service fees, subscriptions, or consulting.</p>
              )}
              <div className="plan-item mt-1">
                <h4>Current Revenue</h4>
                <p>{plan.currentRevenue}</p>
              </div>
            </section>

            {/* Marketing Strategy */}
            <section className="plan-section">
              <div className="section-header-row">
                <h2>6. Marketing Strategy</h2>
                <div className="section-actions">
                  {editingSection !== 'marketing' && (
                    <>
                      <button
                        className="section-action-btn edit"
                        onClick={() => startEditing('marketing', sectionEdits.marketing || (plan.marketingChannels.length > 0 ? `Primary marketing channels: ${plan.marketingChannels.join(', ')}. Develop comprehensive strategies for each channel to maximize customer acquisition and engagement.` : 'Develop a marketing strategy that includes both online and offline channels appropriate for your target market.'))}
                        title="Edit this section"
                      >
                        <Edit3 size={16} /> Edit
                      </button>
                      <button
                        className="section-action-btn regenerate"
                        onClick={() => regenerateSection('marketing')}
                        disabled={regeneratingSection === 'marketing'}
                        title="Generate new AI content"
                      >
                        {regeneratingSection === 'marketing' ? <Loader size={16} className="spinning" /> : <Sparkles size={16} />}
                        {regeneratingSection === 'marketing' ? 'Generating...' : 'AI Regenerate'}
                      </button>
                      {sectionEdits.marketing && (
                        <button
                          className="section-action-btn reset"
                          onClick={() => resetSection('marketing')}
                          title="Reset to original"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              {editingSection === 'marketing' ? (
                <div className="section-edit-mode">
                  <textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    className="section-edit-textarea"
                    rows={6}
                  />
                  <div className="section-edit-actions">
                    <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                    <button className="btn-primary" onClick={() => saveEdit('marketing')}>
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                </div>
              ) : sectionEdits.marketing ? (
                <p>{sectionEdits.marketing}</p>
              ) : plan.marketingChannels.length > 0 ? (
                <>
                  <p>Primary marketing channels and customer acquisition strategies:</p>
                  <div className="channel-list">
                    {plan.marketingChannels.map((channel, idx) => (
                      <span key={idx} className="channel-tag">{channel}</span>
                    ))}
                  </div>
                </>
              ) : (
                <p>Develop a marketing strategy that includes both online and offline channels appropriate for your target market.</p>
              )}
            </section>

            {/* Goals & Milestones */}
            <section className="plan-section">
              <div className="section-header-row">
                <h2>7. Goals & Milestones (6 Months)</h2>
                <div className="section-actions">
                  {editingSection !== 'goals' && (
                    <>
                      <button
                        className="section-action-btn edit"
                        onClick={() => startEditing('goals', sectionEdits.goals || plan.goals || 'Set specific, measurable goals for the next 6 months.')}
                        title="Edit this section"
                      >
                        <Edit3 size={16} /> Edit
                      </button>
                      <button
                        className="section-action-btn regenerate"
                        onClick={() => regenerateSection('goals')}
                        disabled={regeneratingSection === 'goals'}
                        title="Generate new AI content"
                      >
                        {regeneratingSection === 'goals' ? <Loader size={16} className="spinning" /> : <Sparkles size={16} />}
                        {regeneratingSection === 'goals' ? 'Generating...' : 'AI Regenerate'}
                      </button>
                      {sectionEdits.goals && (
                        <button
                          className="section-action-btn reset"
                          onClick={() => resetSection('goals')}
                          title="Reset to original"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              {editingSection === 'goals' ? (
                <div className="section-edit-mode">
                  <textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    className="section-edit-textarea"
                    rows={6}
                  />
                  <div className="section-edit-actions">
                    <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                    <button className="btn-primary" onClick={() => saveEdit('goals')}>
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="goals-box">
                    <p>{sectionEdits.goals || plan.goals || 'Set specific, measurable goals for the next 6 months.'}</p>
                  </div>
                  {!sectionEdits.goals && (
                    <div className="milestone-tips">
                      <h4>Recommended Milestones:</h4>
                      <ul>
                        <li><strong>Month 1-2:</strong> Validate your value proposition with initial customers</li>
                        <li><strong>Month 2-3:</strong> Establish consistent marketing presence</li>
                        <li><strong>Month 3-4:</strong> Optimize operations and gather feedback</li>
                        <li><strong>Month 4-6:</strong> Scale what's working, pivot what isn't</li>
                      </ul>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Challenges & Solutions */}
            {plan.strategyRecommendations.length > 0 && (
              <section className="plan-section">
                <h2>8. Challenges & Recommended Solutions</h2>
                <div className="challenges-list">
                  {plan.strategyRecommendations.map((item, idx) => (
                    <div key={idx} className="challenge-item">
                      <div className="challenge-header">
                        <span className="challenge-number">{idx + 1}</span>
                        <h4>{item.challenge}</h4>
                      </div>
                      <p>{item.strategy}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Financial Overview */}
            <section className="plan-section">
              <div className="section-header-row">
                <h2>9. Financial Overview & Funding</h2>
                <div className="section-actions">
                  {editingSection !== 'financial' && (
                    <>
                      <button
                        className="section-action-btn edit"
                        onClick={() => startEditing('financial', sectionEdits.financial || plan.financialOverview)}
                        title="Edit this section"
                      >
                        <Edit3 size={16} /> Edit
                      </button>
                      <button
                        className="section-action-btn regenerate"
                        onClick={() => regenerateSection('financial')}
                        disabled={regeneratingSection === 'financial'}
                        title="Generate new AI content"
                      >
                        {regeneratingSection === 'financial' ? <Loader size={16} className="spinning" /> : <Sparkles size={16} />}
                        {regeneratingSection === 'financial' ? 'Generating...' : 'AI Regenerate'}
                      </button>
                      {sectionEdits.financial && (
                        <button
                          className="section-action-btn reset"
                          onClick={() => resetSection('financial')}
                          title="Reset to original"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              {editingSection === 'financial' ? (
                <div className="section-edit-mode">
                  <textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    className="section-edit-textarea"
                    rows={6}
                  />
                  <div className="section-edit-actions">
                    <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                    <button className="btn-primary" onClick={() => saveEdit('financial')}>
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p>{sectionEdits.financial || plan.financialOverview}</p>
                  {plan.funding.length > 0 && !sectionEdits.financial && (
                    <div className="funding-sources">
                      <h4>Funding Sources</h4>
                      <div className="source-list">
                        {plan.funding.map((source, idx) => (
                          <span key={idx} className="source-tag">{source}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Areas for Growth */}
            {plan.helpNeeded.length > 0 && (
              <section className="plan-section">
                <div className="section-header-row">
                  <h2>10. Priority Focus Areas</h2>
                  <div className="section-actions">
                    {editingSection !== 'focus' && (
                      <>
                        <button
                          className="section-action-btn edit"
                          onClick={() => startEditing('focus', sectionEdits.focus || `Priority areas for growth:\n${plan.helpNeeded.map(a => `• ${a}`).join('\n')}`)}
                          title="Edit this section"
                        >
                          <Edit3 size={16} /> Edit
                        </button>
                        <button
                          className="section-action-btn regenerate"
                          onClick={() => regenerateSection('focus')}
                          disabled={regeneratingSection === 'focus'}
                          title="Generate new AI content"
                        >
                          {regeneratingSection === 'focus' ? <Loader size={16} className="spinning" /> : <Sparkles size={16} />}
                          {regeneratingSection === 'focus' ? 'Generating...' : 'AI Regenerate'}
                        </button>
                        {sectionEdits.focus && (
                          <button
                            className="section-action-btn reset"
                            onClick={() => resetSection('focus')}
                            title="Reset to original"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {editingSection === 'focus' ? (
                  <div className="section-edit-mode">
                    <textarea
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      className="section-edit-textarea"
                      rows={6}
                    />
                    <div className="section-edit-actions">
                      <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                      <button className="btn-primary" onClick={() => saveEdit('focus')}>
                        <Save size={16} /> Save Changes
                      </button>
                    </div>
                  </div>
                ) : sectionEdits.focus ? (
                  <p style={{ whiteSpace: 'pre-line' }}>{sectionEdits.focus}</p>
                ) : (
                  <>
                    <p>Based on your responses, these are the key areas to focus on for growth:</p>
                    <div className="focus-areas">
                      {plan.helpNeeded.map((area, idx) => (
                        <div key={idx} className="focus-item">
                          <span className="focus-icon">→</span>
                          <span>{area}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>
            )}

            {/* Next Steps */}
            <section className="plan-section next-steps-section">
              <h2>Next Steps</h2>
              <p>Your personalized dashboard is ready with tools and resources tailored to your business needs.</p>
              <button className="view-path-btn" onClick={goToDashboard}>
                View Your Personalized Path <ArrowRight size={20} />
              </button>
            </section>
          </div>

          <div className="plan-footer">
            <p>Generated by Expedium AI • {new Date().toLocaleDateString()}</p>
          </div>

          {/* Redo Business Plan Section */}
          <div className="redo-plan-section">
            <div className="redo-divider">
              <span>Need to make changes?</span>
            </div>
            <p className="redo-description">
              If your business has evolved or you want to update your information, you can create a new business plan from scratch.
            </p>
            <button className="redo-plan-btn" onClick={() => setShowRedoConfirm(true)}>
              <RefreshCw size={18} />
              Start Over with New Business Plan
            </button>
          </div>
        </div>

        {/* Redo Confirmation Modal */}
        {showRedoConfirm && (
          <div className="modal-overlay" onClick={() => setShowRedoConfirm(false)}>
            <div className="modal-content redo-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="redo-confirm-icon">
                <AlertTriangle size={48} />
              </div>
              <h2>Start Over?</h2>
              <p>Are you sure you want to create a new business plan? This will permanently delete your current plan and all the information you've entered.</p>
              <p className="redo-warning">This action cannot be undone.</p>
              <div className="redo-confirm-buttons">
                <button className="btn-secondary" onClick={() => setShowRedoConfirm(false)}>
                  Cancel
                </button>
                <button className="btn-danger" onClick={handleRedoPlan}>
                  Yes, Start Over
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="business-plan-page">
      <div className="survey-section">
        <div className="survey-header">
          <h1>Build Your Business Profile</h1>
          <p>Answer these questions so we can create your personalized business journey</p>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
          <span className="progress-text">{currentQuestion + 1} of {surveyQuestions.length}</span>
        </div>

        <div className="question-card">
          <span className="question-number">Question {currentQuestion + 1}</span>
          <h2 className="question-text">{currentQ.question}</h2>

          {currentQ.helpText && (
            <div className="question-help-text">
              <HelpCircle size={16} />
              <span>{currentQ.helpText}</span>
            </div>
          )}

          <div className="answer-input">
            {currentQ.type === 'text' && (
              <input
                type="text"
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder={currentQ.placeholder}
                className="text-input"
              />
            )}

            {currentQ.type === 'textarea' && (
              <textarea
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder={currentQ.placeholder}
                className="textarea-input"
                rows={4}
              />
            )}

            {currentQ.type === 'select' && currentQ.options && (
              <div className="select-options">
                {currentQ.options.map((option) => (
                  <button
                    key={option}
                    className={`option-btn ${answers[currentQ.id] === option ? 'selected' : ''}`}
                    onClick={() => handleAnswer(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentQ.type === 'multiselect' && currentQ.options && (
              <div className="select-options multiselect">
                {currentQ.options.map((option) => (
                  <div key={option} className="multiselect-option-wrapper">
                    <button
                      className={`option-btn multiselect-btn ${isMultiSelected(option) ? 'selected' : ''}`}
                      onClick={() => handleMultiSelect(option)}
                    >
                      <span className="checkbox">
                        {isMultiSelected(option) && <Check size={14} />}
                      </span>
                      {option}
                    </button>
                    {termDefinitions[option] && (
                      <button
                        className="term-help-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDefinition(showDefinition === option ? null : option);
                        }}
                        title="What's this?"
                      >
                        <HelpCircle size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {showDefinition && termDefinitions[showDefinition] && (
            <div className="term-definition-popup">
              <div className="definition-header">
                <strong>{showDefinition}</strong>
                <button className="close-definition-btn" onClick={() => setShowDefinition(null)}>
                  <X size={16} />
                </button>
              </div>
              <p>{termDefinitions[showDefinition]}</p>
            </div>
          )}

          <div className="navigation-buttons">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="nav-btn prev"
            >
              <ChevronLeft size={20} /> Previous
            </button>

            {currentQuestion === surveyQuestions.length - 1 ? (
              <button onClick={savePlan} className="nav-btn save">
                <Save size={20} /> Save Plan
              </button>
            ) : (
              <button onClick={nextQuestion} className="nav-btn next">
                Next <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="business-models-section">
          <h3><Lightbulb size={20} /> Proven Business Models</h3>
          <div className="models-grid">
            {businessModels.map((model) => (
              <div key={model.name} className="model-card">
                <h4>{model.name}</h4>
                <p>{model.description}</p>
                <span className="success-tag">✓ {model.success}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        className="ai-toggle-btn"
        onClick={() => setShowAiPanel(!showAiPanel)}
      >
        <Bot size={24} />
        <span>AI Assistant</span>
      </button>

      <div className={`ai-panel ${showAiPanel ? 'open' : ''}`}>
        <div className="ai-panel-header">
          <div className="ai-title">
            <Sparkles size={20} />
            <h3>Expedium AI Assistant</h3>
          </div>
          <button className="close-btn" onClick={() => setShowAiPanel(false)}>×</button>
        </div>

        <div className="ai-description">
          <p>I'm here to help streamline your business! Ask me about:</p>
          <ul>
            <li>Pricing strategies</li>
            <li>Marketing approaches</li>
            <li>Scaling your business</li>
            <li>Funding options</li>
          </ul>
        </div>

        <div className="ai-chat">
          {aiChat.length === 0 && (
            <div className="ai-welcome">
              <Bot size={40} />
              <p>Hello! I'm your business advisor. Ask me anything about building and growing your business!</p>
            </div>
          )}
          {aiChat.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role}`}>
              <div className="message-content">
                {msg.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="chat-message assistant">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleAiSubmit} className="ai-input-form">
          <input
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Ask about your business..."
          />
          <button type="submit">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default BusinessPlan;

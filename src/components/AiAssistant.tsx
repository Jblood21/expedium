import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Send, Sparkles, Lightbulb, ChevronDown, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateSecureId } from '../utils/security';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
}

interface PageContext {
  title: string;
  description: string;
  tips: string[];
  quickActions: { label: string; prompt: string }[];
}

const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousPathRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRenderRef = useRef(true);
  const location = useLocation();
  const { user } = useAuth();

  // Get business profile from localStorage
  const getBusinessProfile = () => {
    const savedAnswers = localStorage.getItem(`expedium_answers_${user?.id}`);
    return savedAnswers ? JSON.parse(savedAnswers) : {};
  };

  // Page-specific context
  const pageContexts: { [key: string]: PageContext } = {
    '/dashboard': {
      title: 'Dashboard',
      description: 'Your business command center',
      tips: [
        'Check your daily goals and progress here',
        'Quick links take you to key areas of your business',
        'Review your recent activity to stay on track'
      ],
      quickActions: [
        { label: 'What should I focus on today?', prompt: 'What should I focus on today to grow my business?' },
        { label: 'Help me set goals', prompt: 'Help me set realistic business goals for this week' },
        { label: 'Business health check', prompt: 'Give me a quick health check on my business priorities' }
      ]
    },
    '/business-plan': {
      title: 'Business Plan',
      description: 'Define your business foundation',
      tips: [
        'Be specific about your target market for better strategies',
        'Your value proposition should clearly state what makes you unique',
        'Think about problems you solve, not just products you sell'
      ],
      quickActions: [
        { label: 'Help with value proposition', prompt: 'Help me write a compelling value proposition for my business' },
        { label: 'Define my target market', prompt: 'Help me identify and describe my ideal target market' },
        { label: 'Revenue model ideas', prompt: 'What revenue models would work best for my type of business?' }
      ]
    },
    '/calculators': {
      title: 'Calculators',
      description: 'Financial planning tools',
      tips: [
        'Start with the pricing calculator to ensure profitability',
        'Use break-even analysis before major investments',
        'Calculate customer lifetime value to guide marketing spend'
      ],
      quickActions: [
        { label: 'Help me price my product', prompt: 'Help me figure out the right price for my product or service' },
        { label: 'Calculate my break-even', prompt: 'What numbers do I need to calculate my break-even point?' },
        { label: 'Explain profit margin', prompt: 'Explain the difference between markup and profit margin' }
      ]
    },
    '/customers': {
      title: 'Customer Management',
      description: 'Track and nurture relationships',
      tips: [
        'Follow up with leads within 24-48 hours for best results',
        'Log every interaction to build relationship history',
        'Set reminders for important follow-ups'
      ],
      quickActions: [
        { label: 'Follow-up email template', prompt: 'Write me a professional follow-up email for a potential customer' },
        { label: 'How to qualify leads', prompt: 'What questions should I ask to qualify leads effectively?' },
        { label: 'Improve response rates', prompt: 'How can I improve my customer response rates?' }
      ]
    },
    '/marketing': {
      title: 'Outreach Hub',
      description: 'Automate your marketing',
      tips: [
        'Personalize messages with customer names and business details',
        'Test different subject lines to improve open rates',
        'Schedule outreach for optimal engagement times'
      ],
      quickActions: [
        { label: 'Write cold email', prompt: 'Help me write an effective cold outreach email' },
        { label: 'Social media post ideas', prompt: 'Give me social media post ideas for my business' },
        { label: 'SMS campaign tips', prompt: 'What makes an effective SMS marketing message?' }
      ]
    },
    '/finances': {
      title: 'Finance Tracker',
      description: 'Monitor your money',
      tips: [
        'Categorize expenses consistently for better insights',
        'Review your burn rate monthly to plan ahead',
        'Set aside money for taxes as you earn'
      ],
      quickActions: [
        { label: 'Expense categories', prompt: 'What expense categories should I track for my business?' },
        { label: 'Reduce costs', prompt: 'How can I reduce my business expenses without hurting growth?' },
        { label: 'Cash flow tips', prompt: 'Give me tips to improve my business cash flow' }
      ]
    },
    '/documents': {
      title: 'Documents',
      description: 'Generate business documents',
      tips: [
        'Keep contracts and agreements organized',
        'Update documents regularly as your business evolves',
        'Use templates to save time on routine documents'
      ],
      quickActions: [
        { label: 'Invoice best practices', prompt: 'What should I include on my business invoices?' },
        { label: 'Contract essentials', prompt: 'What key terms should be in my service contracts?' },
        { label: 'Proposal tips', prompt: 'How do I write a winning business proposal?' }
      ]
    },
    '/strategy': {
      title: 'Strategy',
      description: 'Plan your growth',
      tips: [
        'Focus on one or two key strategies at a time',
        'Set measurable milestones to track progress',
        'Review and adjust strategies quarterly'
      ],
      quickActions: [
        { label: 'Growth strategies', prompt: 'What growth strategies work best for small businesses?' },
        { label: 'Competitive advantage', prompt: 'How can I build a sustainable competitive advantage?' },
        { label: 'Scale my business', prompt: 'What steps should I take to scale my business?' }
      ]
    },
    '/resources': {
      title: 'Resources',
      description: 'Learning and tools',
      tips: [
        'Start with guides relevant to your current challenges',
        'Bookmark resources youll need to reference again',
        'Apply one new concept at a time'
      ],
      quickActions: [
        { label: 'Where to start?', prompt: 'I\'m new to business - where should I start learning?' },
        { label: 'Recommended tools', prompt: 'What tools do you recommend for a small business owner?' },
        { label: 'Common mistakes', prompt: 'What are common mistakes new business owners make?' }
      ]
    },
    '/settings': {
      title: 'Settings',
      description: 'Configure your account',
      tips: [
        'Keep your profile information up to date',
        'Enable notifications for important reminders',
        'Review your settings periodically'
      ],
      quickActions: [
        { label: 'Optimize my setup', prompt: 'How should I configure Expedium for my business type?' },
        { label: 'Integration help', prompt: 'What integrations would help my workflow?' }
      ]
    },
    '/employees': {
      title: 'Employees',
      description: 'Manage your team and payroll',
      tips: [
        'Keep employee information up to date',
        'Track satisfaction regularly to improve retention',
        'Review payroll costs monthly to manage expenses'
      ],
      quickActions: [
        { label: 'Calculate payroll', prompt: 'Help me understand my monthly payroll costs' },
        { label: 'Improve satisfaction', prompt: 'How can I improve employee satisfaction?' },
        { label: 'Hiring tips', prompt: 'What should I consider when hiring a new employee?' },
        { label: 'Performance reviews', prompt: 'How do I give effective performance reviews?' }
      ]
    }
  };

  const getCurrentContext = (): PageContext => {
    const path = location.pathname;
    return pageContexts[path] || {
      title: 'Expedium',
      description: 'Your business assistant',
      tips: ['Ask me anything about your business!'],
      quickActions: [{ label: 'Get started', prompt: 'How can Expedium help my business?' }]
    };
  };

  // Generate AI response based on user input and context
  const generateResponse = (userMessage: string): string => {
    const profile = getBusinessProfile();
    const businessName = profile.business_name || 'your business';
    const industry = Array.isArray(profile.industry) ? profile.industry.join('/') : (profile.industry || 'your industry');
    const targetMarket = profile.target_market || '';
    const valueProposition = profile.value_proposition || '';
    const challenges = Array.isArray(profile.main_challenges) ? profile.main_challenges : [];
    const context = getCurrentContext();
    const lowerMessage = userMessage.toLowerCase();

    // Pricing help
    if (lowerMessage.includes('price') || lowerMessage.includes('pricing')) {
      if (context.title === 'Calculators') {
        return `For ${businessName}, here's how to use the pricing calculator:\n\n1. **Product Cost**: Enter your direct cost to make/buy the item\n2. **Overhead**: Add shipping, packaging, or handling costs per unit\n3. **Desired Margin**: Start with 50% for products, 30-40% for services\n\n💡 **Tip for ${industry}**: Research what competitors charge and position accordingly. If you offer better quality or service, you can charge premium prices.\n\nWant me to help you think through your specific costs?`;
      }
      return `To price your offerings at ${businessName}, consider:\n\n1. **Cost-plus pricing**: Add your costs + desired profit margin\n2. **Value-based pricing**: Price based on the value you deliver\n3. **Competitive pricing**: Match or beat competitors\n\nFor ${industry}, I'd recommend focusing on value-based pricing since ${valueProposition || 'your unique offering'} provides clear benefits.\n\nWould you like to try the Pricing Calculator to run the numbers?`;
    }

    // Value proposition help
    if (lowerMessage.includes('value proposition') || lowerMessage.includes('unique')) {
      return `A great value proposition for ${businessName} should answer:\n\n1. **What do you offer?** The product/service\n2. **Who is it for?** ${targetMarket || 'Your target customer'}\n3. **Why is it better?** Your unique advantage\n\n**Template**: "We help [target customer] achieve [benefit] through [your unique approach], unlike [alternatives]"\n\n${valueProposition ? `Your current proposition "${valueProposition}" is good! Consider making it more specific about the transformation you provide.` : 'Would you like me to help draft one based on what you do?'}`;
    }

    // Target market help
    if (lowerMessage.includes('target market') || lowerMessage.includes('ideal customer')) {
      return `For ${businessName} in ${industry}, here's how to define your target market:\n\n**Demographics**:\n- Age range, income level, location\n- Business size (if B2B)\n\n**Psychographics**:\n- What problems do they face?\n- What do they value?\n- Where do they spend time online?\n\n**Buying Behavior**:\n- How do they make decisions?\n- What's their budget?\n\n${targetMarket ? `You've identified "${targetMarket}" - that's a good start! Consider getting more specific about their pain points.` : 'Start by describing your best existing customer (or ideal one).'}\n\nWant me to help you create a customer profile?`;
    }

    // Follow-up/email help
    if (lowerMessage.includes('follow') || lowerMessage.includes('email')) {
      return `Here's a follow-up email template for ${businessName}:\n\n---\n**Subject**: Quick follow-up on [topic]\n\nHi [Name],\n\nI wanted to follow up on our conversation about [specific topic]. I know ${targetMarket || 'professionals like you'} are often dealing with [common challenge], and I wanted to see if you had any questions.\n\n${valueProposition ? `As a reminder, we ${valueProposition.toLowerCase()}.` : ''}\n\nWould you have 15 minutes this week to discuss?\n\nBest,\n[Your name]\n${businessName}\n---\n\n💡 **Tips**: Send within 48 hours, reference something specific from your conversation, and always include a clear call-to-action.`;
    }

    // Break-even help
    if (lowerMessage.includes('break') || lowerMessage.includes('even')) {
      return `For the Break-Even Calculator, you'll need:\n\n1. **Fixed Costs**: Monthly expenses that don't change with sales\n   - Rent, salaries, insurance, subscriptions\n   - Typically $${industry.includes('service') ? '2,000-5,000' : '5,000-15,000'}/month for small businesses\n\n2. **Price Per Unit**: What you charge per product/service\n\n3. **Variable Cost**: Cost that increases with each sale\n   - Materials, commissions, transaction fees\n\n**Formula**: Break-Even = Fixed Costs ÷ (Price - Variable Cost)\n\nWould you like help identifying your specific costs?`;
    }

    // Goals/focus help
    if (lowerMessage.includes('focus') || lowerMessage.includes('goal') || lowerMessage.includes('priorit')) {
      const focusAreas = [];
      if (challenges.includes('Finding Customers')) focusAreas.push('Lead generation and marketing');
      if (challenges.includes('Managing Money/Cash Flow')) focusAreas.push('Cash flow management');
      if (challenges.includes('Time Management')) focusAreas.push('Automation and delegation');
      if (challenges.includes('Marketing/Getting Visible')) focusAreas.push('Building your online presence');

      return `Based on ${businessName}'s profile, here's what to focus on:\n\n**Today's Priorities**:\n${focusAreas.length > 0 ? focusAreas.map((f, i) => `${i + 1}. ${f}`).join('\n') : '1. Define your ideal customer\n2. Set up your value proposition\n3. Create one lead generation channel'}\n\n**Quick Wins**:\n- Update your Business Plan in Expedium\n- Send 3 outreach messages\n- Review one calculator for financial clarity\n\n**This Week**:\n- Set 2-3 specific, measurable goals\n- Schedule customer follow-ups\n- Track your key metrics\n\nWhat specific area would you like to tackle first?`;
    }

    // Growth/scale help
    if (lowerMessage.includes('grow') || lowerMessage.includes('scale')) {
      return `Growth strategies for ${businessName}:\n\n**Quick Growth Tactics**:\n1. **Referral Program**: Ask happy customers to refer others\n2. **Strategic Partnerships**: Team up with complementary businesses\n3. **Content Marketing**: Share your expertise to attract leads\n\n**Sustainable Scaling**:\n1. Systemize your operations (document processes)\n2. Automate repetitive tasks\n3. Hire or outsource strategically\n4. Expand your offerings to existing customers\n\n**For ${industry}**:\n- Focus on customer retention (cheaper than acquisition)\n- Build recurring revenue where possible\n- Invest in tools that save time\n\nWhat growth stage are you at - just starting, gaining traction, or ready to scale?`;
    }

    // Default contextual response
    const defaultResponses: { [key: string]: string } = {
      'Dashboard': `Welcome to your dashboard! Here you can see an overview of ${businessName}'s key metrics and quick actions.\n\n**Quick Tips**:\n- Check your daily tasks and goals\n- Review recent customer interactions\n- Monitor your business health metrics\n\nWhat would you like help with today?`,

      'Calculators': `I can help you use any of the business calculators!\n\n**Most Popular for ${industry}**:\n- **Pricing Calculator**: Ensure profitability\n- **Break-Even Analysis**: Know your targets\n- **Customer Lifetime Value**: Guide marketing spend\n\nWhich calculator would you like help with? I can explain the inputs and what the results mean.`,

      'Outreach Hub': `The Outreach Hub helps you connect with customers through email, SMS, and social media.\n\n**For ${businessName}**, I recommend:\n1. Start with personalized email outreach\n2. Use the AI generator with your business context\n3. Track responses and follow up consistently\n\nWant me to help draft a message for ${targetMarket || 'your target audience'}?`,

      'Business Plan': `Your business plan is the foundation for ${businessName}!\n\n**Key Sections to Complete**:\n- Business name and industry ✓\n- Value proposition (what makes you unique)\n- Target market (who you serve)\n- Revenue model (how you make money)\n\nOnce complete, you'll get an AI-generated business plan document. What section would you like help with?`
    };

    return defaultResponses[context.title] || `I'm here to help with ${businessName}! Based on your ${industry} business, I can assist with:\n\n• Business planning and strategy\n• Financial calculations and pricing\n• Customer outreach and follow-ups\n• Marketing content generation\n\nWhat would you like to work on?`;
  };

  // Send message
  const sendMessage = useCallback((content?: string) => {
    const messageText = content || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: generateSecureId(),
      type: 'user',
      content: messageText
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Simulate AI response delay
    typingTimeoutRef.current = setTimeout(() => {
      const response = generateResponse(messageText);
      const assistantMessage: Message = {
        id: generateSecureId(),
        type: 'assistant',
        content: response
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const context = getCurrentContext();
      const profile = getBusinessProfile();
      const businessName = profile.business_name || 'there';

      // Set the initial path
      previousPathRef.current = location.pathname;

      setMessages([{
        id: 'welcome',
        type: 'assistant',
        content: `Hi${businessName !== 'there' ? `, ${businessName}` : ''}! 👋 I'm your AI assistant.\n\nYou're on the **${context.title}** page. ${context.description}.\n\n**Quick tips for this page:**\n${context.tips.map(t => `• ${t}`).join('\n')}\n\nHow can I help you today?`
      }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Navigation message when page changes (only after initial render and path actually changed)
  useEffect(() => {
    // Skip first render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      previousPathRef.current = location.pathname;
      return;
    }

    // Only add navigation message if:
    // 1. Chat is open
    // 2. There are existing messages
    // 3. Path actually changed (not the same as previous)
    if (isOpen && messages.length > 0 && previousPathRef.current !== location.pathname) {
      const context = getCurrentContext();
      const navMessage: Message = {
        id: `nav-${generateSecureId()}`,
        type: 'assistant',
        content: `📍 You're now on **${context.title}**. ${context.tips[0]}\n\nNeed help with anything here?`
      };
      setMessages(prev => [...prev, navMessage]);
    }

    // Update previous path
    previousPathRef.current = location.pathname;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const context = getCurrentContext();

  if (!isOpen) {
    return (
      <button
        className="ai-assistant-fab"
        onClick={() => setIsOpen(true)}
        title="AI Assistant"
      >
        <Bot size={24} />
        <span className="fab-pulse" />
      </button>
    );
  }

  return (
    <div className={`ai-assistant-panel ${isMinimized ? 'minimized' : ''}`}>
      <div className="ai-assistant-header">
        <div className="ai-header-title">
          <Sparkles size={20} />
          <span>AI Assistant</span>
        </div>
        <div className="ai-header-actions">
          <button onClick={() => setIsMinimized(!isMinimized)} title={isMinimized ? 'Expand' : 'Minimize'}>
            <ChevronDown size={18} style={{ transform: isMinimized ? 'rotate(180deg)' : 'none' }} />
          </button>
          <button onClick={() => setIsOpen(false)} title="Close">
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="ai-assistant-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-message ${msg.type}`}>
                {msg.type === 'assistant' && (
                  <div className="ai-avatar">
                    <Bot size={16} />
                  </div>
                )}
                <div className="ai-message-content">
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="ai-message assistant">
                <div className="ai-avatar">
                  <Bot size={16} />
                </div>
                <div className="ai-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-quick-actions">
            <div className="quick-actions-label">
              <Lightbulb size={14} />
              <span>Quick prompts</span>
            </div>
            <div className="quick-actions-list">
              {context.quickActions.map((action, idx) => (
                <button
                  key={idx}
                  className="quick-action-btn"
                  onClick={() => sendMessage(action.prompt)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ai-assistant-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
            />
            <button onClick={() => sendMessage()} disabled={!input.trim()}>
              <Send size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AiAssistant;

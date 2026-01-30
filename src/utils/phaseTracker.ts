export interface PhaseTask {
  id: string;
  title: string;
  description: string;
  path: string;
  iconName: string;
  checkComplete: (userId: string) => boolean;
}

export interface Phase {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  iconName: string;
  tasks: PhaseTask[];
}

export interface PhaseStatus {
  phase: Phase;
  completedTasks: number;
  totalTasks: number;
  isComplete: boolean;
  isCurrent: boolean;
}

export interface PhaseProgress {
  currentPhaseIndex: number;
  completedTasks: number;
  totalTasks: number;
  overallPercent: number;
  phaseStatuses: PhaseStatus[];
}

// Helper: check if a localStorage key has a non-empty JSON array
function hasData(key: string): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.length > 0;
    if (typeof parsed === 'object' && parsed !== null) return Object.keys(parsed).length > 0;
    return true;
  } catch {
    return false;
  }
}

// Helper: check if completed steps includes a specific step ID
function hasCompletedStep(userId: string, stepId: string): boolean {
  try {
    const raw = localStorage.getItem(`expedium_completed_steps_${userId}`);
    if (!raw) return false;
    const steps: string[] = JSON.parse(raw);
    return steps.includes(stepId);
  } catch {
    return false;
  }
}

export function getPhases(): Phase[] {
  return [
    {
      id: 'starting',
      name: 'Starting',
      subtitle: 'Foundation',
      description: 'Lay the groundwork for your business with a solid plan and clear goals.',
      iconName: 'Lightbulb',
      tasks: [
        {
          id: 'business-plan',
          title: 'Complete Your Business Plan',
          description: 'Answer key questions about your business, market, and goals.',
          path: '/business-plan',
          iconName: 'ClipboardList',
          checkComplete: (userId) => localStorage.getItem(`expedium_plan_completed_${userId}`) === 'true',
        },
        {
          id: 'profile',
          title: 'Set Up Your Profile',
          description: 'Configure your business profile and preferences.',
          path: '/settings',
          iconName: 'User',
          checkComplete: (userId) => hasData(`expedium_profile_${userId}`),
        },
        {
          id: 'strategy-goals',
          title: 'Define Business Goals',
          description: 'Set strategic goals and milestones for your business.',
          path: '/strategy',
          iconName: 'Target',
          checkComplete: (userId) => hasData(`expedium_goals_strategy_${userId}`),
        },
        {
          id: 'resources',
          title: 'Explore Learning Resources',
          description: 'Access curated guides from SBA, SCORE, and industry experts.',
          path: '/resources',
          iconName: 'BookOpen',
          checkComplete: (userId) => hasCompletedStep(userId, 'resources'),
        },
      ],
    },
    {
      id: 'building',
      name: 'Building',
      subtitle: 'Core Operations',
      description: 'Set up the essential systems that power your day-to-day business.',
      iconName: 'Hammer',
      tasks: [
        {
          id: 'finances',
          title: 'Set Up Financial Tracking',
          description: 'Start recording income, expenses, and monitor cash flow.',
          path: '/finances',
          iconName: 'DollarSign',
          checkComplete: (userId) => hasData(`expedium_transactions_${userId}`),
        },
        {
          id: 'pricing',
          title: 'Calculate Pricing & Break-Even',
          description: 'Use calculators to find the right price point and know your numbers.',
          path: '/calculators',
          iconName: 'Calculator',
          checkComplete: (userId) => hasCompletedStep(userId, 'pricing') || hasCompletedStep(userId, 'breakeven'),
        },
        {
          id: 'employees',
          title: 'Add Team Members',
          description: 'Build your team roster and track employee details.',
          path: '/employees',
          iconName: 'Users',
          checkComplete: (userId) => hasData(`expedium_employees_${userId}`),
        },
        {
          id: 'documents',
          title: 'Create Document Templates',
          description: 'Draft proposals and contracts for your business.',
          path: '/documents',
          iconName: 'FileText',
          checkComplete: (userId) => hasData(`expedium_proposals_${userId}`) || hasData(`expedium_contracts_${userId}`),
        },
      ],
    },
    {
      id: 'growing',
      name: 'Growing',
      subtitle: 'Expansion',
      description: 'Attract customers, launch marketing, and analyze your competitive position.',
      iconName: 'TrendingUp',
      tasks: [
        {
          id: 'customers',
          title: 'Add Your First Customers',
          description: 'Start tracking leads and building customer relationships.',
          path: '/customers',
          iconName: 'Users',
          checkComplete: (userId) => hasData(`expedium_customers_${userId}`),
        },
        {
          id: 'marketing',
          title: 'Launch Marketing Outreach',
          description: 'Create campaigns and reach out to prospects.',
          path: '/marketing',
          iconName: 'Megaphone',
          checkComplete: (userId) => hasData(`expedium_outreach_history_${userId}`),
        },
        {
          id: 'competition',
          title: 'Analyze Your Competition',
          description: 'Run SWOT analysis and track competitors.',
          path: '/strategy',
          iconName: 'Target',
          checkComplete: (userId) => hasData(`expedium_swot_${userId}`) || hasData(`expedium_competitors_${userId}`),
        },
        {
          id: 'invoices',
          title: 'Create & Send Invoices',
          description: 'Generate professional invoices for your clients.',
          path: '/documents',
          iconName: 'FileText',
          checkComplete: (userId) => hasData(`expedium_invoices_${userId}`),
        },
      ],
    },
    {
      id: 'maintaining',
      name: 'Maintaining',
      subtitle: 'Optimization',
      description: 'Sustain momentum with budgets, goals, and data-driven decisions.',
      iconName: 'Shield',
      tasks: [
        {
          id: 'budgets',
          title: 'Set Up Monthly Budgets',
          description: 'Plan and track your monthly spending by category.',
          path: '/finances',
          iconName: 'DollarSign',
          checkComplete: (userId) => hasData(`expedium_budgets_${userId}`),
        },
        {
          id: 'outreach-goals',
          title: 'Set Outreach Goals',
          description: 'Define monthly targets for customer outreach.',
          path: '/customers',
          iconName: 'Target',
          checkComplete: (userId) => hasData(`expedium_goals_${userId}`),
        },
        {
          id: 'financial-review',
          title: 'Review Financial Performance',
          description: 'Analyze profit margins and track financial trends.',
          path: '/calculators',
          iconName: 'BarChart3',
          checkComplete: (userId) => hasCompletedStep(userId, 'finances') || hasCompletedStep(userId, 'profit'),
        },
        {
          id: 'strategy-refine',
          title: 'Refine Your Strategy',
          description: 'Update goals and milestones based on real performance data.',
          path: '/strategy',
          iconName: 'Target',
          checkComplete: (userId) => hasCompletedStep(userId, 'strategy') || hasCompletedStep(userId, 'scaling'),
        },
      ],
    },
  ];
}

export function getPhaseProgress(userId: string): PhaseProgress {
  const phases = getPhases();
  let totalCompleted = 0;
  let totalTasks = 0;
  let currentPhaseIndex = phases.length - 1; // default to last if all done
  let foundCurrent = false;

  const phaseStatuses: PhaseStatus[] = phases.map((phase, index) => {
    const completed = phase.tasks.filter(task => task.checkComplete(userId)).length;
    const total = phase.tasks.length;
    totalCompleted += completed;
    totalTasks += total;
    const isComplete = completed === total;

    if (!isComplete && !foundCurrent) {
      currentPhaseIndex = index;
      foundCurrent = true;
    }

    return {
      phase,
      completedTasks: completed,
      totalTasks: total,
      isComplete,
      isCurrent: false, // set below
    };
  });

  // Mark the current phase
  phaseStatuses[currentPhaseIndex].isCurrent = true;

  const overallPercent = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return {
    currentPhaseIndex,
    completedTasks: totalCompleted,
    totalTasks,
    overallPercent,
    phaseStatuses,
  };
}

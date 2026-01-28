export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  lastContact: string;
  nextFollowUp: string;
  notes: string;
  status: 'lead' | 'active' | 'inactive';
  interactions: Interaction[];
}

export interface Interaction {
  id: string;
  date: string;
  type: 'call' | 'email' | 'meeting' | 'promotion';
  outcome: 'positive' | 'negative' | 'neutral' | 'no-response';
  notes: string;
}

export interface MonthlyGoal {
  month: string;
  targetOutreach: number;
  completed: number;
  responses: number;
  positiveResponses: number;
  negativeResponses: number;
}

export interface BusinessPlanAnswers {
  [key: string]: string | string[];
}

export interface SurveyQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number';
  options?: string[];
  placeholder?: string;
  helpText?: string;
}

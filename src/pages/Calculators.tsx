import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, DollarSign, Percent, TrendingUp, Users, BarChart3, CreditCard, Clock, UserPlus, Building, Tag, PieChart, Target, Grid, Flag, ArrowRight, HelpCircle, Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CalculatorResult {
  label: string;
  value: string;
  highlight?: boolean;
}

interface CalculatorInfo {
  id: string;
  name: string;
  icon: React.ElementType;
  category: string;
  question: string; // What question does this answer?
  description: string;
  keywords: string[];
}

const Calculators: React.FC = () => {
  const { user } = useAuth();
  const [activeCalc, setActiveCalc] = useState<string | null>(null);
  const [results, setResults] = useState<CalculatorResult[]>([]);
  const [showFinder, setShowFinder] = useState(false);
  const [finderStep, setFinderStep] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Generic state for all calculators
  const [inputs, setInputs] = useState<{[key: string]: string}>({});

  // Load saved calculator inputs from localStorage
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`expedium_calc_inputs_${user.id}`);
    if (saved) {
      try { setInputs(JSON.parse(saved)); } catch {}
    }
    const savedResults = localStorage.getItem(`expedium_calc_results_${user.id}`);
    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults);
        if (parsed.calcId && parsed.results) {
          setActiveCalc(parsed.calcId);
          setResults(parsed.results);
        }
      } catch {}
    }
  }, [user]);

  // Save inputs to localStorage when they change
  useEffect(() => {
    if (!user || Object.keys(inputs).length === 0) return;
    localStorage.setItem(`expedium_calc_inputs_${user.id}`, JSON.stringify(inputs));
  }, [inputs, user]);

  // Save results to localStorage when they change
  useEffect(() => {
    if (!user || !activeCalc || results.length === 0) return;
    localStorage.setItem(`expedium_calc_results_${user.id}`, JSON.stringify({ calcId: activeCalc, results }));
  }, [results, activeCalc, user]);

  const updateInput = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const getInput = (key: string, defaultVal: string = ''): string => {
    return inputs[key] || defaultVal;
  };

  const getNum = (key: string, defaultVal: number = 0): number => {
    return parseFloat(inputs[key]) || defaultVal;
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  const formatPercent = (num: number): string => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  // ==================== CALCULATOR FUNCTIONS ====================

  const calculatePricing = () => {
    const cost = getNum('productCost');
    const margin = getNum('desiredMargin', 50) / 100;
    const overhead = getNum('overhead');
    const totalCost = cost + overhead;
    const price = totalCost / (1 - margin);
    const profit = price - totalCost;

    setResults([
      { label: 'Total Cost per Unit', value: formatCurrency(totalCost) },
      { label: 'Recommended Price', value: formatCurrency(price), highlight: true },
      { label: 'Profit per Unit', value: formatCurrency(profit), highlight: true },
      { label: 'Actual Margin', value: `${(margin * 100).toFixed(1)}%` },
      { label: 'Competitive Price (-10%)', value: formatCurrency(price * 0.9) },
      { label: 'Premium Price (+25%)', value: formatCurrency(price * 1.25) },
    ]);
  };

  const calculateProfitMargin = () => {
    const revenue = getNum('revenue');
    const cogs = getNum('cogs');
    const expenses = getNum('operatingExpenses');
    if (revenue === 0) {
      setResults([{ label: 'Error', value: 'Revenue cannot be zero', highlight: true }]);
      return;
    }
    const grossProfit = revenue - cogs;
    const operatingProfit = grossProfit - expenses;
    const grossMargin = (grossProfit / revenue) * 100;
    const operatingMargin = (operatingProfit / revenue) * 100;

    setResults([
      { label: 'Gross Profit', value: formatCurrency(grossProfit) },
      { label: 'Gross Margin', value: `${grossMargin.toFixed(1)}%`, highlight: true },
      { label: 'Operating Profit', value: formatCurrency(operatingProfit) },
      { label: 'Operating Margin', value: `${operatingMargin.toFixed(1)}%`, highlight: true },
      { label: 'Profit per $100 Revenue', value: formatCurrency(operatingMargin) },
      { label: 'Break-Even Revenue', value: formatCurrency(expenses / (grossMargin / 100)) },
    ]);
  };

  const calculateBreakEven = () => {
    const fixed = getNum('fixedCosts');
    const price = getNum('pricePerUnit');
    const variable = getNum('variableCost');
    if (price <= variable) {
      setResults([{ label: 'Error', value: 'Price must be greater than variable cost', highlight: true }]);
      return;
    }
    const contribution = price - variable;
    const contributionMarginPercent = (contribution / price) * 100;
    const breakEvenUnits = fixed / contribution;
    const breakEvenRevenue = breakEvenUnits * price;

    // Units needed for target profit amounts
    const profitTarget5k = (fixed + 5000) / contribution;
    const profitTarget10k = (fixed + 10000) / contribution;
    const profitTarget25k = (fixed + 25000) / contribution;

    setResults([
      { label: 'Contribution per Unit', value: formatCurrency(contribution) },
      { label: 'Contribution Margin %', value: `${contributionMarginPercent.toFixed(1)}%` },
      { label: 'Break-Even Units', value: formatNumber(breakEvenUnits), highlight: true },
      { label: 'Break-Even Revenue', value: formatCurrency(breakEvenRevenue), highlight: true },
      { label: 'Units for $5K Profit', value: formatNumber(profitTarget5k) },
      { label: 'Units for $10K Profit', value: formatNumber(profitTarget10k) },
      { label: 'Units for $25K Profit', value: formatNumber(profitTarget25k) },
    ]);
  };

  const calculateROI = () => {
    const invest = getNum('investment');
    const ret = getNum('returns');
    const months = getNum('timePeriod', 12);
    if (invest === 0) {
      setResults([{ label: 'Error', value: 'Investment cannot be zero', highlight: true }]);
      return;
    }
    const netProfit = ret - invest;
    const roi = (netProfit / invest) * 100;
    const monthlyProfit = netProfit / months;
    const monthlyROI = roi / months;
    const annualROI = monthlyROI * 12;
    // Payback = investment / monthly profit (only if profitable)
    const payback = monthlyProfit > 0 ? invest / monthlyProfit : 0;

    setResults([
      { label: 'Net Profit', value: formatCurrency(netProfit) },
      { label: 'Total ROI', value: `${roi.toFixed(1)}%`, highlight: true },
      { label: 'Monthly Profit', value: formatCurrency(monthlyProfit) },
      { label: 'Annualized ROI', value: `${annualROI.toFixed(1)}%`, highlight: true },
      { label: 'Payback Period', value: payback > 0 ? `${payback.toFixed(1)} months` : 'N/A (no profit)' },
      { label: 'Break-Even Multiplier', value: `${(1).toFixed(1)}x → ${(ret/invest).toFixed(2)}x` },
    ]);
  };

  const calculateCLV = () => {
    const avgPurchase = getNum('avgPurchase');
    const frequency = getNum('purchaseFreq');
    const lifespan = getNum('customerLifespan');
    const annual = avgPurchase * frequency;
    const clv = annual * lifespan;

    setResults([
      { label: 'Annual Customer Value', value: formatCurrency(annual) },
      { label: 'Monthly Customer Value', value: formatCurrency(annual / 12) },
      { label: 'Customer Lifetime Value', value: formatCurrency(clv), highlight: true },
      { label: 'Max Acquisition Cost (30%)', value: formatCurrency(clv * 0.3) },
      { label: 'Ideal Acquisition Cost (20%)', value: formatCurrency(clv * 0.2), highlight: true },
    ]);
  };

  const calculateCAC = () => {
    const marketing = getNum('marketingSpend');
    const sales = getNum('salesSpend');
    const newCustomers = getNum('newCustomers');
    const clv = getNum('cacCLV');
    const avgMonthlyRevenue = getNum('avgMonthlyRevenue'); // New field for monthly revenue per customer
    if (newCustomers === 0) {
      setResults([{ label: 'Error', value: 'Customers cannot be zero', highlight: true }]);
      return;
    }
    const cac = (marketing + sales) / newCustomers;
    const ratio = clv / cac;
    // Payback in months = CAC / monthly revenue per customer
    const paybackMonths = avgMonthlyRevenue > 0 ? cac / avgMonthlyRevenue : 0;

    setResults([
      { label: 'Total Acquisition Spend', value: formatCurrency(marketing + sales) },
      { label: 'Customer Acquisition Cost', value: formatCurrency(cac), highlight: true },
      { label: 'CLV:CAC Ratio', value: `${ratio.toFixed(1)}:1`, highlight: true },
      { label: 'Ratio Assessment', value: ratio >= 3 ? '✓ Healthy (3:1+)' : ratio >= 1 ? '⚠ Needs improvement' : '✗ Unsustainable' },
      { label: 'ROI per Customer', value: `${(((clv - cac) / cac) * 100).toFixed(0)}%` },
      { label: 'Payback Period', value: paybackMonths > 0 ? `${paybackMonths.toFixed(1)} months` : 'Enter monthly revenue' },
    ]);
  };

  const calculateLoan = () => {
    const principal = getNum('loanAmount');
    const rate = getNum('interestRate') / 100 / 12;
    const months = getNum('loanTerm');
    const payment = principal * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    const totalPaid = payment * months;
    const totalInterest = totalPaid - principal;

    setResults([
      { label: 'Monthly Payment', value: formatCurrency(payment), highlight: true },
      { label: 'Total Interest', value: formatCurrency(totalInterest) },
      { label: 'Total Amount Paid', value: formatCurrency(totalPaid), highlight: true },
      { label: 'Interest % of Loan', value: `${((totalInterest / principal) * 100).toFixed(1)}%` },
      { label: 'Effective Annual Cost', value: `${((totalInterest / principal / (months / 12)) * 100).toFixed(1)}%` },
    ]);
  };

  const calculateCashFlow = () => {
    const revenue = getNum('monthlyRevenue');
    const fixedCosts = getNum('monthlyFixed');
    const variableCosts = getNum('monthlyVariable');
    const growth = getNum('revenueGrowth', 5) / 100;
    const netCashFlow = revenue - fixedCosts - variableCosts;
    const month3 = (revenue * Math.pow(1 + growth, 3)) - fixedCosts - (variableCosts * Math.pow(1 + growth, 3));
    const month6 = (revenue * Math.pow(1 + growth, 6)) - fixedCosts - (variableCosts * Math.pow(1 + growth, 6));
    const month12 = (revenue * Math.pow(1 + growth, 12)) - fixedCosts - (variableCosts * Math.pow(1 + growth, 12));

    setResults([
      { label: 'Current Monthly Cash Flow', value: formatCurrency(netCashFlow), highlight: true },
      { label: 'Cash Flow Margin', value: `${((netCashFlow / revenue) * 100).toFixed(1)}%` },
      { label: '3-Month Projection', value: formatCurrency(month3) },
      { label: '6-Month Projection', value: formatCurrency(month6), highlight: true },
      { label: '12-Month Projection', value: formatCurrency(month12) },
      { label: 'Annual Cash Flow (Current)', value: formatCurrency(netCashFlow * 12) },
    ]);
  };

  const calculateStartupCosts = () => {
    const equipment = getNum('equipment');
    const inventory = getNum('inventory');
    const legal = getNum('legalFees');
    const marketing = getNum('initialMarketing');
    const rent = getNum('rentDeposit');
    const licenses = getNum('licenses');
    const misc = getNum('miscCosts');
    const runway = getNum('runwayMonths', 6);
    const monthlyBurn = getNum('monthlyBurn');
    const oneTime = equipment + inventory + legal + marketing + rent + licenses + misc;
    const operating = monthlyBurn * runway;
    const total = oneTime + operating;

    setResults([
      { label: 'One-Time Costs', value: formatCurrency(oneTime) },
      { label: 'Operating Capital (Runway)', value: formatCurrency(operating) },
      { label: 'Total Startup Capital', value: formatCurrency(total), highlight: true },
      { label: 'Add 20% Buffer', value: formatCurrency(total * 1.2), highlight: true },
      { label: 'Monthly Burn Rate', value: formatCurrency(monthlyBurn) },
      { label: 'Runway Months', value: `${runway} months` },
    ]);
  };

  const calculateMarkupMargin = () => {
    const cost = getNum('itemCost');
    const markup = getNum('markupPercent');
    const targetMargin = getNum('targetMargin');
    const priceFromMarkup = cost * (1 + markup / 100);
    const priceFromMargin = cost / (1 - targetMargin / 100);
    const marginFromMarkup = ((priceFromMarkup - cost) / priceFromMarkup) * 100;
    const markupFromMargin = ((priceFromMargin - cost) / cost) * 100;

    setResults([
      { label: `Price at ${markup}% Markup`, value: formatCurrency(priceFromMarkup), highlight: true },
      { label: 'Margin from Markup', value: `${marginFromMarkup.toFixed(1)}%` },
      { label: `Price at ${targetMargin}% Margin`, value: formatCurrency(priceFromMargin), highlight: true },
      { label: 'Markup from Margin', value: `${markupFromMargin.toFixed(1)}%` },
      { label: 'Profit (Markup)', value: formatCurrency(priceFromMarkup - cost) },
      { label: 'Profit (Margin)', value: formatCurrency(priceFromMargin - cost) },
    ]);
  };

  const calculateDiscount = () => {
    const originalPrice = getNum('originalPrice');
    const costPerUnit = getNum('discountCost');
    const currentVolume = getNum('currentVolume');
    const discountPercent = getNum('discountPercent');
    const newPrice = originalPrice * (1 - discountPercent / 100);
    const originalProfit = (originalPrice - costPerUnit) * currentVolume;
    const newProfitPerUnit = newPrice - costPerUnit;
    const unitsNeeded = originalProfit / newProfitPerUnit;
    const volumeIncrease = ((unitsNeeded - currentVolume) / currentVolume) * 100;

    setResults([
      { label: 'New Price', value: formatCurrency(newPrice) },
      { label: 'Original Total Profit', value: formatCurrency(originalProfit) },
      { label: 'New Profit per Unit', value: formatCurrency(newProfitPerUnit), highlight: true },
      { label: 'Units Needed to Match Profit', value: formatNumber(unitsNeeded), highlight: true },
      { label: 'Required Volume Increase', value: `${volumeIncrease.toFixed(0)}%` },
      { label: 'Verdict', value: volumeIncrease <= 30 ? '✓ Reasonable' : '⚠ High risk' },
    ]);
  };

  const calculateHourlyRate = () => {
    const targetSalary = getNum('targetSalary');
    const expenses = getNum('yearlyExpenses');
    const profitMargin = getNum('hourlyProfit', 20) / 100;
    const billableHours = getNum('billableHours', 1500);
    const costs = targetSalary + expenses;
    const withProfit = costs / (1 - profitMargin);
    const hourlyRate = withProfit / billableHours;

    setResults([
      { label: 'Yearly Costs', value: formatCurrency(costs) },
      { label: 'With Profit Margin', value: formatCurrency(withProfit) },
      { label: 'Hourly Rate', value: formatCurrency(hourlyRate), highlight: true },
      { label: 'Daily Rate (8hr)', value: formatCurrency(hourlyRate * 8), highlight: true },
      { label: 'Weekly Rate (40hr)', value: formatCurrency(hourlyRate * 40) },
      { label: 'Project Rate (100hr)', value: formatCurrency(hourlyRate * 100) },
    ]);
  };

  const calculateEmployeeCost = () => {
    const salary = getNum('salary');
    const benefits = getNum('benefitsPercent', 25) / 100;
    const taxes = getNum('payrollTaxes', 7.65) / 100;
    const equipment = getNum('equipmentCost');
    const training = getNum('trainingCost');
    const benefitsCost = salary * benefits;
    const taxesCost = salary * taxes;
    const yearOneCost = salary + benefitsCost + taxesCost + equipment + training;
    const ongoingCost = salary + benefitsCost + taxesCost;

    setResults([
      { label: 'Base Salary', value: formatCurrency(salary) },
      { label: 'Benefits Cost', value: formatCurrency(benefitsCost) },
      { label: 'Payroll Taxes', value: formatCurrency(taxesCost) },
      { label: 'Year 1 Total Cost', value: formatCurrency(yearOneCost), highlight: true },
      { label: 'Ongoing Annual Cost', value: formatCurrency(ongoingCost), highlight: true },
      { label: 'Monthly Cost', value: formatCurrency(ongoingCost / 12) },
      { label: 'True Hourly Cost', value: formatCurrency(ongoingCost / 2080) },
    ]);
  };

  const runScenario = () => {
    const type = getInput('scenarioType', 'hiring');

    if (type === 'hiring') {
      const newHires = getNum('newHires', 1);
      const avgSalary = getNum('avgSalary');
      const revenuePerEmployee = getNum('revenuePerEmployee');
      const totalCost = avgSalary * 1.35 * newHires;
      const expectedRevenue = revenuePerEmployee * newHires;
      const netImpact = expectedRevenue - totalCost;

      setResults([
        { label: 'New Employees', value: formatNumber(newHires) },
        { label: 'Total Labor Cost', value: formatCurrency(totalCost), highlight: true },
        { label: 'Expected Revenue Add', value: formatCurrency(expectedRevenue) },
        { label: 'Net Annual Impact', value: formatCurrency(netImpact), highlight: true },
        { label: 'Payback Period', value: netImpact > 0 ? `${(totalCost / expectedRevenue * 12).toFixed(0)} months` : 'N/A' },
        { label: 'Recommendation', value: netImpact > 0 ? '✓ Profitable hire' : '⚠ Review needed' },
      ]);
    } else if (type === 'expansion') {
      const buildout = getNum('buildoutCost');
      const monthlyRent = getNum('newLocationRent');
      const staffing = getNum('expansionStaffing');
      const projectedRevenue = getNum('projectedLocationRevenue');
      const yearOneCost = buildout + (monthlyRent * 12) + staffing;
      const annualRevenue = projectedRevenue * 12;
      const profit = annualRevenue - (monthlyRent * 12) - staffing;
      const payback = buildout / (profit / 12);

      setResults([
        { label: 'Year 1 Investment', value: formatCurrency(yearOneCost), highlight: true },
        { label: 'Projected Annual Revenue', value: formatCurrency(annualRevenue) },
        { label: 'Annual Operating Profit', value: formatCurrency(profit), highlight: true },
        { label: 'Payback Period', value: `${payback.toFixed(0)} months` },
        { label: 'Year 1 ROI', value: `${(((profit - buildout) / yearOneCost) * 100).toFixed(0)}%` },
        { label: 'Recommendation', value: payback <= 24 ? '✓ Good opportunity' : '⚠ Long payback' },
      ]);
    } else if (type === 'churn') {
      const mrr = getNum('currentMRR');
      const customers = getNum('currentCustomers');
      const churnRate = getNum('monthlyChurn') / 100;
      const avgRevenue = mrr / customers;
      const monthlyLoss = mrr * churnRate;
      const customersLost = customers * churnRate;
      const yearlyLoss = monthlyLoss * 12;
      const customerAfter12 = customers * Math.pow(1 - churnRate, 12);

      setResults([
        { label: 'Monthly Revenue Loss', value: formatCurrency(monthlyLoss), highlight: true },
        { label: 'Customers Lost/Month', value: formatNumber(customersLost) },
        { label: 'Annual Revenue Loss', value: formatCurrency(yearlyLoss), highlight: true },
        { label: 'Customers After 12 Mo', value: formatNumber(customerAfter12) },
        { label: 'Customer Lifetime', value: `${(1 / churnRate).toFixed(0)} months` },
        { label: 'LTV per Customer', value: formatCurrency(avgRevenue / churnRate) },
      ]);
    } else if (type === 'seasonal') {
      const baseRevenue = getNum('baseRevenue');
      const peakMultiplier = getNum('peakMultiplier', 1.5);
      const lowMultiplier = getNum('lowMultiplier', 0.7);
      const peakMonths = getNum('peakMonths', 3);
      const lowMonths = getNum('lowMonths', 3);
      const normalMonths = 12 - peakMonths - lowMonths;
      const peakRev = baseRevenue * peakMultiplier * peakMonths;
      const lowRev = baseRevenue * lowMultiplier * lowMonths;
      const normalRev = baseRevenue * normalMonths;
      const totalAnnual = peakRev + lowRev + normalRev;

      setResults([
        { label: 'Peak Season Revenue', value: formatCurrency(peakRev) },
        { label: 'Normal Season Revenue', value: formatCurrency(normalRev) },
        { label: 'Low Season Revenue', value: formatCurrency(lowRev) },
        { label: 'Total Annual Revenue', value: formatCurrency(totalAnnual), highlight: true },
        { label: 'Monthly Average', value: formatCurrency(totalAnnual / 12), highlight: true },
        { label: 'Peak vs Low Diff', value: formatCurrency((baseRevenue * peakMultiplier) - (baseRevenue * lowMultiplier)) },
      ]);
    } else if (type === 'pricing') {
      const price = getNum('currentPrice');
      const volume = getNum('currentVolume');
      const change = getNum('priceChange') / 100;
      const elasticity = getNum('priceElasticity', 1.5);
      const newPrice = price * (1 + change);
      const volumeChange = -change * elasticity;
      const newVolume = volume * (1 + volumeChange);
      const oldRevenue = price * volume;
      const newRevenue = newPrice * newVolume;

      setResults([
        { label: 'New Price', value: formatCurrency(newPrice) },
        { label: 'Expected Volume Change', value: formatPercent(volumeChange * 100) },
        { label: 'New Volume', value: formatNumber(newVolume) },
        { label: 'Current Revenue', value: formatCurrency(oldRevenue) },
        { label: 'New Revenue', value: formatCurrency(newRevenue), highlight: true },
        { label: 'Revenue Change', value: formatPercent(((newRevenue - oldRevenue) / oldRevenue) * 100), highlight: true },
      ]);
    }
  };

  const calculators: CalculatorInfo[] = [
    // Pricing Category
    { id: 'pricing', name: 'Product Pricing', icon: DollarSign, category: 'pricing',
      question: 'What should I charge for my product?',
      description: 'Calculate optimal pricing based on costs and desired profit margins',
      keywords: ['price', 'sell', 'charge', 'product', 'cost', 'margin'] },
    { id: 'margin', name: 'Profit Margin', icon: PieChart, category: 'pricing',
      question: 'What is my profit margin?',
      description: 'Calculate gross and operating margins from revenue and costs',
      keywords: ['profit', 'margin', 'revenue', 'percentage', 'gross', 'operating'] },
    { id: 'markup', name: 'Markup vs Margin', icon: Tag, category: 'pricing',
      question: 'What\'s the difference between markup and margin?',
      description: 'Convert between markup percentage and profit margin',
      keywords: ['markup', 'margin', 'difference', 'convert', 'percentage'] },
    { id: 'discount', name: 'Discount Impact', icon: Percent, category: 'pricing',
      question: 'How will a discount affect my profits?',
      description: 'See how much more you need to sell to maintain profit after discounting',
      keywords: ['discount', 'sale', 'promotion', 'volume', 'profit'] },
    { id: 'hourly', name: 'Hourly Rate', icon: Clock, category: 'pricing',
      question: 'What hourly rate should I charge for services?',
      description: 'Calculate what to charge per hour for consulting or services',
      keywords: ['hourly', 'rate', 'consulting', 'freelance', 'service', 'charge'] },
    // Financial Category
    { id: 'breakeven', name: 'Break-Even', icon: TrendingUp, category: 'financial',
      question: 'How many units do I need to sell to break even?',
      description: 'Find the sales volume needed to cover all your costs',
      keywords: ['breakeven', 'break-even', 'units', 'sell', 'cover', 'costs'] },
    { id: 'roi', name: 'ROI', icon: Percent, category: 'financial',
      question: 'What is my return on investment?',
      description: 'Calculate ROI percentage and payback period',
      keywords: ['roi', 'return', 'investment', 'payback', 'profit'] },
    { id: 'loan', name: 'Loan Payment', icon: CreditCard, category: 'financial',
      question: 'What will my loan payments be?',
      description: 'Calculate monthly payments and total interest on a loan',
      keywords: ['loan', 'payment', 'interest', 'monthly', 'borrow', 'financing'] },
    { id: 'cashflow', name: 'Cash Flow', icon: TrendingUp, category: 'financial',
      question: 'What will my future cash flow look like?',
      description: 'Project monthly cash flow with growth assumptions',
      keywords: ['cash', 'flow', 'forecast', 'projection', 'monthly', 'future'] },
    { id: 'startup', name: 'Startup Costs', icon: Building, category: 'financial',
      question: 'How much money do I need to start my business?',
      description: 'Calculate total startup capital including runway',
      keywords: ['startup', 'start', 'capital', 'launch', 'begin', 'funding'] },
    // Customer Category
    { id: 'clv', name: 'Customer LTV', icon: Users, category: 'customer',
      question: 'How much is each customer worth over time?',
      description: 'Calculate customer lifetime value and max acquisition spend',
      keywords: ['customer', 'lifetime', 'value', 'ltv', 'clv', 'worth'] },
    { id: 'cac', name: 'Acquisition Cost', icon: UserPlus, category: 'customer',
      question: 'How much does it cost to acquire a customer?',
      description: 'Calculate CAC and the crucial CLV:CAC ratio',
      keywords: ['cac', 'acquisition', 'cost', 'customer', 'marketing', 'spend'] },
    // Operations Category
    { id: 'employee', name: 'Employee Cost', icon: Users, category: 'operations',
      question: 'What is the true cost of hiring an employee?',
      description: 'Calculate total employee cost including benefits and taxes',
      keywords: ['employee', 'hire', 'salary', 'cost', 'benefits', 'payroll'] },
    // Scenarios Category
    { id: 'scenario', name: 'Business Scenarios', icon: BarChart3, category: 'scenarios',
      question: 'What if I change my pricing, hire staff, or expand?',
      description: 'Test hiring, expansion, churn, seasonal, and pricing scenarios',
      keywords: ['scenario', 'what if', 'hiring', 'expansion', 'churn', 'seasonal'] },
  ];

  const categories = [
    { id: 'pricing', name: 'Pricing & Margins', icon: DollarSign, color: '#10b981', description: 'Set prices, calculate margins, determine rates' },
    { id: 'financial', name: 'Financial Planning', icon: TrendingUp, color: '#6366f1', description: 'ROI, loans, cash flow, startup costs' },
    { id: 'customer', name: 'Customer Metrics', icon: Users, color: '#f59e0b', description: 'Lifetime value, acquisition costs' },
    { id: 'operations', name: 'Operations', icon: Building, color: '#ef4444', description: 'Employee costs, resource planning' },
    { id: 'scenarios', name: 'What-If Scenarios', icon: BarChart3, color: '#8b5cf6', description: 'Test business decisions before you make them' },
  ];

  // Calculator Finder questions
  const finderQuestions = [
    {
      question: "What are you trying to figure out?",
      options: [
        { label: "How to price something", next: 1, calcs: ['pricing', 'markup', 'hourly'] },
        { label: "If something is profitable", next: 2, calcs: ['margin', 'roi', 'breakeven'] },
        { label: "How much money I need", next: 3, calcs: ['startup', 'loan', 'cashflow'] },
        { label: "Customer-related numbers", next: 4, calcs: ['clv', 'cac'] },
        { label: "Test a business decision", next: -1, calcs: ['scenario'] },
      ]
    },
    {
      question: "What kind of pricing?",
      options: [
        { label: "A physical product", next: -1, calcs: ['pricing'] },
        { label: "Hourly/consulting services", next: -1, calcs: ['hourly'] },
        { label: "Understanding markup vs margin", next: -1, calcs: ['markup'] },
        { label: "Impact of running a discount", next: -1, calcs: ['discount'] },
      ]
    },
    {
      question: "What aspect of profitability?",
      options: [
        { label: "Current profit margins", next: -1, calcs: ['margin'] },
        { label: "Return on an investment", next: -1, calcs: ['roi'] },
        { label: "Sales needed to break even", next: -1, calcs: ['breakeven'] },
      ]
    },
    {
      question: "What kind of funding question?",
      options: [
        { label: "Starting a new business", next: -1, calcs: ['startup'] },
        { label: "Taking out a loan", next: -1, calcs: ['loan'] },
        { label: "Projecting future cash flow", next: -1, calcs: ['cashflow'] },
      ]
    },
    {
      question: "What customer metric?",
      options: [
        { label: "How much a customer is worth", next: -1, calcs: ['clv'] },
        { label: "Cost to acquire customers", next: -1, calcs: ['cac'] },
      ]
    },
  ];

  const renderCalculator = () => {
    switch (activeCalc) {
      case 'pricing':
        return (
          <>
            <h2><DollarSign size={24} /> Product Pricing Calculator</h2>
            <p className="calc-description">Calculate optimal pricing based on costs and desired margins.</p>
            <div className="calc-inputs">
              <div className="input-group"><label>Product Cost ($)</label><input type="number" value={getInput('productCost')} onChange={(e) => updateInput('productCost', e.target.value)} placeholder="Cost to produce" /></div>
              <div className="input-group"><label>Overhead per Unit ($)</label><input type="number" value={getInput('overhead')} onChange={(e) => updateInput('overhead', e.target.value)} placeholder="Shipping, packaging" /></div>
              <div className="input-group"><label>Desired Margin (%)</label><input type="number" value={getInput('desiredMargin', '50')} onChange={(e) => updateInput('desiredMargin', e.target.value)} placeholder="50" /></div>
            </div>
            <button className="calc-btn" onClick={calculatePricing}><Calculator size={18} /> Calculate</button>
          </>
        );

      case 'margin':
        return (
          <>
            <h2><PieChart size={24} /> Profit Margin Calculator</h2>
            <p className="calc-description">Calculate gross, operating, and net profit margins.</p>
            <div className="calc-inputs">
              <div className="input-group"><label>Total Revenue ($)</label><input type="number" value={getInput('revenue')} onChange={(e) => updateInput('revenue', e.target.value)} placeholder="Total sales" /></div>
              <div className="input-group"><label>Cost of Goods Sold ($)</label><input type="number" value={getInput('cogs')} onChange={(e) => updateInput('cogs', e.target.value)} placeholder="Direct costs" /></div>
              <div className="input-group"><label>Operating Expenses ($)</label><input type="number" value={getInput('operatingExpenses')} onChange={(e) => updateInput('operatingExpenses', e.target.value)} placeholder="Rent, salaries, etc." /></div>
            </div>
            <button className="calc-btn" onClick={calculateProfitMargin}><Calculator size={18} /> Calculate</button>
          </>
        );

      case 'markup':
        return (
          <>
            <h2><Tag size={24} /> Markup vs Margin Calculator</h2>
            <p className="calc-description">Convert between markup percentage and profit margin.</p>
            <div className="calc-inputs">
              <div className="input-group"><label>Item Cost ($)</label><input type="number" value={getInput('itemCost')} onChange={(e) => updateInput('itemCost', e.target.value)} placeholder="Your cost" /></div>
              <div className="input-group"><label>Markup (%)</label><input type="number" value={getInput('markupPercent')} onChange={(e) => updateInput('markupPercent', e.target.value)} placeholder="e.g., 50" /></div>
              <div className="input-group"><label>Target Margin (%)</label><input type="number" value={getInput('targetMargin')} onChange={(e) => updateInput('targetMargin', e.target.value)} placeholder="e.g., 33" /></div>
            </div>
            <button className="calc-btn" onClick={calculateMarkupMargin}><Calculator size={18} /> Calculate</button>
          </>
        );

      case 'discount':
        return (
          <>
            <h2><Percent size={24} /> Discount Impact Calculator</h2>
            <p className="calc-description">See how much more you need to sell to maintain profit after a discount.</p>
            <div className="calc-inputs">
              <div className="input-group"><label>Original Price ($)</label><input type="number" value={getInput('originalPrice')} onChange={(e) => updateInput('originalPrice', e.target.value)} placeholder="Current price" /></div>
              <div className="input-group"><label>Cost per Unit ($)</label><input type="number" value={getInput('discountCost')} onChange={(e) => updateInput('discountCost', e.target.value)} placeholder="Your cost" /></div>
              <div className="input-group"><label>Current Monthly Volume</label><input type="number" value={getInput('currentVolume')} onChange={(e) => updateInput('currentVolume', e.target.value)} placeholder="Units sold" /></div>
              <div className="input-group"><label>Discount (%)</label><input type="number" value={getInput('discountPercent')} onChange={(e) => updateInput('discountPercent', e.target.value)} placeholder="e.g., 20" /></div>
            </div>
            <button className="calc-btn" onClick={calculateDiscount}><Calculator size={18} /> Calculate</button>
          </>
        );

      case 'hourly':
        return (
          <>
            <h2><Clock size={24} /> Hourly Rate Calculator</h2>
            <p className="calc-description">Calculate what to charge per hour for services.</p>
            <div className="calc-inputs">
              <div className="input-group"><label>Target Annual Income ($)</label><input type="number" value={getInput('targetSalary')} onChange={(e) => updateInput('targetSalary', e.target.value)} placeholder="Desired salary" /></div>
              <div className="input-group"><label>Yearly Business Expenses ($)</label><input type="number" value={getInput('yearlyExpenses')} onChange={(e) => updateInput('yearlyExpenses', e.target.value)} placeholder="Software, tools, etc." /></div>
              <div className="input-group"><label>Profit Margin (%)</label><input type="number" value={getInput('hourlyProfit', '20')} onChange={(e) => updateInput('hourlyProfit', e.target.value)} placeholder="20" /></div>
              <div className="input-group"><label>Billable Hours/Year</label><input type="number" value={getInput('billableHours', '1500')} onChange={(e) => updateInput('billableHours', e.target.value)} placeholder="1500" /></div>
            </div>
            <button className="calc-btn" onClick={calculateHourlyRate}><Calculator size={18} /> Calculate</button>
          </>
        );

      case 'breakeven':
        return (
          <>
            <h2><TrendingUp size={24} /> Break-Even Calculator</h2>
            <p className="calc-description">Find out how many units you need to sell to cover costs.</p>
            <div className="calc-inputs">
              <div className="input-group"><label>Fixed Costs ($)</label><input type="number" value={getInput('fixedCosts')} onChange={(e) => updateInput('fixedCosts', e.target.value)} placeholder="Rent, salaries, etc." /></div>
              <div className="input-group"><label>Price per Unit ($)</label><input type="number" value={getInput('pricePerUnit')} onChange={(e) => updateInput('pricePerUnit', e.target.value)} placeholder="Selling price" /></div>
              <div className="input-group"><label>Variable Cost per Unit ($)</label><input type="number" value={getInput('variableCost')} onChange={(e) => updateInput('variableCost', e.target.value)} placeholder="Cost per item" /></div>
            </div>
            <button className="calc-btn" onClick={calculateBreakEven}><Calculator size={18} /> Calculate</button>
          </>
        );

      case 'roi':
        return (
          <>
            <h2><Percent size={24} /> ROI Calculator</h2>
            <p className="calc-description">Calculate return on investment.</p>
            <div className="calc-inputs">
              <div className="input-group"><label>Investment ($)</label><input type="number" value={getInput('investment')} onChange={(e) => updateInput('investment', e.target.value)} placeholder="Amount invested" /></div>
              <div className="input-group"><label>Total Returns ($)</label><input type="number" value={getInput('returns')} onChange={(e) => updateInput('returns', e.target.value)} placeholder="Money returned" /></div>
              <div className="input-group"><label>Time Period (months)</label><input type="number" value={getInput('timePeriod', '12')} onChange={(e) => updateInput('timePeriod', e.target.value)} placeholder="12" /></div>
            </div>
            <button className="calc-btn" onClick={calculateROI}><Calculator size={18} /> Calculate</button>
          </>
        );

      case 'loan':
        return (
          <>
            <h2><CreditCard size={24} /> Loan Payment Calculator</h2>
            <p className="calc-description">Calculate monthly payments and total interest.</p>
            <div className="calc-inputs">
              <div className="input-group"><label>Loan Amount ($)</label><input type="number" value={getInput('loanAmount')} onChange={(e) => updateInput('loanAmount', e.target.value)} placeholder="Principal" /></div>
              <div className="input-group"><label>Annual Interest Rate (%)</label><input type="number" value={getInput('interestRate')} onChange={(e) => updateInput('interestRate', e.target.value)} placeholder="e.g., 8" /></div>
              <div className="input-group"><label>Loan Term (months)</label><input type="number" value={getInput('loanTerm')} onChange={(e) => updateInput('loanTerm', e.target.value)} placeholder="e.g., 60" /></div>
            </div>
            <button className="calc-btn" onClick={calculateLoan}><Calculator size={18} /> Calculate</button>
          </>
        );

      case 'cashflow':
        return (
          <>
            <h2><TrendingUp size={24} /> Cash Flow Forecaster</h2>
            <p className="calc-description">Project your monthly cash flow.</p>
            <div className="calc-inputs">
              <div className="input-group"><label>Monthly Revenue ($)</label><input type="number" value={getInput('monthlyRevenue')} onChange={(e) => updateInput('monthlyRevenue', e.target.value)} placeholder="Current revenue" /></div>
              <div className="input-group"><label>Monthly Fixed Costs ($)</label><input type="number" value={getInput('monthlyFixed')} onChange={(e) => updateInput('monthlyFixed', e.target.value)} placeholder="Rent, salaries" /></div>
              <div className="input-group"><label>Monthly Variable Costs ($)</label><input type="number" value={getInput('monthlyVariable')} onChange={(e) => updateInput('monthlyVariable', e.target.value)} placeholder="COGS, commissions" /></div>
              <div className="input-group"><label>Monthly Growth Rate (%)</label><input type="number" value={getInput('revenueGrowth', '5')} onChange={(e) => updateInput('revenueGrowth', e.target.value)} placeholder="5" /></div>
            </div>
            <button className="calc-btn" onClick={calculateCashFlow}><Calculator size={18} /> Calculate</button>
          </>
        );

      case 'startup':
        return (
          <>
            <h2><Building size={24} /> Startup Costs Estimator</h2>
            <p className="calc-description">Calculate total capital needed to launch.</p>
            <div className="calc-inputs">
              <div className="input-group"><label>Equipment ($)</label><input type="number" value={getInput('equipment')} onChange={(e) => updateInput('equipment', e.target.value)} placeholder="Computers, tools" /></div>
              <div className="input-group"><label>Initial Inventory ($)</label><input type="number" value={getInput('inventory')} onChange={(e) => updateInput('inventory', e.target.value)} placeholder="Stock" /></div>
              <div className="input-group"><label>Legal/Professional ($)</label><input type="number" value={getInput('legalFees')} onChange={(e) => updateInput('legalFees', e.target.value)} placeholder="LLC, lawyer" /></div>
              <div className="input-group"><label>Initial Marketing ($)</label><input type="number" value={getInput('initialMarketing')} onChange={(e) => updateInput('initialMarketing', e.target.value)} placeholder="Website, ads" /></div>
              <div className="input-group"><label>Rent/Deposits ($)</label><input type="number" value={getInput('rentDeposit')} onChange={(e) => updateInput('rentDeposit', e.target.value)} placeholder="Security deposit" /></div>
              <div className="input-group"><label>Licenses/Permits ($)</label><input type="number" value={getInput('licenses')} onChange={(e) => updateInput('licenses', e.target.value)} placeholder="Business license" /></div>
              <div className="input-group"><label>Monthly Burn Rate ($)</label><input type="number" value={getInput('monthlyBurn')} onChange={(e) => updateInput('monthlyBurn', e.target.value)} placeholder="Monthly expenses" /></div>
              <div className="input-group"><label>Runway (months)</label><input type="number" value={getInput('runwayMonths', '6')} onChange={(e) => updateInput('runwayMonths', e.target.value)} placeholder="6" /></div>
            </div>
            <button className="calc-btn" onClick={calculateStartupCosts}><Calculator size={18} /> Calculate</button>
          </>
        );

      case 'clv':
        return (
          <>
            <h2><Users size={24} /> Customer Lifetime Value</h2>
            <p className="calc-description">Calculate how much a customer is worth over time.</p>
            <div className="calc-inputs">
              <div className="input-group"><label>Avg Purchase Value ($)</label><input type="number" value={getInput('avgPurchase')} onChange={(e) => updateInput('avgPurchase', e.target.value)} placeholder="Order value" /></div>
              <div className="input-group"><label>Purchase Frequency/Year</label><input type="number" value={getInput('purchaseFreq')} onChange={(e) => updateInput('purchaseFreq', e.target.value)} placeholder="Times per year" /></div>
              <div className="input-group"><label>Customer Lifespan (years)</label><input type="number" value={getInput('customerLifespan')} onChange={(e) => updateInput('customerLifespan', e.target.value)} placeholder="Years active" /></div>
            </div>
            <button className="calc-btn" onClick={calculateCLV}><Calculator size={18} /> Calculate</button>
          </>
        );

      case 'cac':
        return (
          <>
            <h2><UserPlus size={24} /> Customer Acquisition Cost</h2>
            <p className="calc-description">Calculate cost to acquire each customer and CLV:CAC ratio.</p>
            <div className="calc-inputs">
              <div className="input-group"><label>Marketing Spend ($)</label><input type="number" value={getInput('marketingSpend')} onChange={(e) => updateInput('marketingSpend', e.target.value)} placeholder="Ads, content" /></div>
              <div className="input-group"><label>Sales Spend ($)</label><input type="number" value={getInput('salesSpend')} onChange={(e) => updateInput('salesSpend', e.target.value)} placeholder="Sales team costs" /></div>
              <div className="input-group"><label>New Customers Acquired</label><input type="number" value={getInput('newCustomers')} onChange={(e) => updateInput('newCustomers', e.target.value)} placeholder="# of customers" /></div>
              <div className="input-group"><label>Customer LTV ($)</label><input type="number" value={getInput('cacCLV')} onChange={(e) => updateInput('cacCLV', e.target.value)} placeholder="Lifetime value" /></div>
              <div className="input-group"><label>Avg Monthly Revenue/Customer ($)</label><input type="number" value={getInput('avgMonthlyRevenue')} onChange={(e) => updateInput('avgMonthlyRevenue', e.target.value)} placeholder="Monthly spend" /></div>
            </div>
            <button className="calc-btn" onClick={calculateCAC}><Calculator size={18} /> Calculate</button>
          </>
        );

      case 'employee':
        return (
          <>
            <h2><Users size={24} /> Employee Cost Calculator</h2>
            <p className="calc-description">Calculate true cost of hiring an employee.</p>
            <div className="calc-inputs">
              <div className="input-group"><label>Annual Salary ($)</label><input type="number" value={getInput('salary')} onChange={(e) => updateInput('salary', e.target.value)} placeholder="Base salary" /></div>
              <div className="input-group"><label>Benefits (%)</label><input type="number" value={getInput('benefitsPercent', '25')} onChange={(e) => updateInput('benefitsPercent', e.target.value)} placeholder="25" /></div>
              <div className="input-group"><label>Payroll Taxes (%)</label><input type="number" value={getInput('payrollTaxes', '7.65')} onChange={(e) => updateInput('payrollTaxes', e.target.value)} placeholder="7.65" /></div>
              <div className="input-group"><label>Equipment Cost ($)</label><input type="number" value={getInput('equipmentCost')} onChange={(e) => updateInput('equipmentCost', e.target.value)} placeholder="Computer, desk" /></div>
              <div className="input-group"><label>Training Cost ($)</label><input type="number" value={getInput('trainingCost')} onChange={(e) => updateInput('trainingCost', e.target.value)} placeholder="Onboarding" /></div>
            </div>
            <button className="calc-btn" onClick={calculateEmployeeCost}><Calculator size={18} /> Calculate</button>
          </>
        );

      case 'scenario':
        return (
          <>
            <h2><BarChart3 size={24} /> Scenario Tester</h2>
            <p className="calc-description">Test different business scenarios.</p>
            <div className="calc-inputs">
              <div className="input-group">
                <label>Scenario Type</label>
                <select value={getInput('scenarioType', 'hiring')} onChange={(e) => updateInput('scenarioType', e.target.value)} className="select-input">
                  <option value="hiring">Hiring Impact</option>
                  <option value="expansion">New Location/Expansion</option>
                  <option value="churn">Subscription Churn</option>
                  <option value="seasonal">Seasonal Demand</option>
                  <option value="pricing">Price Change Impact</option>
                </select>
              </div>
              {getInput('scenarioType', 'hiring') === 'hiring' && (
                <>
                  <div className="input-group"><label>New Hires</label><input type="number" value={getInput('newHires', '1')} onChange={(e) => updateInput('newHires', e.target.value)} placeholder="1" /></div>
                  <div className="input-group"><label>Avg Salary ($)</label><input type="number" value={getInput('avgSalary')} onChange={(e) => updateInput('avgSalary', e.target.value)} placeholder="Annual salary" /></div>
                  <div className="input-group"><label>Revenue per Employee ($)</label><input type="number" value={getInput('revenuePerEmployee')} onChange={(e) => updateInput('revenuePerEmployee', e.target.value)} placeholder="Expected revenue" /></div>
                </>
              )}
              {getInput('scenarioType') === 'expansion' && (
                <>
                  <div className="input-group"><label>Buildout Cost ($)</label><input type="number" value={getInput('buildoutCost')} onChange={(e) => updateInput('buildoutCost', e.target.value)} placeholder="One-time cost" /></div>
                  <div className="input-group"><label>Monthly Rent ($)</label><input type="number" value={getInput('newLocationRent')} onChange={(e) => updateInput('newLocationRent', e.target.value)} placeholder="New rent" /></div>
                  <div className="input-group"><label>Annual Staffing ($)</label><input type="number" value={getInput('expansionStaffing')} onChange={(e) => updateInput('expansionStaffing', e.target.value)} placeholder="New staff cost" /></div>
                  <div className="input-group"><label>Monthly Revenue ($)</label><input type="number" value={getInput('projectedLocationRevenue')} onChange={(e) => updateInput('projectedLocationRevenue', e.target.value)} placeholder="Expected revenue" /></div>
                </>
              )}
              {getInput('scenarioType') === 'churn' && (
                <>
                  <div className="input-group"><label>Current MRR ($)</label><input type="number" value={getInput('currentMRR')} onChange={(e) => updateInput('currentMRR', e.target.value)} placeholder="Monthly recurring" /></div>
                  <div className="input-group"><label>Current Customers</label><input type="number" value={getInput('currentCustomers')} onChange={(e) => updateInput('currentCustomers', e.target.value)} placeholder="# of customers" /></div>
                  <div className="input-group"><label>Monthly Churn Rate (%)</label><input type="number" value={getInput('monthlyChurn')} onChange={(e) => updateInput('monthlyChurn', e.target.value)} placeholder="e.g., 5" /></div>
                </>
              )}
              {getInput('scenarioType') === 'seasonal' && (
                <>
                  <div className="input-group"><label>Base Monthly Revenue ($)</label><input type="number" value={getInput('baseRevenue')} onChange={(e) => updateInput('baseRevenue', e.target.value)} placeholder="Normal revenue" /></div>
                  <div className="input-group"><label>Peak Multiplier</label><input type="number" value={getInput('peakMultiplier', '1.5')} onChange={(e) => updateInput('peakMultiplier', e.target.value)} placeholder="1.5" /></div>
                  <div className="input-group"><label>Low Multiplier</label><input type="number" value={getInput('lowMultiplier', '0.7')} onChange={(e) => updateInput('lowMultiplier', e.target.value)} placeholder="0.7" /></div>
                  <div className="input-group"><label>Peak Months</label><input type="number" value={getInput('peakMonths', '3')} onChange={(e) => updateInput('peakMonths', e.target.value)} placeholder="3" /></div>
                  <div className="input-group"><label>Low Months</label><input type="number" value={getInput('lowMonths', '3')} onChange={(e) => updateInput('lowMonths', e.target.value)} placeholder="3" /></div>
                </>
              )}
              {getInput('scenarioType') === 'pricing' && (
                <>
                  <div className="input-group"><label>Current Price ($)</label><input type="number" value={getInput('currentPrice')} onChange={(e) => updateInput('currentPrice', e.target.value)} placeholder="Current price" /></div>
                  <div className="input-group"><label>Current Volume</label><input type="number" value={getInput('currentVolume')} onChange={(e) => updateInput('currentVolume', e.target.value)} placeholder="Units sold" /></div>
                  <div className="input-group"><label>Price Change (%)</label><input type="number" value={getInput('priceChange')} onChange={(e) => updateInput('priceChange', e.target.value)} placeholder="+10 or -10" /></div>
                  <div className="input-group"><label>Price Elasticity</label><input type="number" value={getInput('priceElasticity', '1.5')} onChange={(e) => updateInput('priceElasticity', e.target.value)} placeholder="1.5" /></div>
                </>
              )}
            </div>
            <button className="calc-btn" onClick={runScenario}><BarChart3 size={18} /> Run Scenario</button>
          </>
        );

      default:
        return null;
    }
  };

  const handleFinderSelect = (option: { next: number; calcs: string[] }) => {
    if (option.next === -1) {
      // End of finder - open the recommended calculator
      setActiveCalc(option.calcs[0]);
      setShowFinder(false);
      setFinderStep(0);
      setResults([]);
    } else {
      setFinderStep(option.next);
    }
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategory(expandedCategory === catId ? null : catId);
  };

  return (
    <div className="calculators-page">
      <div className="calc-header">
        <Calculator size={32} />
        <h1>Business Calculators</h1>
        <p>Make data-driven decisions with powerful financial tools</p>
      </div>

      {/* Calculator Finder */}
      <div className="calc-finder-section">
        <button
          className={`calc-finder-btn ${showFinder ? 'active' : ''}`}
          onClick={() => { setShowFinder(!showFinder); setFinderStep(0); }}
        >
          <Search size={20} />
          <span>Help me find the right calculator</span>
          {showFinder ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {showFinder && (
          <div className="calc-finder-panel">
            <div className="finder-question">
              <HelpCircle size={24} />
              <h3>{finderQuestions[finderStep].question}</h3>
            </div>
            <div className="finder-options">
              {finderQuestions[finderStep].options.map((opt, idx) => (
                <button
                  key={idx}
                  className="finder-option"
                  onClick={() => handleFinderSelect(opt)}
                >
                  {opt.label}
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>
            {finderStep > 0 && (
              <button className="finder-back" onClick={() => setFinderStep(0)}>
                ← Start over
              </button>
            )}
          </div>
        )}
      </div>

      {/* Strategy Tools Link */}
      <div className="strategy-tools-banner">
        <div className="strategy-banner-content">
          <div className="strategy-banner-text">
            <h3><Target size={20} /> Strategy Planning Tools</h3>
            <p>SWOT analysis, competitor tracking, goals, and milestones</p>
          </div>
          <div className="strategy-tools-links">
            <Link to="/strategy" className="strategy-link-btn">
              <Grid size={16} /> SWOT Analysis
            </Link>
            <Link to="/strategy" className="strategy-link-btn">
              <Users size={16} /> Competitors
            </Link>
            <Link to="/strategy" className="strategy-link-btn">
              <Target size={16} /> Goals
            </Link>
            <Link to="/strategy" className="strategy-link-btn">
              <Flag size={16} /> Milestones
            </Link>
            <Link to="/strategy" className="strategy-link-btn primary">
              Open All <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Category Grid Layout */}
      <div className="calc-categories-grid">
        {categories.map((cat) => {
          const catCalcs = calculators.filter(c => c.category === cat.id);
          const isExpanded = expandedCategory === cat.id;

          return (
            <div key={cat.id} className={`calc-category-card ${isExpanded ? 'expanded' : ''}`}>
              <div
                className="category-header"
                onClick={() => toggleCategory(cat.id)}
                style={{ borderLeftColor: cat.color }}
              >
                <div className="category-title">
                  <cat.icon size={22} style={{ color: cat.color }} />
                  <div>
                    <h3>{cat.name}</h3>
                    <p>{cat.description}</p>
                  </div>
                </div>
                <div className="category-meta">
                  <span className="calc-count">{catCalcs.length} tools</span>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {isExpanded && (
                <div className="category-calculators">
                  {catCalcs.map((calc) => (
                    <button
                      key={calc.id}
                      className={`calc-card ${activeCalc === calc.id ? 'active' : ''}`}
                      onClick={() => { setActiveCalc(calc.id); setResults([]); }}
                    >
                      <div className="calc-card-header">
                        <calc.icon size={20} />
                        <span className="calc-name">{calc.name}</span>
                      </div>
                      <p className="calc-question">{calc.question}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Access Row - Most Popular */}
      <div className="calc-quick-access">
        <h3>Quick Access</h3>
        <div className="quick-access-row">
          {['pricing', 'margin', 'breakeven', 'roi', 'clv', 'scenario'].map(id => {
            const calc = calculators.find(c => c.id === id)!;
            return (
              <button
                key={id}
                className={`quick-calc-btn ${activeCalc === id ? 'active' : ''}`}
                onClick={() => { setActiveCalc(id); setResults([]); }}
              >
                <calc.icon size={18} />
                <span>{calc.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Calculator Panel */}
      {activeCalc && (
        <div className="calc-content">
          <div className="calculator-panel">
            <button className="close-calc-btn" onClick={() => setActiveCalc(null)}>
              <X size={20} />
            </button>
            {renderCalculator()}

            {results.length > 0 && (
              <div className="results-panel">
                <h3>Results</h3>
                <div className="results-grid">
                  {results.map((result, idx) => (
                    <div key={idx} className={`result-item ${result.highlight ? 'highlight' : ''}`}>
                      <span className="result-label">{result.label}</span>
                      <span className="result-value">{result.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculators;

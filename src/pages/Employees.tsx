import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users, Plus, Edit2, Trash2, Save, X, Search, DollarSign,
  Star, Mail, Phone, Calendar, Briefcase, TrendingUp, TrendingDown,
  Award, Clock, Filter, UserPlus, BarChart3
} from 'lucide-react';
import { generateSecureId } from '../utils/security';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  startDate: string;
  payType: 'hourly' | 'salary';
  payRate: number;
  payFrequency: 'weekly' | 'biweekly' | 'monthly';
  hoursPerWeek?: number;
  satisfactionRating: number; // 1-5 stars
  performanceNotes: string;
  status: 'active' | 'on-leave' | 'terminated';
  reviews: PerformanceReview[];
}

interface PerformanceReview {
  id: string;
  date: string;
  rating: number; // 1-5
  strengths: string;
  improvements: string;
  notes: string;
}

const Employees: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('list');

  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    startDate: new Date().toISOString().split('T')[0],
    payType: 'salary' as 'hourly' | 'salary',
    payRate: '',
    payFrequency: 'biweekly' as 'weekly' | 'biweekly' | 'monthly',
    hoursPerWeek: '40',
    satisfactionRating: 3,
    performanceNotes: '',
    status: 'active' as 'active' | 'on-leave' | 'terminated'
  });

  const [reviewForm, setReviewForm] = useState({
    rating: 3,
    strengths: '',
    improvements: '',
    notes: ''
  });

  const departments = ['Management', 'Sales', 'Marketing', 'Operations', 'Finance', 'IT', 'HR', 'Customer Service', 'Other'];

  useEffect(() => {
    const savedEmployees = localStorage.getItem(`expedium_employees_${user?.id}`);
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    }
  }, [user]);

  const saveEmployees = (data: Employee[]) => {
    setEmployees(data);
    localStorage.setItem(`expedium_employees_${user?.id}`, JSON.stringify(data));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const calculateAnnualPay = (employee: Employee) => {
    if (employee.payType === 'salary') {
      switch (employee.payFrequency) {
        case 'weekly': return employee.payRate * 52;
        case 'biweekly': return employee.payRate * 26;
        case 'monthly': return employee.payRate * 12;
      }
    } else {
      const weeklyPay = employee.payRate * (employee.hoursPerWeek || 40);
      return weeklyPay * 52;
    }
  };

  const calculateMonthlyPay = (employee: Employee) => {
    return calculateAnnualPay(employee) / 12;
  };

  const saveEmployeeData = () => {
    const employee: Employee = {
      id: editingEmployee?.id || generateSecureId(),
      name: employeeForm.name,
      email: employeeForm.email,
      phone: employeeForm.phone,
      role: employeeForm.role,
      department: employeeForm.department,
      startDate: employeeForm.startDate,
      payType: employeeForm.payType,
      payRate: parseFloat(employeeForm.payRate) || 0,
      payFrequency: employeeForm.payFrequency,
      hoursPerWeek: employeeForm.payType === 'hourly' ? parseFloat(employeeForm.hoursPerWeek) || 40 : undefined,
      satisfactionRating: employeeForm.satisfactionRating,
      performanceNotes: employeeForm.performanceNotes,
      status: employeeForm.status,
      reviews: editingEmployee?.reviews || []
    };

    if (editingEmployee) {
      saveEmployees(employees.map(e => e.id === editingEmployee.id ? employee : e));
    } else {
      saveEmployees([...employees, employee]);
    }

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setEmployeeForm({
      name: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      startDate: new Date().toISOString().split('T')[0],
      payType: 'salary',
      payRate: '',
      payFrequency: 'biweekly',
      hoursPerWeek: '40',
      satisfactionRating: 3,
      performanceNotes: '',
      status: 'active'
    });
    setEditingEmployee(null);
  };

  const editEmployee = (employee: Employee) => {
    setEmployeeForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      department: employee.department,
      startDate: employee.startDate,
      payType: employee.payType,
      payRate: employee.payRate.toString(),
      payFrequency: employee.payFrequency,
      hoursPerWeek: employee.hoursPerWeek?.toString() || '40',
      satisfactionRating: employee.satisfactionRating,
      performanceNotes: employee.performanceNotes,
      status: employee.status
    });
    setEditingEmployee(employee);
    setShowModal(true);
  };

  const deleteEmployee = (id: string) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      saveEmployees(employees.filter(e => e.id !== id));
    }
  };

  const updateSatisfaction = (id: string, rating: number) => {
    saveEmployees(employees.map(e => e.id === id ? { ...e, satisfactionRating: rating } : e));
  };

  const addPerformanceReview = () => {
    if (!selectedEmployee) return;

    const review: PerformanceReview = {
      id: generateSecureId(),
      date: new Date().toISOString().split('T')[0],
      rating: reviewForm.rating,
      strengths: reviewForm.strengths,
      improvements: reviewForm.improvements,
      notes: reviewForm.notes
    };

    const updatedEmployee = {
      ...selectedEmployee,
      reviews: [...selectedEmployee.reviews, review],
      satisfactionRating: reviewForm.rating
    };

    saveEmployees(employees.map(e => e.id === selectedEmployee.id ? updatedEmployee : e));
    setReviewForm({ rating: 3, strengths: '', improvements: '', notes: '' });
    setShowReviewModal(false);
    setSelectedEmployee(updatedEmployee);
  };

  const filteredEmployees = employees
    .filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 e.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 e.email.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(e => filterDepartment === 'all' || e.department === filterDepartment)
    .filter(e => filterStatus === 'all' || e.status === filterStatus);

  const activeEmployees = employees.filter(e => e.status === 'active');
  const totalMonthlyPayroll = activeEmployees.reduce((sum, e) => sum + calculateMonthlyPay(e), 0);
  const averageSatisfaction = activeEmployees.length > 0
    ? activeEmployees.reduce((sum, e) => sum + e.satisfactionRating, 0) / activeEmployees.length
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'on-leave': return '#f59e0b';
      case 'terminated': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderStars = (rating: number, interactive?: boolean, onChange?: (r: number) => void) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`star-btn ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onChange && onChange(star)}
            disabled={!interactive}
          >
            <Star size={18} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="employees-page">
      <div className="page-header">
        <Users size={32} />
        <h1>Employee Management</h1>
        <p>Track your team, payroll, and satisfaction</p>
      </div>

      {/* Summary Cards */}
      <div className="employee-summary">
        <div className="summary-card">
          <div className="summary-icon employees">
            <Users size={24} />
          </div>
          <div className="summary-info">
            <span className="summary-value">{activeEmployees.length}</span>
            <span className="summary-label">Active Employees</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon payroll">
            <DollarSign size={24} />
          </div>
          <div className="summary-info">
            <span className="summary-value">{formatCurrency(totalMonthlyPayroll)}</span>
            <span className="summary-label">Monthly Payroll</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon annual">
            <BarChart3 size={24} />
          </div>
          <div className="summary-info">
            <span className="summary-value">{formatCurrency(totalMonthlyPayroll * 12)}</span>
            <span className="summary-label">Annual Payroll</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon satisfaction">
            <Star size={24} />
          </div>
          <div className="summary-info">
            <span className="summary-value">{averageSatisfaction.toFixed(1)}/5</span>
            <span className="summary-label">Avg Satisfaction</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="employee-tabs">
        <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
          <Users size={18} /> Employee List
        </button>
        <button className={`tab-btn ${activeTab === 'payroll' ? 'active' : ''}`} onClick={() => setActiveTab('payroll')}>
          <DollarSign size={18} /> Payroll Overview
        </button>
        <button className={`tab-btn ${activeTab === 'satisfaction' ? 'active' : ''}`} onClick={() => setActiveTab('satisfaction')}>
          <Star size={18} /> Satisfaction Tracking
        </button>
      </div>

      {/* Employee List Tab */}
      {activeTab === 'list' && (
        <div className="employees-list-section">
          <div className="section-header">
            <div className="filters-row">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
                <option value="all">All Departments</option>
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="on-leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
              <UserPlus size={18} /> Add Employee
            </button>
          </div>

          {filteredEmployees.length > 0 ? (
            <div className="employees-grid">
              {filteredEmployees.map((employee) => (
                <div key={employee.id} className={`employee-card ${employee.status}`}>
                  <div className="employee-header">
                    <div className="employee-avatar">
                      {employee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="employee-basic">
                      <h3>{employee.name}</h3>
                      <span className="employee-role">{employee.role}</span>
                      <span className="employee-dept">{employee.department}</span>
                    </div>
                    <span className="employee-status" style={{ backgroundColor: getStatusColor(employee.status) }}>
                      {employee.status}
                    </span>
                  </div>

                  <div className="employee-contact">
                    {employee.email && <span><Mail size={14} /> {employee.email}</span>}
                    {employee.phone && <span><Phone size={14} /> {employee.phone}</span>}
                    <span><Calendar size={14} /> Started {employee.startDate}</span>
                  </div>

                  <div className="employee-pay">
                    <span className="pay-label">
                      {employee.payType === 'salary' ? 'Salary' : 'Hourly Rate'}:
                    </span>
                    <span className="pay-value">
                      {formatCurrency(employee.payRate)}
                      {employee.payType === 'hourly' && '/hr'}
                      {employee.payType === 'salary' && `/${employee.payFrequency}`}
                    </span>
                    <span className="annual-pay">
                      ({formatCurrency(calculateAnnualPay(employee))}/year)
                    </span>
                  </div>

                  <div className="employee-satisfaction">
                    <span className="satisfaction-label">Satisfaction:</span>
                    {renderStars(employee.satisfactionRating, true, (r) => updateSatisfaction(employee.id, r))}
                  </div>

                  <div className="employee-actions">
                    <button className="icon-btn" onClick={() => {
                      setSelectedEmployee(employee);
                      setShowReviewModal(true);
                    }} title="Add Review">
                      <Award size={16} />
                    </button>
                    <button className="icon-btn" onClick={() => editEmployee(employee)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="icon-btn danger" onClick={() => deleteEmployee(employee.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Users size={48} />
              <h3>No employees yet</h3>
              <p>Add your team members to track payroll and satisfaction</p>
              <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                <UserPlus size={18} /> Add First Employee
              </button>
            </div>
          )}
        </div>
      )}

      {/* Payroll Overview Tab */}
      {activeTab === 'payroll' && (
        <div className="payroll-section">
          <div className="payroll-breakdown">
            <h3>Payroll by Department</h3>
            {departments.map(dept => {
              const deptEmployees = activeEmployees.filter(e => e.department === dept);
              if (deptEmployees.length === 0) return null;
              const deptPayroll = deptEmployees.reduce((sum, e) => sum + calculateMonthlyPay(e), 0);
              const percentage = (deptPayroll / totalMonthlyPayroll) * 100;

              return (
                <div key={dept} className="payroll-item">
                  <div className="payroll-info">
                    <span className="dept-name">{dept}</span>
                    <span className="dept-count">{deptEmployees.length} employee{deptEmployees.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="payroll-bar">
                    <div className="payroll-fill" style={{ width: `${percentage}%` }} />
                  </div>
                  <div className="payroll-amount">
                    <span className="monthly">{formatCurrency(deptPayroll)}/mo</span>
                    <span className="percent">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="payroll-list">
            <h3>Employee Pay Details</h3>
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Type</th>
                  <th>Rate</th>
                  <th>Monthly</th>
                  <th>Annual</th>
                </tr>
              </thead>
              <tbody>
                {activeEmployees
                  .sort((a, b) => calculateAnnualPay(b) - calculateAnnualPay(a))
                  .map(emp => (
                    <tr key={emp.id}>
                      <td>{emp.name}</td>
                      <td>{emp.role}</td>
                      <td>{emp.payType === 'salary' ? 'Salary' : 'Hourly'}</td>
                      <td>
                        {formatCurrency(emp.payRate)}
                        {emp.payType === 'hourly' && '/hr'}
                      </td>
                      <td>{formatCurrency(calculateMonthlyPay(emp))}</td>
                      <td className="annual">{formatCurrency(calculateAnnualPay(emp))}</td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}><strong>Total</strong></td>
                  <td><strong>{formatCurrency(totalMonthlyPayroll)}</strong></td>
                  <td className="annual"><strong>{formatCurrency(totalMonthlyPayroll * 12)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Satisfaction Tab */}
      {activeTab === 'satisfaction' && (
        <div className="satisfaction-section">
          <div className="satisfaction-overview">
            <div className="satisfaction-meter">
              <h3>Team Satisfaction</h3>
              <div className="meter-display">
                <div className="meter-value">{averageSatisfaction.toFixed(1)}</div>
                <div className="meter-stars">{renderStars(Math.round(averageSatisfaction))}</div>
                <div className="meter-label">out of 5</div>
              </div>
            </div>

            <div className="satisfaction-distribution">
              <h4>Rating Distribution</h4>
              {[5, 4, 3, 2, 1].map(rating => {
                const count = activeEmployees.filter(e => e.satisfactionRating === rating).length;
                const percent = activeEmployees.length > 0 ? (count / activeEmployees.length) * 100 : 0;
                return (
                  <div key={rating} className="distribution-row">
                    <span className="rating-label">{rating} star{rating !== 1 ? 's' : ''}</span>
                    <div className="distribution-bar">
                      <div className="distribution-fill" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="satisfaction-list">
            <h3>Employee Satisfaction Ratings</h3>
            <div className="satisfaction-cards">
              {activeEmployees
                .sort((a, b) => b.satisfactionRating - a.satisfactionRating)
                .map(emp => (
                  <div key={emp.id} className={`satisfaction-card rating-${emp.satisfactionRating}`}>
                    <div className="sat-header">
                      <span className="emp-name">{emp.name}</span>
                      <span className="emp-role">{emp.role}</span>
                    </div>
                    <div className="sat-rating">
                      {renderStars(emp.satisfactionRating, true, (r) => updateSatisfaction(emp.id, r))}
                    </div>
                    {emp.performanceNotes && (
                      <p className="sat-notes">{emp.performanceNotes}</p>
                    )}
                    {emp.reviews.length > 0 && (
                      <div className="recent-review">
                        <span className="review-label">Last Review:</span>
                        <span className="review-date">{emp.reviews[emp.reviews.length - 1].date}</span>
                      </div>
                    )}
                    <button className="add-review-btn" onClick={() => {
                      setSelectedEmployee(emp);
                      setShowReviewModal(true);
                    }}>
                      <Award size={14} /> Add Review
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Employee Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="employee-form">
              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={employeeForm.name}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Role/Position *</label>
                    <input
                      type="text"
                      value={employeeForm.role}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                      placeholder="Sales Manager"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={employeeForm.email}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                      placeholder="john@company.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={employeeForm.phone}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Department</label>
                    <select
                      value={employeeForm.department}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                    >
                      <option value="">Select department</option>
                      {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={employeeForm.startDate}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, startDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={employeeForm.status}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, status: e.target.value as Employee['status'] })}
                  >
                    <option value="active">Active</option>
                    <option value="on-leave">On Leave</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h4>Compensation</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Pay Type</label>
                    <select
                      value={employeeForm.payType}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, payType: e.target.value as 'hourly' | 'salary' })}
                    >
                      <option value="salary">Salary</option>
                      <option value="hourly">Hourly</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{employeeForm.payType === 'salary' ? 'Salary Amount' : 'Hourly Rate'}</label>
                    <input
                      type="number"
                      value={employeeForm.payRate}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, payRate: e.target.value })}
                      placeholder={employeeForm.payType === 'salary' ? '5000' : '25'}
                    />
                  </div>
                </div>

                <div className="form-row">
                  {employeeForm.payType === 'salary' ? (
                    <div className="form-group">
                      <label>Pay Frequency</label>
                      <select
                        value={employeeForm.payFrequency}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, payFrequency: e.target.value as Employee['payFrequency'] })}
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>Hours per Week</label>
                      <input
                        type="number"
                        value={employeeForm.hoursPerWeek}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, hoursPerWeek: e.target.value })}
                        placeholder="40"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h4>Satisfaction & Performance</h4>
                <div className="form-group">
                  <label>Current Satisfaction Rating</label>
                  <div className="satisfaction-input">
                    {renderStars(employeeForm.satisfactionRating, true, (r) =>
                      setEmployeeForm({ ...employeeForm, satisfactionRating: r })
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>Performance Notes</label>
                  <textarea
                    value={employeeForm.performanceNotes}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, performanceNotes: e.target.value })}
                    placeholder="Notes about performance, areas of improvement, etc."
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={saveEmployeeData} disabled={!employeeForm.name || !employeeForm.role}>
                  <Save size={18} /> {editingEmployee ? 'Update' : 'Add'} Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Review Modal */}
      {showReviewModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Performance Review - {selectedEmployee.name}</h2>
              <button className="close-btn" onClick={() => setShowReviewModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="review-form">
              <div className="form-group">
                <label>Overall Rating</label>
                <div className="rating-input">
                  {renderStars(reviewForm.rating, true, (r) => setReviewForm({ ...reviewForm, rating: r }))}
                </div>
              </div>

              <div className="form-group">
                <label>Strengths</label>
                <textarea
                  value={reviewForm.strengths}
                  onChange={(e) => setReviewForm({ ...reviewForm, strengths: e.target.value })}
                  placeholder="What does this employee do well?"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Areas for Improvement</label>
                <textarea
                  value={reviewForm.improvements}
                  onChange={(e) => setReviewForm({ ...reviewForm, improvements: e.target.value })}
                  placeholder="What could they improve on?"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  value={reviewForm.notes}
                  onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
                  placeholder="Any other observations or notes..."
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={addPerformanceReview}>
                  <Save size={18} /> Save Review
                </button>
              </div>
            </div>

            {selectedEmployee.reviews.length > 0 && (
              <div className="past-reviews">
                <h4>Past Reviews</h4>
                {selectedEmployee.reviews
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(review => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <span className="review-date">{review.date}</span>
                        {renderStars(review.rating)}
                      </div>
                      {review.strengths && <p><strong>Strengths:</strong> {review.strengths}</p>}
                      {review.improvements && <p><strong>Improvements:</strong> {review.improvements}</p>}
                      {review.notes && <p><strong>Notes:</strong> {review.notes}</p>}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;

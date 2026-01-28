import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FileText, Download, Plus, Trash2, Edit2, Save, X, Send,
  DollarSign, Calendar, User, Building, FileCheck, Copy, Printer
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  dueDate: string;
  createdDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Proposal {
  id: string;
  title: string;
  clientName: string;
  content: string;
  createdDate: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
}

interface Contract {
  id: string;
  title: string;
  clientName: string;
  content: string;
  createdDate: string;
  status: 'draft' | 'sent' | 'signed';
}

const Documents: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  // Invoice form state
  const [invoiceForm, setInvoiceForm] = useState({
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    items: [{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }] as InvoiceItem[],
    tax: 0,
    dueDate: '',
    notes: ''
  });

  // Proposal form state
  const [proposalForm, setProposalForm] = useState({
    title: '',
    clientName: '',
    content: ''
  });

  // Contract form state
  const [contractForm, setContractForm] = useState({
    title: '',
    clientName: '',
    content: ''
  });

  useEffect(() => {
    const savedInvoices = localStorage.getItem(`expedium_invoices_${user?.id}`);
    const savedProposals = localStorage.getItem(`expedium_proposals_${user?.id}`);
    const savedContracts = localStorage.getItem(`expedium_contracts_${user?.id}`);

    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
    if (savedProposals) setProposals(JSON.parse(savedProposals));
    if (savedContracts) setContracts(JSON.parse(savedContracts));
  }, [user]);

  const saveInvoices = (newInvoices: Invoice[]) => {
    setInvoices(newInvoices);
    localStorage.setItem(`expedium_invoices_${user?.id}`, JSON.stringify(newInvoices));
  };

  const saveProposals = (newProposals: Proposal[]) => {
    setProposals(newProposals);
    localStorage.setItem(`expedium_proposals_${user?.id}`, JSON.stringify(newProposals));
  };

  const saveContracts = (newContracts: Contract[]) => {
    setContracts(newContracts);
    localStorage.setItem(`expedium_contracts_${user?.id}`, JSON.stringify(newContracts));
  };

  const generateInvoiceNumber = () => {
    const prefix = 'INV';
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  };

  const addInvoiceItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { id: Date.now().toString(), description: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const updateInvoiceItem = (id: string, field: string, value: string | number) => {
    const updatedItems = invoiceForm.items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.amount = updated.quantity * updated.rate;
        return updated;
      }
      return item;
    });
    setInvoiceForm({ ...invoiceForm, items: updatedItems });
  };

  const removeInvoiceItem = (id: string) => {
    if (invoiceForm.items.length > 1) {
      setInvoiceForm({
        ...invoiceForm,
        items: invoiceForm.items.filter(item => item.id !== id)
      });
    }
  };

  const calculateSubtotal = () => {
    return invoiceForm.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + (subtotal * invoiceForm.tax / 100);
  };

  const saveInvoice = () => {
    const subtotal = calculateSubtotal();
    const total = calculateTotal();

    const newInvoice: Invoice = {
      id: editingInvoice?.id || Date.now().toString(),
      invoiceNumber: editingInvoice?.invoiceNumber || generateInvoiceNumber(),
      clientName: invoiceForm.clientName,
      clientEmail: invoiceForm.clientEmail,
      clientAddress: invoiceForm.clientAddress,
      items: invoiceForm.items,
      subtotal,
      tax: invoiceForm.tax,
      total,
      dueDate: invoiceForm.dueDate,
      createdDate: editingInvoice?.createdDate || new Date().toISOString().split('T')[0],
      status: 'draft',
      notes: invoiceForm.notes
    };

    if (editingInvoice) {
      saveInvoices(invoices.map(inv => inv.id === editingInvoice.id ? newInvoice : inv));
    } else {
      saveInvoices([...invoices, newInvoice]);
    }

    resetInvoiceForm();
    setShowModal(false);
  };

  const saveProposal = () => {
    const newProposal: Proposal = {
      id: editingProposal?.id || Date.now().toString(),
      title: proposalForm.title,
      clientName: proposalForm.clientName,
      content: proposalForm.content,
      createdDate: editingProposal?.createdDate || new Date().toISOString().split('T')[0],
      status: 'draft'
    };

    if (editingProposal) {
      saveProposals(proposals.map(p => p.id === editingProposal.id ? newProposal : p));
    } else {
      saveProposals([...proposals, newProposal]);
    }

    resetProposalForm();
    setShowModal(false);
  };

  const saveContract = () => {
    const newContract: Contract = {
      id: editingContract?.id || Date.now().toString(),
      title: contractForm.title,
      clientName: contractForm.clientName,
      content: contractForm.content,
      createdDate: editingContract?.createdDate || new Date().toISOString().split('T')[0],
      status: 'draft'
    };

    if (editingContract) {
      saveContracts(contracts.map(c => c.id === editingContract.id ? newContract : c));
    } else {
      saveContracts([...contracts, newContract]);
    }

    resetContractForm();
    setShowModal(false);
  };

  const resetInvoiceForm = () => {
    setInvoiceForm({
      clientName: '',
      clientEmail: '',
      clientAddress: '',
      items: [{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }],
      tax: 0,
      dueDate: '',
      notes: ''
    });
    setEditingInvoice(null);
  };

  const resetProposalForm = () => {
    setProposalForm({ title: '', clientName: '', content: '' });
    setEditingProposal(null);
  };

  const resetContractForm = () => {
    setContractForm({ title: '', clientName: '', content: '' });
    setEditingContract(null);
  };

  const editInvoice = (invoice: Invoice) => {
    setInvoiceForm({
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      clientAddress: invoice.clientAddress,
      items: invoice.items,
      tax: invoice.tax,
      dueDate: invoice.dueDate,
      notes: invoice.notes
    });
    setEditingInvoice(invoice);
    setShowModal(true);
  };

  const deleteInvoice = (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      saveInvoices(invoices.filter(inv => inv.id !== id));
    }
  };

  const deleteProposal = (id: string) => {
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      saveProposals(proposals.filter(p => p.id !== id));
    }
  };

  const deleteContract = (id: string) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      saveContracts(contracts.filter(c => c.id !== id));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#6b7280';
      case 'sent': return '#3b82f6';
      case 'paid': case 'accepted': case 'signed': return '#10b981';
      case 'overdue': case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const printDocument = () => {
    window.print();
  };

  const proposalTemplates = [
    { name: 'Service Proposal', content: `Dear [Client Name],\n\nThank you for considering our services. We are excited to present this proposal for [Project Name].\n\n## Project Overview\n[Describe the project scope and objectives]\n\n## Our Approach\n[Outline your methodology and timeline]\n\n## Investment\n[Detail pricing and payment terms]\n\n## Why Choose Us\n[Highlight your unique value proposition]\n\nWe look forward to the opportunity to work with you.\n\nBest regards,\n${user?.name}\n${user?.company || ''}` },
    { name: 'Consulting Proposal', content: `Dear [Client Name],\n\nI appreciate the opportunity to submit this consulting proposal.\n\n## Understanding Your Needs\n[Summarize the client's challenges]\n\n## Proposed Solution\n[Detail your consulting approach]\n\n## Deliverables\n- [Deliverable 1]\n- [Deliverable 2]\n- [Deliverable 3]\n\n## Timeline & Investment\n[Outline the project timeline and fees]\n\nLooking forward to your response.\n\nBest regards,\n${user?.name}` }
  ];

  const contractTemplates = [
    { name: 'Service Agreement', content: `SERVICE AGREEMENT\n\nThis Service Agreement ("Agreement") is entered into between:\n\nProvider: ${user?.name} ${user?.company ? `(${user.company})` : ''}\nClient: [Client Name]\n\nEffective Date: [Date]\n\n1. SERVICES\nProvider agrees to perform the following services:\n[Describe services]\n\n2. COMPENSATION\nClient agrees to pay Provider:\n[Payment terms]\n\n3. TERM\nThis Agreement begins on [Start Date] and continues until [End Date].\n\n4. TERMINATION\nEither party may terminate with [X] days written notice.\n\n5. CONFIDENTIALITY\nBoth parties agree to maintain confidentiality of proprietary information.\n\nSignatures:\n\nProvider: ___________________ Date: ________\n\nClient: ___________________ Date: ________` },
    { name: 'Non-Disclosure Agreement', content: `NON-DISCLOSURE AGREEMENT\n\nThis NDA is entered into between:\n\nDisclosing Party: ${user?.name}\nReceiving Party: [Client Name]\n\nEffective Date: [Date]\n\n1. PURPOSE\nThe parties wish to explore a business opportunity requiring disclosure of confidential information.\n\n2. CONFIDENTIAL INFORMATION\nAll non-public information disclosed by either party.\n\n3. OBLIGATIONS\nThe Receiving Party agrees to:\n- Maintain confidentiality\n- Use information only for intended purpose\n- Not disclose to third parties\n\n4. TERM\nThis Agreement remains in effect for [X] years.\n\n5. RETURN OF INFORMATION\nUpon request, all confidential materials will be returned.\n\nSignatures:\n\nDisclosing Party: ___________________ Date: ________\n\nReceiving Party: ___________________ Date: ________` }
  ];

  return (
    <div className="documents-page">
      <div className="page-header">
        <FileText size={32} />
        <h1>Documents</h1>
        <p>Create and manage invoices, proposals, and contracts</p>
      </div>

      {/* Tabs */}
      <div className="doc-tabs">
        <button
          className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          <DollarSign size={18} /> Invoices ({invoices.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'proposals' ? 'active' : ''}`}
          onClick={() => setActiveTab('proposals')}
        >
          <FileCheck size={18} /> Proposals ({proposals.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'contracts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contracts')}
        >
          <FileText size={18} /> Contracts ({contracts.length})
        </button>
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="invoices-section">
          <div className="section-header">
            <h2>Your Invoices</h2>
            <button className="btn-primary" onClick={() => { resetInvoiceForm(); setShowModal(true); }}>
              <Plus size={18} /> Create Invoice
            </button>
          </div>

          {invoices.length > 0 ? (
            <div className="invoices-list">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="invoice-card">
                  <div className="invoice-header">
                    <div className="invoice-number">{invoice.invoiceNumber}</div>
                    <span className="status-badge" style={{ backgroundColor: `${getStatusColor(invoice.status)}20`, color: getStatusColor(invoice.status) }}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="invoice-details">
                    <div className="detail-row">
                      <User size={16} />
                      <span>{invoice.clientName}</span>
                    </div>
                    <div className="detail-row">
                      <Calendar size={16} />
                      <span>Due: {invoice.dueDate}</span>
                    </div>
                    <div className="detail-row">
                      <DollarSign size={16} />
                      <span className="invoice-total">{formatCurrency(invoice.total)}</span>
                    </div>
                  </div>
                  <div className="invoice-actions">
                    <button className="icon-btn" onClick={() => editInvoice(invoice)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="icon-btn" onClick={printDocument} title="Print">
                      <Printer size={16} />
                    </button>
                    <button className="icon-btn" onClick={() => deleteInvoice(invoice.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <DollarSign size={48} />
              <h3>No invoices yet</h3>
              <p>Create your first invoice to get started</p>
              <button className="btn-primary" onClick={() => { resetInvoiceForm(); setShowModal(true); }}>
                <Plus size={18} /> Create Invoice
              </button>
            </div>
          )}
        </div>
      )}

      {/* Proposals Tab */}
      {activeTab === 'proposals' && (
        <div className="proposals-section">
          <div className="section-header">
            <h2>Your Proposals</h2>
            <button className="btn-primary" onClick={() => { setActiveTab('proposals'); resetProposalForm(); setShowModal(true); }}>
              <Plus size={18} /> Create Proposal
            </button>
          </div>

          <div className="templates-section">
            <h3>Quick Start Templates</h3>
            <div className="templates-grid">
              {proposalTemplates.map((template, idx) => (
                <button
                  key={idx}
                  className="template-card"
                  onClick={() => {
                    setProposalForm({ title: template.name, clientName: '', content: template.content });
                    setShowModal(true);
                  }}
                >
                  <FileText size={24} />
                  <span>{template.name}</span>
                  <Copy size={16} />
                </button>
              ))}
            </div>
          </div>

          {proposals.length > 0 ? (
            <div className="proposals-list">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="proposal-card">
                  <div className="proposal-header">
                    <h4>{proposal.title}</h4>
                    <span className="status-badge" style={{ backgroundColor: `${getStatusColor(proposal.status)}20`, color: getStatusColor(proposal.status) }}>
                      {proposal.status}
                    </span>
                  </div>
                  <div className="proposal-meta">
                    <span><User size={14} /> {proposal.clientName}</span>
                    <span><Calendar size={14} /> {proposal.createdDate}</span>
                  </div>
                  <div className="proposal-actions">
                    <button className="icon-btn" onClick={() => {
                      setProposalForm({ title: proposal.title, clientName: proposal.clientName, content: proposal.content });
                      setEditingProposal(proposal);
                      setShowModal(true);
                    }}>
                      <Edit2 size={16} />
                    </button>
                    <button className="icon-btn" onClick={() => deleteProposal(proposal.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state small">
              <p>No proposals created yet</p>
            </div>
          )}
        </div>
      )}

      {/* Contracts Tab */}
      {activeTab === 'contracts' && (
        <div className="contracts-section">
          <div className="section-header">
            <h2>Your Contracts</h2>
            <button className="btn-primary" onClick={() => { resetContractForm(); setShowModal(true); }}>
              <Plus size={18} /> Create Contract
            </button>
          </div>

          <div className="templates-section">
            <h3>Contract Templates</h3>
            <div className="templates-grid">
              {contractTemplates.map((template, idx) => (
                <button
                  key={idx}
                  className="template-card"
                  onClick={() => {
                    setContractForm({ title: template.name, clientName: '', content: template.content });
                    setShowModal(true);
                  }}
                >
                  <FileText size={24} />
                  <span>{template.name}</span>
                  <Copy size={16} />
                </button>
              ))}
            </div>
          </div>

          {contracts.length > 0 ? (
            <div className="contracts-list">
              {contracts.map((contract) => (
                <div key={contract.id} className="contract-card">
                  <div className="contract-header">
                    <h4>{contract.title}</h4>
                    <span className="status-badge" style={{ backgroundColor: `${getStatusColor(contract.status)}20`, color: getStatusColor(contract.status) }}>
                      {contract.status}
                    </span>
                  </div>
                  <div className="contract-meta">
                    <span><User size={14} /> {contract.clientName}</span>
                    <span><Calendar size={14} /> {contract.createdDate}</span>
                  </div>
                  <div className="contract-actions">
                    <button className="icon-btn" onClick={() => {
                      setContractForm({ title: contract.title, clientName: contract.clientName, content: contract.content });
                      setEditingContract(contract);
                      setShowModal(true);
                    }}>
                      <Edit2 size={16} />
                    </button>
                    <button className="icon-btn" onClick={() => deleteContract(contract.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state small">
              <p>No contracts created yet</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {activeTab === 'invoices' && (editingInvoice ? 'Edit Invoice' : 'Create Invoice')}
                {activeTab === 'proposals' && (editingProposal ? 'Edit Proposal' : 'Create Proposal')}
                {activeTab === 'contracts' && (editingContract ? 'Edit Contract' : 'Create Contract')}
              </h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Invoice Form */}
            {activeTab === 'invoices' && (
              <div className="invoice-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Client Name</label>
                    <input
                      type="text"
                      value={invoiceForm.clientName}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, clientName: e.target.value })}
                      placeholder="Client name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Client Email</label>
                    <input
                      type="email"
                      value={invoiceForm.clientEmail}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, clientEmail: e.target.value })}
                      placeholder="client@email.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Client Address</label>
                  <input
                    type="text"
                    value={invoiceForm.clientAddress}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, clientAddress: e.target.value })}
                    placeholder="123 Main St, City, State"
                  />
                </div>

                <div className="invoice-items">
                  <h4>Line Items</h4>
                  {invoiceForm.items.map((item, idx) => (
                    <div key={item.id} className="item-row">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                        className="item-description"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="item-qty"
                      />
                      <input
                        type="number"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) => updateInvoiceItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="item-rate"
                      />
                      <span className="item-amount">{formatCurrency(item.amount)}</span>
                      <button className="remove-item-btn" onClick={() => removeInvoiceItem(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button className="add-item-btn" onClick={addInvoiceItem}>
                    <Plus size={16} /> Add Item
                  </button>
                </div>

                <div className="invoice-totals">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="total-row">
                    <span>Tax (%)</span>
                    <input
                      type="number"
                      value={invoiceForm.tax}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, tax: parseFloat(e.target.value) || 0 })}
                      className="tax-input"
                    />
                  </div>
                  <div className="total-row grand-total">
                    <span>Total</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={invoiceForm.dueDate}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={invoiceForm.notes}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                    placeholder="Payment terms, thank you message, etc."
                    rows={3}
                  />
                </div>

                <div className="form-actions">
                  <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn-primary" onClick={saveInvoice}>
                    <Save size={18} /> Save Invoice
                  </button>
                </div>
              </div>
            )}

            {/* Proposal Form */}
            {activeTab === 'proposals' && (
              <div className="proposal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Proposal Title</label>
                    <input
                      type="text"
                      value={proposalForm.title}
                      onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
                      placeholder="Project Proposal"
                    />
                  </div>
                  <div className="form-group">
                    <label>Client Name</label>
                    <input
                      type="text"
                      value={proposalForm.clientName}
                      onChange={(e) => setProposalForm({ ...proposalForm, clientName: e.target.value })}
                      placeholder="Client name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    value={proposalForm.content}
                    onChange={(e) => setProposalForm({ ...proposalForm, content: e.target.value })}
                    placeholder="Write your proposal content..."
                    rows={15}
                  />
                </div>

                <div className="form-actions">
                  <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn-primary" onClick={saveProposal}>
                    <Save size={18} /> Save Proposal
                  </button>
                </div>
              </div>
            )}

            {/* Contract Form */}
            {activeTab === 'contracts' && (
              <div className="contract-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Contract Title</label>
                    <input
                      type="text"
                      value={contractForm.title}
                      onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
                      placeholder="Service Agreement"
                    />
                  </div>
                  <div className="form-group">
                    <label>Client Name</label>
                    <input
                      type="text"
                      value={contractForm.clientName}
                      onChange={(e) => setContractForm({ ...contractForm, clientName: e.target.value })}
                      placeholder="Client name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Contract Content</label>
                  <textarea
                    value={contractForm.content}
                    onChange={(e) => setContractForm({ ...contractForm, content: e.target.value })}
                    placeholder="Write your contract terms..."
                    rows={15}
                  />
                </div>

                <div className="form-actions">
                  <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn-primary" onClick={saveContract}>
                    <Save size={18} /> Save Contract
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

export default Documents;

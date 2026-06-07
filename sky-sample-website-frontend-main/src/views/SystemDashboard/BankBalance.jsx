import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import api from '../../utils/api';
import '../../css/Dashboard.css';
import '../../css/BankBalance.css';
import '../../css/SystemSetup.css';

export default function BankBalance() {
    const { systemId } = useParams();
    const navigate = useNavigate();

    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal control states
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
    const [currentBank, setCurrentBank] = useState(null);

    // Form inputs
    const [formName, setFormName] = useState('');
    const [formBalance, setFormBalance] = useState('');
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/banks');
            setBanks(response.data);
        } catch (err) {
            console.error("Fetch banks failed", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                handleLocalLogout();
            } else {
                setError("Unable to load banks settings.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLocalLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    // Modal Triggers
    const openAddModal = () => {
        setModalType('add');
        setCurrentBank(null);
        setFormName('');
        setFormBalance('');
        setFormError('');
        setModalOpen(true);
    };

    const openEditModal = (bank) => {
        setModalType('edit');
        setCurrentBank(bank);
        setFormName(bank.name);
        setFormBalance(bank.balance);
        setFormError('');
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formName.trim()) {
            setFormError("Bank name is required.");
            return;
        }
        if (formBalance === '' || isNaN(formBalance) || Number(formBalance) < 0) {
            setFormError("A valid balance amount is required.");
            return;
        }

        setSaving(true);
        setFormError('');

        try {
            if (modalType === 'add') {
                const response = await api.post('/banks', {
                    name: formName,
                    balance: Number(formBalance)
                });
                setBanks([...banks, response.data]);
            } else {
                const response = await api.put(`/banks/${currentBank.id}`, {
                    name: formName,
                    balance: Number(formBalance)
                });
                setBanks(banks.map(b => b.id === currentBank.id ? response.data : b));
            }
            setModalOpen(false);
        } catch (err) {
            console.error("Save bank failed", err);
            setFormError("Failed to save bank records. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (bankId, bankName) => {
        if (!window.confirm(`Are you sure you want to delete "${bankName}"?`)) {
            return;
        }

        try {
            await api.delete(`/banks/${bankId}`);
            setBanks(banks.filter(b => b.id !== bankId));
        } catch (err) {
            console.error("Delete bank failed", err);
            alert("Unable to delete bank. Please try again.");
        }
    };

    const getFormattedValue = (value) => {
        return 'Rs. ' + Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', backgroundColor: 'var(--color-bg-primary)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--color-border-light)', borderTopColor: 'var(--color-accent-green)', margin: '0 auto 16px' }}></div>
                    <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>Loading bank settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="setup-container animate-fade-in" style={{ padding: '0px' }}>
            <Head title="Bank Balance Setup | Sky Smart" />

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                <Link to="/system-setup" style={{ color: 'var(--pallet-blue)', textDecoration: 'none' }}>System Setup</Link>
                <span style={{ margin: '0 8px' }}>›</span>
                <Link to={`/system-setup/${systemId || 1}`} style={{ color: 'var(--pallet-blue)', textDecoration: 'none' }}>Finance Setup</Link>
                <span style={{ margin: '0 8px' }}>›</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>Bank Balance</span>
            </div>

            <div className="setup-header-row" style={{ marginBottom: '24px' }}>
                <div className="title-group-header">
                    <h2 className="setup-title">Bank Balance</h2>
                    <p className="setup-subtitle">Manage configured financial institutions for system processing.</p>
                </div>
                <button className="add-system-btn" onClick={openAddModal} aria-label="Add Bank">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>

            {error && (
                <div className="error-alert">
                    {error}
                </div>
            )}

            <div className="bank-table-card">
                <div className="bank-table-header">
                    <span className="col-title institution-col">INSTITUTION NAME</span>
                    <span className="col-title balance-col">BALANCE</span>
                    <span className="col-title actions-col">ACTIONS</span>
                </div>

                <div className="bank-rows-container">
                    {banks.map((bank) => (
                        <div key={bank.id} className="bank-table-row">
                            <div className="bank-institution-info">
                                <div className="bank-icon-container">
                                    <svg className="bank-row-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
                                    </svg>
                                </div>
                                <span className="bank-row-name">{bank.name}</span>
                            </div>
                            
                            <span className="bank-row-balance">{getFormattedValue(bank.balance)}</span>

                            <div className="system-item-actions">
                                <button 
                                    className="action-icon-btn btn-edit" 
                                    onClick={() => openEditModal(bank)}
                                    aria-label="Edit Bank"
                                >
                                    <svg viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                                <button 
                                    className="action-icon-btn btn-delete" 
                                    onClick={() => handleDelete(bank.id, bank.name)}
                                    aria-label="Delete Bank"
                                >
                                    <svg viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}

                    {banks.length === 0 && !loading && (
                        <div className="no-banks-prompt">
                            No financial institutions configured. Click the "+" button to register a bank.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">
                            {modalType === 'add' ? 'Add Bank' : 'Edit Bank'}
                        </h3>
                        
                        <form onSubmit={handleSave}>
                            <div className="modal-form-group">
                                <label className="modal-label">Institution Name</label>
                                <input 
                                    type="text" 
                                    className="modal-input" 
                                    value={formName} 
                                    onChange={(e) => setFormName(e.target.value)} 
                                    placeholder="e.g. Commercial Bank"
                                />
                            </div>
                            
                            <div className="modal-form-group">
                                <label className="modal-label">Balance (Rs.)</label>
                                <input 
                                    type="number" 
                                    className="modal-input" 
                                    value={formBalance} 
                                    onChange={(e) => setFormBalance(e.target.value)} 
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            {formError && (
                                <div className="modal-error" style={{ marginBottom: '16px' }}>
                                    {formError}
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="modal-btn btn-cancel" onClick={() => setModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="modal-btn btn-save" disabled={saving}>
                                    {saving ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div className="btn-spinner"></div>
                                            <span>Saving...</span>
                                        </div>
                                    ) : (
                                        'Save Bank'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function Head({ title }) {
    useEffect(() => {
        document.title = title;
    }, [title]);
    return null;
}

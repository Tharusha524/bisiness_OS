import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import api from '../../utils/api';
import '../../css/Dashboard.css';
import '../../css/BankBalance.css';
import '../../css/SystemSetup.css';

export default function MetricDetails() {
    const { id: systemId, metricId } = useParams();
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [metric, setMetric] = useState(null);
    const [system, setSystem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal control states
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
    const [currentItem, setCurrentItem] = useState(null);

    // Form inputs
    const [formName, setFormName] = useState('');
    const [formValue, setFormValue] = useState('');
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [metricId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [systemRes, metricsRes, itemsRes] = await Promise.all([
                api.get(`/systems/${systemId}`),
                api.get(`/systems/${systemId}/metrics`),
                api.get(`/metrics/${metricId}/items`)
            ]);
            
            setSystem(systemRes.data);
            const currentMetric = metricsRes.data.find(m => m.id === Number(metricId));
            setMetric(currentMetric);
            setItems(itemsRes.data);
        } catch (err) {
            console.error("Fetch items failed", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                handleLocalLogout();
            } else {
                setError("Unable to load metric subcategories.");
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
        setCurrentItem(null);
        setFormName('');
        setFormValue('');
        setFormError('');
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setModalType('edit');
        setCurrentItem(item);
        setFormName(item.name);
        setFormValue(item.value);
        setFormError('');
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formName.trim()) {
            setFormError("Subcategory name is required.");
            return;
        }
        if (formValue === '' || isNaN(formValue) || Number(formValue) < 0) {
            setFormError("A valid number is required for the value.");
            return;
        }

        setSaving(true);
        setFormError('');

        try {
            if (modalType === 'add') {
                const response = await api.post(`/metrics/${metricId}/items`, {
                    name: formName,
                    value: Number(formValue)
                });
                setItems([...items, response.data]);
            } else {
                const response = await api.put(`/metrics/${metricId}/items/${currentItem.id}`, {
                    name: formName,
                    value: Number(formValue)
                });
                setItems(items.map(i => i.id === currentItem.id ? response.data : i));
            }
            setModalOpen(false);
        } catch (err) {
            console.error("Save item failed", err);
            setFormError("Failed to save subcategory. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (itemId, itemName) => {
        if (!window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
            return;
        }

        try {
            await api.delete(`/metrics/${metricId}/items/${itemId}`);
            setItems(items.filter(i => i.id !== itemId));
        } catch (err) {
            console.error("Delete item failed", err);
            alert("Unable to delete subcategory. Please try again.");
        }
    };

    const getFormattedValue = (value) => {
        const numValue = Number(value);
        if (metric && metric.type) {
            if (metric.type.toLowerCase() === 'currency') {
                return 'Rs. ' + numValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
            } else if (metric.type.toLowerCase() === 'percentage') {
                return numValue + '%';
            }
        }
        return numValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', backgroundColor: 'var(--color-bg-primary)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--color-border-light)', borderTopColor: 'var(--color-accent-green)', margin: '0 auto 16px' }}></div>
                    <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>Loading settings...</p>
                </div>
            </div>
        );
    }

    const title = metric ? metric.name : 'Metric Details';

    return (
        <div className="setup-container animate-fade-in" style={{ padding: '0px' }}>
            <Head title={`${title} | Sky Smart`} />

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                <Link to="/system-setup" style={{ color: 'var(--pallet-blue)', textDecoration: 'none' }}>System Setup</Link>
                <span style={{ margin: '0 8px' }}>›</span>
                <Link to={`/system-setup/${systemId}`} style={{ color: 'var(--pallet-blue)', textDecoration: 'none' }}>{system ? system.name : 'System Setup'}</Link>
                <span style={{ margin: '0 8px' }}>›</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{title}</span>
            </div>

            <div className="setup-header-row" style={{ marginBottom: '24px' }}>
                <div className="title-group-header">
                    <h2 className="setup-title">{title}</h2>
                    <p className="setup-subtitle">Manage subcategories for this metric.</p>
                </div>
                <button className="add-system-btn" onClick={openAddModal} aria-label="Add Subcategory">
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
                    <span className="col-title institution-col">SUBCATEGORY NAME</span>
                    <span className="col-title balance-col">VALUE</span>
                    <span className="col-title actions-col">ACTIONS</span>
                </div>

                <div className="bank-rows-container">
                    {items.map((item) => (
                        <div key={item.id} className="bank-table-row">
                            <div className="bank-institution-info">
                                <div className="bank-icon-container">
                                    <svg className="bank-row-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                                    </svg>
                                </div>
                                <span className="bank-row-name">{item.name}</span>
                            </div>
                            
                            <span className="bank-row-balance">{getFormattedValue(item.value)}</span>

                            <div className="system-item-actions">
                                <button 
                                    className="action-icon-btn btn-edit" 
                                    onClick={() => openEditModal(item)}
                                    aria-label="Edit Subcategory"
                                >
                                    <svg viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                                <button 
                                    className="action-icon-btn btn-delete" 
                                    onClick={() => handleDelete(item.id, item.name)}
                                    aria-label="Delete Subcategory"
                                >
                                    <svg viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}

                    {items.length === 0 && !loading && (
                        <div className="no-banks-prompt">
                            No subcategories configured. Click the "+" button to add a subcategory.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">
                            {modalType === 'add' ? 'Add Subcategory' : 'Edit Subcategory'}
                        </h3>
                        
                        <form onSubmit={handleSave}>
                            <div className="modal-form-group">
                                <label className="modal-label">Subcategory Name</label>
                                <input 
                                    type="text" 
                                    className="modal-input" 
                                    value={formName} 
                                    onChange={(e) => setFormName(e.target.value)} 
                                    placeholder="e.g. New Subcategory"
                                />
                            </div>
                            
                            <div className="modal-form-group">
                                <label className="modal-label">Value {metric?.type?.toLowerCase() === 'currency' ? '(Rs.)' : metric?.type?.toLowerCase() === 'percentage' ? '(%)' : ''}</label>
                                <input 
                                    type="number" 
                                    className="modal-input" 
                                    value={formValue} 
                                    onChange={(e) => setFormValue(e.target.value)} 
                                    placeholder="0"
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
                                        'Save Subcategory'
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

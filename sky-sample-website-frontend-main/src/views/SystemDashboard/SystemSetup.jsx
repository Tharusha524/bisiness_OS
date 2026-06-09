import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import api from '../../utils/api';
import useCurrentUser from '../../hooks/useCurrentUser';
import '../../css/Dashboard.css';
import '../../css/SystemSetup.css';

export default function SystemSetup() {
    const [systems, setSystems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useCurrentUser();
    
    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
    const [currentSystem, setCurrentSystem] = useState(null);
    const [formName, setFormName] = useState('');
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchSystems();
    }, []);

    const fetchSystems = async () => {
        try {
            const response = await api.get('/systems');
            setSystems(response.data);
        } catch (err) {
            console.error("Fetch systems failed", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                handleLocalLogout();
            } else {
                setError("Unable to retrieve systems list.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLocalLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    // Modal control
    const openAddModal = () => {
        setModalType('add');
        setCurrentSystem(null);
        setFormName('');
        setFormError('');
        setModalOpen(true);
    };

    const openEditModal = (system) => {
        setModalType('edit');
        setCurrentSystem(system);
        setFormName(system.name);
        setFormError('');
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formName.trim()) {
            setFormError("System name is required.");
            return;
        }

        setSaving(true);
        setFormError('');

        try {
            if (modalType === 'add') {
                const response = await api.post('/systems', {
                    name: formName
                });
                setSystems([...systems, response.data]);
            } else {
                const response = await api.put(`/systems/${currentSystem.id}`, {
                    name: formName
                });
                setSystems(systems.map(s => s.id === currentSystem.id ? response.data : s));
            }
            setModalOpen(false);
        } catch (err) {
            console.error("Save system failed", err);
            if (err.response && err.response.status === 422) {
                setFormError(err.response.data.errors.name[0]);
            } else {
                setFormError("An error occurred. Please try again.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (systemId, systemName) => {
        if (!window.confirm(`Are you sure you want to delete the "${systemName}" system?`)) {
            return;
        }

        try {
            await api.delete(`/systems/${systemId}`);
            setSystems(systems.filter(s => s.id !== systemId));
        } catch (err) {
            console.error("Delete system failed", err);
            alert("Unable to delete system. Please try again.");
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', backgroundColor: 'var(--color-bg-primary)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--color-border-light)', borderTopColor: 'var(--color-accent-green)', margin: '0 auto 16px' }}></div>
                    <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>Loading systems settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="setup-container animate-fade-in" style={{ padding: '0px' }}>
            <Head title="System Setup | BizOS" />

            <div className="setup-header-row" style={{ marginBottom: '24px' }}>
                <h2 className="setup-title">Systems</h2>
                <button className="add-system-btn" onClick={openAddModal} aria-label="Add System">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>

            {error && (
                <div style={{ color: 'var(--color-text-red)', backgroundColor: 'var(--color-bg-metric-red)', padding: '14px 20px', borderRadius: '8px', marginBottom: '20px', fontWeight: 600 }}>
                    {error}
                </div>
            )}

            <div className="systems-list-col">
                {systems.map((system) => (
                    <div 
                        key={system.id} 
                        className="system-list-item-card"
                        onClick={() => navigate(`/system-setup/${system.id}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="system-accent-bar"></div>
                        <span className="system-item-name">{system.name}</span>
                        
                        <div className="system-item-actions" onClick={(e) => e.stopPropagation()}>
                            <button 
                                className="action-icon-btn btn-edit" 
                                onClick={() => openEditModal(system)}
                                aria-label="Edit System"
                            >
                                <svg viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            <button 
                                className="action-icon-btn btn-delete" 
                                onClick={() => handleDelete(system.id, system.name)}
                                aria-label="Delete System"
                            >
                                <svg viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}

                {systems.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                        No systems configured. Click the "+" button to add one.
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">
                            {modalType === 'add' ? 'Add New System' : 'Edit System'}
                        </h3>
                        
                        <form onSubmit={handleSave}>
                            <div className="modal-form-group">
                                <label className="modal-label" htmlFor="systemName">System Name</label>
                                <input
                                    className="modal-input"
                                    type="text"
                                    id="systemName"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="e.g. Human Resources"
                                    required
                                    autoFocus
                                />
                                {formError && <div className="modal-error">{formError}</div>}
                            </div>
                            
                            <div className="modal-actions">
                                <button 
                                    className="modal-btn btn-cancel" 
                                    type="button" 
                                    onClick={() => setModalOpen(false)}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="modal-btn btn-save" 
                                    type="submit" 
                                    disabled={saving}
                                >
                                    {saving ? <div className="btn-spinner"></div> : 'Save'}
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
        document.title = "BizOS";
    }, [title]);
    return null;
}

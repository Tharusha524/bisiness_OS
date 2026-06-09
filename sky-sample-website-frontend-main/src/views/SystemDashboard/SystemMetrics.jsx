import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import api from '../../utils/api';
import '../../css/Dashboard.css';
import '../../css/SystemMetrics.css';

// Helper to render icons — supports Font Awesome (fa-*) and legacy SVG keys
export function getMetricIcon(iconName, className = "metric-icon") {
    if (iconName && iconName.startsWith('iconify:')) {
        const iconKey = iconName.replace('iconify:', '');
        return (
            <img
                src={`https://api.iconify.design/${iconKey}.svg?color=%230f172a`}
                alt={iconKey}
                className={className}
                width={22}
                height={22}
                loading="lazy"
            />
        );
    }
    if (iconName && iconName.startsWith('fa-')) {
        return <i className={`fa-solid ${iconName} ${className}`} style={{ fontSize: '1.4rem' }}></i>;
    }
    switch (iconName) {
        case 'wallet':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11h.01M3 10h18M16 14h2a2 2 0 002-2v0a2 2 0 00-2-2h-2v4z" />
                </svg>
            );
        case 'card':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h.01M11 15h2" />
                </svg>
            );
        case 'bank':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
                </svg>
            );
        case 'dollar':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16c1.657 0 3-.895 3-2s-1.343-2-3-2-3 .895-3 2 1.343 2 3 2z" />
                </svg>
            );
        case 'alert':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            );
        case 'clock':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                </svg>
            );
        case 'check':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        case 'safety':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            );
        case 'chart':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
            );
        default:
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
    }
}

const AVAILABLE_ICONS = [
    { key: 'wallet', label: 'Wallet' },
    { key: 'card', label: 'Credit Card' },
    { key: 'bank', label: 'Bank' },
    { key: 'dollar', label: 'Dollar' },
    { key: 'alert', label: 'Alert' },
    { key: 'clock', label: 'Clock' },
    { key: 'check', label: 'Check' },
    { key: 'safety', label: 'Safety' },
    { key: 'chart', label: 'Chart' }
];

export default function SystemMetrics() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [system, setSystem] = useState(null);
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSystemAndMetrics();
    }, [id]);

    const fetchSystemAndMetrics = async () => {
        try {
            setLoading(true);
            const systemRes = await api.get(`/systems/${id}`);
            setSystem(systemRes.data);

            const metricsRes = await api.get(`/systems/${id}/metrics`);
            setMetrics(metricsRes.data);
        } catch (err) {
            console.error("Fetch system or metrics failed", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                handleLocalLogout();
            } else {
                setError("Unable to load metrics settings. Please ensure the backend is active.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLocalLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };


    const handleDelete = async (metricId, metricName) => {
        if (!window.confirm(`Are you sure you want to delete the "${metricName}" metric?`)) {
            return;
        }

        try {
            await api.delete(`/metrics/${metricId}`);
            setMetrics(metrics.filter(m => m.id !== metricId));
        } catch (err) {
            console.error("Delete metric failed", err);
            alert("Unable to delete metric. Please try again.");
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', backgroundColor: 'var(--color-bg-primary)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--color-border-light)', borderTopColor: 'var(--color-accent-green)', margin: '0 auto 16px' }}></div>
                    <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>Loading system metrics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="setup-container animate-fade-in" style={{ padding: '0px' }}>
            <Head title={`${system?.name || 'System'} Setup | BizOS`} />

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                <Link to="/system-setup" style={{ color: 'var(--pallet-blue)', textDecoration: 'none' }}>System Setup</Link>
                <span style={{ margin: '0 8px' }}>›</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{system?.name}</span>
            </div>

            <div className="setup-header-row" style={{ marginBottom: '24px' }}>
                <div className="title-group-header">
                    <h2 className="setup-title">{system?.name} - KPI setup</h2>
                    <p className="setup-subtitle">Manage metrics displayed in the live system dashboard card.</p>
                </div>
                <button className="add-system-btn" onClick={() => navigate(`/system-setup/${id}/metrics/create`)} aria-label="Add Metric">
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

            <div className="metrics-list-col">
                {metrics.map((metric) => {
                    return (
                        <div 
                            key={metric.id} 
                            className="metric-list-item-card clickable-metric-card"
                            onClick={() => navigate(`/system-setup/${id}/metrics/${metric.id}/details`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="metric-accent-bar"></div>
                            
                            <div className="metric-card-left">
                                <div className="metric-icon-wrapper">
                                    {getMetricIcon(metric.icon)}
                                </div>
                                <div className="metric-text-details">
                                    <span className="metric-card-label">{metric.name}</span>
                                    <span className="metric-card-value">{metric.value || '—'}</span>
                                </div>
                            </div>
                            
                            <div className="system-item-actions" onClick={(e) => e.stopPropagation()}>
                                <button 
                                    className="action-icon-btn btn-edit" 
                                    onClick={() => navigate(`/system-setup/${id}/metrics/${metric.id}/edit`)}
                                    aria-label="Edit Metric"
                                >
                                    <svg viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                                <button 
                                    className="action-icon-btn btn-delete" 
                                    onClick={() => handleDelete(metric.id, metric.name)}
                                    aria-label="Delete Metric"
                                >
                                    <svg viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ); 
                })}

                {metrics.length === 0 && !loading && (
                    <div className="no-metrics-prompt">
                        No metrics configured for this system. Click the "+" button to define a new metric.
                    </div>
                )}
            </div>
        </div>
    );
}

function Head({ title }) {
    useEffect(() => {
        document.title = "BizOS";
    }, [title]);
    return null;
}

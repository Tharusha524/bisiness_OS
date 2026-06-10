import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import useCurrentUser from '../../hooks/useCurrentUser';
import { PermissionKeys } from '../Administration/SectionList';
import CustomPageHistory from '../CustomPage/CustomPageHistory';
import '../../css/Dashboard.css';

export default function Dashboard() {
    const [systems, setSystems] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const { user } = useCurrentUser();
    const queryClient = useQueryClient();
    
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Redirect to preferred system if user has a default set
        if (user?.defaultSystemView) {
            navigate(`/system-details/${user.defaultSystemView}`, { replace: true });
            return;
        }

        setLoading(true);
        setSystems(null);

        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/dashboard');
                setSystems(response.data.systems);
            } catch (err) {
                console.error("Fetch dashboard failed", err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    handleLocalLogout();
                } else {
                    setError("Unable to retrieve systems overview. Please check if backend is running.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user?.defaultSystemView, location.pathname]);

    const handleLocalLogout = () => {
        localStorage.removeItem('token');
        queryClient.clear();
        navigate('/');
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', backgroundColor: 'var(--color-bg-primary)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--color-border-light)', borderTopColor: 'var(--color-accent-green)', margin: '0 auto 16px' }}></div>
                    <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>Loading Sky Smart systems...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', backgroundColor: 'var(--color-bg-primary)', padding: '20px' }}>
                <div style={{ background: 'var(--color-bg-card)', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    <svg style={{ color: 'var(--color-text-red)', width: '48px', height: '48px', marginBottom: '16px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 style={{ marginBottom: '8px', color: 'var(--color-text-primary)' }}>Connection Error</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>{error}</p>
                    <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', backgroundColor: 'var(--color-accent-green)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Retry Connection</button>
                    <button onClick={handleLocalLogout} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: 'none', textDecoration: 'underline', cursor: 'pointer', marginTop: '10px', display: 'block', width: '100%' }}>Back to Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container animate-fade-in" style={{ padding: '0px' }}>
            <Head title="System Overview | BizOS" />

            <div className="dashboard-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 className="dashboard-title">System Overview</h2>
                    <p className="dashboard-subtitle">view KPI records</p>
                </div>
            </div>

            {showHistoryModal && (
                <CustomPageHistory onClose={() => setShowHistoryModal(false)} />
            )}

            {systems && (
                <div className="systems-grid">
                    {systems.filter(system => {
                        const isAdmin = user?.permissionObject?.['SYSTEM_SETUP_EDIT'];
                        if (isAdmin) return true;
                        const hasSystemView = user?.permissionObject?.[`SYSTEM_${system.id}_VIEW`];
                        const hasAnyKpiView = system.metrics?.some(m => user?.permissionObject?.[`KPI_${m.id}_VIEW`]);
                        const hasBadgeView = system.badge?.metricId ? user?.permissionObject?.[`KPI_${system.badge.metricId}_VIEW`] : false;
                        const hasAlertView = system.alert?.metricId ? user?.permissionObject?.[`KPI_${system.alert.metricId}_VIEW`] : false;
                        return hasSystemView || hasAnyKpiView || hasBadgeView || hasAlertView;
                    }).map((system) => {
                        const isAdmin = user?.permissionObject?.['SYSTEM_SETUP_EDIT'];
                        const visibleMetrics = system.metrics ? system.metrics.filter(metric => isAdmin || user?.permissionObject?.[`KPI_${metric.id}_VIEW`]) : [];
                        const showBadge = system.badge?.metricId ? (isAdmin || !!user?.permissionObject?.[`KPI_${system.badge.metricId}_VIEW`]) : false;
                        const showAlert = system.alert?.metricId ? (isAdmin || !!user?.permissionObject?.[`KPI_${system.alert.metricId}_VIEW`]) : false;
                        return (
                        <div key={system.id} className="system-card">
                            <div className="card-header">
                                <div className="card-title-group">
                                    {system.type === 'finance' && (
                                        <svg className="card-title-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    )}
                                    {system.type === 'stores' && (
                                        <svg className="card-title-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    )}
                                    {system.type === 'healthSafety' && (
                                        <svg className="card-title-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    )}
                                    {system.type === 'maintenance' && (
                                        <svg className="card-title-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                    {system.type === 'default' && (
                                        <svg className="card-title-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                    <h3 className="card-title">{system.name}</h3>
                                </div>
                            </div>
                            <div className="card-body">
                                {system.type === 'finance' && (
                                    <>
                                        <div className="metrics-grid-2x2">
                                            {visibleMetrics
                                                .map((metric, idx) => (
                                                <div key={idx} className="metric-block" style={{ position: 'relative' }}>
                                                    <span className="metric-label">{metric.label}</span>
                                                    <span className="metric-value" style={metric.status === 'red' ? { color: '#ef4444' } : undefined}>{metric.value}</span>
                                                    {metric.note && (
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '6px', fontStyle: 'italic', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.2' }}>
                                                            * {metric.note}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {showBadge && system.badge && (
                                            <div className="banner banner-danger" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div>
                                                    <span className="banner-label">{system.badge.label}</span>
                                                    <span className="banner-value">{system.badge.value}</span>
                                                </div>
                                                {system.badge.note && (
                                                    <div style={{ fontSize: '0.85rem', color: '#991b1b', marginTop: '8px', fontStyle: 'italic', wordBreak: 'break-word', whiteSpace: 'normal', textAlign: 'center' }}>
                                                        * {system.badge.note}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {system.type === 'stores' && (
                                    <>
                                        {showAlert && system.alert && (
                                            <div className="alert-banner" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                    <div className="alert-message">
                                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        {system.alert.label}
                                                    </div>
                                                    <span className="alert-value">{system.alert.value}</span>
                                                </div>
                                                {system.alert.note && (
                                                    <div style={{ fontSize: '0.85rem', color: '#0f766e', fontStyle: 'italic', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                                                        * {system.alert.note}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {visibleMetrics.length > 0 ? (
                                            <div className="metrics-grid-2x2">
                                                {visibleMetrics.map((metric, idx) => (
                                                    <div key={idx} className="metric-block" style={{ position: 'relative' }}>
                                                        <span className="metric-label">{metric.label}</span>
                                                        <span className="metric-value">{metric.value}</span>
                                                        {metric.note && (
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '6px', fontStyle: 'italic', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.2' }}>
                                                                * {metric.note}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="optimal-container">
                                                {system.status}
                                            </div>
                                        )}
                                    </>
                                )}

                                {system.type === 'healthSafety' && (
                                    <>
                                        {showBadge && system.badge && (
                                            <div className="banner banner-info" style={{ padding: '16px 20px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div>
                                                    <span className="banner-label">{system.badge.label}</span>
                                                    <span className="banner-value" style={{ fontSize: '1.35rem' }}>{system.badge.value}</span>
                                                </div>
                                                {system.badge.note && (
                                                    <div style={{ fontSize: '0.85rem', color: '#1e3a8a', marginTop: '8px', fontStyle: 'italic', wordBreak: 'break-word', whiteSpace: 'normal', textAlign: 'center' }}>
                                                        * {system.badge.note}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="metric-block" style={{ position: 'relative' }}>
                                            {visibleMetrics && visibleMetrics.length > 0 && (
                                                <>
                                                    <span className="metric-label">{visibleMetrics[0].label}</span>
                                                    <span className="metric-value">{visibleMetrics[0].value}</span>
                                                    {visibleMetrics[0].note && (
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '6px', fontStyle: 'italic', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.2' }}>
                                                            * {visibleMetrics[0].note}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}

                                {system.type === 'maintenance' && (
                                    <>
                                        <div className="metrics-grid-2x2">
                                            {visibleMetrics.map((metric, idx) => (
                                                <div key={idx} className="metric-block" style={{ position: 'relative' }}>
                                                    <span className="metric-label">{metric.label}</span>
                                                    <span className="metric-value" style={metric.status === 'red' ? { color: '#ef4444' } : undefined}>{metric.value}</span>
                                                    {metric.note && (
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '6px', fontStyle: 'italic', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.2' }}>
                                                            * {metric.note}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {system.type === 'default' && (
                                    <>
                                        <div className="metrics-grid-2x2">
                                            {visibleMetrics.map((metric, idx) => (
                                                <div key={idx} className="metric-block" style={{ position: 'relative' }}>
                                                    <span className="metric-label">{metric.label}</span>
                                                    <span className="metric-value" style={metric.status === 'red' ? { color: '#ef4444' } : undefined}>{metric.value}</span>
                                                    {metric.note && (
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '6px', fontStyle: 'italic', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.2' }}>
                                                            * {metric.note}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="optimal-container" style={{ padding: '24px 0' }}>
                                            {system.status}
                                        </div>
                                    </>
                                )}

                                <button 
                                    className="card-action-btn"
                                    onClick={() => navigate(`/system-details/${system.id}`)}
                                >
                                    View Details
                                    <svg viewBox="0 0 24 24">
                                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        );
                    })}
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

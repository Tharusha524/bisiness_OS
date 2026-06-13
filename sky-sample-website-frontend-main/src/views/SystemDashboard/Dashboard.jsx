import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import useCurrentUser from '../../hooks/useCurrentUser';
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
                        return hasSystemView || hasAnyKpiView;
                    }).map((system) => {
                        const isAdmin = user?.permissionObject?.['SYSTEM_SETUP_EDIT'];
                        const visibleMetrics = system.metrics ? system.metrics.filter(metric => isAdmin || user?.permissionObject?.[`KPI_${metric.id}_VIEW`]) : [];
                        return (
                        <div key={system.id} className="system-card">
                            <div className="card-header">
                                <div className="card-title-group">
                                    <svg className="card-title-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <h3 className="card-title">{system.name}</h3>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="metrics-grid-2x2">
                                    {visibleMetrics.map((metric, idx) => (
                                        <div key={idx} className="metric-block" style={{ position: 'relative' }}>
                                            <span className="metric-label">{metric.label}</span>
                                            <span className="metric-value" style={metric.status === 'red' ? { color: '#ef4444' } : undefined}>
                                                {metric.value}
                                            </span>
                                            {metric.note && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '6px', fontStyle: 'italic', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.2' }}>
                                                    * {metric.note}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
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

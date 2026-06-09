import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import api from '../../utils/api';
import useCurrentUser from '../../hooks/useCurrentUser';
import '../../css/Dashboard.css';
import '../../css/SystemMetrics.css';
import { getMetricIcon } from '../SystemDashboard/SystemMetrics';

export default function UserInputMetrics() {
    const { systemId } = useParams();
    const navigate = useNavigate();
    const { user } = useCurrentUser();
    
    const [system, setSystem] = useState(null);
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sysRes, metRes] = await Promise.all([
                    api.get(`/systems/${systemId}`),
                    api.get(`/systems/${systemId}/metrics`)
                ]);
                setSystem(sysRes.data);
                setMetrics(metRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [systemId]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(15, 60, 43, 0.1)', borderTopColor: '#154c37' }}></div>
            </div>
        );
    }

    return (
        <div className="setup-container animate-fade-in" style={{ padding: '0px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                <Link to="/user-input" style={{ color: 'var(--pallet-blue)', textDecoration: 'none' }}>Data Entry</Link>
                <span style={{ margin: '0 8px' }}>›</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{system?.name}</span>
            </div>

            <div className="setup-header-row">
                <div className="title-group-header">
                    <h2 className="setup-title">{system?.name} KPIs</h2>
                    <p className="setup-subtitle">Select a KPI to input values.</p>
                </div>
            </div>

            <div className="metrics-list-col">
                {metrics.filter(metric => user?.permissionObject?.['SYSTEM_SETUP_EDIT'] || user?.permissionObject?.[`KPI_${metric.id}_EDIT`]).map((metric) => (
                    <div 
                        key={metric.id} 
                        className="metric-list-item-card clickable-metric-card"
                        onClick={() => navigate(`/user-input/${systemId}/metrics/${metric.id}/input`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="metric-accent-bar"></div>
                        <div className="metric-icon-box">
                            {getMetricIcon(metric.icon)}
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', marginLeft: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{metric.name}</h3>
                                <span style={{ padding: '2px 8px', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-muted)', fontSize: '0.75rem', borderRadius: '12px', fontWeight: 500 }}>
                                    {metric.type || 'Number'}
                                </span>
                            </div>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Click to input new data</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

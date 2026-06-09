import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import api from '../../utils/api';
import useCurrentUser from '../../hooks/useCurrentUser';
import '../../css/Dashboard.css';
import '../../css/SystemSetup.css';

// Helper to analyze the status
function analyzeKpiStatus(metric) {
    if (!metric.value) return 'grey';

    // Extract numeric value, ignore Rs. % and commas
    const rawValStr = metric.value.replace(/[^0-9.-]+/g, '');
    const rawVal = parseFloat(rawValStr);

    if (isNaN(rawVal)) return 'grey';

    let rule = null;
    try {
        rule = metric.rule ? JSON.parse(metric.rule) : null;
    } catch (e) {
        return 'grey';
    }

    if (!rule || !rule.type || rule.type === 'None' || !rule.config) return 'grey';

    const config = rule.config;

    if (rule.type === 'Min') {
        const minVal = parseFloat(config.value);
        const warningVal = config.warning ? parseFloat(config.warning) : null;
        if (rawVal < minVal) return 'red';
        if (warningVal !== null && rawVal <= warningVal) return 'orange';
        return 'green';
    }

    if (rule.type === 'Max') {
        const maxVal = parseFloat(config.value);
        const warningVal = config.warning ? parseFloat(config.warning) : null;
        if (rawVal > maxVal) return 'red';
        if (warningVal !== null && rawVal >= warningVal) return 'orange';
        return 'green';
    }

    if (rule.type === 'Range') {
        const minVal = parseFloat(config.min);
        const maxVal = parseFloat(config.max);
        if (rawVal < minVal || rawVal > maxVal) return 'red';
        return 'green';
    }

    if (rule.type === 'Target') {
        const goal = parseFloat(config.value);
        if (goal === 0) return 'grey';
        const percentage = (rawVal / goal) * 100;
        if (percentage < 80) return 'red';
        if (percentage < 100) return 'orange';
        return 'green';
    }

    return 'grey';
}

const getStatusText = (status) => {
    switch(status) {
        case 'green': return 'SAFE';
        case 'orange': return 'WARNING';
        case 'red': return 'CRITICAL';
        default: return 'UNCONFIGURED';
    }
};

export default function Report() {
    const [systems, setSystems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useCurrentUser();

    const [filterSystem, setFilterSystem] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/systems');
            setSystems(response.data);
        } catch (err) {
            console.error(err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                localStorage.removeItem('token');
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    const allMetrics = useMemo(() => {
        let metricsList = [];
        const isAdmin = user?.permissionObject?.['SYSTEM_SETUP_EDIT'];
        systems.filter(sys => isAdmin || user?.permissionObject?.[`SYSTEM_${sys.id}_VIEW`]).forEach(sys => {
            (sys.metrics || []).filter(m => isAdmin || user?.permissionObject?.[`KPI_${m.id}_VIEW`]).forEach(m => {
                metricsList.push({
                    ...m,
                    systemName: sys.name,
                    status: analyzeKpiStatus(m)
                });
            });
        });
        return metricsList;
    }, [systems, user]);

    const filteredMetrics = useMemo(() => {
        return allMetrics.filter(m => {
            const matchSystem = filterSystem === 'All' || m.systemName === filterSystem;
            const matchStatus = filterStatus === 'All' || m.status === filterStatus;
            return matchSystem && matchStatus;
        });
    }, [allMetrics, filterSystem, filterStatus]);

    const stats = useMemo(() => {
        return {
            total: allMetrics.length,
            green: allMetrics.filter(m => m.status === 'green').length,
            orange: allMetrics.filter(m => m.status === 'orange').length,
            red: allMetrics.filter(m => m.status === 'red').length,
        };
    }, [allMetrics]);

    const downloadCSV = () => {
        const headers = ["System", "KPI Name", "Current Value", "Applied Rule", "Status"];
        const rows = filteredMetrics.map(m => {
            let ruleDisplay = 'None';
            try {
                if (m.rule) {
                    const r = JSON.parse(m.rule);
                    if (r.type === 'Min') ruleDisplay = `Min: ${r.config.value}${r.config.warning ? ` (Warn: ${r.config.warning})` : ''}`;
                    else if (r.type === 'Max') ruleDisplay = `Max: ${r.config.value}${r.config.warning ? ` (Warn: ${r.config.warning})` : ''}`;
                    else if (r.type === 'Range') ruleDisplay = `Range: ${r.config.min} - ${r.config.max}`;
                    else if (r.type === 'Target') ruleDisplay = `Target: ${r.config.value}`;
                }
            } catch(e){}

            // Escape commas and quotes for CSV
            const escapeCSV = (str) => `"${String(str || '').replace(/"/g, '""')}"`;
            
            return [
                escapeCSV(m.systemName),
                escapeCSV(m.name),
                escapeCSV(m.value || 'N/A'),
                escapeCSV(ruleDisplay),
                escapeCSV(getStatusText(m.status))
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `KPI_Report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--color-border-light)', borderTopColor: 'var(--color-accent-green)' }}></div>
            </div>
        );
    }

    return (
        <div className="setup-container animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <h2 className="setup-title" style={{ marginBottom: '8px' }}>KPI Analytics Report</h2>
                    <p className="setup-subtitle">Analyze real-time status of all system metrics.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={() => window.print()}
                        style={{ padding: '8px 16px', backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-light)', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print PDF
                    </button>
                    <button 
                        onClick={downloadCSV}
                        style={{ padding: '8px 16px', backgroundColor: 'var(--color-accent-green)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download CSV
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: 'var(--color-bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border-light)', borderLeft: '4px solid #3b82f6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Monitored KPIs</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '8px' }}>{stats.total}</div>
                </div>
                <div style={{ backgroundColor: 'var(--color-bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border-light)', borderLeft: '4px solid var(--color-bg-metric-green)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Safe</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '8px' }}>{stats.green}</div>
                </div>
                <div style={{ backgroundColor: 'var(--color-bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border-light)', borderLeft: '4px solid #f97316', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Warning</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '8px' }}>{stats.orange}</div>
                </div>
                <div style={{ backgroundColor: 'var(--color-bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border-light)', borderLeft: '4px solid #ef4444', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Critical</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '8px' }}>{stats.red}</div>
                </div>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border-light)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>Detailed Analytics</h3>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <select 
                            value={filterSystem} 
                            onChange={(e) => setFilterSystem(e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--color-border-light)', fontSize: '0.9rem', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)' }}
                        >
                            <option value="All">All Systems</option>
                            {systems.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                        
                        <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--color-border-light)', fontSize: '0.9rem', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)' }}
                        >
                            <option value="All">All Statuses</option>
                            <option value="green">Safe</option>
                            <option value="orange">Warning</option>
                            <option value="red">Critical</option>
                            <option value="grey">Unconfigured / Info</option>
                        </select>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--color-border-light)' }}>
                                <th style={{ padding: '12px 16px' }}>System</th>
                                <th style={{ padding: '12px 16px' }}>KPI Name</th>
                                <th style={{ padding: '12px 16px' }}>Current Value</th>
                                <th style={{ padding: '12px 16px' }}>Applied Rule</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMetrics.map((m) => {
                                let ruleDisplay = 'None';
                                try {
                                    if (m.rule) {
                                        const r = JSON.parse(m.rule);
                                        if (r.type === 'Min') ruleDisplay = `Min: ${r.config.value}${r.config.warning ? ` (Warn: ${r.config.warning})` : ''}`;
                                        else if (r.type === 'Max') ruleDisplay = `Max: ${r.config.value}${r.config.warning ? ` (Warn: ${r.config.warning})` : ''}`;
                                        else if (r.type === 'Range') ruleDisplay = `Range: ${r.config.min} - ${r.config.max}`;
                                        else if (r.type === 'Target') ruleDisplay = `Target: ${r.config.value}`;
                                    }
                                } catch(e){}

                                return (
                                    <tr key={m.id} style={{ borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-primary)' }}>
                                        <td style={{ padding: '12px 16px' }}>{m.systemName}</td>
                                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>{m.name}</td>
                                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{m.value || 'N/A'}</td>
                                        <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>{ruleDisplay}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <div style={{
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
                                                backgroundColor: m.status === 'green' ? 'var(--color-bg-metric-green)' : m.status === 'orange' ? '#ffedd5' : m.status === 'red' ? 'var(--color-bg-metric-red)' : 'var(--color-bg-input)',
                                                color: m.status === 'green' ? '#166534' : m.status === 'orange' ? '#9a3412' : m.status === 'red' ? 'var(--color-text-red)' : 'var(--color-text-secondary)'
                                            }}>
                                                {getStatusText(m.status)}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredMetrics.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                        No KPIs found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

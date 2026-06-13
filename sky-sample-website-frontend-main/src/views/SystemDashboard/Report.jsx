import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import api from '../../utils/api';
import useCurrentUser from '../../hooks/useCurrentUser';
import '../../css/Dashboard.css';
import '../../css/SystemSetup.css';

function analyzeKpiStatus(metric) {
    if (!metric.value) return 'grey';
    const match = String(metric.value).match(/-?\d+(\.\d+)?/);
    const rawVal = match ? parseFloat(match[0]) : NaN;
    if (isNaN(rawVal)) return 'grey';
    let rule = null;
    try { rule = metric.rule ? JSON.parse(metric.rule) : null; } catch(e) { return 'grey'; }
    if (!rule || !rule.type || rule.type === 'None' || !rule.config) return 'grey';
    const config = rule.config;
    if (rule.type === 'Min') {
        const minVal = parseFloat(config.value);
        const warnVal = config.warning ? parseFloat(config.warning) : null;
        if (rawVal < minVal) return 'red';
        if (warnVal !== null && rawVal <= warnVal) return 'orange';
        return 'green';
    }
    if (rule.type === 'Max') {
        const maxVal = parseFloat(config.value);
        const warnVal = config.warning ? parseFloat(config.warning) : null;
        if (rawVal > maxVal) return 'red';
        if (warnVal !== null && rawVal >= warnVal) return 'orange';
        return 'green';
    }
    if (rule.type === 'Range') {
        if (rawVal < parseFloat(config.min) || rawVal > parseFloat(config.max)) return 'red';
        return 'green';
    }
    if (rule.type === 'Target') {
        const goal = parseFloat(config.value);
        if (goal === 0) return 'grey';
        const pct = (rawVal / goal) * 100;
        if (pct < 80) return 'red';
        if (pct < 100) return 'orange';
        return 'green';
    }
    return 'grey';
}

const getStatusText = (s) => ({ green: 'SAFE', orange: 'WARNING', red: 'CRITICAL' }[s] || 'UNCONFIGURED');

const getRuleDisplay = (rule) => {
    try {
        if (!rule) return 'None';
        const r = JSON.parse(rule);
        if (r.type === 'Min') return `Min: ${r.config.value}${r.config.warning ? ` (Warn: ${r.config.warning})` : ''}`;
        if (r.type === 'Max') return `Max: ${r.config.value}${r.config.warning ? ` (Warn: ${r.config.warning})` : ''}`;
        if (r.type === 'Range') return `Range: ${r.config.min} – ${r.config.max}`;
        if (r.type === 'Target') return `Target: ${r.config.value}`;
    } catch(e) {}
    return 'None';
};

const TODAY = new Date().toISOString().split('T')[0];
const CURRENT_MONTH = TODAY.slice(0, 7);
const CURRENT_YEAR = TODAY.slice(0, 4);
const YEARS = Array.from({ length: 6 }, (_, i) => String(parseInt(CURRENT_YEAR) - i));

const STATUS_BADGE = (status) => ({
    style: {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
        backgroundColor: status === 'green' ? 'var(--color-bg-metric-green)' : status === 'orange' ? '#ffedd5' : status === 'red' ? 'var(--color-bg-metric-red)' : 'var(--color-bg-input)',
        color: status === 'green' ? '#166534' : status === 'orange' ? '#9a3412' : status === 'red' ? 'var(--color-text-red)' : 'var(--color-text-secondary)',
    }
});

export default function Report() {
    const [systems, setSystems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [histLoading, setHistLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useCurrentUser();

    const [filterSystem, setFilterSystem] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    const [periodType, setPeriodType] = useState('Today');
    const [selectedDate, setSelectedDate] = useState(TODAY);
    const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
    const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
    const [dateFrom, setDateFrom] = useState(TODAY);
    const [dateTo, setDateTo] = useState(TODAY);
    const [historicalData, setHistoricalData] = useState({});

    useEffect(() => {
        api.get('/systems')
            .then(r => setSystems(r.data))
            .catch(err => {
                if (err.response?.status === 401 || err.response?.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/');
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const allMetrics = useMemo(() => {
        const isAdmin = user?.permissionObject?.['SYSTEM_SETUP_EDIT'];
        const list = [];
        systems
            .filter(sys => isAdmin || user?.permissionObject?.[`SYSTEM_${sys.id}_VIEW`])
            .forEach(sys => {
                (sys.metrics || [])
                    .filter(m => isAdmin || user?.permissionObject?.[`KPI_${m.id}_VIEW`])
                    .forEach(m => list.push({ ...m, systemName: sys.name, status: analyzeKpiStatus(m) }));
            });
        return list;
    }, [systems, user]);

    const getDateRange = useCallback(() => {
        switch (periodType) {
            case 'Today':  return { from: TODAY, to: TODAY };
            case 'Daily':  return { from: selectedDate, to: selectedDate };
            case 'Weekly': {
                const d = new Date(selectedDate + 'T00:00:00');
                const dow = d.getDay() === 0 ? 7 : d.getDay();
                const mon = new Date(d); mon.setDate(d.getDate() - dow + 1);
                const sun = new Date(d); sun.setDate(d.getDate() - dow + 7);
                return { from: mon.toISOString().split('T')[0], to: sun.toISOString().split('T')[0] };
            }
            case 'Monthly': {
                const [y, m] = selectedMonth.split('-');
                const last = new Date(parseInt(y), parseInt(m), 0).getDate();
                return { from: `${y}-${m}-01`, to: `${y}-${m}-${String(last).padStart(2, '0')}` };
            }
            case 'Yearly':  return { from: `${selectedYear}-01-01`, to: `${selectedYear}-12-31` };
            case 'Custom':  return { from: dateFrom, to: dateTo };
            default: return { from: TODAY, to: TODAY };
        }
    }, [periodType, selectedDate, selectedMonth, selectedYear, dateFrom, dateTo]);

    useEffect(() => {
        if (periodType === 'Today' || allMetrics.length === 0) return;
        const { from, to } = getDateRange();
        setHistLoading(true);
        Promise.all(allMetrics.map(m =>
            api.get(`/metrics/${m.id}/daily-values`)
                .then(r => ({ id: m.id, data: (r.data || []).filter(dv => dv.data_date >= from && dv.data_date <= to) }))
                .catch(() => ({ id: m.id, data: [] }))
        )).then(results => {
            const map = {};
            results.forEach(r => { map[r.id] = r.data; });
            setHistoricalData(map);
        }).finally(() => setHistLoading(false));
    }, [periodType, selectedDate, selectedMonth, selectedYear, dateFrom, dateTo, allMetrics]);

    const historicalRows = useMemo(() => {
        if (periodType === 'Today') return [];
        const rows = [];
        allMetrics.forEach(m => {
            const dvs = historicalData[m.id] || [];
            if (dvs.length === 0) {
                rows.push({ ...m, date: '—', histValue: 'No data', histStatus: 'grey' });
            } else {
                dvs.sort((a, b) => a.data_date.localeCompare(b.data_date)).forEach(dv => {
                    rows.push({ ...m, date: dv.data_date, histValue: dv.value || 'N/A', histStatus: analyzeKpiStatus({ ...m, value: dv.value }) });
                });
            }
        });
        return rows;
    }, [historicalData, allMetrics, periodType]);

    const filteredMetrics = useMemo(() =>
        allMetrics.filter(m =>
            (filterSystem === 'All' || m.systemName === filterSystem) &&
            (filterStatus === 'All' || m.status === filterStatus)
        ), [allMetrics, filterSystem, filterStatus]);

    const filteredHistRows = useMemo(() =>
        historicalRows.filter(r =>
            (filterSystem === 'All' || r.systemName === filterSystem) &&
            (filterStatus === 'All' || r.histStatus === filterStatus)
        ), [historicalRows, filterSystem, filterStatus]);

    const stats = useMemo(() => ({
        total: allMetrics.length,
        green: allMetrics.filter(m => m.status === 'green').length,
        orange: allMetrics.filter(m => m.status === 'orange').length,
        red: allMetrics.filter(m => m.status === 'red').length,
    }), [allMetrics]);

    const { from: rangeFrom, to: rangeTo } = getDateRange();

    const downloadCSV = () => {
        let headers, rows;
        if (periodType === 'Today') {
            headers = ["System", "KPI Name", "Current Value", "Applied Rule", "Status"];
            rows = filteredMetrics.map(m => {
                const esc = s => `"${String(s || '').replace(/"/g, '""')}"`;
                return [esc(m.systemName), esc(m.name), esc(m.value || 'N/A'), esc(getRuleDisplay(m.rule)), esc(getStatusText(m.status))].join(',');
            });
        } else {
            headers = ["Date", "System", "KPI Name", "Value", "Applied Rule", "Status"];
            rows = filteredHistRows.map(r => {
                const esc = s => `"${String(s || '').replace(/"/g, '""')}"`;
                return [esc(r.date), esc(r.systemName), esc(r.name), esc(r.histValue), esc(getRuleDisplay(r.rule)), esc(getStatusText(r.histStatus))].join(',');
            });
        }
        const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', `KPI_Report_${periodType}_${TODAY}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const periodBtnStyle = (type) => ({
        padding: '7px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
        fontWeight: 600, fontSize: '0.85rem',
        backgroundColor: periodType === type ? 'var(--color-accent-blue)' : 'var(--color-bg-input)',
        color: periodType === type ? '#fff' : 'var(--color-text-secondary)',
        transition: 'all 0.15s',
    });

    const inputStyle = {
        padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border-light)',
        fontSize: '0.85rem', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)',
        fontFamily: 'inherit',
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

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 className="setup-title" style={{ marginBottom: '4px' }}>KPI Analytics Report</h2>
                    <p className="setup-subtitle">Historical and real-time status of all system metrics.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => window.print()} style={{ padding: '8px 16px', backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-light)', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print
                    </button>
                    <button onClick={downloadCSV} style={{ padding: '8px 16px', backgroundColor: 'var(--color-accent-green)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download CSV
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                    { label: 'Total KPIs', value: stats.total, color: '#3b82f6' },
                    { label: 'Safe', value: stats.green, color: 'var(--color-bg-metric-green)' },
                    { label: 'Warning', value: stats.orange, color: '#f97316' },
                    { label: 'Critical', value: stats.red, color: '#ef4444' },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ backgroundColor: 'var(--color-bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border-light)', borderLeft: `4px solid ${color}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '6px' }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Period selector + filters */}
            <div style={{ backgroundColor: 'var(--color-bg-card)', padding: '16px 20px', borderRadius: '8px', border: '1px solid var(--color-border-light)', marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                {/* Period buttons */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['Today', 'Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'].map(p => (
                        <button key={p} style={periodBtnStyle(p)} onClick={() => setPeriodType(p)}>{p}</button>
                    ))}
                </div>

                {/* Date pickers */}
                {periodType === 'Daily' && (
                    <input type="date" value={selectedDate} max={TODAY} onChange={e => setSelectedDate(e.target.value)} style={inputStyle} />
                )}
                {periodType === 'Weekly' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Pick any day in week:</span>
                        <input type="date" value={selectedDate} max={TODAY} onChange={e => setSelectedDate(e.target.value)} style={inputStyle} />
                    </div>
                )}
                {periodType === 'Monthly' && (
                    <input type="month" value={selectedMonth} max={CURRENT_MONTH} onChange={e => setSelectedMonth(e.target.value)} style={inputStyle} />
                )}
                {periodType === 'Yearly' && (
                    <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={inputStyle}>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                )}
                {periodType === 'Custom' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="date" value={dateFrom} max={TODAY} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>to</span>
                        <input type="date" value={dateTo} min={dateFrom} max={TODAY} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
                    </div>
                )}

                {/* Range label */}
                {periodType !== 'Today' && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                        {rangeFrom === rangeTo ? rangeFrom : `${rangeFrom} → ${rangeTo}`}
                    </span>
                )}
            </div>

            {/* Table */}
            <div style={{ backgroundColor: 'var(--color-bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border-light)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                        {periodType === 'Today' ? 'Current KPI Status' : `Historical Data — ${periodType}`}
                    </h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select value={filterSystem} onChange={e => setFilterSystem(e.target.value)} style={{ ...inputStyle, padding: '8px 12px' }}>
                            <option value="All">All Systems</option>
                            {systems.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, padding: '8px 12px' }}>
                            <option value="All">All Statuses</option>
                            <option value="green">Safe</option>
                            <option value="orange">Warning</option>
                            <option value="red">Critical</option>
                            <option value="grey">Unconfigured</option>
                        </select>
                    </div>
                </div>

                {histLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                        <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid var(--color-border-light)', borderTopColor: 'var(--color-accent-green)', margin: '0 auto 12px' }}></div>
                        Loading historical data...
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--color-border-light)' }}>
                                    {periodType !== 'Today' && <th style={{ padding: '12px 16px' }}>Date</th>}
                                    <th style={{ padding: '12px 16px' }}>System</th>
                                    <th style={{ padding: '12px 16px' }}>KPI Name</th>
                                    <th style={{ padding: '12px 16px' }}>Value</th>
                                    <th style={{ padding: '12px 16px' }}>Applied Rule</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {periodType === 'Today' ? (
                                    filteredMetrics.length === 0 ? (
                                        <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No KPIs found.</td></tr>
                                    ) : filteredMetrics.map(m => (
                                        <tr key={m.id} style={{ borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-primary)' }}>
                                            <td style={{ padding: '12px 16px' }}>{m.systemName}</td>
                                            <td style={{ padding: '12px 16px', fontWeight: 500 }}>{m.name}</td>
                                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>{m.value || 'N/A'}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>{getRuleDisplay(m.rule)}</td>
                                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                <div {...STATUS_BADGE(m.status)}>{getStatusText(m.status)}</div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    filteredHistRows.length === 0 ? (
                                        <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No data found for the selected period.</td></tr>
                                    ) : filteredHistRows.map((r, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-primary)' }}>
                                            <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{r.date}</td>
                                            <td style={{ padding: '12px 16px' }}>{r.systemName}</td>
                                            <td style={{ padding: '12px 16px', fontWeight: 500 }}>{r.name}</td>
                                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>{r.histValue}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>{getRuleDisplay(r.rule)}</td>
                                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                <div {...STATUS_BADGE(r.histStatus)}>{getStatusText(r.histStatus)}</div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

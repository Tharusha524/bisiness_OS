import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import api from '../../utils/api';
import useCurrentUser from '../../hooks/useCurrentUser';
import { getKpiAiSuggestions } from '../../api/kpiSuggestionApi';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
    PieChart, Pie, Legend, AreaChart, Area,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getOrganization } from '../../api/OrganizationSettings/organizationSettingsApi';
import '../../css/Dashboard.css';
import '../../css/SystemDetails.css';

const getSystemTag = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('finance')) return { tag: 'FIN', color: 'fin-tag' };
    if (nameLower.includes('maintenance')) return { tag: 'MAINT', color: 'maint-tag' };
    if (nameLower.includes('safety') || nameLower.includes('health')) return { tag: 'SAFE', color: 'safe-tag' };
    if (nameLower.includes('store')) return { tag: 'STOR', color: 'stor-tag' };
    if (nameLower.includes('hr') || nameLower.includes('human')) return { tag: 'HR', color: 'hr-tag' };
    const clean = name.replace(/[^a-zA-Z]/g, '');
    return { tag: clean.slice(0, 4).toUpperCase(), color: 'default-tag' };
};

const getFallbackSuggestions = (metricName) => {
    const n = (metricName || '').toLowerCase();
    if (n.includes('debtor')) return [
        { title: "Incentivize Early Payments", desc: "Offer a 2% discount for outstanding invoices settled within 10 days.", impact: "HIGH IMPACT", impactType: "high" },
        { title: "Automated Reminders", desc: "Send automatic invoice reminders 5 days before due dates.", impact: "MEDIUM IMPACT", impactType: "medium" }
    ];
    if (n.includes('creditor')) return [
        { title: "Negotiate Extended Terms", desc: "Extend credit accounts with primary suppliers from 30 to 45 days.", impact: "HIGH IMPACT", impactType: "high" },
        { title: "Batch Payment Processing", desc: "Settle payments bi-weekly to reduce transaction overhead.", impact: "MEDIUM IMPACT", impactType: "medium" }
    ];
    if (n.includes('bank') || n.includes('cash')) return [
        { title: "Automate Cash Sweeping", desc: "Move surplus bank funds daily into interest-bearing accounts.", impact: "HIGH IMPACT", impactType: "high" },
        { title: "Daily Reconciliation", desc: "Run automated bank reconciliations to catch discrepancies early.", impact: "MEDIUM IMPACT", impactType: "medium" }
    ];
    if (n.includes('absent')) return [
        { title: "Flexible Work Options", desc: "Introduce remote work policies to improve attendance and morale.", impact: "HIGH IMPACT", impactType: "high" },
        { title: "Wellness Programs", desc: "Run quarterly wellness check-ins for high-stress departments.", impact: "MEDIUM IMPACT", impactType: "medium" }
    ];
    if (n.includes('accident') || n.includes('safety')) return [
        { title: "Daily PPE Audits", desc: "Enforce daily personal protective equipment checks on all floors.", impact: "HIGH IMPACT", impactType: "high" },
        { title: "Anonymous Hazard Reporting", desc: "Provide a digital portal for employees to report safety risks.", impact: "MEDIUM IMPACT", impactType: "medium" }
    ];
    if (n.includes('downtime') || n.includes('mtbf') || n.includes('breakdown')) return [
        { title: "Predictive Maintenance", desc: "Use sensor alerts to identify equipment faults before breakdown.", impact: "HIGH IMPACT", impactType: "high" },
        { title: "Off-Peak Servicing", desc: "Schedule all maintenance during non-production hours.", impact: "MEDIUM IMPACT", impactType: "medium" }
    ];
    return [
        { title: "Streamline Workflows", desc: "Automate data collection to reduce manual entry and delays.", impact: "HIGH IMPACT", impactType: "high" },
        { title: "Review Baselines", desc: "Adjust performance targets monthly based on trend analysis.", impact: "MEDIUM IMPACT", impactType: "medium" }
    ];
};

// Chart color palette (forest green spectrum) — light mode
const CHART_COLORS_LIGHT = ['#0f3c2b', '#1a6644', '#2a9d6b', '#4db882', '#82f25b', '#154c37', '#228051'];
// Brighter palette for dark mode so bars/slices stand out against the dark background
const CHART_COLORS_DARK = ['#4ade80', '#34d399', '#6ee7b7', '#a7f3d0', '#86efac', '#2dd4bf', '#5eead4'];

const parseNumericValue = (val) => {
    if (!val && val !== 0) return 0;
    return parseFloat(String(val).replace(/[^0-9.-]/g, '')) || 0;
};

const formatItemValue = (rawValue, metric, orgData) => {
    const valFloat = parseFloat(rawValue);
    const formatted = !isNaN(valFloat) ? valFloat.toLocaleString() : String(rawValue || '0');
    const typeLower = (metric?.type || '').toLowerCase();
    if (typeLower === 'currency') {
        const defaultSymbol = orgData?.defaultCurrency ? orgData.defaultCurrency + ' ' : 'Rs. ';
        return `${metric?.unit ? metric.unit + ' ' : defaultSymbol}${formatted}`;
    }
    if (typeLower === 'percentage') return `${formatted}%`;
    if (metric?.unit) return `${formatted} ${metric.unit}`;
    return formatted;
};

const parseRule = (ruleStr) => {
    if (!ruleStr) return null;
    try { return JSON.parse(ruleStr); } catch { return null; }
};

const getRuleStatus = (metricValue, rule) => {
    if (!rule) return null;
    const current = parseNumericValue(metricValue);
    const ruleType = (rule.type || rule.rule || '').toLowerCase();
    
    // Some rules have a nested `config` object, some might be flat. Handle both.
    let val = rule.config?.value !== undefined ? rule.config.value : rule.value;
    let minVal = rule.config?.min !== undefined ? rule.config.min : rule.min;
    let maxVal = rule.config?.max !== undefined ? rule.config.max : rule.max;

    if (val === '') val = null;
    if (minVal === '') minVal = null;
    if (maxVal === '') maxVal = null;

    if (ruleType === 'max' && val != null) {
        return current <= parseFloat(val) ? 'on-target' : 'above';
    }
    if (ruleType === 'min' && val != null) {
        return current >= parseFloat(val) ? 'on-target' : 'below';
    }
    if (ruleType === 'range' && minVal != null && maxVal != null) {
        const min = parseFloat(minVal), max = parseFloat(maxVal);
        return current >= min && current <= max ? 'on-target' : current < min ? 'below' : 'above';
    }
    if (ruleType === 'target' && val != null) {
        const target = parseFloat(val);
        return Math.abs(current - target) <= target * 0.05 ? 'on-target' : current < target ? 'below' : 'above';
    }
    return null;
};

const getRuleLabel = (rule) => {
    if (!rule) return 'No rule configured';
    const ruleType = (rule.type || rule.rule || '').toUpperCase();
    
    let val = rule.config?.value !== undefined ? rule.config.value : rule.value;
    let minVal = rule.config?.min !== undefined ? rule.config.min : rule.min;
    let maxVal = rule.config?.max !== undefined ? rule.config.max : rule.max;

    if (val === '') val = null;
    if (minVal === '') minVal = null;
    if (maxVal === '') maxVal = null;

    if (minVal != null && maxVal != null) return `${ruleType}: ${parseFloat(minVal).toLocaleString()} – ${parseFloat(maxVal).toLocaleString()}`;
    if (val != null) return `${ruleType}: ${parseFloat(val).toLocaleString()}`;
    return ruleType;
};


// Custom tooltip for charts
const ChartTooltip = ({ active, payload, metric, orgData, total }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : null;
    return (
        <div style={{ background: 'var(--color-bg-card)', borderRadius: 8, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', fontSize: 12, border: '1px solid var(--color-border-light)' }}>
            <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>{d.fullName || d.name}</div>
            <div style={{ color: 'var(--color-accent-green)', fontWeight: 700 }}>{formatItemValue(d.rawValue, metric, orgData)}</div>
            {pct && <div style={{ color: 'var(--color-text-muted)', marginTop: 2 }}>{pct}% of total</div>}
        </div>
    );
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function isoWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function processHistory(rawData, view) {
    const parse = v => parseFloat(String(v || '').replace(/[^0-9.-]/g, '')) || 0;
    if (!rawData || rawData.length === 0) return [];

    const sorted = [...rawData].sort((a, b) => a.data_date.localeCompare(b.data_date));

    if (view === 'daily') {
        return sorted.slice(-30).map(d => {
            const dt = new Date(d.data_date + 'T00:00:00');
            return { label: `${MONTH_NAMES[dt.getMonth()]} ${dt.getDate()}`, value: parse(d.value) };
        });
    }

    if (view === 'weekly') {
        const map = {};
        sorted.forEach(d => {
            const dt = new Date(d.data_date + 'T00:00:00');
            const w  = isoWeekNumber(dt);
            const key = `${dt.getFullYear()}-W${String(w).padStart(2, '0')}`;
            if (!map[key]) map[key] = { values: [], sortKey: key };
            map[key].values.push(parse(d.value));
        });
        return Object.entries(map)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-12)
            .map(([key, { values }]) => {
                const [yr, wk] = key.split('-W');
                return { label: `W${wk} '${yr.slice(2)}`, value: Math.round(values.reduce((s, v) => s + v, 0) / values.length) };
            });
    }

    if (view === 'monthly') {
        const map = {};
        sorted.forEach(d => {
            const key = d.data_date.substring(0, 7);
            if (!map[key]) map[key] = [];
            map[key].push(parse(d.value));
        });
        return Object.entries(map)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-12)
            .map(([key, values]) => {
                const [yr, mo] = key.split('-');
                return { label: `${MONTH_NAMES[parseInt(mo) - 1]} '${yr.slice(2)}`, value: Math.round(values.reduce((s, v) => s + v, 0) / values.length) };
            });
    }

    if (view === 'yearly') {
        const map = {};
        sorted.forEach(d => {
            const key = d.data_date.substring(0, 4);
            if (!map[key]) map[key] = [];
            map[key].push(parse(d.value));
        });
        return Object.entries(map)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([key, values]) => ({
                label: key,
                value: Math.round(values.reduce((s, v) => s + v, 0) / values.length),
            }));
    }

    return [];
}

export default function SystemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useCurrentUser();

    const isDarkMode = !user || !user.themePreference || user.themePreference === 'System'
        ? (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        : user.themePreference.toLowerCase() === 'dark';
    const CHART_COLORS = isDarkMode ? CHART_COLORS_DARK : CHART_COLORS_LIGHT;

    const { data: orgData } = useQuery({
        queryKey: ['organization'],
        queryFn: getOrganization,
    });

    const [systems, setSystems] = useState([]);
    const [currentSystem, setCurrentSystem] = useState(null);
    const [metrics, setMetrics] = useState([]);
    const [activeMetric, setActiveMetric] = useState(null);
    const [activeMetricItems, setActiveMetricItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [loading, setLoading] = useState(true);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [aiRequested, setAiRequested] = useState(false);

    const [historyData, setHistoryData] = useState([]);
    const [historyView, setHistoryView] = useState('daily');
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        fetchDetailsData();
    }, [id]);

    useEffect(() => {
        if (activeMetric) {
            fetchMetricItems(activeMetric.id);
        } else {
            setActiveMetricItems([]);
        }
    }, [activeMetric]);

    useEffect(() => {
        setAiSuggestions([]);
        setAiRequested(false);
        setSuggestionsLoading(false);
    }, [activeMetric]);

    useEffect(() => {
        if (activeMetric) {
            fetchHistoryData(activeMetric.id);
            setHistoryView('daily');
        } else {
            setHistoryData([]);
        }
    }, [activeMetric]);

    const fetchHistoryData = async (metricId) => {
        try {
            setHistoryLoading(true);
            const res = await api.get(`/metrics/${metricId}/daily-values`);
            setHistoryData(res.data || []);
        } catch {
            setHistoryData([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleAskAI = () => {
        if (!activeMetric) return;
        setAiRequested(true);
        setSuggestionsLoading(true);
        setAiSuggestions([]);
        
        getKpiAiSuggestions(activeMetric.id)
            .then(data => {
                setAiSuggestions(Array.isArray(data) && data.length ? data : getFallbackSuggestions(activeMetric.name));
            })
            .catch((err) => {
                const detail = err?.response?.data;
                console.error('AI suggestions error:', JSON.stringify(detail ?? err?.message ?? 'unknown'));
                setAiSuggestions(getFallbackSuggestions(activeMetric.name));
            })
            .finally(() => {
                setSuggestionsLoading(false);
            });
    };

    const fetchMetricItems = async (metricId) => {
        try {
            setLoadingItems(true);
            const res = await api.get(`/metrics/${metricId}/items`);
            setActiveMetricItems(res.data);
        } catch (err) {
            console.error("Failed to fetch metric items", err);
        } finally {
            setLoadingItems(false);
        }
    };

    const fetchDetailsData = async () => {
        try {
            setLoading(true);
            const systemsRes = await api.get('/systems');
            setSystems(systemsRes.data);
            const currentRes = await api.get(`/systems/${id}`);
            setCurrentSystem(currentRes.data);
            const metricsRes = await api.get(`/systems/${id}/metrics`);
            setMetrics(metricsRes.data);
            
            const isAdmin = user?.permissionObject?.['SYSTEM_SETUP_EDIT'];
            const accessibleMetrics = metricsRes.data.filter(m => isAdmin || user?.permissionObject?.[`KPI_${m.id}_VIEW`]);
            if (accessibleMetrics.length > 0) {
                setActiveMetric(accessibleMetrics[0]);
            } else {
                setActiveMetric(null);
            }
        } catch (err) {
            console.error("Fetch system details failed", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                handleLocalLogout();
            } else {
                console.error("Unable to load analytics metrics. Please ensure backend is online.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLocalLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    if (loading) {
        return (
            <div className="dashboard-layout" style={{ justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--color-bg-primary)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--color-border-light)', borderTopColor: 'var(--color-accent-green)', margin: '0 auto 16px' }}></div>
                    <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>Loading system analytics...</p>
                </div>
            </div>
        );
    }

    // --- Chart data computed from real metric items ---
    const chartData = activeMetricItems.map(item => ({
        name: item.name.length > 18 ? item.name.slice(0, 18) + '…' : item.name,
        fullName: item.name,
        value: parseFloat(item.value) || 0,
        rawValue: item.value,
    }));
    const total = chartData.reduce((sum, d) => sum + d.value, 0);
    const pieData = chartData.filter(d => d.value > 0);
    const sortedByValue = [...chartData].sort((a, b) => b.value - a.value);
    const topItem = sortedByValue[0] || null;
    const rule = parseRule(activeMetric?.rule);
    const currentValue = activeMetric?.latestDailyValue?.value ?? activeMetric?.value;
    const ruleStatus = getRuleStatus(currentValue, rule);
    const barChartHeight = Math.max(200, chartData.length * 50 + 60);

    return (
        <div className="dashboard-container animate-fade-in" style={{ padding: '0px' }}>
            <Head title={`${currentSystem?.name || 'Details'} Analytics | BizOS`} />

            <div className="details-container-split">

                {/* Left Column (Analytics Panels) */}
                <div className="details-analytics-panel">

                    {/* Breadcrumbs */}
                    <div className="details-breadcrumbs animate-fade-in">
                        <span>System administrator</span>
                        <span className="breadcrumb-separator">›</span>
                        <Link to="/dashboard" className="breadcrumb-link-back">System Setup</Link>
                        <span className="breadcrumb-separator">›</span>
                        <span className="breadcrumb-active">{currentSystem?.name}</span>
                        {activeMetric && (
                            <>
                                <span className="breadcrumb-separator">›</span>
                                <span className="breadcrumb-active-sub">{activeMetric.name}</span>
                            </>
                        )}
                    </div>

                    <div className="kpi-tabs-row animate-fade-in">
                        {metrics.filter(m => user?.permissionObject?.['SYSTEM_SETUP_EDIT'] || user?.permissionObject?.[`KPI_${m.id}_VIEW`]).map((metric) => {
                            const isActive = activeMetric && activeMetric.id === metric.id;
                            const displayName = metric.name
                                .replace('Total ', '')
                                .replace(' Balance', '')
                                .replace('Number of ', '');
                            return (
                                <button
                                    key={metric.id}
                                    className={`kpi-tab-btn ${isActive ? 'active' : ''}`}
                                    onClick={() => setActiveMetric(metric)}
                                >
                                    {displayName}
                                </button>
                            );
                        })}
                        {metrics.filter(m => user?.permissionObject?.['SYSTEM_SETUP_EDIT'] || user?.permissionObject?.[`KPI_${m.id}_VIEW`]).length === 0 && (
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 600, padding: '10px 0' }}>
                                No KPI metrics configured for this system.
                            </div>
                        )}
                    </div>

                    {/* Analytics Panel */}
                    {activeMetric && (
                        <div className="metric-telemetry-block animate-fade-in">

                            {/* ── KPI Summary Cards ── */}
                            <div className="kpi-summary-stats-row">
                                {/* Total Value */}
                                <div className="kpi-stat-card">
                                    <div className="kpi-stat-label">CURRENT VALUE</div>
                                    <div className="kpi-stat-value">{(activeMetric.latestDailyValue?.value ?? activeMetric.value) || '—'}</div>
                                    <div className="kpi-stat-sub">
                                        {activeMetricItems.length} subcategor{activeMetricItems.length !== 1 ? 'ies' : 'y'} recorded
                                    </div>
                                </div>

                                {/* Largest Entry */}
                                {topItem ? (
                                    <div className="kpi-stat-card">
                                        <div className="kpi-stat-label">LARGEST ENTRY</div>
                                        <div className="kpi-stat-value" style={{ fontSize: '1.1rem', letterSpacing: '-0.5px' }}>
                                            {topItem.fullName}
                                        </div>
                                        <div className="kpi-stat-sub">
                                            {formatItemValue(topItem.rawValue, activeMetric, orgData)}
                                            {total > 0 && ` · ${((topItem.value / total) * 100).toFixed(1)}% of total`}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="kpi-stat-card">
                                        <div className="kpi-stat-label">LARGEST ENTRY</div>
                                        <div className="kpi-stat-value" style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>No subcategories yet</div>
                                        <div className="kpi-stat-sub">Add subcategories to see breakdown</div>
                                    </div>
                                )}

                                {/* Rule / Target Status */}
                                <div className={`kpi-stat-card${ruleStatus ? ` kpi-stat-${ruleStatus}` : ''}`}>
                                    <div className="kpi-stat-label">TARGET STATUS</div>
                                    <div className="kpi-stat-value" style={{ fontSize: '1.2rem' }}>
                                        {ruleStatus === 'on-target' && '✓ On Target'}
                                        {ruleStatus === 'above' && '↑ Above Limit'}
                                        {ruleStatus === 'below' && '↓ Below Target'}
                                        {!ruleStatus && '— No Rule Set'}
                                    </div>
                                    <div className="kpi-stat-sub">{getRuleLabel(rule)}</div>
                                </div>
                            </div>

                            {/* ── Charts Section ── */}
                            {loadingItems ? (
                                <div className="details-card" style={{ textAlign: 'center', padding: '50px 24px' }}>
                                    <p style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Loading chart data…</p>
                                </div>
                            ) : activeMetricItems.length === 0 ? (
                                <div className="details-card" style={{ textAlign: 'center', padding: '50px 24px', marginBottom: '24px' }}>
                                    <svg style={{ width: 52, height: 52, color: 'var(--color-text-muted)', margin: '0 auto 16px', display: 'block' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                    </svg>
                                    <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)' }}>No Subcategories Recorded</p>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                                        Generate data-driven insights and actionable recommendations for this KPI using AI analysis.
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Bar + Pie charts side-by-side */}
                                    <div className={`charts-two-col-row${pieData.length < 2 ? ' charts-single-col' : ''}`}>

                                        {/* Horizontal Bar Chart — Item Values */}
                                        <div className="details-card chart-main-card">
                                            <h5 className="trend-card-title">{activeMetric.name.toUpperCase()} — SUBCATEGORY BREAKDOWN</h5>
                                            <div style={{ width: '100%', height: barChartHeight, marginTop: '16px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart
                                                        data={sortedByValue}
                                                        layout="vertical"
                                                        margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                                        <XAxis
                                                            type="number"
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                                                            tickFormatter={v =>
                                                                v >= 1000000 ? `${(v / 1000000).toFixed(1)}M`
                                                                    : v >= 1000 ? `${(v / 1000).toFixed(0)}K`
                                                                    : v.toLocaleString()
                                                            }
                                                        />
                                                        <YAxis
                                                            type="category"
                                                            dataKey="name"
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fontSize: 11, fill: 'var(--color-text-primary)', fontWeight: 600 }}
                                                            width={115}
                                                        />
                                                        <Tooltip content={<ChartTooltip metric={activeMetric} orgData={orgData} total={total} />} />
                                                        <Bar dataKey="value" radius={[0, 5, 5, 0]} barSize={22}>
                                                            {sortedByValue.map((_, idx) => (
                                                                <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Donut Pie Chart — Distribution */}
                                        {pieData.length >= 2 && (
                                            <div className="details-card chart-pie-card">
                                                <h5 className="trend-card-title">DISTRIBUTION</h5>
                                                <div style={{ width: '100%', height: Math.max(barChartHeight, 260), marginTop: '8px' }}>
                                                    <ResponsiveContainer>
                                                        <PieChart>
                                                            <Pie
                                                                data={pieData}
                                                                cx="50%"
                                                                cy="42%"
                                                                innerRadius={55}
                                                                outerRadius={90}
                                                                paddingAngle={2}
                                                                dataKey="value"
                                                                nameKey="name"
                                                            >
                                                                {pieData.map((_, idx) => (
                                                                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip content={<ChartTooltip metric={activeMetric} orgData={orgData} total={total} />} />
                                                            <Legend
                                                                iconType="circle"
                                                                iconSize={8}
                                                                wrapperStyle={{ fontSize: '11px', fontWeight: 600 }}
                                                                formatter={val => val.length > 16 ? val.slice(0, 16) + '…' : val}
                                                            />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Item Proportion Analysis */}
                                    {total > 0 && (
                                        <div className="details-card" style={{ marginBottom: '24px' }}>
                                            <h5 className="trend-card-title">SUBCATEGORY PROPORTION ANALYSIS</h5>
                                            <div className="progress-list" style={{ marginTop: '16px' }}>
                                                {sortedByValue.map((item, i) => {
                                                    const pct = (item.value / total) * 100;
                                                    return (
                                                        <div key={i} className="progress-list-item">
                                                            <span className="proportion-item-name">{item.fullName}</span>
                                                            <div className="progress-bar-track">
                                                                <div
                                                                    className="progress-bar-fill"
                                                                    style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                                                                />
                                                            </div>
                                                            <span className="proportion-item-value">
                                                                {formatItemValue(item.rawValue, activeMetric, orgData)}
                                                                <span className="proportion-pct">({pct.toFixed(1)}%)</span>
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* ── Historical Progress Chart ── */}
                            {(() => {
                                const chartHistoryData = processHistory(historyData, historyView);
                                const viewLabels = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };
                                return (
                                    <div className="details-card" style={{ marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                                            <h5 className="trend-card-title" style={{ margin: 0 }}>HISTORICAL PROGRESS</h5>
                                            <div style={{ display: 'flex', gap: '3px', backgroundColor: 'var(--color-bg-input)', borderRadius: '8px', padding: '3px' }}>
                                                {Object.entries(viewLabels).map(([key, label]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => setHistoryView(key)}
                                                        style={{
                                                            padding: '4px 12px', borderRadius: '6px', border: 'none',
                                                            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                                                            backgroundColor: historyView === key ? 'var(--color-accent-green)' : 'transparent',
                                                            color: historyView === key ? 'white' : 'var(--color-text-muted)',
                                                            transition: 'all 0.15s',
                                                        }}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {historyLoading ? (
                                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                                                <div className="spinner" style={{ width: 24, height: 24, border: '2px solid var(--color-border-light)', borderTopColor: 'var(--color-accent-green)', margin: '0 auto 10px' }}></div>
                                                Loading history…
                                            </div>
                                        ) : chartHistoryData.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
                                                <svg style={{ width: 40, height: 40, color: 'var(--color-text-muted)', margin: '0 auto 12px', display: 'block' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 16l4-4 4 4 4-6" />
                                                </svg>
                                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', fontWeight: 500, margin: 0 }}>
                                                    No {viewLabels[historyView].toLowerCase()} history yet. Use the Data Entry page to start recording values.
                                                </p>
                                            </div>
                                        ) : (
                                            <div style={{ width: '100%', height: 260 }}>
                                                <ResponsiveContainer>
                                                    <AreaChart data={chartHistoryData} margin={{ top: 8, right: 20, left: 0, bottom: 4 }}>
                                                        <defs>
                                                            <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%"  stopColor={isDarkMode ? '#4ade80' : '#154c37'} stopOpacity={0.18} />
                                                                <stop offset="95%" stopColor={isDarkMode ? '#4ade80' : '#154c37'} stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                        <XAxis
                                                            dataKey="label"
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 500 }}
                                                            interval="preserveStartEnd"
                                                        />
                                                        <YAxis
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                                                            tickFormatter={v =>
                                                                v >= 1000000 ? `${(v / 1000000).toFixed(1)}M`
                                                                : v >= 1000    ? `${(v / 1000).toFixed(0)}K`
                                                                : v
                                                            }
                                                            width={52}
                                                        />
                                                        <Tooltip
                                                            formatter={val => [formatItemValue(val, activeMetric, orgData), activeMetric.name]}
                                                            labelStyle={{ fontWeight: 700, color: '#1e293b', fontSize: 12 }}
                                                            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, backgroundColor: '#ffffff' }}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="value"
                                                            stroke={isDarkMode ? '#4ade80' : '#154c37'}
                                                            strokeWidth={2.5}
                                                            fill="url(#histGrad)"
                                                            dot={{ r: 3, fill: isDarkMode ? '#4ade80' : '#154c37', strokeWidth: 0 }}
                                                            activeDot={{ r: 5, fill: isDarkMode ? '#4ade80' : '#154c37' }}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}

                                        {!historyLoading && chartHistoryData.length > 0 && (historyView === 'weekly' || historyView === 'monthly' || historyView === 'yearly') && (
                                            <p style={{ margin: '10px 0 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                                                Values show the average recorded across each {historyView === 'weekly' ? 'week' : historyView === 'monthly' ? 'month' : 'year'}.
                                            </p>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* ── Special Notes ── */}
                            {(() => {
                                const recentNotes = historyData
                                    .filter(d => d.notes && d.notes.trim())
                                    .slice(0, 5);
                                if (recentNotes.length === 0) return null;
                                return (
                                    <div className="details-card" style={{ marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                            <svg width="16" height="16" fill="none" stroke="var(--color-accent-green)" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            <h5 className="trend-card-title" style={{ margin: 0 }}>SPECIAL NOTES</h5>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {recentNotes.map((entry, i) => {
                                                const dt = new Date(entry.data_date + 'T00:00:00');
                                                const dateLabel = dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                                                const isLatest = i === 0;
                                                return (
                                                    <div key={entry.id ?? i} style={{
                                                        padding: '12px 16px',
                                                        borderRadius: '8px',
                                                        backgroundColor: isLatest ? 'var(--color-bg-primary)' : 'var(--color-bg-input)',
                                                        border: `1px solid ${isLatest ? 'var(--color-accent-green)' : 'var(--color-border-light)'}`,
                                                        display: 'flex',
                                                        gap: '14px',
                                                        alignItems: 'flex-start',
                                                    }}>
                                                        <div style={{
                                                            minWidth: '80px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700,
                                                            color: isLatest ? 'var(--color-accent-green)' : 'var(--color-text-muted)',
                                                            paddingTop: '2px',
                                                            whiteSpace: 'nowrap',
                                                        }}>
                                                            {dateLabel}
                                                            {isLatest && (
                                                                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 500, color: 'var(--color-accent-green)', marginTop: '2px' }}>
                                                                    Latest
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ flex: 1, fontSize: '0.88rem', color: 'var(--color-text-primary)', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>
                                                            {entry.notes}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* ── Detailed Metric Items Table ── */}
                            <div className="kpi-items-card animate-fade-in">
                                <h5 className="trend-card-title">DETAILED METRIC SUBCATEGORIES</h5>
                                <table className="kpi-items-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Value</th>
                                            <th>Share</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingItems ? (
                                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>Loading…</td></tr>
                                        ) : activeMetricItems.length === 0 ? (
                                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>No subcategories found for this metric.</td></tr>
                                        ) : (
                                            sortedByValue.map((item, idx) => {
                                                const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '—';
                                                return (
                                                    <tr key={idx}>
                                                        <td style={{ width: 36 }}>
                                                            <span className="table-rank-dot" style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }}>
                                                                {idx + 1}
                                                            </span>
                                                        </td>
                                                        <td>{item.fullName}</td>
                                                        <td style={{ color: 'var(--color-text-green)', fontWeight: 700 }}>
                                                            {formatItemValue(item.rawValue, activeMetric, orgData)}
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <div style={{ flex: 1, height: 6, background: 'var(--color-bg-input)', borderRadius: 99, overflow: 'hidden', minWidth: 60 }}>
                                                                    <div style={{ height: '100%', width: `${total > 0 ? (item.value / total) * 100 : 0}%`, background: CHART_COLORS[idx % CHART_COLORS.length], borderRadius: 99 }} />
                                                                </div>
                                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', minWidth: 38 }}>{pct}%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                    {activeMetricItems.length > 0 && (
                                        <tfoot>
                                            <tr style={{ borderTop: '2px solid var(--color-border-light)' }}>
                                                <td colSpan="2" style={{ padding: '12px', fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.88rem' }}>
                                                    TOTAL
                                                </td>
                                                <td style={{ padding: '12px', fontWeight: 800, color: 'var(--color-text-green)' }}>
                                                    {(activeMetric.latestDailyValue?.value ?? activeMetric.value) || '—'}
                                                </td>
                                                <td style={{ padding: '12px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                                                    100%
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>

                            {/* ── AI-Powered Suggestions ── */}
                            <div className="details-card suggestions-main-card">
                                <div className="suggestions-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <svg className="bulb-svg-icon" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                        <h4 className="suggestions-title">System Efficiency Suggestions</h4>
                                    </div>
                                    {!aiRequested && !suggestionsLoading && (
                                        <button 
                                            onClick={handleAskAI}
                                            style={{
                                                backgroundColor: '#154c37', color: 'white', border: 'none', 
                                                padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', 
                                                fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                                            }}
                                        >
                                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Ask AI
                                        </button>
                                    )}
                                </div>

                                {!aiRequested && !suggestionsLoading && (
                                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-muted)', fontSize: '0.88rem', fontWeight: 500 }}>
                                        Click the "Ask AI" button above to generate intelligent insights for this KPI.
                                    </div>
                                )}

                                {suggestionsLoading && (
                                    <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--color-text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>
                                        <div className="spinner" style={{ width: 24, height: 24, border: '2px solid rgba(15,60,43,0.1)', borderTopColor: '#154c37', margin: '0 auto 10px' }}></div>
                                        Generating AI suggestions…
                                    </div>
                                )}

                                {!suggestionsLoading && aiRequested && aiSuggestions.length > 0 && (
                                    <div className="suggestions-grid">
                                        {aiSuggestions.map((sug, i) => (
                                            <div key={i} className="suggestion-subcard" style={{ border: '1px solid var(--color-border-light)' }}>
                                                <div className="sug-header">
                                                    {i === 0 ? (
                                                        <svg className="sug-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="sug-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                                                        </svg>
                                                    )}
                                                    <span className="sug-title">{sug.title}</span>
                                                </div>
                                                <p className="sug-desc">{sug.desc}</p>
                                                <span className={`sug-impact-badge badge-${sug.impactType}`}>{sug.impact}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                </div>

                {/* Right Column (Departments Switcher) */}
                <div className="details-switcher-panel animate-slide-left">
                    <h4 className="switcher-header-title">Departments</h4>
                    <span className="switcher-header-sub">Switch department</span>
                    <div className="switcher-list">
                        {systems.map((sys) => {
                            const isActive = currentSystem && currentSystem.id === sys.id;
                            const { tag, color } = getSystemTag(sys.name);
                            return (
                                <button
                                    key={sys.id}
                                    className={`switcher-item-btn ${isActive ? 'active' : ''}`}
                                    onClick={() => navigate(`/system-details/${sys.id}`)}
                                >
                                    <div className={`switcher-tag-box ${color}`}>{tag}</div>
                                    <span className="switcher-item-name">{sys.name}</span>
                                    <svg className="switcher-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            );
                        })}
                    </div>
                </div>

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

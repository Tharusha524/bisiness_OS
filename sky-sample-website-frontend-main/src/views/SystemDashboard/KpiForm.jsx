import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import api from '../../utils/api';
import '../../css/Dashboard.css';
import '../../css/SystemMetrics.css';

const AVAILABLE_ICONS = [
    { key: 'fa-wallet', label: 'Wallet', tags: ['wallet', 'money', 'payment', 'finance', 'cash', 'purse'] },
    { key: 'fa-credit-card', label: 'Credit Card', tags: ['credit', 'card', 'payment', 'debit', 'swipe', 'finance'] },
    { key: 'fa-building-columns', label: 'Bank', tags: ['bank', 'finance', 'institution', 'money', 'savings', 'loan'] },
    { key: 'fa-dollar-sign', label: 'Dollar', tags: ['dollar', 'money', 'currency', 'usd', 'cash', 'finance', 'cost', 'price'] },
    { key: 'fa-triangle-exclamation', label: 'Alert', tags: ['alert', 'warning', 'danger', 'caution', 'hazard', 'risk', 'exclamation'] },
    { key: 'fa-clock', label: 'Clock', tags: ['clock', 'time', 'hour', 'schedule', 'duration', 'deadline', 'timer'] },
    { key: 'fa-circle-check', label: 'Check', tags: ['check', 'done', 'complete', 'success', 'tick', 'verified', 'approved'] },
    { key: 'fa-shield-halved', label: 'Safety', tags: ['safety', 'shield', 'protect', 'security', 'guard', 'defense'] },
    { key: 'fa-chart-bar', label: 'Chart', tags: ['chart', 'bar', 'graph', 'statistics', 'data', 'analytics', 'report', 'kpi'] },
    { key: 'fa-chart-line', label: 'Line Chart', tags: ['chart', 'line', 'graph', 'trend', 'analytics', 'progress', 'data'] },
    { key: 'fa-chart-pie', label: 'Pie Chart', tags: ['chart', 'pie', 'graph', 'percentage', 'distribution', 'analytics'] },
    { key: 'fa-users', label: 'Users', tags: ['users', 'people', 'team', 'group', 'staff', 'employees', 'headcount', 'workforce'] },
    { key: 'fa-user', label: 'User', tags: ['user', 'person', 'profile', 'account', 'individual', 'employee', 'member'] },
    { key: 'fa-user-tie', label: 'Employee', tags: ['employee', 'staff', 'worker', 'professional', 'hr', 'manager', 'executive'] },
    { key: 'fa-briefcase', label: 'Briefcase', tags: ['briefcase', 'business', 'work', 'job', 'career', 'office', 'professional'] },
    { key: 'fa-building', label: 'Building', tags: ['building', 'office', 'company', 'property', 'real estate', 'headquarters'] },
    { key: 'fa-industry', label: 'Industry', tags: ['industry', 'factory', 'manufacturing', 'production', 'plant', 'operations'] },
    { key: 'fa-box', label: 'Box', tags: ['box', 'package', 'inventory', 'product', 'shipment', 'parcel', 'stock'] },
    { key: 'fa-boxes-stacked', label: 'Stock', tags: ['stock', 'inventory', 'boxes', 'warehouse', 'storage', 'goods', 'supply'] },
    { key: 'fa-truck', label: 'Truck', tags: ['truck', 'transport', 'logistics', 'delivery', 'vehicle', 'fleet', 'shipping'] },
    { key: 'fa-truck-fast', label: 'Delivery', tags: ['delivery', 'truck', 'fast', 'shipping', 'dispatch', 'logistics', 'courier'] },
    { key: 'fa-cart-shopping', label: 'Cart', tags: ['cart', 'shopping', 'purchase', 'order', 'buy', 'ecommerce', 'sales'] },
    { key: 'fa-bag-shopping', label: 'Shopping', tags: ['shopping', 'bag', 'purchase', 'retail', 'buy', 'sales', 'store'] },
    { key: 'fa-store', label: 'Store', tags: ['store', 'shop', 'retail', 'outlet', 'market', 'branch', 'sales'] },
    { key: 'fa-tag', label: 'Tag', tags: ['tag', 'label', 'price', 'discount', 'category', 'product', 'sku'] },
    { key: 'fa-tags', label: 'Tags', tags: ['tags', 'labels', 'categories', 'pricing', 'discount', 'sku', 'product'] },
    { key: 'fa-receipt', label: 'Receipt', tags: ['receipt', 'bill', 'invoice', 'payment', 'transaction', 'purchase', 'expense'] },
    { key: 'fa-file-invoice', label: 'Invoice', tags: ['invoice', 'bill', 'document', 'payment', 'finance', 'accounting', 'receipt'] },
    { key: 'fa-file-invoice-dollar', label: 'Invoice $', tags: ['invoice', 'dollar', 'bill', 'payment', 'finance', 'accounting', 'cost'] },
    { key: 'fa-money-bill', label: 'Money Bill', tags: ['money', 'bill', 'cash', 'currency', 'finance', 'dollar', 'banknote'] },
    { key: 'fa-money-bill-trend-up', label: 'Revenue', tags: ['revenue', 'income', 'money', 'growth', 'earnings', 'sales', 'profit', 'finance'] },
    { key: 'fa-coins', label: 'Coins', tags: ['coins', 'money', 'cash', 'currency', 'change', 'finance', 'savings'] },
    { key: 'fa-piggy-bank', label: 'Savings', tags: ['savings', 'piggy', 'bank', 'save', 'finance', 'deposit', 'fund', 'budget'] },
    { key: 'fa-hand-holding-dollar', label: 'Profit', tags: ['profit', 'income', 'earning', 'money', 'gain', 'return', 'finance'] },
    { key: 'fa-percent', label: 'Percent', tags: ['percent', 'rate', 'ratio', 'percentage', 'discount', 'interest', 'kpi'] },
    { key: 'fa-arrow-trend-up', label: 'Trend Up', tags: ['trend', 'up', 'growth', 'increase', 'rise', 'improve', 'positive'] },
    { key: 'fa-arrow-trend-down', label: 'Trend Down', tags: ['trend', 'down', 'decline', 'decrease', 'fall', 'negative', 'loss'] },
    { key: 'fa-scale-balanced', label: 'Balance', tags: ['balance', 'scale', 'equity', 'fair', 'accounting', 'finance', 'compare'] },
    { key: 'fa-fire', label: 'Fire', tags: ['fire', 'flame', 'hot', 'danger', 'hazard', 'safety', 'emergency', 'burn'] },
    { key: 'fa-fire-extinguisher', label: 'Extinguisher', tags: ['fire', 'extinguisher', 'safety', 'emergency', 'hazard', 'protection', 'rescue'] },
    { key: 'fa-hard-hat', label: 'Hard Hat', tags: ['hard hat', 'helmet', 'construction', 'safety', 'worker', 'ppe', 'protection'] },
    { key: 'fa-helmet-safety', label: 'Helmet', tags: ['helmet', 'safety', 'ppe', 'construction', 'protection', 'hard hat', 'worker'] },
    { key: 'fa-vest-patches', label: 'Safety Vest', tags: ['vest', 'safety', 'ppe', 'hi-vis', 'worker', 'visibility', 'protection'] },
    { key: 'fa-eye', label: 'Eye', tags: ['eye', 'view', 'monitor', 'watch', 'inspect', 'observe', 'surveillance'] },
    { key: 'fa-ban', label: 'Ban', tags: ['ban', 'block', 'prohibited', 'not allowed', 'restrict', 'stop', 'forbidden'] },
    { key: 'fa-circle-xmark', label: 'Close', tags: ['close', 'cancel', 'remove', 'delete', 'reject', 'error', 'failed'] },
    { key: 'fa-circle-info', label: 'Info', tags: ['info', 'information', 'help', 'about', 'detail', 'note', 'tip'] },
    { key: 'fa-star', label: 'Star', tags: ['star', 'rating', 'favorite', 'quality', 'excellence', 'top', 'kpi'] },
    { key: 'fa-thumbs-up', label: 'Thumbs Up', tags: ['thumbs up', 'like', 'approve', 'positive', 'good', 'feedback', 'rating'] },
    { key: 'fa-bolt', label: 'Energy', tags: ['energy', 'bolt', 'lightning', 'electricity', 'power', 'fast', 'utility'] },
    { key: 'fa-leaf', label: 'Eco', tags: ['eco', 'leaf', 'green', 'environment', 'sustainable', 'nature', 'carbon'] },
    { key: 'fa-recycle', label: 'Recycle', tags: ['recycle', 'environment', 'waste', 'green', 'sustainable', 'eco', 'reuse'] },
    { key: 'fa-droplet', label: 'Water', tags: ['water', 'droplet', 'liquid', 'fluid', 'utility', 'environment', 'consumption'] },
    { key: 'fa-temperature-half', label: 'Temperature', tags: ['temperature', 'heat', 'cold', 'climate', 'weather', 'thermostat', 'degree'] },
    { key: 'fa-gauge', label: 'Gauge', tags: ['gauge', 'meter', 'measure', 'speed', 'performance', 'kpi', 'level'] },
    { key: 'fa-gauge-high', label: 'Gauge High', tags: ['gauge', 'high', 'performance', 'meter', 'speed', 'max', 'kpi'] },
    { key: 'fa-list-check', label: 'Checklist', tags: ['checklist', 'list', 'task', 'todo', 'audit', 'inspection', 'compliance'] },
    { key: 'fa-clipboard-list', label: 'Clipboard', tags: ['clipboard', 'list', 'notes', 'record', 'report', 'form', 'data'] },
    { key: 'fa-clipboard-check', label: 'Audit', tags: ['audit', 'clipboard', 'check', 'compliance', 'inspection', 'review', 'verify'] },
    { key: 'fa-calendar', label: 'Calendar', tags: ['calendar', 'date', 'schedule', 'plan', 'event', 'month', 'deadline'] },
    { key: 'fa-calendar-check', label: 'Schedule', tags: ['schedule', 'calendar', 'plan', 'appointment', 'meeting', 'date', 'deadline'] },
    { key: 'fa-bell', label: 'Bell', tags: ['bell', 'alert', 'notification', 'alarm', 'reminder', 'notify', 'warning'] },
    { key: 'fa-bell-slash', label: 'Bell Off', tags: ['bell', 'mute', 'silent', 'no alert', 'notification off', 'off'] },
    { key: 'fa-flag', label: 'Flag', tags: ['flag', 'mark', 'report', 'issue', 'milestone', 'goal', 'target'] },
    { key: 'fa-bookmark', label: 'Bookmark', tags: ['bookmark', 'save', 'mark', 'favorite', 'reference', 'note'] },
    { key: 'fa-gear', label: 'Settings', tags: ['settings', 'gear', 'config', 'configure', 'system', 'admin', 'preferences'] },
    { key: 'fa-wrench', label: 'Wrench', tags: ['wrench', 'tool', 'repair', 'maintenance', 'fix', 'service', 'mechanic'] },
    { key: 'fa-screwdriver-wrench', label: 'Tools', tags: ['tools', 'wrench', 'screwdriver', 'repair', 'maintenance', 'fix', 'service'] },
    { key: 'fa-hammer', label: 'Hammer', tags: ['hammer', 'tool', 'construction', 'build', 'repair', 'maintenance', 'work'] },
    { key: 'fa-server', label: 'Server', tags: ['server', 'it', 'tech', 'infrastructure', 'database', 'hosting', 'system'] },
    { key: 'fa-database', label: 'Database', tags: ['database', 'data', 'storage', 'records', 'it', 'server', 'sql'] },
    { key: 'fa-network-wired', label: 'Network', tags: ['network', 'wired', 'connection', 'it', 'infrastructure', 'internet', 'lan'] },
    { key: 'fa-laptop', label: 'Laptop', tags: ['laptop', 'computer', 'device', 'it', 'tech', 'work', 'remote'] },
    { key: 'fa-mobile-screen', label: 'Mobile', tags: ['mobile', 'phone', 'device', 'smartphone', 'app', 'digital', 'it'] },
    { key: 'fa-print', label: 'Print', tags: ['print', 'printer', 'document', 'paper', 'office', 'output', 'report'] },
    { key: 'fa-envelope', label: 'Email', tags: ['email', 'envelope', 'mail', 'message', 'contact', 'communication', 'inbox'] },
    { key: 'fa-phone', label: 'Phone', tags: ['phone', 'call', 'contact', 'communication', 'support', 'helpdesk', 'mobile'] },
    { key: 'fa-location-dot', label: 'Location', tags: ['location', 'place', 'address', 'map', 'pin', 'site', 'gps', 'branch'] },
    { key: 'fa-map', label: 'Map', tags: ['map', 'location', 'area', 'region', 'geography', 'site', 'territory'] },
    { key: 'fa-globe', label: 'Globe', tags: ['globe', 'world', 'global', 'international', 'internet', 'web', 'online'] },
    { key: 'fa-lock', label: 'Lock', tags: ['lock', 'security', 'protect', 'password', 'access', 'private', 'safe'] },
    { key: 'fa-unlock', label: 'Unlock', tags: ['unlock', 'open', 'access', 'permission', 'security', 'allow'] },
    { key: 'fa-key', label: 'Key', tags: ['key', 'access', 'password', 'security', 'login', 'credential', 'unlock'] },
    { key: 'fa-id-card', label: 'ID Card', tags: ['id', 'card', 'identity', 'badge', 'employee', 'staff', 'profile', 'hr'] },
    { key: 'fa-image', label: 'Image', tags: ['image', 'photo', 'picture', 'media', 'gallery', 'visual', 'file'] },
    { key: 'fa-file', label: 'File', tags: ['file', 'document', 'record', 'paper', 'report', 'data', 'archive'] },
    { key: 'fa-folder', label: 'Folder', tags: ['folder', 'directory', 'files', 'storage', 'organize', 'archive', 'document'] },
    { key: 'fa-cloud', label: 'Cloud', tags: ['cloud', 'online', 'storage', 'backup', 'saas', 'it', 'upload'] },
    { key: 'fa-upload', label: 'Upload', tags: ['upload', 'send', 'transfer', 'share', 'submit', 'cloud', 'file'] },
    { key: 'fa-download', label: 'Download', tags: ['download', 'receive', 'transfer', 'get', 'file', 'save', 'export'] },
    { key: 'fa-magnifying-glass', label: 'Search', tags: ['search', 'find', 'look', 'scan', 'inspect', 'investigate', 'query'] },
    { key: 'fa-house', label: 'Home', tags: ['home', 'house', 'main', 'dashboard', 'start', 'property', 'base'] },
    { key: 'fa-table-columns', label: 'Dashboard', tags: ['dashboard', 'overview', 'panel', 'layout', 'admin', 'summary', 'kpi'] },
    { key: 'fa-sitemap', label: 'Sitemap', tags: ['sitemap', 'hierarchy', 'structure', 'org chart', 'tree', 'map', 'organization'] },
    { key: 'fa-timeline', label: 'Timeline', tags: ['timeline', 'history', 'progress', 'milestone', 'schedule', 'plan', 'roadmap'] },
    { key: 'fa-bullseye', label: 'Target', tags: ['target', 'goal', 'aim', 'kpi', 'objective', 'bullseye', 'hit'] },
    { key: 'fa-trophy', label: 'Trophy', tags: ['trophy', 'award', 'win', 'achievement', 'success', 'reward', 'excellence'] },
    { key: 'fa-medal', label: 'Medal', tags: ['medal', 'award', 'achievement', 'rank', 'honor', 'recognition', 'quality'] },
    { key: 'fa-ranking-star', label: 'Ranking', tags: ['ranking', 'rank', 'star', 'rating', 'score', 'performance', 'leaderboard'] },
];

export default function KpiForm() {
    const { id, metricId } = useParams();
    const navigate = useNavigate();
    
    const [system, setSystem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Form fields
    const [formName, setFormName] = useState('');
    const [formType, setFormType] = useState('Number');
    const [formUnit, setFormUnit] = useState('');
    const [ruleType, setRuleType] = useState('None');
    const [ruleConfig, setRuleConfig] = useState({ min: '', max: '', value: '', warning: '' });
    const [formDescription, setFormDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [items, setItems] = useState([]);
    const [newItemInput, setNewItemInput] = useState('');
    const [formIcon, setFormIcon] = useState('fa-dollar-sign');
    const [iconSearch, setIconSearch] = useState('');
    const [remoteIcons, setRemoteIcons] = useState([]);
    const [iconSearchLoading, setIconSearchLoading] = useState(false);
    const [iconSearchError, setIconSearchError] = useState(null);

    const isEditMode = !!metricId;

    useEffect(() => {
        fetchData();
    }, [id, metricId]);

    useEffect(() => {
        const query = iconSearch.trim();
        if (query.length < 2) {
            setRemoteIcons([]);
            setIconSearchError(null);
            return undefined;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(async () => {
            setIconSearchLoading(true);
            setIconSearchError(null);
            try {
                const response = await fetch(
                    `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=48`,
                    { signal: controller.signal }
                );
                if (!response.ok) {
                    throw new Error(`Icon search failed (${response.status})`);
                }
                const data = await response.json();
                const nextIcons = (data.icons || []).map((name) => {
                    const labelPart = name.includes(':') ? name.split(':')[1] : name;
                    return {
                        key: `iconify:${name}`,
                        label: labelPart.replace(/[-_]/g, ' '),
                        iconify: name
                    };
                });
                setRemoteIcons(nextIcons);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setIconSearchError('Unable to load online icons. Try again.');
                }
            } finally {
                setIconSearchLoading(false);
            }
        }, 300);

        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [iconSearch]);

    const renderIconPreview = (iconKey) => {
        if (iconKey.startsWith('iconify:')) {
            const iconName = iconKey.replace('iconify:', '');
            return (
                <img
                    src={`https://api.iconify.design/${iconName}.svg?color=%230f172a`}
                    alt={iconName}
                    width={22}
                    height={22}
                    loading="lazy"
                />
            );
        }

        return <i className={`fa-solid ${iconKey} picker-svg-icon`} style={{ fontSize: '1.4rem' }}></i>;
    };

    const filteredLocalIcons = AVAILABLE_ICONS.filter((icon) => {
        if (!iconSearch.trim()) {
            return true;
        }
        const query = iconSearch.toLowerCase();
        const labelMatch = icon.label.toLowerCase().includes(query);
        const tagMatch = (icon.tags || []).some((tag) => tag.toLowerCase().includes(query));
        return labelMatch || tagMatch;
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const systemRes = await api.get(`/systems/${id}`);
            setSystem(systemRes.data);

            if (isEditMode) {
                const metricsRes = await api.get(`/systems/${id}/metrics`);
                const metric = metricsRes.data.find(m => m.id === parseInt(metricId));
                if (metric) {
                    setFormName(metric.name || '');
                    setFormType(metric.type || 'Number');
                    setFormUnit(metric.unit || '');
                    
                    try {
                        if (metric.rule) {
                            const parsed = JSON.parse(metric.rule);
                            setRuleType(parsed.type || 'None');
                            setRuleConfig(parsed.config || { min: '', max: '', value: '', warning: '' });
                        } else {
                            setRuleType('None');
                        }
                    } catch (e) {
                        // fallback if rule was a string
                        setRuleType('None');
                    }
                    
                    setFormDescription(metric.description || '');
                    setIsActive(metric.is_active !== undefined ? metric.is_active : true);
                    setItems(metric.items || []);
                    setFormIcon(metric.icon || 'fa-dollar-sign');
                } else {
                    setError("Metric not found.");
                }
            }
        } catch (err) {
            console.error("Fetch failed", err);
            setError("Unable to load details.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        if (newItemInput.trim() && !items.includes(newItemInput.trim())) {
            setItems([...items, newItemInput.trim()]);
            setNewItemInput('');
        }
    };

    const handleRemoveItem = (itemToRemove) => {
        setItems(items.filter(item => item !== itemToRemove));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formName.trim()) {
            setError("Metric Name is required.");
            return;
        }

        setSaving(true);
        setError(null);

        // Include any un-added item in the input field
        let finalItems = [...items];
        if (newItemInput.trim() && !finalItems.includes(newItemInput.trim())) {
            finalItems.push(newItemInput.trim());
            setNewItemInput('');
            setItems(finalItems);
        }

        const rulePayload = JSON.stringify({
            type: ruleType,
            config: ruleConfig
        });

        const payload = {
            name: formName,
            type: formType,
            unit: formUnit,
            rule: rulePayload,
            description: formDescription,
            is_active: isActive,
            items: finalItems,
            icon: formIcon,
            value: isEditMode ? undefined : '0' // Default value placeholder if needed
        };

        try {
            if (isEditMode) {
                await api.put(`/metrics/${metricId}`, payload);
            } else {
                await api.post(`/systems/${id}/metrics`, payload);
            }
            navigate(`/system-setup/${id}`);
        } catch (err) {
            console.error("Save failed", err);
            setError("Failed to save metric. Please verify inputs.");
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', backgroundColor: 'var(--color-bg-primary)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--color-border-light)', borderTopColor: 'var(--color-accent-green)', margin: '0 auto 16px' }}></div>
                    <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="setup-container animate-fade-in" style={{ padding: '0px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                <Link to="/system-setup" style={{ color: 'var(--pallet-blue)', textDecoration: 'none' }}>System administrator</Link>
                <span style={{ margin: '0 8px' }}>›</span>
                <Link to="/system-setup" style={{ color: 'var(--pallet-blue)', textDecoration: 'none' }}>System Setup</Link>
                <span style={{ margin: '0 8px' }}>›</span>
                <Link to={`/system-setup/${id}`} style={{ color: 'var(--pallet-blue)', textDecoration: 'none' }}>{system?.name || 'Finance'}</Link>
                <span style={{ margin: '0 8px' }}>›</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{isEditMode ? 'Edit KPI' : 'Add KPI'}</span>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: '8px', border: '1px solid var(--color-border-light)', borderTop: '4px solid var(--color-accent-green)', padding: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)', marginBottom: '24px', fontWeight: 600 }}>KPI Make Form</h2>
                <hr style={{ borderTop: '1px solid var(--color-border-light)', marginBottom: '24px' }} />

                {error && <div className="error-alert" style={{ marginBottom: '20px' }}>{error}</div>}

                <form onSubmit={handleSave}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Name</label>
                            <input
                                type="text"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder="Enter KPI Name"
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--color-border-light)', fontSize: '0.95rem', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)' }}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Type</label>
                                <select
                                    value={formType}
                                    onChange={(e) => { setFormType(e.target.value); setFormUnit(''); }}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--color-border-light)', fontSize: '0.95rem', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)' }}
                                >
                                    <option value="Number">Select Type (Number)</option>
                                    <option value="Percentage">Percentage</option>
                                    <option value="Currency">Currency</option>
                                    <option value="Count">Count</option>
                                    <option value="Rate">Rate</option>
                                    <option value="Ratio">Ratio</option>
                                    <option value="Duration">Duration</option>
                                    <option value="Time">Time</option>
                                    <option value="Quantity">Quantity</option>
                                    <option value="Volume">Volume</option>
                                    <option value="Weight">Weight</option>
                                    <option value="Distance">Distance</option>
                                    <option value="Area">Area</option>
                                    <option value="Energy">Energy</option>
                                    <option value="Cost">Cost</option>
                                    <option value="Revenue">Revenue</option>
                                    <option value="Profit">Profit</option>
                                    <option value="Quality">Quality</option>
                                    <option value="Compliance">Compliance</option>
                                    <option value="Satisfaction">Satisfaction</option>
                                </select>
                            </div>
                            {(formType === 'Currency' || ['Cost', 'Revenue', 'Profit'].includes(formType)) && (
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Currency</label>
                                    <input 
                                        type="text" 
                                        list="currency-list"
                                        value={formUnit}
                                        onChange={(e) => setFormUnit(e.target.value)}
                                        placeholder="e.g. USD, Rs."
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--color-border-light)', fontSize: '0.95rem', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)' }}
                                    />
                                    <datalist id="currency-list">
                                        <option value="Rs.">Rs. (Rupee)</option>
                                        <option value="$">US Dollar</option>
                                        <option value="€">Euro</option>
                                        <option value="£">British Pound</option>
                                        <option value="¥">Japanese Yen</option>
                                        <option value="₹">Indian Rupee</option>
                                        <option value="AUD">Australian Dollar</option>
                                        <option value="CAD">Canadian Dollar</option>
                                        <option value="CHF">Swiss Franc</option>
                                        <option value="CNY">Chinese Yuan</option>
                                        <option value="RUB">Russian Ruble</option>
                                        <option value="ZAR">South African Rand</option>
                                    </datalist>
                                </div>
                            )}
                            {['Weight', 'Distance', 'Duration', 'Time', 'Volume', 'Area', 'Energy'].includes(formType) && (
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Unit</label>
                                    <input 
                                        type="text" 
                                        list={`${formType.toLowerCase()}-list`}
                                        value={formUnit}
                                        onChange={(e) => setFormUnit(e.target.value)}
                                        placeholder="e.g. kg, km"
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--color-border-light)', fontSize: '0.95rem', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)' }}
                                    />
                                    <datalist id="weight-list"><option value="kg"/><option value="g"/><option value="lbs"/><option value="oz"/><option value="ton"/></datalist>
                                    <datalist id="distance-list"><option value="km"/><option value="m"/><option value="cm"/><option value="mi"/><option value="yd"/><option value="ft"/></datalist>
                                    <datalist id="duration-list"><option value="sec"/><option value="min"/><option value="hours"/><option value="days"/><option value="weeks"/><option value="months"/></datalist>
                                    <datalist id="time-list"><option value="sec"/><option value="min"/><option value="hours"/><option value="days"/></datalist>
                                    <datalist id="volume-list"><option value="L"/><option value="mL"/><option value="gal"/><option value="qt"/><option value="pt"/></datalist>
                                    <datalist id="area-list"><option value="sq m"/><option value="sq km"/><option value="sq ft"/><option value="acres"/><option value="hectares"/></datalist>
                                    <datalist id="energy-list"><option value="J"/><option value="kJ"/><option value="cal"/><option value="kcal"/><option value="Wh"/><option value="kWh"/></datalist>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Rule Type</label>
                                <select
                                    value={ruleType}
                                    onChange={(e) => setRuleType(e.target.value)}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--color-border-light)', fontSize: '0.95rem', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)' }}
                                >
                                    <option value="None">None (Info only)</option>
                                    <option value="Min">Min (At least this much)</option>
                                    <option value="Max">Max (Must not exceed)</option>
                                    <option value="Range">Range (Stay between numbers)</option>
                                    <option value="Target">Target (% against a goal)</option>
                                </select>
                            </div>
                            
                            {(ruleType === 'Min' || ruleType === 'Max') && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{ruleType === 'Min' ? 'Minimum Value' : 'Maximum Value'}</label>
                                        <input
                                            type="number"
                                            value={ruleConfig.value}
                                            onChange={(e) => setRuleConfig({...ruleConfig, value: e.target.value})}
                                            placeholder="Value"
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--color-border-light)', fontSize: '0.95rem', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Warning Zone (Optional)</label>
                                        <input
                                            type="number"
                                            value={ruleConfig.warning}
                                            onChange={(e) => setRuleConfig({...ruleConfig, warning: e.target.value})}
                                            placeholder="Warning value"
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--color-border-light)', fontSize: '0.95rem', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)' }}
                                        />
                                    </div>
                                </div>
                            )}

                            {ruleType === 'Range' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Min Value</label>
                                        <input
                                            type="number"
                                            value={ruleConfig.min}
                                            onChange={(e) => setRuleConfig({...ruleConfig, min: e.target.value})}
                                            placeholder="Min"
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--color-border-light)', fontSize: '0.95rem', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Max Value</label>
                                        <input
                                            type="number"
                                            value={ruleConfig.max}
                                            onChange={(e) => setRuleConfig({...ruleConfig, max: e.target.value})}
                                            placeholder="Max"
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--color-border-light)', fontSize: '0.95rem', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)' }}
                                        />
                                    </div>
                                </div>
                            )}

                            {ruleType === 'Target' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Target Goal</label>
                                    <input
                                        type="number"
                                        value={ruleConfig.value}
                                        onChange={(e) => setRuleConfig({...ruleConfig, value: e.target.value})}
                                        placeholder="Goal value"
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--color-border-light)', fontSize: '0.95rem', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)' }}
                                    />
                                    <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                        Below 80% = Red | 80-99% = Orange | 100%+ = Green
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Description</label>
                        <textarea
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            placeholder="Enter Description"
                            rows={4}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--color-border-light)', fontSize: '0.95rem', resize: 'vertical', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)' }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Subcategories</label>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Active</span>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                        style={{ display: 'none' }}
                                    />
                                    <div style={{
                                        width: '40px', height: '20px', backgroundColor: isActive ? 'var(--color-accent-green)' : 'var(--color-border-light)',
                                        borderRadius: '20px', position: 'relative', transition: '0.3s'
                                    }}>
                                        <div style={{
                                            width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%',
                                            position: 'absolute', top: '2px', left: isActive ? '22px' : '2px', transition: '0.3s'
                                        }}></div>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <div style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border-light)', borderRadius: '4px', padding: '16px', minHeight: '80px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                                {items.map((item, index) => (
                                    <div key={index} style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-light)', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                                        {item}
                                        <button type="button" onClick={() => handleRemoveItem(item)} style={{ background: 'none', border: 'none', marginLeft: '6px', cursor: 'pointer', color: 'var(--color-text-muted)' }}>✕</button>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    value={newItemInput}
                                    onChange={(e) => setNewItemInput(e.target.value)}
                                    placeholder="New Subcategory"
                                    style={{ padding: '6px 12px', border: '1px solid var(--color-border-light)', borderRadius: '4px 0 0 4px', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem(e)}
                                />
                                <button type="button" onClick={handleAddItem} style={{ padding: '6px 12px', border: '1px solid var(--color-border-light)', borderLeft: 'none', borderRadius: '0 4px 4px 0', backgroundColor: 'var(--color-bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-accent-green)', fontWeight: 500 }}>
                                    <span style={{ marginRight: '4px' }}>+</span> Add Subcategory
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Choose Icon</label>
                        <input
                            type="text"
                            placeholder="Search icons..."
                            value={iconSearch}
                            onChange={(e) => setIconSearch(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', marginBottom: '10px', border: '1px solid var(--color-border-light)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)' }}
                        />
                        <div className="icon-selection-grid" style={{ maxHeight: '260px', overflowY: 'auto' }}>
                            {filteredLocalIcons.map((icon) => (
                                <button
                                    key={icon.key}
                                    type="button"
                                    className={`icon-picker-btn ${formIcon === icon.key ? 'selected' : ''}`}
                                    onClick={() => setFormIcon(icon.key)}
                                    title={icon.label}
                                >
                                    {renderIconPreview(icon.key)}
                                    <span className="picker-icon-name">{icon.label}</span>
                                </button>
                            ))}
                            {iconSearch.trim().length >= 2 && (
                                <div className="icon-picker-section" style={{ width: '100%' }}>
                                    <div className="icon-picker-subtitle" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '8px 0' }}>
                                        Online results
                                    </div>
                                    {iconSearchLoading && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Loading icons...</div>
                                    )}
                                    {iconSearchError && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-red)' }}>{iconSearchError}</div>
                                    )}
                                    {!iconSearchLoading && !iconSearchError && remoteIcons.length === 0 && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No online icons found.</div>
                                    )}
                                </div>
                            )}
                            {remoteIcons.map((icon) => (
                                <button
                                    key={icon.key}
                                    type="button"
                                    className={`icon-picker-btn ${formIcon === icon.key ? 'selected' : ''}`}
                                    onClick={() => setFormIcon(icon.key)}
                                    title={icon.label}
                                >
                                    {renderIconPreview(icon.key)}
                                    <span className="picker-icon-name">{icon.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: 'var(--color-bg-primary)', padding: '16px', margin: '0 -24px -24px -24px', borderTop: '1px solid var(--color-border-light)', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                        <button 
                            type="button" 
                            onClick={() => navigate(`/system-setup/${id}`)}
                            style={{ padding: '8px 24px', backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-light)', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, color: 'var(--color-text-secondary)' }}
                            disabled={saving}
                        >
                            cancel
                        </button>
                        <button 
                            type="submit" 
                            style={{ padding: '8px 24px', backgroundColor: 'var(--color-accent-green)', border: '1px solid var(--color-accent-green)', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, color: 'white' }}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Confirm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

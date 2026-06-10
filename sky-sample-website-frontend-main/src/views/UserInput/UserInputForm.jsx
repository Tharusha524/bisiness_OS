import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material';
import api from '../../utils/api';
import useCurrentUser from '../../hooks/useCurrentUser';
import '../../css/Dashboard.css';
import '../../css/SystemSetup.css';

function evaluateRule(rawVal, ruleStr) {
    if (isNaN(rawVal)) return 'grey';
    let rule = null;
    try { rule = ruleStr ? JSON.parse(ruleStr) : null; } catch(e){}
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

function localToday() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function UserInputForm() {
    const { systemId, metricId } = useParams();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const muiTheme = useTheme();
    const dark = muiTheme.palette.mode === 'dark';
    const { user } = useCurrentUser();
    const canAddNote = !!user?.permissionObject?.[`KPI_${metricId}_NOTE`];

    const [system, setSystem] = useState(null);
    const [metric, setMetric] = useState(null);
    const [metricItems, setMetricItems] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [singleValue, setSingleValue] = useState('');
    const [itemValues, setItemValues] = useState({});
    const [notes, setNotes] = useState('');

    // Date selection
    const [selectedDate, setSelectedDate] = useState(localToday());
    const [holidays, setHolidays] = useState([]);
    const [dateError, setDateError] = useState('');
    const [deadlineWarning, setDeadlineWarning] = useState('');
    const [orgSettings, setOrgSettings] = useState(null);
    const [minDate, setMinDate] = useState('');

    useEffect(() => {
        fetchMetaData();
    }, [systemId, metricId]);

    // Reload daily value whenever the selected date changes (and metric items are ready)
    useEffect(() => {
        if (!metric) return;
        loadDailyValue(selectedDate);
    }, [selectedDate, metric]);

    const fetchMetaData = async () => {
        try {
            const [sysRes, metsRes, itemsRes, holidaysRes, orgRes] = await Promise.all([
                api.get(`/systems/${systemId}`),
                api.get(`/systems/${systemId}/metrics`),
                api.get(`/metrics/${metricId}/items`),
                api.get('/company-holidays'),
                fetch('/api/organizations').then(r => r.json()).catch(() => null),
            ]);
            setSystem(sysRes.data);

            const met = metsRes.data.find(m => m.id === Number(metricId));
            setMetric(met);

            const items = itemsRes.data;
            setMetricItems(items);

            const holidayDates = (holidaysRes.data || []).map(h =>
                typeof h.date === 'string' ? h.date.substring(0, 10) : ''
            );
            setHolidays(holidayDates);

            // Apply org settings
            if (orgRes) {
                setOrgSettings(orgRes);
                const graceDays = orgRes.historicalDataGracePeriod || 30;
                const minD = new Date();
                minD.setDate(minD.getDate() - graceDays);
                setMinDate(`${minD.getFullYear()}-${String(minD.getMonth()+1).padStart(2,'0')}-${String(minD.getDate()).padStart(2,'0')}`);

                // Check if past today's deadline
                if (orgRes.dataEntryDeadlineTime) {
                    const now = new Date();
                    const [h, m] = orgRes.dataEntryDeadlineTime.split(':').map(Number);
                    const deadline = new Date();
                    deadline.setHours(h, m, 0, 0);
                    if (now > deadline) {
                        setDeadlineWarning(`Today's data entry deadline (${orgRes.dataEntryDeadlineTime}) has passed. Your entry will be recorded as late.`);
                    }
                }
            }

            if (items.length > 0) {
                const map = {};
                items.forEach(i => { map[i.id] = ''; });
                setItemValues(map);
            } else {
                setSingleValue('');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadDailyValue = useCallback(async (date) => {
        try {
            const res = await api.get(`/metrics/${metricId}/daily-values/${date}`);
            const dv = res.data;

            if (dv) {
                if (metricItems.length > 0 && dv.item_values) {
                    setItemValues(dv.item_values);
                } else if (dv.value !== null && dv.value !== undefined) {
                    const numeric = parseFloat(String(dv.value).replace(/[^0-9.-]+/g, ''));
                    setSingleValue(isNaN(numeric) ? '' : String(numeric));
                }
                setNotes(dv.notes || '');
            } else {
                // No data yet for this date — clear form
                if (metricItems.length > 0) {
                    const map = {};
                    metricItems.forEach(i => { map[i.id] = ''; });
                    setItemValues(map);
                } else {
                    setSingleValue('');
                }
                setNotes('');
            }
        } catch {
            // Not found is fine — just clear
            if (metricItems.length > 0) {
                const map = {};
                metricItems.forEach(i => { map[i.id] = ''; });
                setItemValues(map);
            } else {
                setSingleValue('');
            }
            setNotes('');
        }
    }, [metricId, metricItems]);

    const validateDate = (dateStr) => {
        if (minDate && dateStr < minDate)
            return `Date is outside the allowed historical period (max ${orgSettings?.historicalDataGracePeriod || 30} days back)`;
        if (holidays.includes(dateStr))
            return 'This is a company holiday — no data entry allowed';
        if (orgSettings?.workingDays?.length) {
            const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
            const day = dayNames[new Date(dateStr + 'T00:00:00').getDay()];
            if (!orgSettings.workingDays.includes(day))
                return `${day} is not a working day for your company`;
        }
        return '';
    };

    const handleDateChange = (e) => {
        const val = e.target.value;
        setSelectedDate(val);
        setDateError(validateDate(val));
    };

    const isComposite = metricItems.length > 0;

    const currentTotal = useMemo(() => {
        if (!isComposite) return parseFloat(singleValue) || 0;
        return Object.values(itemValues).reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
    }, [isComposite, singleValue, itemValues]);

    const currentStatus = useMemo(() => evaluateRule(currentTotal, metric?.rule), [currentTotal, metric]);

    const handleSave = async (e) => {
        e.preventDefault();

        const err = validateDate(selectedDate);
        if (err) {
            enqueueSnackbar(err, { variant: 'warning' });
            return;
        }

        setSaving(true);
        try {
            const type = metric.type?.toLowerCase();
            let formattedValue;
            if (type === 'currency') {
                formattedValue = 'Rs. ' + parseFloat(currentTotal).toFixed(2);
            } else if (type === 'percentage') {
                formattedValue = parseFloat(currentTotal).toFixed(2) + '%';
            } else {
                formattedValue = String(currentTotal);
            }

            const payload = {
                data_date: selectedDate,
                value: formattedValue,
                item_values: isComposite ? itemValues : null,
                notes: notes.trim() || null,
            };

            // Save to daily-values history
            await api.post(`/metrics/${metricId}/daily-values`, payload);

            // Only sync metric_items and metric.value for today's data.
            // For historical dates the backend already re-syncs metric.value
            // to the most recent data_date entry, so overwriting here would
            // push a past value into the live dashboard.
            if (isToday) {
                if (isComposite) {
                    for (const item of metricItems) {
                        await api.put(`/metrics/${metricId}/items/${item.id}`, {
                            name: item.name,
                            value: parseFloat(itemValues[item.id]) || 0,
                        });
                    }
                }

                await api.put(`/metrics/${metricId}`, {
                    ...metric,
                    value: formattedValue,
                });
            }

            enqueueSnackbar(
                isToday ? 'Data saved successfully!' : `Historical data for ${selectedDate} saved!`,
                { variant: 'success' }
            );
            navigate(`/user-input/${systemId}`);
        } catch {
            enqueueSnackbar('Failed to save data.', { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(15,60,43,0.1)', borderTopColor: '#154c37' }}></div>
            </div>
        );
    }

    const getStatusColor = (s) => s === 'green' ? '#22c55e' : s === 'orange' ? '#f97316' : s === 'red' ? '#ef4444' : '#94a3b8';
    const getStatusText  = (s) => s === 'green' ? 'On Target' : s === 'orange' ? 'Warning' : s === 'red' ? 'Critical' : 'No Rule Set';

    let ruleDisplay = 'None';
    if (metric?.rule) {
        try {
            const r = JSON.parse(metric.rule);
            if (r.type === 'Min')    ruleDisplay = `Min: ${r.config.value}`;
            if (r.type === 'Max')    ruleDisplay = `Max: ${r.config.value}`;
            if (r.type === 'Range')  ruleDisplay = `Range: ${r.config.min} - ${r.config.max}`;
            if (r.type === 'Target') ruleDisplay = `Target: ${r.config.value}`;
        } catch {}
    }

    const today = localToday();
    const isToday = selectedDate === today;

    return (
        <div className="setup-container animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                <Link to="/user-input" style={{ color: 'var(--pallet-blue)', textDecoration: 'none' }}>Data Entry</Link>
                <span style={{ margin: '0 8px' }}>›</span>
                <Link to={`/user-input/${systemId}`} style={{ color: 'var(--pallet-blue)', textDecoration: 'none' }}>{system?.name}</Link>
                <span style={{ margin: '0 8px' }}>›</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{metric?.name}</span>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg-card)', padding: '32px', borderRadius: '8px', border: '1px solid var(--color-border-light)', boxShadow: dark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)', maxWidth: '700px' }}>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)', marginBottom: '8px', fontWeight: 600 }}>{metric?.name} Input</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border-light)' }}>
                    <span style={{ fontSize: '0.85rem', padding: '4px 8px', backgroundColor: 'var(--color-bg-input)', borderRadius: '4px', color: 'var(--color-text-muted)' }}>
                        Rule: {ruleDisplay}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: getStatusColor(currentStatus), backgroundColor: `${getStatusColor(currentStatus)}15`, padding: '4px 10px', borderRadius: '12px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor(currentStatus) }}></div>
                        Status: {getStatusText(currentStatus)}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Total: {currentTotal}
                    </span>
                </div>

                {/* Date selector */}
                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--color-bg-input)', borderRadius: '8px', border: `1px solid ${dateError ? '#fca5a5' : 'var(--color-border-light)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                                Data Entry Date
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                max={today}
                                min={minDate || undefined}
                                onChange={handleDateChange}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: `1px solid ${dateError ? '#ef4444' : '#cbd5e1'}`,
                                    fontSize: '0.95rem',
                                    color: 'var(--color-text-primary)',
                                    backgroundColor: 'var(--color-bg-card)',
                                    cursor: 'pointer',
                                    width: '100%',
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '22px' }}>
                            {isToday ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 600, color: '#16a34a', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '12px' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }}></div>
                                    Today
                                </span>
                            ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 600, color: '#9333ea', backgroundColor: '#f3e8ff', padding: '4px 10px', borderRadius: '12px' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-5"/></svg>
                                    Historical
                                </span>
                            )}
                        </div>
                    </div>
                    {dateError && (
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.82rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            {dateError}
                        </p>
                    )}
                    {!dateError && !isToday && (
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.82rem', color: '#7c3aed' }}>
                            You are entering historical data for <strong>{selectedDate}</strong>. This will be stored separately from today's current value.
                        </p>
                    )}
                    {!dateError && isToday && deadlineWarning && (
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.82rem', color: '#f97316', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            {deadlineWarning}
                        </p>
                    )}
                </div>

                <form onSubmit={handleSave}>
                    {!isComposite ? (
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>Value</label>
                            <input
                                type="number"
                                step="any"
                                value={singleValue}
                                onChange={(e) => setSingleValue(e.target.value)}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--color-border-light)', fontSize: '1.2rem', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)' }}
                                required
                                disabled={!!dateError}
                            />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                            {metricItems.map(item => (
                                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: '16px', padding: '12px', backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border-light)', borderRadius: '6px' }}>
                                    <div style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>{item.name}</div>
                                    <input
                                        type="number"
                                        step="any"
                                        value={itemValues[item.id] !== undefined ? itemValues[item.id] : ''}
                                        onChange={(e) => setItemValues({ ...itemValues, [item.id]: e.target.value })}
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--color-border-light)', fontSize: '1rem', backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
                                        required
                                        disabled={!!dateError}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {canAddNote && (
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                                Special Notes
                                <span style={{ marginLeft: '8px', fontSize: '0.78rem', fontWeight: 400, color: '#94a3b8' }}>Optional</span>
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any remarks or observations for this entry…"
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--color-border-light)',
                                    fontSize: '0.9rem',
                                    color: 'var(--color-text-primary)',
                                    backgroundColor: 'var(--color-bg-input)',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    lineHeight: '1.5',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={() => navigate(`/user-input/${systemId}`)}
                            style={{ padding: '10px 24px', backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-light)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: 'var(--color-text-secondary)' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !!dateError}
                            style={{ padding: '10px 32px', backgroundColor: dateError ? '#94a3b8' : '#154c37', border: 'none', borderRadius: '6px', cursor: dateError ? 'not-allowed' : 'pointer', fontWeight: 600, color: 'white' }}
                        >
                            {saving ? 'Saving...' : isToday ? 'Save Data' : 'Save Historical Data'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

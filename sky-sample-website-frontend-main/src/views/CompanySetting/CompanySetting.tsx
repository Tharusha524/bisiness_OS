import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material';
import { getOrganization, updateOrganization } from '../../api/OrganizationSettings/organizationSettingsApi';
import { fetchHolidays, createHoliday, updateHoliday, deleteHoliday } from '../../api/OrganizationSettings/companyHolidaysApi';
import api from '../../utils/api';
import DepartmentTable from '../Administration/DepartmentTable';
import JobPositionTable from '../Administration/JobPositionTable';
import '../../css/Dashboard.css';
import '../../css/SystemSetup.css';

export default function CompanySetting() {
    const { enqueueSnackbar } = useSnackbar();
    const queryClient = useQueryClient();
    const muiTheme = useTheme();
    const dark = muiTheme.palette.mode === 'dark';

    const card    = { bg: dark ? '#1e293b' : '#ffffff', border: dark ? '#334155' : '#e2e8f0' };
    const inp     = { bg: dark ? '#0f172a' : '#f8fafc', border: dark ? '#475569' : '#cbd5e1' };
    const txt     = { primary: dark ? '#f1f5f9' : '#1e293b', secondary: dark ? '#94a3b8' : '#64748b', heading: dark ? '#ffffff' : '#0f172a' };
    const divider = dark ? '#334155' : '#e2e8f0';

    const { data: orgData, isLoading } = useQuery({ queryKey: ['organization'], queryFn: getOrganization });
    const { data: holidays = [], refetch: refetchHolidays } = useQuery({ queryKey: ['holidays'], queryFn: fetchHolidays });
    const { data: activities = [], refetch: refetchActivities } = useQuery({ queryKey: ['user-activities'], queryFn: () => api.get('/user-activities').then(r => r.data) });

    const [activityFilter, setActivityFilter] = useState('');

    const [isHolidayOpen, setIsHolidayOpen] = useState(false);
    const [newHolidayName, setNewHolidayName] = useState('');
    const [newHolidayDate, setNewHolidayDate] = useState('');
    const [editingHoliday, setEditingHoliday] = useState<{ id: number; name: string; date: string } | null>(null);

    // Core Identity
    const [organizationName, setOrganizationName] = useState('');
    const [organizationFactoryName, setOrganizationFactoryName] = useState('');
    const [companyPhone, setCompanyPhone] = useState('');
    const [industry, setIndustry] = useState('');
    const [insightDescription, setInsightDescription] = useState('');
    const [companyWebsite, setCompanyWebsite] = useState('');
    const [supportEmail, setSupportEmail] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

    // Localisation & Working Hours
    const [defaultCurrency, setDefaultCurrency] = useState('');
    const [timezone, setTimezone] = useState('');
    const [dateFormat, setDateFormat] = useState('');
    const [workingDays, setWorkingDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    const [workingHoursStart, setWorkingHoursStart] = useState('');
    const [workingHoursEnd, setWorkingHoursEnd] = useState('');

    // Operational
    const [historicalDataGracePeriod, setHistoricalDataGracePeriod] = useState<number | ''>(30);
    const [dataEntryDeadlineTime, setDataEntryDeadlineTime] = useState('');

    // Legal
    const [headquartersAddress, setHeadquartersAddress] = useState('');
    const [taxId, setTaxId] = useState('');
    const [financialYearStart, setFinancialYearStart] = useState('');

    // Security
    const [sessionTimeout, setSessionTimeout] = useState<number | ''>('');
    const [enforce2fa, setEnforce2fa] = useState(false);
    const [allowSelfRegistration, setAllowSelfRegistration] = useState(false);
    const [allowedEmailDomains, setAllowedEmailDomains] = useState('');
    const [passwordPolicy, setPasswordPolicy] = useState('Standard');
    const [passwordMinLength, setPasswordMinLength] = useState<number | ''>(8);
    const [passwordRequireUppercase, setPasswordRequireUppercase] = useState(false);
    const [passwordRequireNumbers, setPasswordRequireNumbers] = useState(false);
    const [passwordRequireSymbols, setPasswordRequireSymbols] = useState(false);
    const [passwordExpiryDays, setPasswordExpiryDays] = useState<number | ''>(90);

    // Alerts
    const [globalAlertEmails, setGlobalAlertEmails] = useState('');

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        if (!orgData) return;
        setOrganizationName(orgData.organizationName || '');
        setOrganizationFactoryName(orgData.organizationFactoryName || '');
        setCompanyPhone(orgData.companyPhone || '');
        setIndustry(orgData.industry || '');
        setInsightDescription(orgData.insightDescription || '');
        setCompanyWebsite(orgData.companyWebsite || '');
        setSupportEmail(orgData.supportEmail || '');

        if (!Array.isArray(orgData.logoUrl) && orgData.logoUrl?.signedUrl)
            setLogoPreviewUrl(orgData.logoUrl.signedUrl);
        else if (Array.isArray(orgData.logoUrl) && orgData.logoUrl[0]?.signedUrl)
            setLogoPreviewUrl(orgData.logoUrl[0].signedUrl);

        setDefaultCurrency(orgData.defaultCurrency || '');
        setTimezone(orgData.timezone || '');
        setDateFormat(orgData.dateFormat || '');
        setWorkingDays(orgData.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
        setWorkingHoursStart((orgData as any).workingHoursStart || '');
        setWorkingHoursEnd((orgData as any).workingHoursEnd || '');
        setHistoricalDataGracePeriod((orgData as any).historicalDataGracePeriod ?? 30);
        setDataEntryDeadlineTime((orgData as any).dataEntryDeadlineTime || '');

        setHeadquartersAddress(orgData.headquartersAddress || '');
        setTaxId(orgData.taxId || '');
        setFinancialYearStart(orgData.financialYearStart || '');

        setSessionTimeout(orgData.sessionTimeout || '');
        setEnforce2fa(orgData.enforce2fa || false);
        setAllowSelfRegistration(orgData.allowSelfRegistration || false);
        setAllowedEmailDomains((orgData.allowedEmailDomains || []).join(', '));
        setPasswordPolicy((orgData as any).passwordPolicy || 'Standard');
        setPasswordMinLength(orgData.passwordMinLength || 8);
        setPasswordRequireUppercase(orgData.passwordRequireUppercase || false);
        setPasswordRequireNumbers(orgData.passwordRequireNumbers || false);
        setPasswordRequireSymbols(orgData.passwordRequireSymbols || false);
        setPasswordExpiryDays(orgData.passwordExpiryDays || 90);
        setGlobalAlertEmails(orgData.globalAlertEmails || '');
    }, [orgData]);

    // Sync strict policy toggle to individual checkboxes
    const handlePolicyToggle = (policy: string) => {
        setPasswordPolicy(policy);
        if (policy === 'Strict') {
            setPasswordMinLength(12);
            setPasswordRequireUppercase(true);
            setPasswordRequireNumbers(true);
            setPasswordRequireSymbols(true);
        } else {
            setPasswordMinLength(8);
            setPasswordRequireUppercase(false);
            setPasswordRequireNumbers(false);
            setPasswordRequireSymbols(false);
        }
    };

    const updateOrgMutation = useMutation({
        mutationFn: updateOrganization,
        onSuccess: () => { enqueueSnackbar('Company settings saved', { variant: 'success' }); queryClient.invalidateQueries({ queryKey: ['organization'] }); },
        onError: () => enqueueSnackbar('Failed to save settings', { variant: 'error' }),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!orgData) return;
        updateOrgMutation.mutate({
            ...orgData,
            organizationName, organizationFactoryName, companyPhone, industry,
            insightDescription, companyWebsite, supportEmail,
            defaultCurrency, timezone, dateFormat,
            workingDays,
            workingHoursStart: (workingHoursStart || null) as any,
            workingHoursEnd: (workingHoursEnd || null) as any,
            historicalDataGracePeriod: historicalDataGracePeriod ? Number(historicalDataGracePeriod) : null,
            dataEntryDeadlineTime: (dataEntryDeadlineTime || null) as any,
            headquartersAddress, taxId, financialYearStart,
            sessionTimeout: sessionTimeout ? Number(sessionTimeout) : null,
            enforce2fa, allowSelfRegistration,
            allowedEmailDomains: allowedEmailDomains.split(',').map(s => s.trim()).filter(Boolean),
            passwordPolicy: passwordPolicy as any,
            passwordMinLength: passwordMinLength ? Number(passwordMinLength) : null,
            passwordRequireUppercase, passwordRequireNumbers, passwordRequireSymbols,
            passwordExpiryDays: passwordExpiryDays ? Number(passwordExpiryDays) : null,
            globalAlertEmails,
            logoUrl: logoFile ? [logoFile] : orgData.logoUrl,
        } as any);
    };

    const handleAddHoliday = async () => {
        if (!newHolidayName || !newHolidayDate) return;
        try {
            if (editingHoliday) {
                await updateHoliday({ id: editingHoliday.id, name: newHolidayName, date: newHolidayDate });
                enqueueSnackbar('Holiday updated', { variant: 'success' });
                setEditingHoliday(null);
            } else {
                await createHoliday({ name: newHolidayName, date: newHolidayDate });
                enqueueSnackbar('Holiday added', { variant: 'success' });
            }
            setNewHolidayName(''); setNewHolidayDate('');
            refetchHolidays();
        } catch { enqueueSnackbar('Failed to save holiday', { variant: 'error' }); }
    };

    const handleEditHoliday = (h: any) => {
        setEditingHoliday({ id: h.id, name: h.name, date: h.date });
        setNewHolidayName(h.name);
        setNewHolidayDate(h.date?.substring(0, 10) || '');
    };

    const handleDeleteHoliday = async (id: number) => {
        if (!window.confirm('Delete this holiday?')) return;
        try { await deleteHoliday(id); enqueueSnackbar('Holiday deleted', { variant: 'success' }); refetchHolidays(); }
        catch { enqueueSnackbar('Failed to delete holiday', { variant: 'error' }); }
    };

    if (isLoading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--color-border-light)', borderTopColor: 'var(--color-accent-green)' }} />
        </div>
    );

    const inpStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: '6px', border: `1px solid ${inp.border}`, fontSize: '1rem', backgroundColor: inp.bg, color: txt.primary, boxSizing: 'border-box' };
    const cardStyle: React.CSSProperties = { backgroundColor: card.bg, padding: '28px', borderRadius: '8px', border: `1px solid ${card.border}`, boxShadow: dark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)' };
    const chk: React.CSSProperties = { width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-accent-green)' };

    const SectionHeader = ({ title, desc }: { title: string; desc: string }) => (
        <div style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: `1px solid ${divider}` }}>
            <h3 style={{ fontSize: '1.15rem', color: txt.heading, margin: '0 0 4px 0', fontWeight: 600 }}>{title}</h3>
            <p style={{ fontSize: '0.85rem', color: txt.secondary, margin: 0 }}>{desc}</p>
        </div>
    );

    const Label = ({ text }: { text: string }) => (
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: txt.primary, fontWeight: 600 }}>{text}</label>
    );

    const Helper = ({ text }: { text: string }) => (
        <p style={{ marginTop: '4px', fontSize: '0.8rem', color: txt.secondary }}>{text}</p>
    );

    const CheckRow = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={chk} />
            <span style={{ fontSize: '0.9rem', color: txt.primary }}>{label}</span>
        </div>
    );

    const SaveBtn = ({ text, pending }: { text: string; pending: boolean }) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '14px', borderTop: `1px solid ${divider}` }}>
            <button type="submit" disabled={pending} style={{ padding: '10px 22px', backgroundColor: 'var(--color-accent-green)', border: 'none', borderRadius: '6px', cursor: pending ? 'not-allowed' : 'pointer', fontWeight: 600, color: 'white', opacity: pending ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {pending && <div className="btn-spinner" style={{ width: '15px', height: '15px' }} />}
                {pending ? 'Saving...' : text}
            </button>
        </div>
    );

    return (
        <div className="setup-container animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h2 className="setup-title" style={{ color: txt.heading, marginBottom: '6px' }}>Company Settings</h2>
                    <p className="setup-subtitle" style={{ color: txt.secondary }}>Manage global configuration, security policies, and operational rules.</p>
                </div>
                <button onClick={() => setIsHolidayOpen(true)} style={{ padding: '8px 16px', backgroundColor: dark ? '#334155' : '#f8fafc', border: `1px solid ${card.border}`, borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: txt.primary }}>
                    Manage Holidays
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '28px', maxWidth: '880px' }}>

                {/* ── 1. Core Identity ── */}
                <div style={cardStyle}>
                    <SectionHeader title="Core Identity & Branding" desc="Primary company details and logo." />

                    <div style={{ marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '18px' }}>
                        <div style={{ width: '76px', height: '76px', borderRadius: '8px', border: `1px dashed ${inp.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: inp.bg }}>
                            {logoPreviewUrl
                                ? <img src={logoPreviewUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                : <i className="fa-solid fa-image" style={{ color: txt.secondary, fontSize: '1.5rem' }} />}
                        </div>
                        <div>
                            <Label text="Company Logo" />
                            <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) { setLogoFile(e.target.files[0]); setLogoPreviewUrl(URL.createObjectURL(e.target.files[0])); } }} style={{ fontSize: '0.88rem', color: txt.secondary }} />
                            <Helper text="256×256 px recommended. Max 2 MB." />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div><Label text="Organization Name *" /><input type="text" value={organizationName} onChange={e => setOrganizationName(e.target.value)} style={inpStyle} required /></div>
                        <div><Label text="Factory / Branch Name" /><input type="text" value={organizationFactoryName} onChange={e => setOrganizationFactoryName(e.target.value)} style={inpStyle} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div><Label text="Phone" /><input type="text" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} style={inpStyle} /></div>
                        <div>
                            <Label text="Industry" />
                            <select value={industry} onChange={e => setIndustry(e.target.value)} style={inpStyle}>
                                <option value="">Select Industry</option>
                                {['Manufacturing', 'Software & Technology', 'Healthcare', 'Retail', 'Logistics & Supply Chain', 'Textile', 'Construction', 'Agriculture'].map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div><Label text="Website" /><input type="url" value={companyWebsite} onChange={e => setCompanyWebsite(e.target.value)} placeholder="https://example.com" style={inpStyle} /></div>
                        <div><Label text="Support Email" /><input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} style={inpStyle} /></div>
                    </div>
                    <div>
                        <Label text="Company Description" />
                        <textarea value={insightDescription} onChange={e => setInsightDescription(e.target.value)} rows={3} style={{ ...inpStyle, resize: 'vertical' }} />
                    </div>
                    <SaveBtn text="Save Changes" pending={updateOrgMutation.isPending} />
                </div>

                {/* ── 2. Localisation & Working Hours ── */}
                <div style={cardStyle}>
                    <SectionHeader title="Localisation & Working Hours" desc="Currency, timezone, and when staff work." />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <Label text="Default Currency" />
                            <select value={defaultCurrency} onChange={e => setDefaultCurrency(e.target.value)} style={inpStyle}>
                                <option value="">Select</option>
                                {[['LKR', 'LKR (Rs.)'], ['USD', 'USD ($)'], ['EUR', 'EUR (€)'], ['GBP', 'GBP (£)'], ['AUD', 'AUD (A$)'], ['INR', 'INR (₹)']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label text="System Timezone" />
                            <select value={timezone} onChange={e => setTimezone(e.target.value)} style={inpStyle}>
                                <option value="">Select</option>
                                {['Asia/Colombo', 'Asia/Kolkata', 'America/New_York', 'Europe/London', 'Australia/Sydney', 'UTC'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label text="Date Format" />
                            <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} style={inpStyle}>
                                <option value="">Select</option>
                                {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <Label text="Working Days" />
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px' }}>
                            {daysOfWeek.map(day => (
                                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <input type="checkbox" checked={workingDays.includes(day)} onChange={() => setWorkingDays(workingDays.includes(day) ? workingDays.filter(d => d !== day) : [...workingDays, day])} style={chk} />
                                    <label style={{ fontSize: '0.88rem', color: txt.primary }}>{day.slice(0, 3)}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div><Label text="Working Hours Start" /><input type="time" value={workingHoursStart} onChange={e => setWorkingHoursStart(e.target.value)} style={inpStyle} /><Helper text="Office opens at this time." /></div>
                        <div><Label text="Working Hours End" /><input type="time" value={workingHoursEnd} onChange={e => setWorkingHoursEnd(e.target.value)} style={inpStyle} /><Helper text="Office closes at this time." /></div>
                    </div>

                    <SaveBtn text="Save Changes" pending={updateOrgMutation.isPending} />
                </div>

                {/* ── 3. Data Entry Rules ── */}
                <div style={cardStyle}>
                    <SectionHeader title="Data Entry Rules" desc="Control how users submit KPI data on the Input Page." />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <Label text="Historical Data Grace Period (days)" />
                            <input type="number" value={historicalDataGracePeriod} onChange={e => setHistoricalDataGracePeriod(e.target.value ? Number(e.target.value) : '')} min="1" max="365" style={inpStyle} />
                            <Helper text="How many days back users can enter historical data." />
                        </div>
                        <div>
                            <Label text="Daily Data Entry Deadline" />
                            <input type="time" value={dataEntryDeadlineTime} onChange={e => setDataEntryDeadlineTime(e.target.value)} style={inpStyle} />
                            <Helper text="Cutoff time for same-day data submission." />
                        </div>
                    </div>

                    <SaveBtn text="Save Changes" pending={updateOrgMutation.isPending} />
                </div>

                {/* ── 4. Legal Details ── */}
                <div style={cardStyle}>
                    <SectionHeader title="Legal & Financial Details" desc="Official details used in reports and documentation." />

                    <div style={{ marginBottom: '20px' }}>
                        <Label text="Headquarters Address" />
                        <textarea value={headquartersAddress} onChange={e => setHeadquartersAddress(e.target.value)} rows={2} style={{ ...inpStyle, resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div><Label text="Tax / Registration ID" /><input type="text" value={taxId} onChange={e => setTaxId(e.target.value)} placeholder="VAT or EIN" style={inpStyle} /></div>
                        <div>
                            <Label text="Financial Year Start" />
                            <select value={financialYearStart} onChange={e => setFinancialYearStart(e.target.value)} style={inpStyle}>
                                <option value="">Select Month</option>
                                {['January', 'April', 'July', 'October'].map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>
                    <SaveBtn text="Save Changes" pending={updateOrgMutation.isPending} />
                </div>

                {/* ── 5. Security & Access ── */}
                <div style={cardStyle}>
                    <SectionHeader title="Security & Access Policies" desc="Authentication rules and password requirements." />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div><Label text="Session Timeout (minutes)" /><input type="number" value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value ? Number(e.target.value) : '')} placeholder="60" min="1" max="1440" style={inpStyle} /></div>
                        <div><Label text="Allowed Email Domains" /><input type="text" value={allowedEmailDomains} onChange={e => setAllowedEmailDomains(e.target.value)} placeholder="acme.com, acmecorp.com" style={inpStyle} /><Helper text="Leave blank to allow any. Comma-separated." /></div>
                    </div>

                    <div style={{ display: 'flex', gap: '28px', marginBottom: '24px', flexWrap: 'wrap' }}>
                        <CheckRow checked={enforce2fa} onChange={setEnforce2fa} label="Enforce 2FA for all users" />
                        <CheckRow checked={allowSelfRegistration} onChange={setAllowSelfRegistration} label="Allow user self-registration" />
                    </div>

                    <h4 style={{ margin: '0 0 14px', color: txt.primary, fontSize: '0.95rem' }}>Password Policy</h4>

                    <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
                        {['Standard', 'Strict'].map(p => (
                            <button key={p} type="button" onClick={() => handlePolicyToggle(p)} style={{ padding: '8px 20px', borderRadius: '6px', border: `2px solid ${passwordPolicy === p ? 'var(--color-accent-green)' : inp.border}`, backgroundColor: passwordPolicy === p ? 'var(--color-accent-green)' : inp.bg, color: passwordPolicy === p ? 'white' : txt.primary, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                                {p}
                            </button>
                        ))}
                        <span style={{ alignSelf: 'center', fontSize: '0.82rem', color: txt.secondary }}>
                            {passwordPolicy === 'Strict' ? 'Min 12 chars + uppercase + numbers + symbols' : 'Min 8 characters'}
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                        <div><Label text="Minimum Password Length" /><input type="number" value={passwordMinLength} onChange={e => setPasswordMinLength(e.target.value ? Number(e.target.value) : '')} min="4" max="32" style={inpStyle} /></div>
                        <div><Label text="Password Expiry (days, 0 = never)" /><input type="number" value={passwordExpiryDays} onChange={e => setPasswordExpiryDays(e.target.value ? Number(e.target.value) : '')} min="0" style={inpStyle} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <CheckRow checked={passwordRequireUppercase} onChange={setPasswordRequireUppercase} label="Require uppercase" />
                        <CheckRow checked={passwordRequireNumbers} onChange={setPasswordRequireNumbers} label="Require numbers" />
                        <CheckRow checked={passwordRequireSymbols} onChange={setPasswordRequireSymbols} label="Require symbols" />
                    </div>

                    <SaveBtn text="Save Changes" pending={updateOrgMutation.isPending} />
                </div>

                {/* ── 6. Alert Emails ── */}
                <div style={cardStyle}>
                    <SectionHeader title="System Alert Emails" desc="Who receives critical system notifications." />
                    <Label text="Global Alert Email Addresses" />
                    <input type="text" value={globalAlertEmails} onChange={e => setGlobalAlertEmails(e.target.value)} placeholder="admin@company.com, ops@company.com" style={inpStyle} />
                    <Helper text="Comma-separated. These addresses receive critical KPI and system warnings." />
                    <SaveBtn text="Save Changes" pending={updateOrgMutation.isPending} />
                </div>
            </form>

            {/* ── 7. Departments ── */}
            <div style={{ display: 'grid', gap: '28px', maxWidth: '880px', marginTop: '28px' }}>
                <div style={cardStyle}>
                    <SectionHeader title="Departments" desc="Manage the departments in your organisation." />
                    <DepartmentTable />
                </div>

                {/* ── 8. Job Positions ── */}
                <div style={cardStyle}>
                    <SectionHeader title="Job Positions" desc="Manage job positions available in your organisation." />
                    <JobPositionTable />
                </div>

                {/* ── 9. User Activities ── */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <SectionHeader title="User Activities" desc="Real-time log of all user actions in the system." />
                        <button onClick={() => refetchActivities()} style={{ padding: '7px 14px', backgroundColor: 'var(--color-accent-green)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}>
                            Refresh
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by user, action or module..."
                        value={activityFilter}
                        onChange={e => setActivityFilter(e.target.value)}
                        style={{ ...inpStyle, marginBottom: '14px', width: '100%', boxSizing: 'border-box' }}
                    />
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: dark ? '#0f172a' : '#f1f5f9' }}>
                                    {['Time', 'User', 'Email', 'Action', 'Module', 'Description', 'IP'].map(h => (
                                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: txt.secondary, fontWeight: 600, borderBottom: `1px solid ${divider}`, whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {activities
                                    .filter((a: any) =>
                                        !activityFilter ||
                                        a.user_name?.toLowerCase().includes(activityFilter.toLowerCase()) ||
                                        a.action?.toLowerCase().includes(activityFilter.toLowerCase()) ||
                                        a.module?.toLowerCase().includes(activityFilter.toLowerCase()) ||
                                        a.description?.toLowerCase().includes(activityFilter.toLowerCase())
                                    )
                                    .map((a: any, i: number) => (
                                        <tr key={a.id ?? i} style={{ borderBottom: `1px solid ${divider}` }}>
                                            <td style={{ padding: '9px 12px', color: txt.secondary, whiteSpace: 'nowrap' }}>{new Date(a.created_at).toLocaleString()}</td>
                                            <td style={{ padding: '9px 12px', color: txt.primary, fontWeight: 500 }}>{a.user_name ?? '—'}</td>
                                            <td style={{ padding: '9px 12px', color: txt.secondary }}>{a.user_email ?? '—'}</td>
                                            <td style={{ padding: '9px 12px' }}>
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700,
                                                    backgroundColor: a.action === 'LOGIN' ? '#dcfce7' : a.action === 'LOGOUT' ? '#fee2e2' : '#dbeafe',
                                                    color: a.action === 'LOGIN' ? '#16a34a' : a.action === 'LOGOUT' ? '#dc2626' : '#1d4ed8'
                                                }}>{a.action}</span>
                                            </td>
                                            <td style={{ padding: '9px 12px', color: txt.secondary }}>{a.module ?? '—'}</td>
                                            <td style={{ padding: '9px 12px', color: txt.primary }}>{a.description ?? '—'}</td>
                                            <td style={{ padding: '9px 12px', color: txt.secondary, fontFamily: 'monospace', fontSize: '0.8rem' }}>{a.ip_address ?? '—'}</td>
                                        </tr>
                                    ))}
                                {activities.length === 0 && (
                                    <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: txt.secondary }}>No activities recorded yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Holidays Drawer ── */}
            {isHolidayOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 }}>
                    <div style={{ width: '400px', backgroundColor: card.bg, height: '100%', padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${card.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                            <h3 style={{ margin: 0, color: txt.heading }}>Company Holidays</h3>
                            <button onClick={() => { setIsHolidayOpen(false); setEditingHoliday(null); setNewHolidayName(''); setNewHolidayDate(''); }} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: txt.secondary }}>&times;</button>
                        </div>

                        <div style={{ backgroundColor: dark ? '#0f172a' : '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '22px', border: `1px solid ${card.border}` }}>
                            <h4 style={{ margin: '0 0 14px', color: txt.primary }}>{editingHoliday ? 'Edit Holiday' : 'Add Holiday'}</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.88rem', fontWeight: 600, color: txt.primary }}>Name</label>
                                    <input type="text" value={newHolidayName} onChange={e => setNewHolidayName(e.target.value)} placeholder="e.g. New Year's Day" style={inpStyle} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.88rem', fontWeight: 600, color: txt.primary }}>Date</label>
                                    <input type="date" value={newHolidayDate} onChange={e => setNewHolidayDate(e.target.value)} style={inpStyle} />
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={handleAddHoliday} disabled={!newHolidayName || !newHolidayDate} style={{ flex: 1, padding: '9px', backgroundColor: 'var(--color-accent-green)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', opacity: (!newHolidayName || !newHolidayDate) ? 0.5 : 1 }}>
                                        {editingHoliday ? 'Update' : 'Add'}
                                    </button>
                                    {editingHoliday && (
                                        <button onClick={() => { setEditingHoliday(null); setNewHolidayName(''); setNewHolidayDate(''); }} style={{ padding: '9px 14px', backgroundColor: inp.bg, color: txt.primary, border: `1px solid ${inp.border}`, borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 14px', color: txt.primary }}>Holidays ({(holidays as any[]).length})</h4>
                            {(holidays as any[]).length === 0
                                ? <p style={{ color: txt.secondary, fontSize: '0.88rem', textAlign: 'center', marginTop: '30px' }}>No holidays defined yet.</p>
                                : (holidays as any[]).map((h: any) => (
                                    <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 12px', border: `1px solid ${card.border}`, borderRadius: '6px', marginBottom: '8px', backgroundColor: editingHoliday?.id === h.id ? (dark ? '#334155' : '#f0fdf4') : 'transparent' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: txt.primary, fontSize: '0.9rem' }}>{h.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: txt.secondary }}>{new Date(h.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button onClick={() => handleEditHoliday(h)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: '0.82rem', fontWeight: 600 }}>Edit</button>
                                            <button onClick={() => handleDeleteHoliday(h.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.82rem', fontWeight: 600 }}>Delete</button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

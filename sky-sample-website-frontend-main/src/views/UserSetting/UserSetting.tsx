import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material';
import useCurrentUser from '../../hooks/useCurrentUser';
import {
    updateUserProfileDetails, userPasswordReset, updateUserProfileImage,
    fetchActiveSessions, fetchLoginHistory, revokeSession,
    resetProfileEmail, resetProfileEmailVerification, resetProfileEmailConfirm,
    exportUserData,
} from '../../api/userApi';
import api from '../../utils/api';
import '../../css/Dashboard.css';
import '../../css/SystemSetup.css';

export default function UserSetting() {
    const { user } = useCurrentUser();
    const { enqueueSnackbar } = useSnackbar();
    const queryClient = useQueryClient();
    const muiTheme = useTheme();
    const dark = muiTheme.palette.mode === 'dark';

    // Theme-aware style tokens
    const card    = { bg: dark ? '#1e293b' : '#ffffff', border: dark ? '#334155' : '#e2e8f0' };
    const inp     = { bg: dark ? '#0f172a' : '#f8fafc', border: dark ? '#475569' : '#cbd5e1' };
    const txt     = { primary: dark ? '#f1f5f9' : '#1e293b', secondary: dark ? '#94a3b8' : '#64748b', heading: dark ? '#ffffff' : '#0f172a' };
    const divider = dark ? '#334155' : '#e2e8f0';

    // Profile form
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [gender, setGender] = useState('Male');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

    // Preferences
    const [themePreference, setThemePreference] = useState('System');
    const [defaultLandingPage, setDefaultLandingPage] = useState('Dashboard');
    const [languageOverride, setLanguageOverride] = useState('English');
    const [defaultSystemView, setDefaultSystemView] = useState('');

    // KPI & data entry preferences
    const [kpiAlertPreference, setKpiAlertPreference] = useState(true);
    const [dataEntryReminder, setDataEntryReminder] = useState(false);

    // Notification preferences
    const [emailDailyDigest, setEmailDailyDigest] = useState(true);
    const [emailImmediateAlerts, setEmailImmediateAlerts] = useState(true);
    const [inAppNotifications, setInAppNotifications] = useState(true);

    // Security
    const [personal2faEnabled, setPersonal2faEnabled] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);

    // Email change
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailChangeStep, setEmailChangeStep] = useState<'init' | 'verify' | 'confirm'>('init');
    const [newEmail, setNewEmail] = useState('');
    const [emailOtp, setEmailOtp] = useState('');

    // Available systems for default view
    const { data: systems = [] } = useQuery({
        queryKey: ['systems'],
        queryFn: () => api.get('/systems').then(r => r.data),
    });

    useEffect(() => {
        if (!user) return;
        setName(user.name || '');
        setMobile(user.mobile || '');
        setGender(user.gender || 'Male');
        setThemePreference(user.themePreference || 'System');
        setDefaultLandingPage(user.defaultLandingPage || 'Dashboard');
        setLanguageOverride(user.languageOverride || 'English');
        setDefaultSystemView((user as any).defaultSystemView || '');
        setPersonal2faEnabled(user.personal2faEnabled || false);
        setKpiAlertPreference((user as any).kpiAlertPreference ?? true);
        setDataEntryReminder((user as any).dataEntryReminder ?? false);
        setEmailDailyDigest(user.emailDailyDigest ?? true);
        setEmailImmediateAlerts(user.emailImmediateAlerts ?? true);
        setInAppNotifications(user.inAppNotifications ?? true);
        if (user.profileImage?.length > 0) {
            const img = user.profileImage[0] as any;
            if (img?.imageUrl) setProfileImagePreview(img.imageUrl);
        }
    }, [user]);

    const { data: activeSessions = [], refetch: refetchSessions } = useQuery({
        queryKey: ['activeSessions'],
        queryFn: fetchActiveSessions,
    });
    const { data: loginHistories = [] } = useQuery({
        queryKey: ['loginHistory'],
        queryFn: fetchLoginHistory,
    });

    const updateImageMutation = useMutation({
        mutationFn: updateUserProfileImage,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['current-user'] }),
        onError: () => enqueueSnackbar('Failed to update profile image', { variant: 'error' }),
    });

    const updateProfileMutation = useMutation({
        mutationFn: updateUserProfileDetails,
        onSuccess: () => {
            if (profileImage && user) updateImageMutation.mutate({ id: user.id, imageFile: profileImage });
            enqueueSnackbar('Settings updated successfully', { variant: 'success' });
            queryClient.invalidateQueries({ queryKey: ['current-user'] });
        },
        onError: () => enqueueSnackbar('Failed to update settings', { variant: 'error' }),
    });

    const resetPasswordMutation = useMutation({
        mutationFn: userPasswordReset,
        onSuccess: () => {
            enqueueSnackbar('Password changed successfully', { variant: 'success' });
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        },
        onError: (err: any) => enqueueSnackbar(err?.data?.message || 'Failed to change password', { variant: 'error' }),
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        updateProfileMutation.mutate({
            id: user.id, name, mobile, gender,
            themePreference, defaultLandingPage, languageOverride, defaultSystemView,
            personal2faEnabled,
            kpiAlertPreference, dataEntryReminder,
            emailDailyDigest, emailImmediateAlerts, inAppNotifications,
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { enqueueSnackbar('Passwords do not match', { variant: 'error' }); return; }
        if (newPassword.length < 8) { enqueueSnackbar('Minimum 8 characters required', { variant: 'error' }); return; }
        resetPasswordMutation.mutate({ currentPassword, newPassword, newPassword_confirmation: confirmPassword });
    };

    const handleRevokeSession = async (tokenId: number) => {
        try { await revokeSession(tokenId); enqueueSnackbar('Session revoked', { variant: 'success' }); refetchSessions(); }
        catch { enqueueSnackbar('Failed to revoke session', { variant: 'error' }); }
    };

    const handleEmailInitiate = async () => {
        if (!user) return;
        try { await resetProfileEmail({ currentEmail: user.email, id: user.id }); setEmailChangeStep('verify'); enqueueSnackbar('OTP sent', { variant: 'success' }); }
        catch (e: any) { enqueueSnackbar(e?.data?.message || 'Failed to send OTP', { variant: 'error' }); }
    };
    const handleEmailVerify = async () => {
        if (!user) return;
        try { await resetProfileEmailVerification({ otp: emailOtp, id: user.id }); setEmailChangeStep('confirm'); enqueueSnackbar('OTP verified', { variant: 'success' }); }
        catch (e: any) { enqueueSnackbar(e?.data?.message || 'Invalid OTP', { variant: 'error' }); }
    };
    const handleEmailConfirm = async () => {
        if (!user) return;
        try {
            await resetProfileEmailConfirm({ newEmail, id: user.id });
            setIsEmailModalOpen(false); setEmailChangeStep('init'); setNewEmail(''); setEmailOtp('');
            queryClient.invalidateQueries({ queryKey: ['current-user'] });
            enqueueSnackbar('Email updated', { variant: 'success' });
        } catch (e: any) { enqueueSnackbar(e?.data?.message || 'Failed to update email', { variant: 'error' }); }
    };

    const pwdStrength = (p: string) => {
        if (!p) return { text: '', color: 'transparent', pct: 0 };
        let s = 0;
        if (p.length >= 8) s++; if (p.length >= 12) s++;
        if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++;
        if (s <= 2) return { text: 'Weak', color: '#ef4444', pct: 20 };
        if (s <= 4) return { text: 'Medium', color: '#eab308', pct: 60 };
        return { text: 'Strong', color: '#22c55e', pct: 100 };
    };
    const strength = pwdStrength(newPassword);

    const inpStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: '6px', border: `1px solid ${inp.border}`, fontSize: '1rem', backgroundColor: inp.bg, color: txt.primary, boxSizing: 'border-box' };
    const cardStyle: React.CSSProperties = { backgroundColor: card.bg, padding: '28px', borderRadius: '8px', border: `1px solid ${card.border}`, boxShadow: dark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)' };

    const SectionHeader = ({ title, desc }: { title: string; desc: string }) => (
        <div style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: `1px solid ${divider}` }}>
            <h3 style={{ fontSize: '1.15rem', color: txt.heading, margin: '0 0 4px 0', fontWeight: 600 }}>{title}</h3>
            <p style={{ fontSize: '0.85rem', color: txt.secondary, margin: 0 }}>{desc}</p>
        </div>
    );

    const Label = ({ text }: { text: string }) => (
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: txt.primary, fontWeight: 600 }}>{text}</label>
    );

    const CheckRow = ({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" id={id} checked={checked} onChange={e => onChange(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-accent-green)' }} />
            <label htmlFor={id} style={{ fontSize: '0.9rem', color: txt.primary, cursor: 'pointer' }}>{label}</label>
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

    const ReadOnly = ({ label, value }: { label: string; value: string }) => (
        <div>
            <Label text={label} />
            <div style={{ ...inpStyle, color: txt.secondary, cursor: 'not-allowed', display: 'flex', alignItems: 'center' }}>{value || '—'}</div>
        </div>
    );

    const isPending = updateProfileMutation.isPending || updateImageMutation.isPending;

    return (
        <div className="setup-container animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '28px' }}>
                <h2 className="setup-title" style={{ color: txt.heading, marginBottom: '6px' }}>User Settings</h2>
                <p className="setup-subtitle" style={{ color: txt.secondary }}>Manage your personal profile, preferences, and security.</p>
            </div>

            <div style={{ display: 'grid', gap: '28px', maxWidth: '880px' }}>
                <form onSubmit={handleProfileSubmit} style={{ display: 'grid', gap: '28px' }}>

                    {/* ── 1. Profile Information ── */}
                    <div style={cardStyle}>
                        <SectionHeader title="Profile Information" desc="Update your name, contact details and photo." />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '22px' }}>
                            <div style={{ width: '76px', height: '76px', borderRadius: '50%', backgroundColor: dark ? '#334155' : '#e2e8f0', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {profileImagePreview
                                    ? <img src={profileImagePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <span style={{ fontSize: '1.8rem', color: txt.secondary }}>👤</span>}
                            </div>
                            <div>
                                <Label text="Profile Photo" />
                                <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setProfileImage(f); setProfileImagePreview(URL.createObjectURL(f)); } }} style={{ fontSize: '0.88rem', color: txt.secondary }} />
                                <p style={{ marginTop: '4px', fontSize: '0.8rem', color: txt.secondary }}>Square image recommended. Max 2 MB.</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <Label text="Full Name" />
                                <input type="text" value={name} onChange={e => setName(e.target.value)} style={inpStyle} required />
                            </div>
                            <div>
                                <Label text="Email Address" />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="email" value={user?.email || ''} disabled style={{ ...inpStyle, color: txt.secondary }} />
                                    <button type="button" onClick={() => setIsEmailModalOpen(true)} style={{ padding: '0 14px', backgroundColor: dark ? '#334155' : '#e2e8f0', color: txt.primary, border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>Update</button>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <Label text="Mobile Number" />
                                <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} style={inpStyle} />
                            </div>
                            <div>
                                <Label text="Gender" />
                                <select value={gender} onChange={e => setGender(e.target.value)} style={inpStyle}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                            <ReadOnly label="Employee Number" value={user?.employeeNumber || ''} />
                            <ReadOnly label="Department" value={user?.department || ''} />
                            <ReadOnly label="Job Position" value={user?.jobPosition || ''} />
                        </div>

                        <SaveBtn text="Update Profile" pending={isPending} />
                    </div>

                    {/* ── 2. Preferences ── */}
                    <div style={cardStyle}>
                        <SectionHeader title="Preferences" desc="Customise your interface and default views." />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <Label text="Theme" />
                                <select value={themePreference} onChange={e => setThemePreference(e.target.value)} style={inpStyle}>
                                    <option value="System">System Default</option>
                                    <option value="Light">Light</option>
                                    <option value="Dark">Dark</option>
                                </select>
                            </div>
                            <div>
                                <Label text="Language" />
                                <select value={languageOverride} onChange={e => setLanguageOverride(e.target.value)} style={inpStyle}>
                                    <option value="English">English</option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="French">French</option>
                                    <option value="German">German</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <Label text="Default Landing Page" />
                                <select value={defaultLandingPage} onChange={e => setDefaultLandingPage(e.target.value)} style={inpStyle}>
                                    <option value="Dashboard">Dashboard</option>
                                    <option value="Reports">Report</option>
                                    <option value="Input Page">Input Page</option>
                                    <option value="Insights">Insight</option>
                                </select>
                                <p style={{ marginTop: '4px', fontSize: '0.8rem', color: txt.secondary }}>Page that opens after login.</p>
                            </div>
                            <div>
                                <Label text="Default Dashboard System" />
                                <select value={defaultSystemView} onChange={e => setDefaultSystemView(e.target.value)} style={inpStyle}>
                                    <option value="">All Systems</option>
                                    {systems.map((s: any) => (
                                        <option key={s.id} value={String(s.id)}>{s.name}</option>
                                    ))}
                                </select>
                                <p style={{ marginTop: '4px', fontSize: '0.8rem', color: txt.secondary }}>Which system to show first on the dashboard.</p>
                            </div>
                        </div>

                        <SaveBtn text="Update Preferences" pending={isPending} />
                    </div>

                    {/* ── 3. KPI & Data Entry Alerts ── */}
                    <div style={cardStyle}>
                        <SectionHeader title="KPI & Data Entry Alerts" desc="Control how this system notifies you about your KPIs and data submissions." />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <CheckRow id="kpiAlert" checked={kpiAlertPreference} onChange={setKpiAlertPreference} label="Notify me when my assigned KPIs turn orange or red" />
                            <CheckRow id="dataReminder" checked={dataEntryReminder} onChange={setDataEntryReminder} label="Remind me daily to submit data on the Input Page" />
                        </div>

                        <SaveBtn text="Update Alert Preferences" pending={isPending} />
                    </div>

                    {/* ── 4. Notification Preferences ── */}
                    <div style={cardStyle}>
                        <SectionHeader title="Notification Preferences" desc="Control how and where the system sends you notifications." />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <CheckRow id="emailDailyDigest" checked={emailDailyDigest} onChange={setEmailDailyDigest} label="Receive a daily email digest of activity and KPI summaries" />
                            <CheckRow id="emailImmediateAlerts" checked={emailImmediateAlerts} onChange={setEmailImmediateAlerts} label="Receive immediate email alerts for critical events" />
                            <CheckRow id="inAppNotifications" checked={inAppNotifications} onChange={setInAppNotifications} label="Show in-app notifications in the sidebar" />
                        </div>
                        <SaveBtn text="Update Notifications" pending={isPending} />
                    </div>

                    {/* ── 5. Security ── */}
                    <div style={cardStyle}>
                        <SectionHeader title="Security" desc="Enable two-factor authentication for extra account protection." />
                        <CheckRow id="2fa" checked={personal2faEnabled} onChange={setPersonal2faEnabled} label="Enable personal Two-Factor Authentication (2FA)" />
                        <SaveBtn text="Update Security" pending={isPending} />
                    </div>
                </form>

                {/* ── 5. Change Password ── */}
                <div style={cardStyle}>
                    <SectionHeader title="Change Password" desc="Update your login password." />
                    <form onSubmit={handlePasswordSubmit}>
                        <div style={{ display: 'grid', gap: '16px', marginBottom: '20px' }}>
                            {[
                                { label: 'Current Password', val: currentPassword, set: setCurrentPassword, show: showCurrentPwd, toggle: setShowCurrentPwd },
                                { label: 'New Password',     val: newPassword,     set: setNewPassword,     show: showNewPwd,     toggle: setShowNewPwd },
                                { label: 'Confirm Password', val: confirmPassword, set: setConfirmPassword, show: showConfirmPwd, toggle: setShowConfirmPwd },
                            ].map(({ label, val, set, show, toggle }) => (
                                <div key={label} style={{ position: 'relative' }}>
                                    <Label text={label} />
                                    <input type={show ? 'text' : 'password'} value={val} onChange={e => set(e.target.value)} style={inpStyle} required />
                                    <button type="button" onClick={() => toggle(!show)} style={{ position: 'absolute', right: '12px', top: '34px', background: 'none', border: 'none', cursor: 'pointer', color: txt.secondary }}>
                                        {show ? '🙈' : '👁️'}
                                    </button>
                                    {label === 'New Password' && val && (
                                        <div style={{ marginTop: '6px' }}>
                                            <div style={{ height: '4px', backgroundColor: dark ? '#334155' : '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${strength.pct}%`, backgroundColor: strength.color, transition: 'width 0.3s' }} />
                                            </div>
                                            <span style={{ fontSize: '0.78rem', color: strength.color, display: 'block', marginTop: '3px' }}>{strength.text} Password</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button type="submit" disabled={resetPasswordMutation.isPending} style={{ padding: '10px 22px', backgroundColor: '#3b82f6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: 'white', opacity: resetPasswordMutation.isPending ? 0.7 : 1 }}>
                            {resetPasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>

                {/* ── 6. Active Sessions ── */}
                <div style={cardStyle}>
                    <SectionHeader title="Active Sessions" desc="Devices currently logged in to your account." />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(activeSessions as any[]).length === 0 && <p style={{ color: txt.secondary, fontSize: '0.9rem' }}>No active sessions found.</p>}
                        {(activeSessions as any[]).map((s: any) => (
                            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', border: `1px solid ${card.border}`, borderRadius: '6px', backgroundColor: dark ? '#0f172a' : '#f8fafc' }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: txt.primary, fontSize: '0.9rem' }}>{s.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: txt.secondary }}>Last used: {new Date(s.last_used_at).toLocaleString()}</div>
                                </div>
                                <button onClick={() => handleRevokeSession(s.id)} style={{ padding: '5px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Revoke</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── 7. My Data ── */}
                <div style={cardStyle}>
                    <SectionHeader title="My Data" desc="Download a copy of all your personal data stored in the system." />
                    <button
                        onClick={async () => {
                            try {
                                const data = await exportUserData();
                                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `my-data-${new Date().toISOString().split('T')[0]}.json`;
                                a.click();
                                URL.revokeObjectURL(url);
                            } catch {
                                enqueueSnackbar('Failed to export data', { variant: 'error' });
                            }
                        }}
                        style={{ padding: '10px 22px', backgroundColor: '#3b82f6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: 'white' }}
                    >
                        Export My Data (JSON)
                    </button>
                </div>

                {/* ── 8. Login History ── */}
                <div style={cardStyle}>
                    <SectionHeader title="Login History" desc="Recent sign-ins to your account." />
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: `2px solid ${divider}` }}>
                                    {['Date & Time', 'IP Address', 'Device / Browser'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '10px 8px', color: txt.secondary, fontSize: '0.82rem', fontWeight: 600 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(loginHistories as any[]).map((h: any) => (
                                    <tr key={h.id} style={{ borderBottom: `1px solid ${divider}` }}>
                                        <td style={{ padding: '10px 8px', color: txt.primary, fontSize: '0.88rem' }}>{new Date(h.login_at).toLocaleString()}</td>
                                        <td style={{ padding: '10px 8px', color: txt.primary, fontSize: '0.88rem' }}>{h.ip_address}</td>
                                        <td style={{ padding: '10px 8px', color: txt.primary, fontSize: '0.88rem' }}>{h.device}</td>
                                    </tr>
                                ))}
                                {(loginHistories as any[]).length === 0 && (
                                    <tr><td colSpan={3} style={{ padding: '20px 8px', color: txt.secondary, fontSize: '0.88rem', textAlign: 'center' }}>No login history available.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Email Change Modal ── */}
            {isEmailModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: card.bg, padding: '28px', borderRadius: '10px', width: '100%', maxWidth: '460px', border: `1px solid ${card.border}` }}>
                        <h3 style={{ marginTop: 0, color: txt.heading }}>Update Email Address</h3>

                        {emailChangeStep === 'init' && (
                            <>
                                <p style={{ color: txt.secondary, fontSize: '0.9rem' }}>An OTP will be sent to your current email to verify your identity.</p>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                    <button onClick={() => setIsEmailModalOpen(false)} style={{ padding: '8px 16px', background: 'none', border: `1px solid ${card.border}`, borderRadius: '4px', cursor: 'pointer', color: txt.primary }}>Cancel</button>
                                    <button onClick={handleEmailInitiate} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Send OTP</button>
                                </div>
                            </>
                        )}
                        {emailChangeStep === 'verify' && (
                            <>
                                <label style={{ display: 'block', marginBottom: '6px', color: txt.primary, fontWeight: 600 }}>Enter OTP</label>
                                <input type="text" value={emailOtp} onChange={e => setEmailOtp(e.target.value)} placeholder="123456" style={inpStyle} />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                    <button onClick={() => setIsEmailModalOpen(false)} style={{ padding: '8px 16px', background: 'none', border: `1px solid ${card.border}`, borderRadius: '4px', cursor: 'pointer', color: txt.primary }}>Cancel</button>
                                    <button onClick={handleEmailVerify} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Verify</button>
                                </div>
                            </>
                        )}
                        {emailChangeStep === 'confirm' && (
                            <>
                                <label style={{ display: 'block', marginBottom: '6px', color: txt.primary, fontWeight: 600 }}>New Email Address</label>
                                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="new@example.com" style={inpStyle} />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                    <button onClick={() => setIsEmailModalOpen(false)} style={{ padding: '8px 16px', background: 'none', border: `1px solid ${card.border}`, borderRadius: '4px', cursor: 'pointer', color: txt.primary }}>Cancel</button>
                                    <button onClick={handleEmailConfirm} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Confirm</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

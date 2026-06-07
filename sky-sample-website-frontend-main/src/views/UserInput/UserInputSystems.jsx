import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../../utils/api';
import useCurrentUser from '../../hooks/useCurrentUser';
import '../../css/Dashboard.css';
import '../../css/SystemSetup.css';

// Helper to get a suitable icon based on system name
function getSystemIcon(name) {
    const n = name.toLowerCase();
    const style = { width: '40px', height: '40px', color: 'var(--color-accent-green)' };
    
    if (n.includes('finance')) {
        return (
            <svg style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
    }
    if (n.includes('hr') || n.includes('human')) {
        return (
            <svg style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        );
    }
    if (n.includes('health') || n.includes('safety')) {
        return (
            <svg style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        );
    }
    if (n.includes('store') || n.includes('inventory')) {
        return (
            <svg style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        );
    }
    
    // Default
    return (
        <svg style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    );
}

export default function UserInputSystems() {
    const [systems, setSystems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useCurrentUser();

    useEffect(() => {
        const fetchSystems = async () => {
            try {
                const response = await api.get('/systems');
                setSystems(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSystems();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(15, 60, 43, 0.1)', borderTopColor: '#154c37' }}></div>
            </div>
        );
    }

    return (
        <div className="setup-container animate-fade-in" style={{ padding: '0px' }}>
            <div className="setup-header-row">
                <div className="title-group-header">
                    <h2 className="setup-title">Data Entry</h2>
                    <p className="setup-subtitle">Select a system to input KPI values.</p>
                </div>
            </div>

            <div className="systems-grid">
                {systems.filter(system => {
                    const hasSystemView = user?.permissionObject?.[`SYSTEM_${system.id}_VIEW`];
                    const hasAnyKpiEdit = system.metrics?.some(m => user?.permissionObject?.[`KPI_${m.id}_EDIT`]);
                    return hasSystemView || hasAnyKpiEdit;
                }).map((system) => (
                    <div 
                        key={system.id} 
                        className="system-card"
                        onClick={() => navigate(`/user-input/${system.id}`)}
                        style={{ cursor: 'pointer', padding: '24px', textAlign: 'center' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                            {getSystemIcon(system.name)}
                        </div>
                        <h3 className="system-card-title">{system.name}</h3>
                        <p className="system-card-count">Input Data</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

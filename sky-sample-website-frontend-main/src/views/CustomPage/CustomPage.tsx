import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import useCurrentUser from '../../hooks/useCurrentUser';
import { PermissionKeys } from '../Administration/SectionList';
import PermissionDenied from '../../components/PermissionDenied';
import './CustomPage.css';

const initialRowState = {
    mc: '',
    operators: '',
    item: '',
    target: '',
    actualProduction: '',
    normalAllowance: '',
    additionalProduction: '',
    additionalAllowance: '',
    noOfBd: '',
    downTime: '',
    changeOverTime: '',
    damagePkts: '',
    tissueWasted: ''
};

const initialTableData = {
    'A1': { ...initialRowState },
    'A2': { ...initialRowState },
    'B1': { ...initialRowState },
    'B2': { ...initialRowState }
};

export default function CustomPage() {
    const { user } = useCurrentUser();
    const canEdit = user?.permissionObject?.[PermissionKeys.CUSTOM_PAGE_EDIT];

    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [tableData, setTableData] = useState(initialTableData);
    const [specialNotes, setSpecialNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        if (date) {
            fetchData(date);
        }
    }, [date]);

    const fetchData = async (selectedDate: string) => {
        try {
            setLoading(true);
            const res = await api.get(`/custom-dashboard?date=${selectedDate}`);
            if (res.data && res.data.table_data) {
                setTableData(res.data.table_data);
                setSpecialNotes(res.data.special_notes || '');
            } else {
                setTableData(initialTableData);
                setSpecialNotes('');
            }
        } catch (err) {
            console.error("Failed to fetch custom page data", err);
            setTableData(initialTableData);
            setSpecialNotes('');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setSaveMessage('');
            await api.post('/custom-dashboard', {
                date: date,
                table_data: tableData,
                special_notes: specialNotes
            });
            setSaveMessage('Saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (err) {
            console.error("Failed to save custom page data", err);
            setSaveMessage('Error saving data.');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (rowKey: string, field: string, value: string) => {
        setTableData(prev => ({
            ...prev,
            [rowKey]: {
                ...prev[rowKey as keyof typeof initialTableData],
                [field]: value
            }
        }));
    };

    const calcTotal = (field: string) => {
        const rows = ['A1', 'A2', 'B1', 'B2'];
        let total = 0;
        let isNumeric = false;
        rows.forEach(r => {
            const val = parseFloat((tableData as any)[r][field]);
            if (!isNaN(val)) {
                total += val;
                isNumeric = true;
            }
        });
        return isNumeric ? total.toString() : '';
    };

    return (
        <div className="custom-page-container animate-fade-in">
            
            <div className="custom-page-header">
                <div>
                    <h1 style={{ color: '#1a6644', marginTop: '5px' }}>Daily KPI Dashboard</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '5px' }}>
                        Every responsible officer must record the KPI values relevant to their department in this sheet at the end of the day.
                    </p>
                </div>
                <div className="custom-page-actions">
                    <div className="date-picker-group">
                        <label>Date:</label>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                            className="custom-date-input"
                        />
                    </div>
                    {canEdit && (
                        <button 
                            className="custom-save-btn" 
                            onClick={handleSave}
                            disabled={saving || loading}
                        >
                            {saving ? 'Saving...' : 'Save Data'}
                        </button>
                    )}
                    {saveMessage && <span className={`save-msg ${saveMessage.includes('Error') ? 'error' : 'success'}`}>{saveMessage}</span>}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#1a6644', margin: '0 auto 16px' }}></div>
                    <p>Loading data for {date}...</p>
                </div>
            ) : (
                <div className="custom-table-wrapper">
                    <table className="custom-kpi-table">
                        <thead>
                            <tr>
                                <th>Shift</th>
                                <th>No</th>
                                <th>MC</th>
                                <th>Operators</th>
                                <th>Item</th>
                                <th>Target<br/>(Qty)</th>
                                <th>Actual<br/>Production<br/>(Qty)</th>
                                <th>Normal<br/>Production<br/>Allowance (Rs)</th>
                                <th>Additional<br/>Production<br/>(Qty)</th>
                                <th>Additional<br/>Production<br/>Allowance (Rs)</th>
                                <th>No of<br/>BD<br/>(Qty)</th>
                                <th>Down<br/>Time<br/>(Min.)</th>
                                <th>Change<br/>Over Time<br/>(Min.)</th>
                                <th>Damage<br/>Pkts<br/>(Qty)</th>
                                <th>Tissue<br/>Wasted<br/>(Kg)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {['A1', 'A2', 'B1', 'B2'].map((rowKey, idx) => {
                                const row = (tableData as any)[rowKey];
                                const isA = rowKey.startsWith('A');
                                return (
                                    <tr key={rowKey}>
                                        {(idx === 0 || idx === 2) && (
                                            <td rowSpan={2} className="shift-cell">
                                                <strong>{isA ? 'A' : 'B'}</strong>
                                            </td>
                                        )}
                                        <td className="no-cell">{rowKey.charAt(1)}</td>
                                        {Object.keys(initialRowState).map(field => (
                                            <td key={field}>
                                                <input 
                                                    type={field === 'mc' || field === 'item' ? 'text' : 'number'}
                                                    value={row[field] || ''}
                                                    onChange={(e) => handleInputChange(rowKey, field, e.target.value)}
                                                    disabled={!canEdit}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                            <tr className="total-row">
                                <td colSpan={2} className="total-label">Total</td>
                                {Object.keys(initialRowState).map(field => (
                                    <td key={field} className="total-value">
                                        {calcTotal(field)}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            <div className="custom-page-footer">
                <label>Special Notes:</label>
                <textarea 
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="Enter special notes here..."
                    disabled={!canEdit || loading}
                    rows={4}
                />
            </div>
        </div>
    );
}

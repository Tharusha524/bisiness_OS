import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import useCurrentUser from '../../hooks/useCurrentUser';
import { PermissionKeys } from '../Administration/SectionList';
import PermissionDenied from '../../components/PermissionDenied';
import '../CustomPage/CustomPage.css'; // Reuse existing CSS for the table
import './CustomPageHistory.css';

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

interface CustomPageHistoryProps {
    onClose?: () => void;
}

export default function CustomPageHistory({ onClose }: CustomPageHistoryProps) {
    const { user } = useCurrentUser();
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [tableData, setTableData] = useState<any>(null);
    const [specialNotes, setSpecialNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const canView = user?.permissionObject?.[PermissionKeys.CUSTOM_PAGE_VIEW];

    useEffect(() => {
        if (!canView || !selectedDate) return;
        fetchDashboardData(selectedDate);
    }, [canView, selectedDate]);

    const fetchDashboardData = async (date: string) => {
        setLoading(true);
        setSelectedDate(date);
        try {
            const res = await api.get(`/custom-dashboard?date=${date}`);
            if (res.data && res.data.table_data) {
                setTableData(res.data.table_data);
                setSpecialNotes(res.data.special_notes || '');
            } else {
                setTableData(null);
                setSpecialNotes('');
            }
        } catch (err) {
            console.error("Failed to fetch data", err);
            setTableData(null);
        } finally {
            setLoading(false);
        }
    };

    const calcTotal = (field: string) => {
        if (!tableData) return '';
        const rows = ['A1', 'A2', 'B1', 'B2'];
        let total = 0;
        let isNumeric = false;
        rows.forEach(r => {
            const val = parseFloat(tableData[r]?.[field]);
            if (!isNaN(val)) {
                total += val;
                isNumeric = true;
            }
        });
        return isNumeric ? total.toString() : '';
    };

    if (!canView) {
        return <PermissionDenied />;
    }

    const isModal = !!onClose;

    return (
        <div className={isModal ? "history-modal-overlay" : undefined}>
            <div className={`custom-page-container animate-fade-in${isModal ? " history-modal-content" : ""}`}>
                <div className="custom-page-header">
                    <div>
                        <h1 style={{ color: '#000000', marginTop: '5px' }}>Production System Overview</h1>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '5px' }}>
                            View production KPI records.
                        </p>
                    </div>
                    <div className="custom-page-actions">
                        <div className="date-picker-group">
                            <label>Date:</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="custom-date-input"
                            />
                        </div>
                        {isModal && (
                            <button onClick={onClose} className="history-close-btn">&times;</button>
                        )}
                    </div>
                </div>

            <div className="history-content" style={{ marginTop: '20px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#1a6644', margin: '0 auto 16px' }}></div>
                        <p>Loading data for {selectedDate}...</p>
                    </div>
                ) : !tableData ? (
                    <div className="empty-state">No data found for this date.</div>
                ) : (
                    <div className="read-only-dashboard">
                        <div className="custom-table-wrapper" style={{ overflowX: 'auto', width: '100%' }}>
                            <table className="custom-kpi-table">
                                    <thead>
                                        <tr>
                                            <th>SHIFT</th>
                                            <th>NO</th>
                                            <th>MC</th>
                                            <th>OPERATORS</th>
                                            <th>ITEM</th>
                                            <th>TARGET<br/>(QTY)</th>
                                            <th>ACTUAL<br/>PRODUCTION<br/>(QTY)</th>
                                            <th>NORMAL<br/>PRODUCTION<br/>ALLOWANCE<br/>(RS)</th>
                                            <th>ADDITIONAL<br/>PRODUCTION<br/>(QTY)</th>
                                            <th>ADDITIONAL<br/>PRODUCTION<br/>ALLOWANCE<br/>(RS)</th>
                                            <th>NO OF<br/>BD<br/>(QTY)</th>
                                            <th>DOWN<br/>TIME<br/>(MIN.)</th>
                                            <th>CHANGE<br/>OVER TIME<br/>(MIN.)</th>
                                            <th>DAMAGE<br/>PKTS<br/>(QTY)</th>
                                            <th>TISSUE<br/>WASTED<br/>(KG)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {['A1', 'A2', 'B1', 'B2'].map((rowKey) => {
                                            const shift = rowKey.charAt(0);
                                            const no = rowKey.charAt(1);
                                            return (
                                                <tr key={rowKey}>
                                                    {no === '1' && (
                                                        <td rowSpan={2} className="shift-cell">
                                                            <strong>{shift}</strong>
                                                        </td>
                                                    )}
                                                    <td className="no-cell"><strong>{no}</strong></td>
                                                    
                                                    {Object.keys(initialRowState).map((field) => (
                                                        <td key={field}>
                                                            <input 
                                                                type={['mc','item'].includes(field) ? "text" : "number"}
                                                                value={tableData[rowKey]?.[field] || ''}
                                                                disabled={true}
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

                            <div className="custom-page-footer" style={{ marginTop: '20px' }}>
                                <label>Special Notes:</label>
                                <textarea 
                                    value={specialNotes}
                                    disabled={true}
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

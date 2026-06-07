import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrganization } from '../api/OrganizationSettings/organizationSettingsApi';
import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';

export default function AutoLogoutProvider({ children }: { children: React.ReactNode }) {
    const { data: orgData } = useQuery({
        queryKey: ['organization'],
        queryFn: getOrganization,
    });
    
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    const logoutUser = () => {
        localStorage.removeItem('token');
        enqueueSnackbar('You have been logged out due to inactivity', { variant: 'warning' });
        navigate('/');
    };

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        if (!localStorage.getItem('token')) return; // Don't timeout if not logged in

        // Default to 120 minutes if not set in settings
        const timeoutMinutes = orgData?.sessionTimeout || 120;
        timeoutRef.current = setTimeout(logoutUser, timeoutMinutes * 60 * 1000);
    };

    useEffect(() => {
        const events = ['mousemove', 'keydown', 'scroll', 'click'];
        
        resetTimeout();
        
        const handleActivity = () => resetTimeout();
        
        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });
        
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [orgData?.sessionTimeout]);

    return <>{children}</>;
}

import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { getOrganization } from '../api/OrganizationSettings/organizationSettingsApi';

export default function useAppDate() {
    const { data: orgData } = useQuery({
        queryKey: ['organization'],
        queryFn: getOrganization,
    });

    const formatDate = (date: Date | string | number) => {
        if (!date) return '';
        
        const dateObj = new Date(date);
        
        let formatStr = orgData?.dateFormat || 'yyyy-MM-dd';
        
        // Quick normalization from backend format (YYYY-MM-DD) to date-fns format (yyyy-MM-dd)
        formatStr = formatStr.replace(/Y/g, 'y').replace(/D/g, 'd');
        
        try {
            return format(dateObj, formatStr);
        } catch (e) {
            return format(dateObj, 'yyyy-MM-dd');
        }
    };

    return { formatDate, dateFormat: orgData?.dateFormat || 'YYYY-MM-DD' };
}

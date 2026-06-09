import api from "../../utils/api";

export interface CompanyHoliday {
    id?: number;
    date: string;
    name: string;
}

export async function fetchHolidays() {
    const res = await api.get('/company-holidays');
    return res.data;
}

export async function createHoliday(data: CompanyHoliday) {
    const res = await api.post('/company-holidays', data);
    return res.data;
}

export async function updateHoliday(data: CompanyHoliday) {
    const res = await api.put(`/company-holidays/${data.id}`, data);
    return res.data;
}

export async function deleteHoliday(id: number) {
    const res = await api.delete(`/company-holidays/${id}`);
    return res.data;
}

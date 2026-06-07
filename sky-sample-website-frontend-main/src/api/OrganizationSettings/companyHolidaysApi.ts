import axios from "axios";

export interface CompanyHoliday {
    id?: number;
    date: string;
    name: string;
}

export async function fetchHolidays() {
    const res = await axios.get('/api/company-holidays');
    return res.data;
}

export async function createHoliday(data: CompanyHoliday) {
    const res = await axios.post('/api/company-holidays', data);
    return res.data;
}

export async function updateHoliday(data: CompanyHoliday) {
    const res = await axios.put(`/api/company-holidays/${data.id}`, data);
    return res.data;
}

export async function deleteHoliday(id: number) {
    const res = await axios.delete(`/api/company-holidays/${id}`);
    return res.data;
}

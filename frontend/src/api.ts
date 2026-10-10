import axios from 'axios';
import type { Incident, User } from './types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const incidentApi = {
  getAll: async (): Promise<Incident[]> => {
    const res = await axios.get<Incident[]>(`${API_BASE_URL}/incidents/`);
    return res.data;
  },
  getUsers: async (): Promise<User[]> => {
    const res = await axios.get<User[]>(`${API_BASE_URL}/users/`);
    return res.data;
  },
  create: async (data: { title: string; description: string; priority: string; assigned_to: number | null }): Promise<Incident> => {
    const res = await axios.post<Incident>(`${API_BASE_URL}/incidents/`, data);
    return res.data;
  },
  updateStatus: async (id: number, status: Incident['status']): Promise<Incident> => {
    const res = await axios.patch<Incident>(`${API_BASE_URL}/incidents/${id}/`, { status });
    return res.data;
  },
  updateAssignee: async (id: number, assigned_to: number | null): Promise<Incident> => {
    const res = await axios.patch<Incident>(`${API_BASE_URL}/incidents/${id}/`, { assigned_to });
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/incidents/${id}/`);
  }
};
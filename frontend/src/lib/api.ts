import axios from 'axios';
import { Incident, PaginatedResponse } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: `${API_URL}/incidents`,
});

export const getIncidents = async (page: number = 1, limit: number = 10) => {
  const response = await apiClient.get<PaginatedResponse<Incident>>(`?page=${page}&limit=${limit}`);
  return response.data;
};

export const createIncident = async (data: Partial<Incident>) => {
  const response = await apiClient.post<Incident>('', data);
  return response.data;
};

export const updateIncident = async (id: string, data: Partial<Incident>) => {
  const response = await apiClient.patch<Incident>(`/${id}`, data);
  return response.data;
};

export const deleteIncident = async (id: string) => {
  const response = await apiClient.delete<Incident>(`/${id}`);
  return response.data;
};
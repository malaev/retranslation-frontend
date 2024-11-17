import axios from 'axios';
import { FetcherScheduleConfig } from "@/types/reddit";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Создаем инстанс axios с базовой конфигурацией
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const redditApi = {
  async getSchedules(): Promise<FetcherScheduleConfig[]> {
    const { data } = await axiosInstance.get('/reddit/schedules');
    return data;
  },

  async createSchedule(schedule: Omit<FetcherScheduleConfig, 'id'>): Promise<FetcherScheduleConfig> {
    const { data } = await axiosInstance.post('/reddit/schedules', schedule);
    return data;
  },

  async updateSchedule(id: string, updates: Partial<Omit<FetcherScheduleConfig, 'id'>>): Promise<FetcherScheduleConfig> {
    const { data } = await axiosInstance.patch(`/reddit/schedules/${id}`, updates);
    return data;
  },

  async deleteSchedule(id: string): Promise<void> {
    await axiosInstance.delete(`/reddit/schedules/${id}`);
  },
}; 
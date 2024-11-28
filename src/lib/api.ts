import axios from 'axios';
import { FetcherScheduleConfig } from "@/types/reddit";
import { TelegramChannelConfig } from "@/types/telegram";

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

export const channelApi = {
  async getChannelConfig(scheduleId: string): Promise<TelegramChannelConfig | null> {
    try {
      const { data } = await axiosInstance.get(`/channel-configs/schedule/${scheduleId}`);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async createChannelConfig(config: Omit<TelegramChannelConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<TelegramChannelConfig> {
    const { data } = await axiosInstance.post('/channel-configs', config);
    return data;
  },

  async updateChannelConfig(id: string, updates: Partial<TelegramChannelConfig>): Promise<TelegramChannelConfig> {
    const { data } = await axiosInstance.put(`/channel-configs/${id}`, updates);
    return data;
  },

  async deleteChannelConfig(id: string): Promise<void> {
    await axiosInstance.delete(`/channel-configs/${id}`);
  },
}; 
import axios from 'axios';
import { FetcherScheduleConfig } from "@/types/reddit";
import { TelegramChannelConfig } from "@/types/telegram";
import { ModerationStatus, ProcessedPost, PostsQueryParams } from "@/types/moderation";
import { PublicationSchedule } from "@/types/publication";

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

export const moderationApi = {
  async getPosts(params: PostsQueryParams): Promise<ProcessedPost[]> {
    const { data } = await axiosInstance.get('/moderation/posts', { params });
    return data;
  },

  async approvePost(id: string): Promise<ProcessedPost> {
    const { data } = await axiosInstance.post(`/moderation/posts/${id}/approve`);
    return data;
  },

  async rejectPost(id: string): Promise<ProcessedPost> {
    const { data } = await axiosInstance.post(`/moderation/posts/${id}/reject`);
    return data;
  },

  async updatePostContent(id: string, content: ProcessedPost['content']): Promise<ProcessedPost> {
    const { data } = await axiosInstance.put(`/moderation/posts/${id}/content`, { content });
    return data;
  },
};

export const publicationApi = {
  async getSchedule(channelId: string): Promise<PublicationSchedule | null> {
    const { data } = await axiosInstance.get(`/telegram-publisher/schedules/${channelId}`);
    return data;
  },

  async createSchedule(schedule: Omit<PublicationSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<PublicationSchedule> {
    const { data } = await axiosInstance.post('/telegram-publisher/schedules', schedule);
    return data;
  },

  async updateSchedule(id: string, updates: Partial<Omit<PublicationSchedule, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PublicationSchedule> {
    const { data } = await axiosInstance.put(`/telegram-publisher/schedules/${id}`, updates);
    return data;
  },
}; 

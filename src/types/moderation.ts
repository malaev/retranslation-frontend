export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface ProcessedPost {
  id: string;
  content: {
    title: string;
    text: string;
    finalText?: string;
    media?: {
      type: string;
      urls: string[];
      generatedDescription?: string;
      coherenceScore?: number;
    }[];
    finalMedia?: {
      type: string;
      urls: string[];
      generatedDescription?: string;
      coherenceScore?: number;
      caption?: string;
    }[];
  };
  moderationStatus: ModerationStatus;
  channelId: string;
  scheduleId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostsQueryParams {
  moderationStatus?: ModerationStatus;
  channelId?: string;
  scheduleId?: string;
  page?: number;
  limit?: number;
} 
export interface PublicationSchedule {
  id?: string;
  channelId: string;
  publicationTimes: string[];
  timezone: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 
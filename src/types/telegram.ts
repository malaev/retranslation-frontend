export enum ProcessingStep {
  Translation = 'translation',
  Summarization = 'summarization',
  Styling = 'styling',
  Media = 'media',
}

export type ProcessingStepConfig = {
  [ProcessingStep.Translation]?: {
    targetLang: string;
  };
  [ProcessingStep.Summarization]?: {
    maxLength: number;
    prompt: string;
  };
  [ProcessingStep.Styling]?: {
    prompt: string;
  };
  [ProcessingStep.Media]?: {
    minCoherenceScore: number; // Минимальный порог согласованности текста и медиа
  };
};

export interface ProcessingPipeline {
  steps: {
    type: ProcessingStep;
    config: Partial<ProcessingStepConfig[keyof ProcessingStepConfig]>;
    order: number;
  }[];
}

export interface TelegramChannelConfig {
  id?: string;
  scheduleId: string;
  name: string;
  chatId?: string;
  pipeline: ProcessingPipeline;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TelegramChannelConfig, ProcessingStep, ProcessingStepConfig } from '@/types/telegram';
import { channelApi } from '@/lib/api';

interface ChannelConfigFormProps {
  scheduleId: string;
  onConfigSaved?: () => void;
}

const AVAILABLE_STEPS: { value: ProcessingStep; label: string }[] = [
  { value: ProcessingStep.Translation, label: 'Перевод' },
  { value: ProcessingStep.Summarization, label: 'Суммаризация' },
  { value: ProcessingStep.Styling, label: 'Стилизация' },
  { value: ProcessingStep.Media, label: 'Обработка медиа' },
];

const STEP_CONFIGS: Record<ProcessingStep, React.ComponentType<{
  config;
  onChange: (config) => void;
}>> = {
  [ProcessingStep.Translation]: ({ config, onChange }: { config: ProcessingStepConfig[ProcessingStep.Translation], onChange: (config: ProcessingStepConfig[ProcessingStep.Translation]) => void }) => (
    <Select
      value={config?.targetLang || 'ru'}
      onValueChange={(value) => onChange({ targetLang: value })}
    >
      <SelectTrigger>
        <SelectValue placeholder="Выберите язык" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ru">Русский</SelectItem>
        <SelectItem value="en">English</SelectItem>
      </SelectContent>
    </Select>
  ),
  [ProcessingStep.Summarization]: ({ config, onChange }: { config: ProcessingStepConfig[ProcessingStep.Summarization], onChange: (config: ProcessingStepConfig[ProcessingStep.Summarization]) => void }) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <label>Максимальная длина</label>
        <Input
          type="number"
        placeholder="Максимальная длина"
        value={config?.maxLength || 500}
          onChange={(e) => onChange({ ...config, maxLength: parseInt(e.target.value) || 300 })}
        />
      </div>
      <div className="flex items-center space-x-2">
        <label>Промт суммаризации</label>
        <Input
          placeholder="Промт суммаризации"
        value={config?.prompt || ''}
          onChange={(e) => onChange({ ...config, prompt: e.target.value || '' })}
        />
      </div>
    </div>
  ),
  [ProcessingStep.Styling]: ({ config, onChange }) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <label>Промт стилизации</label>
        <Input
          placeholder="Промт стилизации"
        value={config?.prompt || ''}
          onChange={(e) => onChange({ ...config, prompt: e.target.value || '' })}
        />
      </div>
    </div>
  ),
  [ProcessingStep.Media]: ({ config, onChange }) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <label>Минимальный порог согласованности текста и медиа</label>
        <Input
          type="number"
          placeholder="Минимальный порог согласованности текста и медиа"
          value={config?.minCoherenceScore || 0.5}
          onChange={(e) => onChange({ ...config, minCoherenceScore: parseFloat(e.target.value) || 0.8 })}
        />
      </div>
    </div>
  ),
};

export function ChannelConfigForm({ scheduleId, onConfigSaved }: ChannelConfigFormProps) {
  const [config, setConfig] = useState<TelegramChannelConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await channelApi.getChannelConfig(scheduleId);
        setConfig(data || {
          scheduleId,
          name: '',
          isActive: true,
          pipeline: { steps: [] },
        });
      } catch (error) {
        console.error('Ошибка загрузки конфигурации:', error);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, [scheduleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    try {
      if (config.id) {
        await channelApi.updateChannelConfig(config.id, config);
      } else {
        await channelApi.createChannelConfig(config);
      }
      onConfigSaved?.();
    } catch (error) {
      console.error('Ошибка сохранения конфигурации:', error);
    }
  };

  const addStep = (type: ProcessingStep) => {
    if (!config) return;
    
    setConfig(prev => ({
      ...prev!,
      pipeline: {
        steps: [
          ...prev!.pipeline.steps,
          {
            type,
            config: {},
            order: prev!.pipeline.steps.length,
          },
        ],
      },
    }));
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!config) {
    return <div>Ошибка загрузки конфигурации</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Название канала</label>
            <Input
              value={config.name}
              onChange={e => setConfig(prev => ({ ...prev!, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ID чата</label>
            <Input
              value={config.chatId || ''}
              onChange={e => setConfig(prev => ({ ...prev!, chatId: e.target.value }))}
              placeholder="@channel_name или -100123456789"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={config.isActive}
              onCheckedChange={checked => setConfig(prev => ({ ...prev!, isActive: checked }))}
            />
            <label className="text-sm font-medium">Активен</label>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Этапы обработки</h3>
        <div className="space-y-4">
          {config.pipeline.steps.map((step, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>{AVAILABLE_STEPS.find(s => s.value === step.type)?.label}</span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setConfig(prev => ({
                        ...prev!,
                        pipeline: {
                          steps: prev!.pipeline.steps.filter((_, i) => i !== index),
                        },
                      }));
                    }}
                  >
                    Удалить
                  </Button>
                </div>
                
                <div className="mt-2">
                  {STEP_CONFIGS[step.type]({
                    config: step.config,
                    onChange: (newConfig) => {
                      const newSteps = [...config.pipeline.steps];
                      newSteps[index] = { ...step, config: newConfig };
                      setConfig(prev => ({
                        ...prev!,
                        pipeline: { steps: newSteps },
                      }));
                    },
                  })}
                </div>
              </div>
            </Card>
          ))}

          <div className="flex gap-2 flex-wrap">
            {AVAILABLE_STEPS.map(step => (
              <Button
                key={step.value}
                type="button"
                variant="outline"
                onClick={() => addStep(step.value)}
              >
                Добавить {step.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="submit">
          {config.id ? 'Сохранить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
} 
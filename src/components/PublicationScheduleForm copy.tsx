'use client';

import { useState, useEffect } from 'react';
import { publicationApi } from '@/lib/api';
import { PublicationSchedule } from '@/types/publication';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PublicationScheduleFormProps {
  channelId: string;
}

const TIMEZONES = [
  { value: 'Europe/Moscow', label: 'Москва (UTC+3)' },
  { value: 'Europe/London', label: 'Лондон (UTC+0)' },
  // Добавьте другие часовые пояса по необходимости
];

export function PublicationScheduleForm({ channelId }: PublicationScheduleFormProps) {
  const [schedule, setSchedule] = useState<PublicationSchedule>({
    channelId,
    publicationTimes: ['09:00', '15:00', '21:00'],
    timezone: 'Europe/Moscow',
    isActive: true,
  });

  useEffect(() => {
    const loadSchedule = async () => {
      const data = await publicationApi.getSchedule(channelId);
      if (data) {
        setSchedule(data);
      }
    };
    loadSchedule();
  }, [channelId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (schedule.id) {
      await publicationApi.updateSchedule(schedule.id, schedule);
    } else {
      await publicationApi.createSchedule(schedule);
    }
  };

  const addTime = () => {
    setSchedule(prev => ({
      ...prev,
      publicationTimes: [...prev.publicationTimes, '12:00'],
    }));
  };

  const removeTime = (index: number) => {
    setSchedule(prev => ({
      ...prev,
      publicationTimes: prev.publicationTimes.filter((_, i) => i !== index),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                checked={schedule.isActive}
                onCheckedChange={(checked) => setSchedule(prev => ({ ...prev, isActive: checked }))}
              />
              <label>Расписание активно</label>
            </div>
            <Select
              value={schedule.timezone}
              onValueChange={(value) => setSchedule(prev => ({ ...prev, timezone: value }))}
            >
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Выберите часовой пояс" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map(tz => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Время публикаций</h3>
              <Button type="button" variant="outline" onClick={addTime}>
                Добавить время
              </Button>
            </div>
            
            {schedule.publicationTimes.map((time, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => {
                    const newTimes = [...schedule.publicationTimes];
                    newTimes[index] = e.target.value;
                    setSchedule(prev => ({ ...prev, publicationTimes: newTimes }));
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeTime(index)}
                >
                  Удалить
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">
          {schedule.id ? 'Сохранить' : 'Создать'} расписание
        </Button>
      </div>
    </form>
  );
} 
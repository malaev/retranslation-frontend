'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { redditApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import type { FetcherScheduleConfig, SubredditConfig } from '@/types/reddit';

interface ScheduleFormProps {
  initialData?: FetcherScheduleConfig;
}

export function ScheduleForm({ initialData }: ScheduleFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<FetcherScheduleConfig, 'id'>>({
    name: initialData?.name || '',
    isActive: initialData?.isActive ?? true,
    subreddits: initialData?.subreddits || [{
      subreddit: '',
      sortType: 'top',
      timeRange: 'day',
      isActive: true,
      fetchInterval: 3600,
      minScore: 0,
      limit: 10,
    }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData?.id) {
        await redditApi.updateSchedule(initialData.id, formData);
      } else {
        await redditApi.createSchedule(formData);
      }
      router.push('/schedules');
      router.refresh();
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const addSubreddit = () => {
    setFormData(prev => ({
      ...prev,
      subreddits: [...prev.subreddits, {
        subreddit: '',
        sortType: 'top',
        timeRange: 'day',
        isActive: true,
        fetchInterval: 3600,
        minScore: 0,
        limit: 10,
      }],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Название секции</label>
          <Input
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.isActive}
            onCheckedChange={checked => setFormData(prev => ({ ...prev, isActive: checked }))}
          />
          <label className="text-sm font-medium">Активна</label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Сабреддиты</h2>
          <Button type="button" onClick={addSubreddit} variant="outline">
            Добавить сабреддит
          </Button>
        </div>

        {formData.subreddits.map((subreddit, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Название сабреддита</label>
                <Input
                  placeholder="Название сабреддита"
                  value={subreddit.subreddit}
                  onChange={e => {
                    const newSubreddits = [...formData.subreddits];
                    newSubreddits[index] = { ...subreddit, subreddit: e.target.value };
                    setFormData(prev => ({ ...prev, subreddits: newSubreddits }));
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Тип сортировки</label>
                <select
                  className="w-full border rounded p-2"
                  value={subreddit.sortType}
                  onChange={e => {
                    const newSubreddits = [...formData.subreddits];
                    newSubreddits[index] = { ...subreddit, sortType: e.target.value as 'top' | 'rising' | 'new' };
                    setFormData(prev => ({ ...prev, subreddits: newSubreddits }));
                  }}
                >
                  <option value="top">Top</option>
                  <option value="rising">Rising</option>
                  <option value="new">New</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Временной диапазон</label>
                <select
                  className="w-full border rounded p-2"
                  value={subreddit.timeRange}
                  onChange={e => {
                    const newSubreddits = [...formData.subreddits];
                    newSubreddits[index] = { ...subreddit, timeRange: e.target.value as 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' };
                    setFormData(prev => ({ ...prev, subreddits: newSubreddits }));
                  }}
                >
                  <option value="hour">Hour</option>
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                  <option value="all">All</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Интервал выборки (в секундах)</label>
                <Input
                  type="number"
                  placeholder="Интервал выборки (в секундах)"
                  value={subreddit.fetchInterval}
                  onChange={e => {
                    const newSubreddits = [...formData.subreddits];
                    newSubreddits[index] = { ...subreddit, fetchInterval: parseInt(e.target.value, 10) || 3600 };
                    setFormData(prev => ({ ...prev, subreddits: newSubreddits }));
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Минимальный рейтинг</label>
                <Input
                  type="number"
                  placeholder="Минимальный рейтинг"
                  value={subreddit.minScore ?? 0}
                  onChange={e => {
                    const newSubreddits = [...formData.subreddits];
                    newSubreddits[index] = { ...subreddit, minScore: parseInt(e.target.value, 10) || 0 };
                    setFormData(prev => ({ ...prev, subreddits: newSubreddits }));
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Лимит</label>
                <Input
                  type="number"
                  placeholder="Лимит"
                  value={subreddit.limit ?? 10}
                  onChange={e => {
                    const newSubreddits = [...formData.subreddits];
                    newSubreddits[index] = { ...subreddit, limit: parseInt(e.target.value, 10) || 10 };
                    setFormData(prev => ({ ...prev, subreddits: newSubreddits }));
                  }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Отмена
        </Button>
        <Button type="submit">
          {initialData ? 'Сохранить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
} 
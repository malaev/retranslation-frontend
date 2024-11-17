'use client';
import { Suspense, useEffect, useState } from 'react';
import { redditApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FetcherScheduleConfig } from '@/types/reddit';

function SchedulesList() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<FetcherScheduleConfig[]>([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      const data = await redditApi.getSchedules();
      setSchedules(data);
    };
    fetchSchedules();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту секцию?')) {
      try {
        await redditApi.deleteSchedule(id);
        router.refresh();
      } catch (error) {
        console.error('Ошибка при удалении секции:', error);
        alert('Не удалось удалить секцию');
      }
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {schedules.map((schedule) => (
        <Card key={schedule.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{schedule.name}</span>
              <span className={`text-sm ${schedule.isActive ? 'text-green-500' : 'text-red-500'}`}>
                {schedule.isActive ? 'Активен' : 'Неактивен'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Сабреддитов: {schedule.subreddits.length}
              </p>
              <p className="text-sm text-muted-foreground">
                Последний сбор: {schedule.lastFetch ? new Date(schedule.lastFetch).toLocaleString() : 'Нет данных'}
              </p>
              <div className="flex gap-2">
                <Link href={`/schedules/${schedule.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Редактировать
                  </Button>
                </Link>
                <Button 
                  variant="destructive" 
                  onClick={() => schedule.id && handleDelete(schedule.id)}
                  className="w-[100px]"
                >
                  Удалить
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SchedulesPage() {
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Секции источников</h1>
        <Link href="/schedules/new">
          <Button>Создать секцию</Button>
        </Link>
      </div>
      <Suspense fallback={<div>Загрузка...</div>}>
        <SchedulesList />
      </Suspense>
    </div>
  );
} 
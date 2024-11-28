import { notFound } from 'next/navigation';
import { redditApi } from '@/lib/api';
import { ScheduleForm } from '@/components/ScheduleForm';
import { ChannelConfigForm } from '@/components/ChannelConfigForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function EditSchedulePage({ params }: { params: { id: string } }) {
  const schedules = await redditApi.getSchedules();
  const schedule = schedules.find(s => s.id === params.id);

  if (!schedule) {
    notFound();
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Редактирование секции источников</h1>
      
      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList>
          <TabsTrigger value="schedule">Настройки расписания</TabsTrigger>
          <TabsTrigger value="channel">Настройки Telegram канала</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <ScheduleForm initialData={schedule} />
        </TabsContent>

        <TabsContent value="channel">
          <ChannelConfigForm scheduleId={schedule.id!} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 
import { notFound } from 'next/navigation';
import { redditApi } from '@/lib/api';
import { ScheduleForm } from '@/components/ScheduleForm';

export default async function EditSchedulePage({ params }: { params: { id: string } }) {
  const schedules = await redditApi.getSchedules();
  const schedule = schedules.find(s => s.id === params.id);

  if (!schedule) {
    notFound();
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Редактирование секции источников</h1>
      <ScheduleForm initialData={schedule} />
    </div>
  );
} 
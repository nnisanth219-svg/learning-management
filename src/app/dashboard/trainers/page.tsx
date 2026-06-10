import { redirect } from 'next/navigation';

export default function TrainersRedirect() {
  redirect('/dashboard/students?tab=trainers');
}

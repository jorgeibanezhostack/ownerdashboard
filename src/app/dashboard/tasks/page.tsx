import { adminClient } from '@/lib/supabase/admin'
import { TORRIDONIA_PROPERTY_ID } from '@/lib/constants'
import TaskAssignForm from '@/components/TaskAssignForm'

export default async function TasksPage() {
  const [{ data: tasks }, { data: staff }] = await Promise.all([
    adminClient
      .from('tasks')
      .select('id, title, role_category')
      .eq('property_id', TORRIDONIA_PROPERTY_ID)
      .order('title'),
    adminClient
      .from('users')
      .select('id, full_name, role')
      .eq('property_id', TORRIDONIA_PROPERTY_ID)
      .in('role', ['staff', 'volunteer'])
      .eq('is_active', true)
      .order('full_name'),
  ])

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Asignar tarea</h1>
      <p className="text-sm text-gray-500 mb-6">
        El staff asignado recibirá una notificación automática.
      </p>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <TaskAssignForm tasks={tasks ?? []} staff={staff ?? []} />
      </div>
    </div>
  )
}

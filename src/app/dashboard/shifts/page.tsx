import { adminClient } from '@/lib/supabase/admin'
import { TORRIDONIA_PROPERTY_ID } from '@/lib/constants'
import ShiftCreateForm from '@/components/ShiftCreateForm'

export const dynamic = 'force-dynamic'

export default async function ShiftsPage() {
  const { data: staff } = await adminClient
    .from('users')
    .select('id, full_name, role')
    .eq('property_id', TORRIDONIA_PROPERTY_ID)
    .in('role', ['staff', 'volunteer'])
    .eq('is_active', true)
    .order('full_name')

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Create shift</h1>
      <p className="text-sm text-gray-500 mb-6">
        Assigned staff will receive an automatic notification.
      </p>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ShiftCreateForm staff={staff ?? []} />
      </div>
    </div>
  )
}

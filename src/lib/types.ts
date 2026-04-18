export type UserRole = 'owner' | 'manager' | 'staff' | 'volunteer'

export interface UserRow {
  id: string
  property_id: string
  email: string
  auth_uid: string
  role: UserRole
  full_name: string
  is_active: boolean
  check_in_date: string | null
  check_out_date: string | null
}

export interface TaskRow {
  id: string
  property_id: string
  title: string
  description: string | null
  role_category: string
  requires_photo: boolean
  is_recurring: boolean
}

export interface TaskAssignmentRow {
  id: string
  property_id: string
  task_id: string
  assigned_to: string
  due_date: string
  completed_at: string | null
  photo_verification: Record<string, unknown> | null
}

export interface ShiftRow {
  id: string
  property_id: string
  user_id: string
  start_time: string
  end_time: string
  role: string
  checked_in_at: string | null
  checked_out_at: string | null
}

export interface NotificationRow {
  id: string
  property_id: string
  user_id: string
  type: string
  title: string
  body: string
  link: string | null
  read_at: string | null
  created_at: string
}

export type FeedItem =
  | {
      kind: 'task_completion'
      id: string
      task_title: string
      staff_name: string
      timestamp: string
    }
  | {
      kind: 'shift_checkin'
      id: string
      staff_name: string
      timestamp: string
    }

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TORRIDONIA_PROPERTY_ID } from '@/lib/constants'
import type { FeedItem } from '@/lib/types'

interface InitialCompletion {
  id: string
  completed_at: string
  tasks: { title: string } | null
  users: { full_name: string } | null
}

export default function LiveFeed({
  initialCompletions,
}: {
  initialCompletions: InitialCompletion[]
}) {
  const [feed, setFeed] = useState<FeedItem[]>(() =>
    initialCompletions
      .filter((c) => c.completed_at)
      .map((c) => ({
        kind: 'task_completion' as const,
        id: c.id,
        task_title: c.tasks?.title ?? '(sin título)',
        staff_name: c.users?.full_name ?? '(desconocido)',
        timestamp: c.completed_at,
      }))
  )

  useEffect(() => {
    const supabase = createClient()

    const taskChannel = supabase
      .channel('task-completions')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'task_assignments',
          filter: `property_id=eq.${TORRIDONIA_PROPERTY_ID}`,
        },
        async (payload) => {
          const row = payload.new as {
            id: string
            completed_at: string | null
            task_id: string
            assigned_to: string
          }
          if (!row.completed_at) return

          const inner = createClient()
          const [{ data: task }, { data: user }] = await Promise.all([
            inner.from('tasks').select('title').eq('id', row.task_id).single(),
            inner.from('users').select('full_name').eq('id', row.assigned_to).single(),
          ])

          const item: FeedItem = {
            kind: 'task_completion',
            id: row.id,
            task_title: task?.title ?? '(sin título)',
            staff_name: user?.full_name ?? '(desconocido)',
            timestamp: row.completed_at,
          }

          setFeed((prev) => {
            if (prev.some((f) => f.id === item.id && f.kind === item.kind)) return prev
            return [item, ...prev]
          })
        }
      )
      .subscribe()

    const shiftChannel = supabase
      .channel('shift-checkins')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shifts',
          filter: `property_id=eq.${TORRIDONIA_PROPERTY_ID}`,
        },
        async (payload) => {
          const row = payload.new as {
            id: string
            checked_in_at: string | null
            user_id: string
          }
          if (!row.checked_in_at) return

          const { data: user } = await createClient()
            .from('users')
            .select('full_name')
            .eq('id', row.user_id)
            .single()

          const item: FeedItem = {
            kind: 'shift_checkin',
            id: row.id,
            staff_name: user?.full_name ?? '(desconocido)',
            timestamp: row.checked_in_at,
          }

          setFeed((prev) => {
            if (prev.some((f) => f.id === item.id && f.kind === item.kind)) return prev
            return [item, ...prev]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(taskChannel)
      supabase.removeChannel(shiftChannel)
    }
  }, [])

  if (feed.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        Sin actividad registrada hoy.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {feed.map((item) => (
        <li
          key={`${item.kind}-${item.id}`}
          className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0"
        >
          <span className="mt-0.5 text-lg leading-none">
            {item.kind === 'task_completion' ? '✓' : '→'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800">
              {item.kind === 'task_completion' ? (
                <>
                  <span className="font-medium">{item.staff_name}</span> completó{' '}
                  <span className="font-medium">&ldquo;{item.task_title}&rdquo;</span>
                </>
              ) : (
                <>
                  <span className="font-medium">{item.staff_name}</span> hizo check-in de turno
                </>
              )}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(item.timestamp).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

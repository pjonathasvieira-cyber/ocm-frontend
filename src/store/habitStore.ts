import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface Habit {
  id: string
  title: string
  description?: string
}

export interface HabitCheckin {
  id: string
  habit_id: string
  week_number: number
  day_number: number
  checked: boolean
  checked_at?: string
}

interface HabitStore {
  currentWeek: number
  currentDay: number
  habits: Habit[]
  checkins: HabitCheckin[]
  loading: boolean
  error: string | null

  setCurrentWeek: (week: number) => void
  setCurrentDay: (day: number) => void
  loadHabitsForWeek: (weekNumber: number) => Promise<void>
  loadCheckinsForWeek: (userId: string, weekNumber: number) => Promise<void>
  toggleHabitCheckin: (userId: string, habitId: string, weekNumber: number, dayNumber: number, checked: boolean) => Promise<void>
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  currentWeek: 1,
  currentDay: 1,
  habits: [],
  checkins: [],
  loading: false,
  error: null,

  setCurrentWeek: (week: number) => set({ currentWeek: week }),
  setCurrentDay: (day: number) => set({ currentDay: day }),

  loadHabitsForWeek: async (weekNumber: number) => {
    set({ loading: true, error: null })
    try {
      const { data: weeks } = await supabase
        .from('weeks')
        .select('id')
        .eq('week_number', weekNumber)

      const weekId = weeks?.[0]?.id
      if (!weekId) throw new Error('Week not found')

      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('week_id', weekId)

      if (error) throw error
      set({ habits: data || [] })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar hábitos'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },

  loadCheckinsForWeek: async (userId: string, weekNumber: number) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('habit_checkins')
        .select('*')
        .eq('user_id', userId)
        .eq('week_number', weekNumber)

      if (error) throw error
      set({ checkins: data || [] })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar check-ins'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },

  toggleHabitCheckin: async (userId: string, habitId: string, weekNumber: number, dayNumber: number, checked: boolean) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from('habit_checkins')
        .upsert(
          {
            user_id: userId,
            habit_id: habitId,
            week_number: weekNumber,
            day_number: dayNumber,
            checked,
            checked_at: checked ? new Date().toISOString() : null,
          },
          { onConflict: 'user_id,habit_id,week_number,day_number' }
        )

      if (error) throw error

      const { checkins } = get()
      const updatedCheckins = checkins.filter(
        (c) => !(c.habit_id === habitId && c.week_number === weekNumber && c.day_number === dayNumber)
      )
      updatedCheckins.push({
        id: `${userId}-${habitId}-${weekNumber}-${dayNumber}`,
        habit_id: habitId,
        week_number: weekNumber,
        day_number: dayNumber,
        checked,
        checked_at: checked ? new Date().toISOString() : undefined,
      })
      set({ checkins: updatedCheckins })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar check-in'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },
}))

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const DAYS = [
  { number: 1, name: 'Segunda' },
  { number: 2, name: 'Terça' },
  { number: 3, name: 'Quarta' },
  { number: 4, name: 'Quinta' },
  { number: 5, name: 'Sexta' },
  { number: 6, name: 'Sábado' },
  { number: 7, name: 'Domingo' },
]

const WEEKS = Array.from({ length: 12 }, (_, i) => ({
  number: i + 1,
  title: `Semana ${i + 1}`,
}))

interface HabitWithCheckin {
  id: string
  title: string
  description?: string
  checked: boolean
}

export default function HabitCheckinPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState(1)
  const [currentDay, setCurrentDay] = useState(1)
  const [habitsForDisplay, setHabitsForDisplay] = useState<HabitWithCheckin[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then((res) => {
      if (res.data.user) setUserId(res.data.user.id)
    })
  }, [])

  useEffect(() => {
    if (userId) loadHabitsAndCheckins()
  }, [currentWeek, currentDay, userId])

  const loadHabitsAndCheckins = async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      // Fetch habits for week
      const { data: weeks, error: weeksError } = await supabase
        .from('weeks')
        .select('id')
        .eq('week_number', currentWeek)

      if (weeksError) {
        console.error('Erro ao buscar semana:', weeksError)
        setError('Erro ao carregar semana')
        return
      }

      const weekId = weeks?.[0]?.id

      if (!weekId) {
        console.warn('Semana não encontrada:', currentWeek)
        setHabitsForDisplay([])
        setLoading(false)
        return
      }

      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('week_id', weekId)

      if (habitsError) {
        console.error('Erro ao buscar hábitos:', habitsError)
        setError('Erro ao carregar hábitos')
        return
      }

      console.log('Hábitos carregados:', habits)

      // Fetch checkins for the day
      const { data: checkins, error: checkinsError } = await supabase
        .from('habit_checkins')
        .select('*')
        .eq('user_id', userId)
        .eq('week_number', currentWeek)
        .eq('day_number', currentDay)

      if (checkinsError) {
        console.error('Erro ao buscar check-ins:', checkinsError)
      }

      const checkinsMap = new Map(checkins?.map((c) => [c.habit_id, c]) || [])
      const display = (habits || []).map((h) => ({
        id: h.id,
        title: h.title,
        description: h.description,
        checked: checkinsMap.get(h.id)?.checked || false,
      }))

      setHabitsForDisplay(display)
    } catch (err) {
      console.error('Erro geral ao carregar hábitos:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleCheckin = async (habitId: string, newChecked: boolean) => {
    if (!userId) return

    try {
      await supabase.from('habit_checkins').upsert(
        {
          user_id: userId,
          habit_id: habitId,
          week_number: currentWeek,
          day_number: currentDay,
          checked: newChecked,
          checked_at: newChecked ? new Date().toISOString() : null,
        },
        { onConflict: 'user_id,habit_id,week_number,day_number' }
      )

      setHabitsForDisplay((prev) =>
        prev.map((h) => (h.id === habitId ? { ...h, checked: newChecked } : h))
      )
    } catch (err) {
      console.error('Erro ao atualizar check-in:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Seletor de Semana */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Semana</h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
          {WEEKS.map((week) => (
            <button
              key={week.number}
              onClick={() => setCurrentWeek(week.number)}
              className={`py-2 px-2 rounded-lg font-medium text-sm transition ${
                currentWeek === week.number
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-400'
              }`}
            >
              {week.number}
            </button>
          ))}
        </div>
      </div>

      {/* Seletor de Dia */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Dia da Semana</h2>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day) => (
            <button
              key={day.number}
              onClick={() => setCurrentDay(day.number)}
              className={`py-2 px-1 rounded-lg font-medium text-sm transition ${
                currentDay === day.number
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-400'
              }`}
            >
              {day.name.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Hábitos */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Hábitos - Semana {currentWeek}, {DAYS.find((d) => d.number === currentDay)?.name}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading && <div className="text-gray-600">Carregando...</div>}

        {habitsForDisplay.length === 0 && !loading ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">Nenhum hábito configurado para esta semana.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {habitsForDisplay.map((habit) => (
              <div
                key={habit.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-4 hover:shadow-md transition"
              >
                <input
                  type="checkbox"
                  checked={habit.checked}
                  onChange={(e) => handleToggleCheckin(habit.id, e.target.checked)}
                  className="w-6 h-6 mt-1 text-blue-600 rounded cursor-pointer"
                />
                <div className="flex-1">
                  <h3 className={`font-medium ${habit.checked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {habit.title}
                  </h3>
                  {habit.description && (
                    <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
                  )}
                </div>
                {habit.checked && <span className="text-green-600 font-bold">✓</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

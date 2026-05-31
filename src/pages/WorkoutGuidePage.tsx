import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Exercise {
  name: string
  sets?: number
  reps?: string
  weight?: string
  notes?: string
}

interface Workout {
  title: string
  description?: string
  workout_type: 'strength' | 'cardio' | 'rest'
  exercises?: Exercise[]
  week_number: number
  day_number: number
}

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

export default function WorkoutGuidePage() {
  const [currentWeek, setCurrentWeek] = useState(1)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadWorkoutsForWeek()
  }, [currentWeek])

  const loadWorkoutsForWeek = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: err } = await supabase
        .from('workouts')
        .select('*')
        .eq('week_number', currentWeek)
        .order('day_number', { ascending: true })

      if (err) throw err
      setWorkouts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar treinos')
    } finally {
      setLoading(false)
    }
  }

  const getWorkoutTypeLabel = (type: string) => {
    const labels = {
      strength: '💪 Musculação',
      cardio: '🏃 Cardio',
      rest: '😴 Descanso',
    }
    return labels[type as keyof typeof labels] || type
  }

  const getWorkoutTypeColor = (type: string) => {
    const colors = {
      strength: 'bg-orange-50 border-orange-200',
      cardio: 'bg-red-50 border-red-200',
      rest: 'bg-green-50 border-green-200',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-50 border-gray-200'
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

      {/* Treinos */}
      {loading ? (
        <div className="text-gray-600">Carregando...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : workouts.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">Nenhum treino configurado para esta semana.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout) => (
            <div
              key={`${workout.week_number}-${workout.day_number}`}
              className={`border rounded-lg p-6 ${getWorkoutTypeColor(workout.workout_type)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{workout.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {DAYS.find((d) => d.number === workout.day_number)?.name} - {getWorkoutTypeLabel(workout.workout_type)}
                  </p>
                </div>
              </div>

              {workout.description && (
                <p className="text-gray-700 mb-4">{workout.description}</p>
              )}

              {workout.exercises && workout.exercises.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Exercícios:</h4>
                  <ul className="space-y-2">
                    {workout.exercises.map((ex, idx) => (
                      <li key={idx} className="bg-white bg-opacity-50 rounded px-3 py-2 text-sm text-gray-800">
                        <span className="font-medium">{ex.name}</span>
                        {ex.sets && <span className="text-gray-600"> • {ex.sets} séries</span>}
                        {ex.reps && <span className="text-gray-600"> • {ex.reps} reps</span>}
                        {ex.weight && <span className="text-gray-600"> • {ex.weight}</span>}
                        {ex.notes && <span className="text-gray-500"> ({ex.notes})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

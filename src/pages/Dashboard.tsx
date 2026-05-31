import { useState } from 'react'
import { supabase } from '../lib/supabase'
import HabitCheckinPage from './HabitCheckinPage'
import { DevotionalPage } from './DevotionalPage'
import { AudioPlayerPage } from './AudioPlayerPage'
import WorkoutGuidePage from './WorkoutGuidePage'

type TabType = 'habits' | 'devotional' | 'audio' | 'workouts'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('habits')
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setLoading(false)
  }

  const tabs = [
    { id: 'habits', label: '✅ Hábitos', icon: '✅' },
    { id: 'devotional', label: '📖 Devocional', icon: '📖' },
    { id: 'audio', label: '🎵 Áudio', icon: '🎵' },
    { id: 'workouts', label: '💪 Treinos', icon: '💪' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">O Código da Masculinidade</h1>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {loading ? 'Saindo...' : 'Sair'}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-3 px-4 rounded-lg font-medium text-sm transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'habits' && <HabitCheckinPage />}
          {activeTab === 'devotional' && <DevotionalPage />}
          {activeTab === 'audio' && <AudioPlayerPage />}
          {activeTab === 'workouts' && <WorkoutGuidePage />}
        </div>
      </main>
    </div>
  )
}

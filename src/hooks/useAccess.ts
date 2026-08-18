import { useEffect, useState } from 'react'
import { getCurrentUserProfile } from '../lib/auth'

export interface AccessFlags {
  level: number
  canAccessEbook: boolean
  canAccessAudiobook: boolean
  canAccessDevotional: boolean
  canAccessPlaybook: boolean
  canAccessWorkout: boolean
  loading: boolean
}

export function useAccess(): AccessFlags {
  const [level, setLevel] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUserProfile().then(({ data }) => {
      if (data) setLevel(data.access_level ?? 1)
      setLoading(false)
    })
  }, [])

  return {
    level,
    canAccessEbook: level >= 1,
    canAccessAudiobook: level >= 2,
    canAccessDevotional: level >= 3,
    canAccessPlaybook: level >= 4,
    canAccessWorkout: level >= 5,
    loading,
  }
}

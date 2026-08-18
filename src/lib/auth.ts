import { supabase } from './supabase'
export { getCurrentWeekNumber } from './api'

export interface UserProfile {
  id: string
  email: string
  name: string | null
  start_date: string | null
  access_expires_at: string | null
  must_change_password: boolean
  is_active: boolean
  access_level: number
  created_at: string
}

export async function getCurrentUserProfile(): Promise<{ data: UserProfile | null; error: string | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { data: null, error: 'Não autenticado' }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) return { data: null, error: error.message }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Erro ao buscar perfil' }
  }
}

/**
 * Check if access has expired (180 days after start_date)
 */
export function hasAccessExpired(profile: UserProfile): boolean {
  if (!profile.access_expires_at) return false
  return new Date() > new Date(profile.access_expires_at)
}

/**
 * Calculate days until access expires
 */
export function daysUntilExpiration(profile: UserProfile): number {
  if (!profile.access_expires_at) return -1
  const now = new Date()
  const expires = new Date(profile.access_expires_at)
  const diff = expires.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Change user password (for both first-time and regular password changes)
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<{ error: string | null }> {
  try {
    // First, verify current password by attempting to sign in
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      return { error: 'Usuário não autenticado' }
    }

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (signInError) {
      return { error: 'Senha atual incorreta' }
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      return { error: updateError.message }
    }

    // Update must_change_password flag if it was set
    if (user.id) {
      await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', user.id)
    }

    return { error: null }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar senha'
    return { error: errorMessage }
  }
}

/**
 * Set password on first login (no current password required)
 */
export async function setInitialPassword(newPassword: string): Promise<{ error: string | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Usuário não autenticado' }
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      return { error: updateError.message }
    }

    // Update must_change_password flag
    if (user.id) {
      await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', user.id)
    }

    return { error: null }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro ao definir senha'
    return { error: errorMessage }
  }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) return { error: error.message }
    return { error: null }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro ao desconectar'
    return { error: errorMessage }
  }
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login'
    return { error: errorMessage }
  }
}

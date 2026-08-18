/**
 * Data layer for student features
 * Queries to fetch weeks, days, devotionals, audios, habits, habit_logs
 */

import { supabase } from './supabase';

export interface Week {
  id: number;
  number: number;
  pillar: string;
  title: string;
  focus: string;
  objective: string;
  created_at: string;
}

export interface Day {
  id: number;
  week_id: number;
  day_number: number;
  title: string;
  day_type: string;
  created_at: string;
}

export interface Devotional {
  id: number;
  day_id: number;
  anchor_text: string;
  anchor_reference: string;
  reflection: string;
  question: string;
  created_at: string;
}

export interface Audio {
  id: number;
  day_id: number;
  title: string;
  duration_target: string;
  audio_url: string;
  script_bullets: string[];
  created_at: string;
}

export interface Habit {
  id: number;
  week_id: number;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
}

export interface HabitLog {
  id: number;
  user_id: string;
  habit_id: number;
  log_date: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DevotionalCompletion {
  id: number;
  user_id: string;
  day_id: number;
  completed_at: string;
}

/**
 * Get all weeks (1-12)
 */
export async function getWeeks(): Promise<{ data: Week[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('weeks')
      .select('*')
      .order('number', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Get specific week by number
 */
export async function getWeekByNumber(weekNumber: number): Promise<{ data: Week | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('weeks')
      .select('*')
      .eq('number', weekNumber)
      .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Get days for a specific week
 */
export async function getDaysForWeek(weekId: number): Promise<{ data: Day[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('days')
      .select('*')
      .eq('week_id', weekId)
      .order('day_number', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Get devotional for a specific day
 */
export async function getDevotionalForDay(dayId: number): Promise<{ data: Devotional | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('devotionals')
      .select('*')
      .eq('day_id', dayId)
      .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Get audio for a specific day
 */
export async function getAudioForDay(dayId: number): Promise<{ data: Audio | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('audios')
      .select('*')
      .eq('day_id', dayId)
      .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Get habits for a specific week
 */
export async function getHabitsForWeek(weekId: number): Promise<{ data: Habit[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('week_id', weekId)
      .order('order_index', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Get habit logs for current user on a specific date
 */
export async function getHabitLogsForDate(logDate: string): Promise<{ data: HabitLog[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('log_date', logDate);

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Create or update a habit log
 */
export async function upsertHabitLog(
  habitId: number,
  logDate: string,
  completed: boolean
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('habit_logs')
      .upsert({
        habit_id: habitId,
        log_date: logDate,
        completed,
      });

    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Get current week number (calls backend function)
 */
export async function getCurrentWeekNumber(startDate: string): Promise<{ data: number | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('get_current_week_number', {
      start_date: startDate,
    });

    if (error) return { data: null, error: error.message };
    return { data: data as number, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Check whether the current user has marked a given day's devotional as completed
 */
export async function getDevotionalCompletion(dayId: number): Promise<{ data: boolean; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: false, error: null };

    const { data, error } = await supabase
      .from('devotional_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('day_id', dayId)
      .maybeSingle();

    if (error) return { data: false, error: error.message };
    return { data: !!data, error: null };
  } catch (err) {
    return { data: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Mark (or unmark) a day's devotional as completed for the current user
 */
export async function setDevotionalCompletion(
  dayId: number,
  completed: boolean
): Promise<{ error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    if (completed) {
      const { error } = await supabase
        .from('devotional_completions')
        .upsert({ user_id: user.id, day_id: dayId, completed_at: new Date().toISOString() }, { onConflict: 'user_id,day_id' });
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase
        .from('devotional_completions')
        .delete()
        .eq('user_id', user.id)
        .eq('day_id', dayId);
      if (error) return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Find the day_id the "Abrir Devocional" button should open: the devotional
 * right after the last one the user marked as completed (in week/day order).
 * If nothing has been completed yet, returns the very first day (Semana 1, Dia 1).
 * If everything has been completed, returns the last day of the program.
 */
export async function getNextDevotionalDayId(): Promise<{ data: number | null; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data: days, error: daysError } = await supabase
      .from('days')
      .select('id, day_number, week_id, weeks(number)')
      .order('week_id', { ascending: true })
      .order('day_number', { ascending: true });

    if (daysError) return { data: null, error: daysError.message };
    if (!days || days.length === 0) return { data: null, error: null };

    const orderedDays = [...days].sort((a, b) => {
      const weekA = (a.weeks as any)?.number ?? 0;
      const weekB = (b.weeks as any)?.number ?? 0;
      if (weekA !== weekB) return weekA - weekB;
      return a.day_number - b.day_number;
    });

    const { data: completions, error: completionsError } = await supabase
      .from('devotional_completions')
      .select('day_id')
      .eq('user_id', user.id);

    if (completionsError) return { data: null, error: completionsError.message };

    const completedIds = new Set((completions || []).map(c => c.day_id));

    let lastCompletedIndex = -1;
    for (let i = orderedDays.length - 1; i >= 0; i--) {
      if (completedIds.has(orderedDays[i].id)) {
        lastCompletedIndex = i;
        break;
      }
    }

    const nextIndex = Math.min(lastCompletedIndex + 1, orderedDays.length - 1);
    return { data: orderedDays[nextIndex].id, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Check if access is expired (calls backend function)
 */
export async function checkAccessExpired(startDate: string): Promise<{ data: boolean | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('is_access_expired', {
      start_date: startDate,
    });

    if (error) return { data: null, error: error.message };
    return { data: data as boolean, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

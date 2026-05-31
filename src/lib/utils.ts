/**
 * Utility functions for Phase 4
 * Date calculations, formatters, helpers
 */

/**
 * Calculate days remaining until expiration
 */
export function daysRemainingUntilExpiration(expiresAt: string | null): number {
  if (!expiresAt) return 0;
  const expireDate = new Date(expiresAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expireDate.setHours(0, 0, 0, 0);
  const diffTime = expireDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Calculate days remaining until week is unlocked
 */
export function daysUntilWeekUnlock(weekNumber: number, startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  
  // Calculate which day the week should unlock
  const daysPerWeek = 7;
  const unlockDay = (weekNumber - 1) * daysPerWeek + 1;
  const unlockDate = new Date(start);
  unlockDate.setDate(unlockDate.getDate() + unlockDay - 1);
  
  // Calculate days until unlock
  const diffTime = unlockDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * Format date to readable string (Portuguese)
 */
export function formatDateBR(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Sao_Paulo', // Brazil timezone
  };
  return d.toLocaleDateString('pt-BR', options);
}

/**
 * Format date to short format (DD/MM/YYYY)
 */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Get day of week name in Portuguese
 */
export function getDayNameBR(dayNumber: number): string {
  const days = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  return days[dayNumber] || '';
}

/**
 * Get day type label in Portuguese
 */
export function getDayTypeLabel(dayType: string): string {
  const labels: { [key: string]: string } = {
    fundamento: 'Fundamento',
    espelho: 'Espelho',
    modelo: 'Modelo',
    batalha: 'Batalha',
    prática: 'Prática',
    fruto: 'Fruto',
    pacto: 'Pacto',
  };
  return labels[dayType] || dayType;
}

/**
 * Get pillar color (accent variant)
 */
export function getPillarColor(pillar: string): string {
  const colors: { [key: string]: string } = {
    DOMÍNIO: '#C9A050',
    CULTIVAR: '#C9A050',
    GUARDAR: '#C9A050',
    LIDERAR: '#C9A050',
  };
  return colors[pillar] || '#C9A050';
}

/**
 * Get week number from start date (client-side fallback, SHOULD USE BACKEND FUNCTION)
 * @deprecated - Use getCurrentWeekNumber() from api.ts instead
 */
export function getWeekNumberClientSide(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(diffDays / 7) + 1;
  return Math.max(1, Math.min(12, weekNumber));
}

/**
 * Format time duration
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Generate random password (for admin panel)
 */
export function generatePassword(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Calculate progress percentage
 */
export function calculateProgressPercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

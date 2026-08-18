// Admin API Client
// Frontend calls to admin backend endpoints

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:3001';

export interface StudentDto {
  email: string;
  name?: string;
  startDate: string;
  accessLevel?: number;
}

export interface StudentResponse {
  id: string;
  email: string;
  name?: string;
  startDate: string;
  currentWeek: number;
  accessExpiresAt: string;
  daysRemaining: number;
  status: 'active' | 'expired' | 'inactive';
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  accessLevel?: number;
}

export interface DashboardMetrics {
  totalStudents: number;
  activeStudents: number;
  expiredStudents: number;
  inactiveStudents: number;
  byWeek: { week: number; count: number }[];
  recentAdditions: StudentResponse[];
}

/**
 * Admin login
 */
export async function adminLogin(password: string): Promise<{ token: string | null; error: string | null }> {
  try {
    const response = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { token: null, error: data.error || 'Login failed' };
    }

    const data = await response.json();
    return { token: data.token, error: null };
  } catch (err) {
    return { token: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Create new student
 */
export async function createStudent(
  student: StudentDto,
  adminToken: string
): Promise<{ data: StudentResponse | null; error: string | null }> {
  try {
    const response = await fetch(`${API_BASE}/api/admin/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(student),
    });

    if (!response.ok) {
      const data = await response.json();
      return { data: null, error: data.error || 'Failed to create student' };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Get all students
 */
export async function getStudents(
  adminToken: string,
  filters?: { status?: string; pillar?: string }
): Promise<{ data: StudentResponse[] | null; error: string | null }> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.pillar) params.append('pillar', filters.pillar);

    const response = await fetch(`${API_BASE}/api/admin/students?${params}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return { data: null, error: data.error || 'Failed to fetch students' };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Update student
 */
export async function updateStudent(
  studentId: string,
  updates: { name?: string; isActive?: boolean; resetPassword?: boolean; accessLevel?: number },
  adminToken: string
): Promise<{ error: string | null }> {
  try {
    const response = await fetch(`${API_BASE}/api/admin/students/${studentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.error || 'Failed to update student' };
    }

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Delete student
 */
export async function deleteStudent(
  studentId: string,
  adminToken: string
): Promise<{ error: string | null }> {
  try {
    const response = await fetch(`${API_BASE}/api/admin/students/${studentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.error || 'Failed to delete student' };
    }

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Get dashboard metrics
 */
export async function getDashboardMetrics(
  adminToken: string
): Promise<{ data: DashboardMetrics | null; error: string | null }> {
  try {
    const response = await fetch(`${API_BASE}/api/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return { data: null, error: data.error || 'Failed to fetch metrics' };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

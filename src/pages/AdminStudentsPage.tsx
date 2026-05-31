import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { getStudents, updateStudent, deleteStudent } from '../lib/adminApi';
import type { StudentResponse } from '../lib/adminApi';
import { formatDateShort } from '../lib/utils';

export function AdminStudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function loadStudents() {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          navigate('/admin/login');
          return;
        }

        const res = await getStudents(adminToken);
        if (res.error) {
          setError(res.error);
          setLoading(false);
          return;
        }

        setStudents(res.data || []);
        setFilteredStudents(res.data || []);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    loadStudents();
  }, [navigate]);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(students.filter((s) => s.status === statusFilter));
    }
  }, [statusFilter, students]);

  const handleDeactivate = async (studentId: string) => {
    if (!confirm('Desativar este aluno? Ele perderá acesso imediatamente.')) {
      return;
    }

    setActionLoading(studentId);
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) return;

    const res = await updateStudent(studentId, { isActive: false }, adminToken);
    setActionLoading(null);

    if (res.error) {
      setError(res.error);
      return;
    }

    // Update local state
    setStudents(students.map((s) => (s.id === studentId ? { ...s, isActive: false, status: 'inactive' } : s)));
  };

  const handleResetPassword = async (studentId: string) => {
    if (!confirm('Resetar a senha deste aluno? Ele terá que definir uma nova ao fazer login.')) {
      return;
    }

    setActionLoading(studentId);
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) return;

    const res = await updateStudent(studentId, { resetPassword: true }, adminToken);
    setActionLoading(null);

    if (res.error) {
      setError(res.error);
      return;
    }

    // Update local state
    setStudents(students.map((s) => (s.id === studentId ? { ...s, mustChangePassword: true } : s)));
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm('Deletar este aluno permanentemente? Esta ação não pode ser desfeita.')) {
      return;
    }

    setActionLoading(studentId);
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) return;

    const res = await deleteStudent(studentId, adminToken);
    setActionLoading(null);

    if (res.error) {
      setError(res.error);
      return;
    }

    // Update local state
    setStudents(students.filter((s) => s.id !== studentId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-8">
      {/* Header */}
      <header className="bg-bg-card border-b border-border px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/admin')}
            className="text-accent hover:text-accent-muted transition-colors"
          >
            ← Dashboard
          </button>
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Alunos</h1>
        <p className="text-text-secondary text-sm mt-1">{students.length} alunos registrados</p>
      </header>

      {/* Actions */}
      <div className="bg-bg-card border-b border-border px-4 py-4 sm:px-6">
        <div className="flex gap-2 items-center">
          <span className="text-text-secondary text-sm">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-bg-elevated border border-border rounded text-text-primary text-sm"
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="expired">Expirados</option>
            <option value="inactive">Inativos</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/admin/students/new')}
            className="ml-auto"
          >
            + Novo Aluno
          </Button>
        </div>
      </div>

      {/* Main */}
      <main className="px-4 sm:px-6 py-8">
        {filteredStudents.length === 0 ? (
          <div className="bg-bg-card border border-border rounded p-8 text-center">
            <p className="text-text-secondary">Nenhum aluno encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-bg-card border border-border rounded p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex-grow">
                  <h3 className="font-semibold text-text-primary">{student.name || student.email}</h3>
                  <p className="text-text-secondary text-sm">{student.email}</p>
                  <div className="flex gap-4 mt-2 text-xs text-text-secondary">
                    <span>Semana {student.currentWeek}</span>
                    <span>•</span>
                    <span>{student.daysRemaining} dias restantes</span>
                    <span>•</span>
                    <span className={`font-semibold ${student.status === 'active' ? 'text-accent' : 'text-text-secondary'}`}>
                      {student.status === 'active' ? 'Ativo' : student.status === 'expired' ? 'Expirado' : 'Inativo'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {student.status === 'active' && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleResetPassword(student.id)}
                        disabled={actionLoading === student.id}
                      >
                        Resetar Senha
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDeactivate(student.id)}
                        disabled={actionLoading === student.id}
                      >
                        Desativar
                      </Button>
                    </>
                  )}

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDelete(student.id)}
                    disabled={actionLoading === student.id}
                    className="!border-red-500 !text-red-400 hover:!bg-red-500 hover:!bg-opacity-10"
                  >
                    Deletar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

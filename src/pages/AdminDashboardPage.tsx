import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { getDashboardMetrics } from '../lib/adminApi';
import type { DashboardMetrics } from '../lib/adminApi';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          navigate('/admin/login');
          return;
        }

        const res = await getDashboardMetrics(adminToken);
        if (res.error) {
          setError(res.error);
          setLoading(false);
          return;
        }

        setMetrics(res.data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    loadMetrics();
  }, [navigate]);

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

  if (!metrics) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">Sem dados</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-8">
      {/* Header */}
      <header className="bg-bg-card border-b border-border px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              localStorage.removeItem('adminToken');
              navigate('/admin/login');
            }}
          >
            Sair
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="px-4 sm:px-6 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-bg-card border border-border rounded p-6">
            <div className="text-text-secondary text-sm uppercase tracking-wider mb-2">
              Total de Alunos
            </div>
            <div className="text-3xl font-bold text-text-primary">
              {metrics.totalStudents}
            </div>
          </div>

          <div className="bg-bg-card border border-border rounded p-6">
            <div className="text-text-secondary text-sm uppercase tracking-wider mb-2">
              Ativos
            </div>
            <div className="text-3xl font-bold text-accent">
              {metrics.activeStudents}
            </div>
          </div>

          <div className="bg-bg-card border border-border rounded p-6">
            <div className="text-text-secondary text-sm uppercase tracking-wider mb-2">
              Expirados
            </div>
            <div className="text-3xl font-bold text-text-secondary">
              {metrics.expiredStudents}
            </div>
          </div>

          <div className="bg-bg-card border border-border rounded p-6">
            <div className="text-text-secondary text-sm uppercase tracking-wider mb-2">
              Inativos
            </div>
            <div className="text-3xl font-bold text-text-secondary">
              {metrics.inactiveStudents}
            </div>
          </div>
        </div>

        {/* Distribution by Week */}
        <div className="bg-bg-card border border-border rounded p-6 mb-8">
          <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-6">
            Distribuição por Semana
          </h2>

          <div className="space-y-4">
            {metrics.byWeek.map((item) => (
              <div key={item.week}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary text-sm">Semana {item.week}</span>
                  <span className="text-text-primary font-semibold">{item.count} alunos</span>
                </div>
                <div className="bg-bg-elevated rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full transition-all"
                    style={{ width: `${(item.count / metrics.totalStudents) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/admin/students/new')}
          >
            + Adicionar Aluno
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/admin/students')}
          >
            Ver Todos os Alunos
          </Button>
        </div>
      </main>
    </div>
  );
}

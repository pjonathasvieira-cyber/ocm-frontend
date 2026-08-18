import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { createStudent } from '../lib/adminApi';
import { generatePassword, formatDateShort } from '../lib/utils';

const ACCESS_LEVELS = [
  { value: 1, label: 'Nível 1 — Ebook' },
  { value: 2, label: 'Nível 2 — + Audiobook' },
  { value: 3, label: 'Nível 3 — + Devocional' },
  { value: 4, label: 'Nível 4 — + Playbook' },
  { value: 5, label: 'Nível 5 — Completo (+ Treino)' },
];

export function AdminAddStudentPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [accessLevel, setAccessLevel] = useState(1);
  const [password, setPassword] = useState(generatePassword());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const calculateExpiryDate = (date: string): string => {
    const d = new Date(date);
    d.setDate(d.getDate() + 365);
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (!email || !startDate) {
      setError('Preencha todos os campos obrigatórios');
      setLoading(false);
      return;
    }

    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }

    const res = await createStudent(
      {
        email,
        name: name || undefined,
        startDate,
        accessLevel,
      },
      adminToken
    );

    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      navigate('/admin/students');
    }, 2000);
  };

  const expiryDate = calculateExpiryDate(startDate);

  return (
    <div className="min-h-screen bg-bg-primary pb-8">
      {/* Header */}
      <header className="bg-bg-card border-b border-border px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/admin/students')}
            className="text-accent hover:text-accent-muted transition-colors"
          >
            ← Voltar
          </button>
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Adicionar Novo Aluno</h1>
      </header>

      {/* Main */}
      <main className="px-4 sm:px-6 py-8 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info Section */}
          <div className="bg-bg-card border border-border rounded p-6">
            <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-6">
              Informações do Aluno
            </h2>

            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aluno@example.com"
                disabled={loading}
                required
              />

              <Input
                label="Nome (Opcional)"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do aluno"
                disabled={loading}
              />

              <div>
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 bg-bg-elevated border border-border rounded text-text-primary focus:border-accent transition-colors"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
                  Nível de Acesso
                </label>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-bg-elevated border border-border rounded text-text-primary focus:border-accent transition-colors"
                  disabled={loading}
                >
                  {ACCESS_LEVELS.map((lvl) => (
                    <option key={lvl.value} value={lvl.value}>
                      {lvl.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dates Section */}
          <div className="bg-bg-elevated border border-border rounded p-6">
            <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-4">
              Datas Calculadas
            </h2>

            <div className="space-y-3">
              <div>
                <span className="text-text-secondary text-xs uppercase tracking-wider">Início:</span>
                <p className="text-text-primary font-semibold mt-1">{formatDateShort(startDate)}</p>
              </div>
              <div>
                <span className="text-text-secondary text-xs uppercase tracking-wider">Expira em:</span>
                <p className="text-text-primary font-semibold mt-1">{formatDateShort(expiryDate)}</p>
              </div>
              <div>
                <span className="text-text-secondary text-xs uppercase tracking-wider">Duração:</span>
                <p className="text-text-primary font-semibold mt-1">365 dias</p>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-bg-card border border-border rounded p-6">
            <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-6">
              Credenciais Iniciais
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                  Senha Inicial
                </label>
                <div className="flex gap-3 mt-2">
                  <input
                    type="text"
                    value={password}
                    readOnly
                    className="flex-grow px-4 py-2 bg-bg-elevated border border-border rounded text-text-primary font-mono text-sm"
                  />
                  <Button
                    variant="secondary"
                    size="md"
                    type="button"
                    onClick={() => setPassword(generatePassword())}
                  >
                    Gerar Nova
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    type="button"
                    onClick={() => navigator.clipboard.writeText(password)}
                  >
                    Copiar
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-bg-elevated rounded border border-border text-sm text-text-secondary">
                <p className="mb-2">
                  ℹ️ O aluno será obrigado a mudar a senha no primeiro login.
                </p>
                <p>
                  Compartilhe a senha com segurança (email, SMS, etc.)
                </p>
              </div>
            </div>
          </div>

          {/* Error/Success */}
          {error && (
            <div className="p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded text-sm text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-success bg-opacity-10 border border-success rounded text-sm text-success">
              ✓ Aluno criado com sucesso! Redirecionando...
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={loading}
              className="flex-grow"
            >
              {loading ? 'Criando...' : 'Criar Aluno'}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/admin/students')}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

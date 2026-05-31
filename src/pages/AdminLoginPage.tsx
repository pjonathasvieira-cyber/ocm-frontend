import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { adminLogin } from '../lib/adminApi';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await adminLogin(password);
    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    if (res.token) {
      // Store token in localStorage
      localStorage.setItem('adminToken', res.token);
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Painel Admin</h1>
          <p className="text-text-secondary text-sm">O Código da Masculinidade</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-bg-card border border-border rounded-lg p-8 space-y-6"
        >
          <div>
            <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-4">
              Autenticação
            </h2>

            <Input
              label="Senha Admin"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha de administrador"
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded text-sm text-red-400">
              {error}
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Autenticando...' : 'Entrar'}
          </Button>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-text-secondary text-center">
              ← Retornar ao login regular
            </p>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/login')}
              className="w-full mt-3"
            >
              Voltar ao Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

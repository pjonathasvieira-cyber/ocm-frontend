import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { getCurrentUserProfile, changePassword, signOut } from '../lib/auth';
import { daysRemainingUntilExpiration, formatDateShort } from '../lib/utils';

export function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await getCurrentUserProfile();
        if (res.error || !res.data) {
          setError(res.error || 'Could not fetch profile');
          setLoading(false);
          return;
        }

        setProfile(res.data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validation
    if (!currentPassword) {
      setPasswordError('Digite sua senha atual');
      return;
    }

    if (!newPassword) {
      setPasswordError('Digite uma nova senha');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Nova senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Senhas não conferem');
      return;
    }

    setSavingPassword(true);

    const res = await changePassword(currentPassword, newPassword);
    setSavingPassword(false);

    if (res.error) {
      setPasswordError(res.error);
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => {
      setShowPasswordForm(false);
      setPasswordSuccess(false);
    }, 2000);
  };

  const handleLogout = async () => {
    const res = await signOut();
    if (res.error) {
      setError(res.error);
    } else {
      navigate('/login');
    }
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

  const daysRemaining = daysRemainingUntilExpiration(profile?.access_expires_at);

  return (
    <div className="min-h-screen bg-bg-primary pb-8">
      {/* Header */}
      <header className="bg-bg-card border-b border-border px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-accent hover:text-accent-muted transition-colors"
          >
            ← Voltar
          </button>
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Meu Perfil</h1>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-6 py-8 max-w-2xl mx-auto">
        {/* User Info */}
        <section className="bg-bg-card border border-border rounded p-6 mb-8">
          <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-6">
            Informações Pessoais
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                Nome
              </label>
              <p className="text-text-primary mt-2">{profile?.name || 'Não informado'}</p>
            </div>

            <div>
              <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                Email
              </label>
              <p className="text-text-primary mt-2">{profile?.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                  Data de Início
                </label>
                <p className="text-text-primary mt-2">
                  {formatDateShort(profile?.start_date)}
                </p>
              </div>

              <div>
                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                  Dias Restantes
                </label>
                <p className={`mt-2 font-semibold ${daysRemaining < 30 ? 'text-accent' : 'text-text-primary'}`}>
                  {daysRemaining} dias
                </p>
              </div>
            </div>

            <div>
              <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                Acesso Expira Em
              </label>
              <p className="text-text-primary mt-2">
                {formatDateShort(profile?.access_expires_at)}
              </p>
            </div>
          </div>
        </section>

        {/* Password Change */}
        <section className="bg-bg-card border border-border rounded p-6 mb-8">
          <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-6">
            Segurança
          </h2>

          {!showPasswordForm ? (
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowPasswordForm(true)}
            >
              Trocar Senha
            </Button>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Senha Atual"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={savingPassword}
                required
              />

              <Input
                label="Nova Senha"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={savingPassword}
                helperText="Mínimo 8 caracteres"
                required
              />

              <Input
                label="Confirmar Senha"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={savingPassword}
                required
              />

              {passwordError && (
                <div className="p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded text-sm text-red-400">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-success bg-opacity-10 border border-success rounded text-sm text-success">
                  ✓ Senha alterada com sucesso!
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={savingPassword}
                >
                  {savingPassword ? 'Salvando...' : 'Salvar Nova Senha'}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setShowPasswordForm(false)}
                  disabled={savingPassword}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </section>

        {/* Logout */}
        <section>
          <Button
            variant="secondary"
            size="md"
            onClick={handleLogout}
            className="w-full"
          >
            Sair da Conta
          </Button>
        </section>
      </main>
    </div>
  );
}

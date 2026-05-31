import { useState } from 'react'
import { Button, Input } from '../components'
import { login } from '../lib/auth'

interface LoginPageProps {
  onLoginSuccess: () => void
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await login(email, password)

    if (authError) {
      setError(authError)
      setLoading(false)
      return
    }

    // Success - callback to parent to handle navigation
    onLoginSuccess()
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-mobile">
        {/* Logo/Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#F0F0F0] mb-2">
              O Código da Masculinidade
            </h1>
            <div className="w-10 h-px bg-[#C9A050] mx-auto mb-4" />
            <p className="text-[#888888] text-sm">
              Programa de transformação em 12 semanas
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#1A1A1A] rounded-sm p-8 border border-[#2A2A2A]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              fullWidth
            />

            {/* Password Input */}
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              fullWidth
            />

            {/* Error Message */}
            {error && (
              <div className="bg-[#FF6B6B] bg-opacity-10 border border-[#FF6B6B] text-[#FF6B6B] px-4 py-3 rounded-sm text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
            >
              Entrar
            </Button>
          </form>

          {/* Footer Note */}
          <p className="text-[#555555] text-xs text-center mt-6">
            Entre em contato com seu mentor para receber suas credenciais de acesso
          </p>
        </div>

        {/* Brand Footer */}
        <p className="text-[#555555] text-xs text-center mt-8">
          @ocodigodamasculinidade
        </p>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '../components'
import { setInitialPassword } from '../lib/auth'

export default function CreatePasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validatePassword = (): boolean => {
    if (password.length < 8) {
      setError('Senha deve ter no mínimo 8 caracteres')
      return false
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validatePassword()) {
      return
    }

    setLoading(true)

    const { error: authError } = await setInitialPassword(password)

    if (authError) {
      setError(authError)
      setLoading(false)
      return
    }

    // Success - redirect to dashboard
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-mobile bg-[#1A1A1A] rounded-sm p-8 border border-[#2A2A2A]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#F0F0F0] mb-2">
            Crie sua senha
          </h1>
          <p className="text-[#888888] text-sm leading-relaxed">
            Bem-vindo ao{' '}
            <span className="text-[#C9A050] font-semibold">
              O Código da Masculinidade
            </span>
            . Esta é sua primeira vez? Defina uma nova senha para prosseguir.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Input */}
          <Input
            label="Nova Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            helperText="Escolha uma senha forte e memorável"
            fullWidth
          />

          {/* Confirm Password Input */}
          <Input
            label="Confirmar Senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme sua senha"
            error={confirmPassword && password !== confirmPassword ? 'Senhas não coincidem' : ''}
            fullWidth
          />

          {/* Error Message */}
          {error && (
            <div className="bg-[#FF6B6B] bg-opacity-10 border border-[#FF6B6B] text-[#FF6B6B] px-4 py-3 rounded-sm text-sm">
              {error}
            </div>
          )}

          {/* Password Requirements */}
          <div className="bg-[#222222] p-4 rounded-sm border border-[#2A2A2A]">
            <p className="text-[#C9A050] text-xs uppercase font-semibold tracking-widest mb-2">
              Requisitos
            </p>
            <ul className="text-xs text-[#888888] space-y-1">
              <li className="flex items-center">
                <span className={`mr-2 ${password.length >= 8 ? 'text-[#4CAF50]' : 'text-[#2A2A2A]'}`}>
                  ✓
                </span>
                Mínimo 8 caracteres
              </li>
              <li className="flex items-center">
                <span className={`mr-2 ${password === confirmPassword && confirmPassword ? 'text-[#4CAF50]' : 'text-[#2A2A2A]'}`}>
                  ✓
                </span>
                Senhas coincidem
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={loading}
          >
            Definir Senha e Entrar
          </Button>
        </form>

        {/* Footer Note */}
        <p className="text-[#555555] text-xs text-center mt-6">
          Esta é uma senha obrigatória para acessar o programa
        </p>
      </div>
    </div>
  )
}

import { Button } from '../components'
import { signOut } from '../lib/auth'

export default function AccessExpiredPage() {
  const handleLogout = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-mobile">
        {/* Centered Content */}
        <div className="text-center mb-12">
          {/* Icon/Badge */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#222222] rounded-sm border-2 border-[#C9A050] flex items-center justify-center">
              <span className="text-3xl">🔒</span>
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-3xl font-bold text-[#F0F0F0] mb-3">
            Acesso Expirado
          </h1>
          <p className="text-[#888888] text-base leading-relaxed mb-6">
            Seu período de acesso ao programa{' '}
            <span className="text-[#C9A050] font-semibold">
              O Código da Masculinidade
            </span>{' '}
            chegou ao final. O programa dura 180 dias a partir de sua data de início.
          </p>
        </div>

        {/* Information Box */}
        <div className="bg-[#1A1A1A] rounded-sm p-6 border border-[#2A2A2A] mb-8">
          <p className="text-[#C9A050] text-xs uppercase font-semibold tracking-widest mb-3">
            Próximas Etapas
          </p>
          <ul className="text-[#F0F0F0] text-sm space-y-3">
            <li className="flex items-start">
              <span className="text-[#C9A050] mr-3 font-semibold">1.</span>
              <span>Entre em contato com seu mentor ou líder do programa</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#C9A050] mr-3 font-semibold">2.</span>
              <span>Solicite renovação ou acesso ao próximo ciclo do programa</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#C9A050] mr-3 font-semibold">3.</span>
              <span>Continue colocando em prática os princípios aprendidos</span>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="bg-[#0D0D0D] rounded-sm p-4 border border-[#2A2A2A] mb-8 text-center">
          <p className="text-[#888888] text-xs mb-2">
            Para mais informações, entre em contato:
          </p>
          <p className="text-[#C9A050] font-semibold text-sm">
            @ocodigodamasculinidade
          </p>
        </div>

        {/* Logout Button */}
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={handleLogout}
        >
          Sair
        </Button>

        {/* Footer Message */}
        <p className="text-[#555555] text-xs text-center mt-6">
          Muito grato pela sua dedicação durante essas 12 semanas de transformação
        </p>
      </div>
    </div>
  )
}

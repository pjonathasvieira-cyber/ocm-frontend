const WHATSAPP_NUMBER = '5561991734974'

const LEVEL_NAMES: Record<number, string> = {
  1: 'Ebook',
  2: 'Ebook + Audiobook',
  3: 'Ebook + Audiobook + Devocional',
  4: 'Ebook + Audiobook + Devocional + Playbook',
  5: 'Acesso Completo',
}

export function LockedPage({ minLevel = 2 }: { minLevel?: number }) {
  const packageName = LEVEL_NAMES[minLevel] ?? 'um pacote superior'

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-6">🔒</div>
        <h1 className="text-xl font-bold text-text-primary mb-3">Conteúdo Bloqueado</h1>
        <p className="text-text-secondary text-sm mb-2 leading-relaxed">
          Este conteúdo está disponível no pacote:
        </p>
        <p className="text-accent font-semibold text-sm mb-8">{packageName}</p>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Quero fazer upgrade do meu pacote no Código da Masculinidade.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary block text-center"
        >
          Fazer Upgrade
        </a>
      </div>
    </div>
  )
}

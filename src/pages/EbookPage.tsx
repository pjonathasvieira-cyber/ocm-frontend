import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function EbookPage() {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getSignedUrl() {
      const { data, error } = await supabase.storage
        .from('Ebooks')
        .createSignedUrl('ebook-ocm.pdf', 3600)

      if (error || !data) {
        setError('Não foi possível carregar o ebook. Tente novamente mais tarde.')
      } else {
        setUrl(data.signedUrl)
      }
      setLoading(false)
    }
    getSignedUrl()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 56px)' }}>
        <p className="text-text-secondary text-sm">Carregando ebook...</p>
      </div>
    )
  }

  if (error || !url) {
    return (
      <div className="flex items-center justify-center px-4" style={{ height: 'calc(100vh - 56px)' }}>
        <div className="text-center">
          <p className="text-text-secondary text-sm mb-2">{error}</p>
          <p className="text-text-muted text-xs">
            Se o problema persistir, entre em contato pelo WhatsApp.
          </p>
        </div>
      </div>
    )
  }

  return (
    <iframe
      src={url}
      title="Ebook — O Código da Masculinidade"
      style={{ width: '100%', height: 'calc(100vh - 56px)', border: 'none', display: 'block' }}
    />
  )
}

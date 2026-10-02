import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** Shows "Install app" on browsers that support it (Chrome/Edge/Android). */
export default function InstallButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setPrompt(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!prompt) return null
  return (
    <button
      type="button"
      onClick={async () => {
        await prompt.prompt()
        await prompt.userChoice
        setPrompt(null)
      }}
      className="btn-outline px-3 py-2 text-sm"
    >
      <Download className="size-4" aria-hidden />
      <span className="hidden sm:inline">Install app</span>
    </button>
  )
}

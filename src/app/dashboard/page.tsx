'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { checkPasskeyAuth } from '../login/actions'
import AiAssistant from './ai-assistant' // Your actual AI component

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    async function verifyAccess() {
      const authenticated = await checkPasskeyAuth()
      if (!authenticated) {
        // Redirect to login page with error flag so you know WHY it bounced
        router.push('/login?error=Session%20expired%20or%20invalid%20passkey')
      } else {
        setIsAuthorized(true)
      }
    }
    verifyAccess()
  }, [router])

  if (isAuthorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400 font-sans">
        Authenticating session...
      </div>
    )
  }

  return <AiAssistant />
}
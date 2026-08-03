'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { checkPasskeyAuth } from '../login/actions'
import AiAssistant from './ai-assistant' // Your actual AI UI component

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    async function verifyAccess() {
      const authenticated = await checkPasskeyAuth()
      if (!authenticated) {
        router.push('/login')
      } else {
        setIsAuthorized(true)
      }
    }
    verifyAccess()
  }, [router])

  if (isAuthorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400 font-sans">
        Checking authentication...
      </div>
    )
  }

  return <AiAssistant />
}
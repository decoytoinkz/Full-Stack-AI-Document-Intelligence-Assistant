'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { KeyRound, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { verifyPasskey } from './actions'

// 1. Separate component that reads search params
function LoginForm() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const [passkey, setPasskey] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <form action={verifyPasskey} onSubmit={() => setLoading(true)} className="space-y-4">
      <div>
        <input
          type="password"
          name="passkey"
          value={passkey}
          onChange={(e) => setPasskey(e.target.value)}
          placeholder="Enter Secret Passkey..."
          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Reads error from URL query string if passkey fails */}
      {errorParam && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-900/50 bg-rose-950/30 p-3 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorParam}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !passkey.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <span>Unlock Access</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  )
}

// 2. Main Page exporting the component wrapped in Suspense
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-indigo-600/20 p-3 text-indigo-400">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold">Protected Assistant</h1>
          <p className="mt-1 text-xs text-slate-400">
            Enter the secret passkey to access the AI dashboard
          </p>
        </div>

        {/* Suspense boundary satisfies Next.js static build requirements */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-6 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
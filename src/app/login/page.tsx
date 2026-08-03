'use client'

import { useActionState, Suspense } from 'react'
import { KeyRound, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { verifyPasskey } from './actions'

function LoginForm() {
  const [state, formAction, isPending] = useActionState(verifyPasskey, null)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <input
          type="password"
          name="passkey"
          placeholder="Enter Secret Passkey..."
          required
          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-900/50 bg-rose-950/30 p-3 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
      >
        {isPending ? (
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

        <Suspense fallback={<Loader2 className="h-5 w-5 animate-spin mx-auto text-slate-500" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
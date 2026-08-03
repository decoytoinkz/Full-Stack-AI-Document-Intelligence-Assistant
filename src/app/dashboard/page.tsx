'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { Copy, Check, Sparkles, Upload, FileText, Loader2, AlertCircle, LogOut } from 'lucide-react'
import { askGeminiFromFile } from './actions'
import { checkPasskeyAuth, logout } from '../login/actions'

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  
  const [file, setFile] = useState<File | null>(null)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Enforce Passkey Protection on Component Mount
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file first.')
      return
    }
    if (!question.trim()) {
      setError('Please enter a question.')
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('question', question)

    try {
      const result = await askGeminiFromFile(formData)
      if (result.success && result.answer) {
        setResponse(result.answer)
      } else {
        setError(result.error || 'Something went wrong.')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!response) return
    try {
      await navigator.clipboard.writeText(response)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  // Prevent flash of UI while authenticating passkey cookie
  if (isAuthorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
          <span className="text-sm font-medium">Verifying passkey authorization...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-600 p-2 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold">AI Document Assistant</h1>
          </div>

          {/* Optional Logout Button */}
          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Lock</span>
          </button>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* Form Side */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Upload */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 flex items-center gap-2 font-semibold">
                <Upload className="h-4 w-4 text-indigo-600" />
                1. Upload Document
              </h2>
              
              <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 cursor-pointer">
                <FileText className="mb-2 h-8 w-8 text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {file ? file.name : 'Click to select a file'}
                </span>
                <span className="mt-1 text-xs text-slate-500">
                  PDF, TXT, MD, CSV (Max 10 MB)
                </span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.md,.csv"
                  className="hidden"
                />
              </label>

              {file && (
                <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Ready to analyze: {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              )}
            </div>

            {/* Step 2: Ask Question */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                2. Ask Questions
              </h2>
              
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Can you give me his strengths and key skills?"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />

              <button
                type="submit"
                disabled={loading || !file || !question.trim()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing document...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Ask AI
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </form>

          {/* Response Output Side */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                <Sparkles className="h-4 w-4" />
                <span>AI RESPONSE</span>
              </div>

              {/* Copy Response Button */}
              {response && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Response Output Container */}
            {loading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <p className="text-sm">Reading document & analyzing...</p>
              </div>
            ) : response ? (
              <div className="prose prose-slate max-w-none text-sm leading-relaxed dark:prose-invert prose-headings:font-semibold prose-a:text-indigo-600">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-slate-400">
                Upload a document and ask a question to see the AI output here.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
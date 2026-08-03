'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  Send, 
  Loader2, 
  LogOut, 
  Bot, 
  CheckCircle2, 
  Trash2 
} from 'lucide-react'
import { logout } from '../login/actions'

export default function AiAssistant() {
  const [file, setFile] = useState<File | null>(null)
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !file) return

    setLoading(true)
    setResponse('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('question', question)

      const res = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      setResponse(data.answer || data.error || 'Failed to analyze document.')
    } catch (err) {
      setResponse('An unexpected error occurred while communicating with the AI.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 leading-none">Document Intelligence</h1>
            <p className="text-xs text-slate-400 mt-1">AI-Powered PDF & Data Analyzer</p>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: File Upload (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-4">
              <UploadCloud className="h-4 w-4 text-indigo-400" />
              <span>1. Upload Document</span>
            </h2>

            {!file ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl cursor-pointer bg-slate-950/50 hover:bg-slate-900/60 transition-all text-center p-4">
                <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                <span className="text-xs font-medium text-slate-300">Click to upload or drag & drop</span>
                <span className="text-[10px] text-slate-500 mt-1">PDF, TXT, MD, CSV (Max 10MB)</span>
                <input type="file" className="hidden" accept=".pdf,.txt,.md,.csv" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950">
                  <div className="flex items-center gap-3 truncate">
                    <FileText className="h-6 w-6 text-indigo-400 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-medium text-slate-200 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 p-2.5 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Document parsed and ready for analysis</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Q&A & Output (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Query Form */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>2. Ask Questions</span>
            </h2>

            <form onSubmit={handleAskAI} className="space-y-3">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={file ? "e.g., What are his key strengths and technical skills?" : "Upload a document first..."}
                disabled={!file || loading}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!file || !question.trim() || loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing document...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Ask AI</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* AI Output Card */}
          {(response || loading) && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4 border-b border-slate-800/80 pb-3">
                <Bot className="h-4 w-4" />
                <span>AI Insights & Analysis</span>
              </div>

              {loading ? (
                <div className="space-y-3 py-4 animate-pulse">
                  <div className="h-3 bg-slate-800 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-800 rounded w-5/6"></div>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-3">
                  <ReactMarkdown>{response}</ReactMarkdown>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
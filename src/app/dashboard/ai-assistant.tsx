'use client'

import { useState } from 'react'
import { askGeminiFromFile } from './actions'
import { Bot, Send, Sparkles, Upload, FileCheck, Loader2, AlertCircle } from 'lucide-react'

const MAX_FILE_SIZE_MB = 10

export default function AIAssistant() {
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setFileError(null)

    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setFileError(`File size exceeds ${MAX_FILE_SIZE_MB} MB limit (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB).`)
        setFile(null)
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !question.trim()) return

    setLoading(true)
    setError(null)
    setAnswer(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('question', question)

    const res = await askGeminiFromFile(formData)

    if (res.success && res.answer) {
      setAnswer(res.answer)
    } else {
      setError(res.error || 'Something went wrong.')
    }

    setLoading(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Left Column: File Upload */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
            <Upload className="w-5 h-5 text-indigo-600" />
            <h2>1. Upload Document</h2>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition bg-gray-50 flex flex-col items-center justify-center">
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.txt,.md,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              {file ? (
                <FileCheck className="w-12 h-12 text-green-600 mb-2" />
              ) : (
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {file ? file.name : 'Click to upload or drag & drop'}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                PDF, TXT, MD, CSV (Max {MAX_FILE_SIZE_MB} MB)
              </span>
            </label>
          </div>

          {file && (
            <div className="mt-3 text-xs text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-200 flex items-center gap-2">
              <FileCheck className="w-4 h-4 shrink-0" />
              <span>Ready to analyze: <strong>{(file.size / (1024 * 1024)).toFixed(2)} MB</strong></span>
            </div>
          )}

          {fileError && (
            <div className="mt-3 text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Q&A Prompt */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2>2. Ask Questions</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What is the main topic of this document?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !file || !question.trim()}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Reading document & analyzing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Ask AI
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {answer && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
                <Bot className="w-4 h-4" />
                AI Response
              </div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {answer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
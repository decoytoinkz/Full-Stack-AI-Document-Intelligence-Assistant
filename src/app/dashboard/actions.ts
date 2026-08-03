'use server'

import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB limit

export async function askGeminiFromFile(formData: FormData) {
  try {
    const file = formData.get('file') as File | null
    const question = formData.get('question') as string
    
    if (!question) {
      return { success: false, error: 'Please enter a question.' }
    }

    if (!file || file.size === 0) {
      return { success: false, error: 'Please select a file to upload.' }
    }

    // 1. Check file size limit
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size exceeds the 10 MB limit. (Selected file: ${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
      }
    }
    
    const buffer = Buffer.from(await file.arrayBuffer())
    const mimeType = file.type || 'text/plain'

    let contents: any[] = []

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // Pass PDF directly to Gemini as inline binary data
      const base64Data = buffer.toString('base64')
      
      contents = [
        {
          inlineData: {
            data: base64Data,
            mimeType: 'application/pdf',
          },
        },
        `You are a helpful AI document assistant. Answer the user's question based strictly on the document attached above. If the answer cannot be determined, state that politely.

USER QUESTION: ${question}`,
      ]
    } else {
      // Handle plain text files (TXT, MD, CSV, etc.)
      const text = buffer.toString('utf-8')
      contents = [
        `You are a helpful AI document assistant. Answer the user's question based strictly on the document text provided below.

---
DOCUMENT CONTENT:
${text}
---



USER QUESTION: ${question}`,
      ]
    }
    
    // 2. Call Gemini model directly
    // Fetch and log all models supported by your API key:
    const availableModels = await ai.models.list()
    console.log('Available models:', availableModels)
    
    const response = await ai.models.generateContent({
      model: 'models/gemini-flash-latest',
      contents: contents,
    })

    return { success: true, answer: response.text }
  } catch (error: any) {
    console.error('File Analysis Error:', error)

    // Check for 429 / Rate Limit / Resource Exhausted errors
    if (
      error?.status === 'RESOURCE_EXHAUSTED' ||
      error?.code === 429 ||
      error?.message?.includes('429') ||
      error?.message?.includes('Quota exceeded')
    ) {
      return {
        success: false,
        error: 'Rate limit reached on the free tier. Please wait about 1 minute before asking another question.',
      }
    }

    return {
      success: false,
      error: error.message || 'Failed to process file with AI.',
    }
  }
}
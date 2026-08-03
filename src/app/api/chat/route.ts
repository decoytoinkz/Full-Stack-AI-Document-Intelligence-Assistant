import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini with your API Key from Vercel/Environment Variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const question = formData.get('question') as string | null

    if (!file || !question) {
      return NextResponse.json(
        { error: 'Missing document file or question parameter.' },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is missing in environment variables.' },
        { status: 500 }
      )
    }

    // Convert uploaded File into Buffer and Base64 format for Gemini API
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')

    // Select Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

    // Generate content using multimodal inline data
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type || 'application/pdf',
        },
      },
      `You are an expert Document Intelligence AI. Analyze the attached document and answer the following query concisely and clearly with formatted Markdown:\n\nQuery: ${question}`,
    ])

    const responseText = result.response.text()

    return NextResponse.json({ answer: responseText })
  } catch (error: any) {
    console.error('Gemini Processing Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process document with Gemini AI.' },
      { status: 500 }
    )
  }
}
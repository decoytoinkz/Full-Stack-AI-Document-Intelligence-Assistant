'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function verifyPasskey(prevState: any, formData: FormData) {
  const inputPasskey = (formData.get('passkey') as string || '').trim()
  const secretPasskey = (process.env.SECRET_PASSKEY || '').trim()

  if (secretPasskey && inputPasskey === secretPasskey) {
    const cookieStore = await cookies()

    cookieStore.set('passkey_auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    // Direct server-side redirect guarantees cookie headers are sent in response
    redirect('/dashboard')
  }

  return { error: 'Invalid passkey' }
}

export async function checkPasskeyAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('passkey_auth')
  return authCookie?.value === 'true'
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('passkey_auth')
  redirect('/login')
}
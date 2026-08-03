'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function verifyPasskey(formData: FormData) {
  const inputPasskey = formData.get('passkey') as string
  const secretPasskey = process.env.SECRET_PASSKEY

  if (inputPasskey === secretPasskey) {
    const cookieStore = await cookies()

    // Set cookie with explicit root path and production flags
    cookieStore.set('passkey_auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    redirect('/dashboard')
  } else {
    redirect('/login?error=Invalid%20passkey')
  }
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
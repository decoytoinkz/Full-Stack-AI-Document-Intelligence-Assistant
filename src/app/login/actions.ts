'use server'

import { cookies } from 'next/headers'

export async function verifyPasskey(formData: FormData) {
  const inputPasskey = formData.get('passkey') as string
  const secretPasskey = process.env.SECRET_PASSKEY

  if (inputPasskey === secretPasskey) {
    const cookieStore = await cookies()

    cookieStore.set('passkey_auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return { success: true }
  } else {
    return { success: false, error: 'Invalid passkey' }
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
  return { success: true }
}
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

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

    // Force Next.js to purge cached routes on Vercel so /dashboard picks up the new cookie!
    revalidatePath('/', 'layout')
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
  revalidatePath('/', 'layout')
  redirect('/login')
}
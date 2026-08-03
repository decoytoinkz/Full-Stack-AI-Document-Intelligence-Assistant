'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Verifies the submitted secret passkey against process.env.SECRET_PASSKEY
 */
export async function verifyPasskey(formData: FormData) {
  const passkey = formData.get('passkey') as string
  const validPasskey = process.env.SECRET_PASSKEY

  if (!passkey || passkey !== validPasskey) {
    redirect('/login?error=' + encodeURIComponent('Invalid secret passkey. Access denied.'))
  }

  // Set an HTTP-only auth cookie valid for 7 days
  const cookieStore = await cookies()
  cookieStore.set('auth_passkey', passkey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

/**
 * Checks if the current request has a valid passkey cookie set
 */
export async function checkPasskeyAuth() {
  const cookieStore = await cookies()
  const passkeyCookie = cookieStore.get('auth_passkey')?.value
  
  return passkeyCookie === process.env.SECRET_PASSKEY
}

/**
 * Clears the passkey cookie and redirects to login
 */
export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_passkey')
  
  revalidatePath('/', 'layout')
  redirect('/login')
}
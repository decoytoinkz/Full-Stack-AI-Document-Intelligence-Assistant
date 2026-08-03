'use server'

import { cookies } from 'next/headers'

export async function verifyPasskey(formData: FormData) {
  const inputPasskey = (formData.get('passkey') as string || '').trim()
  const secretPasskey = (process.env.SECRET_PASSKEY || '').trim()

  // DEBUG LOGS - Verify passkey match on submit
  console.log('--- [VERIFY PASSKEY ACTION] ---')
  console.log('INPUT PASSKEY:', JSON.stringify(inputPasskey))
  console.log('SECRET PASSKEY SET?:', Boolean(secretPasskey))
  console.log('MATCH?:', inputPasskey === secretPasskey)

  if (secretPasskey && inputPasskey === secretPasskey) {
    const cookieStore = await cookies()

    cookieStore.set('passkey_auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return { success: true }
  } else {
    return { success: false, error: 'Invalid passkey' }
  }
}

export async function checkPasskeyAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('passkey_auth')
  
  // DEBUG LOGS - Check if cookie is present when dashboard asks for it
  console.log('--- [CHECK AUTH ACTION] ---')
  console.log('COOKIE VALUE:', authCookie?.value)

  return authCookie?.value === 'true'
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('passkey_auth')
  return { success: true }
}
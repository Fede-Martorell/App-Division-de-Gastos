'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

async function wrapAction(action: () => Promise<void>) {
    try {
        await action()
    } catch (error: any) {
        // Next.js redirects throw a specific error with a digest that starts with NEXT_REDIRECT
        if (error.digest?.startsWith('NEXT_REDIRECT')) {
            throw error
        }
        console.error('[AuthAction Error]:', error)
        redirect('/login?error=Error+interno+del+servidor+o+configuracion+incorrecta')
    }
}

export async function login(formData: FormData) {
    await wrapAction(async () => {
        const supabase = await createClient()
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            redirect('/login?error=Credenciales+incorrectas')
        }

        revalidatePath('/', 'layout')
        redirect('/dashboard')
    })
}

export async function signup(formData: FormData) {
    await wrapAction(async () => {
        const supabase = await createClient()
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const { error } = await supabase.auth.signUp({ email, password })

        if (error) {
            redirect('/login?error=No+se+pudo+registrar')
        }

        revalidatePath('/', 'layout')
        redirect('/profile')
    })
}

export async function signInWithGoogle() {
    await wrapAction(async () => {
        const supabase = await createClient()
        const headersList = await headers()
        const host = headersList.get('host')
        const protocol = headersList.get('x-forwarded-proto') || 'http'
        const origin = process.env.NEXT_PUBLIC_SITE_URL || (host ? `${protocol}://${host}` : 'http://localhost:3000')

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${origin}/auth/callback`,
            },
        })

        if (error) {
            redirect('/login?error=Error+al+iniciar+sesion+con+Google')
        }

        if (data.url) {
            redirect(data.url)
        }
    })
}

export async function resetPassword(formData: FormData) {
    await wrapAction(async () => {
        const supabase = await createClient()
        const email = formData.get('email') as string
        const headersList = await headers()
        const host = headersList.get('host')
        const protocol = headersList.get('x-forwarded-proto') || 'http'
        const origin = process.env.NEXT_PUBLIC_SITE_URL || (host ? `${protocol}://${host}` : 'http://localhost:3000')

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/auth/callback`,
        })

        if (error) {
            redirect('/login?error=Error+al+solicitar+recuperacion')
        }

        redirect('/login?message=Email+de+recuperacion+enviado')
    })
}

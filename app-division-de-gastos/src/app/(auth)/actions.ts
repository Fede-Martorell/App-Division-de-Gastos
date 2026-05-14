'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

import { isRedirectError } from 'next/dist/client/components/redirect'

async function wrapAction(action: () => Promise<void>) {
    try {
        await action()
    } catch (error: any) {
        if (isRedirectError(error)) {
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
        const origin = headersList.get('origin') || 'http://localhost:3000'

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

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${(await headers()).get('origin')}/auth/callback`,
        })

        if (error) {
            redirect('/login?error=Error+al+solicitar+recuperacion')
        }

        redirect('/login?message=Email+de+recuperacion+enviado')
    })
}

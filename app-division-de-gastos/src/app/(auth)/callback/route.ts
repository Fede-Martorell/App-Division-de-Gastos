import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    // Si no hay ruta de destino, mandamos al dashboard
    const next = searchParams.get('next') ?? '/dashboard'

    if (error) {
        return NextResponse.redirect(`${origin}/login?error=Error+en+la+autenticacion+de+Google`)
    }

    if (code) {
        const supabase = await createClient()
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (!exchangeError) {
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Si algo falla, lo devolvemos al login con error
    return NextResponse.redirect(`${origin}/login?error=No+se+pudo+iniciar+con+Google`)
}
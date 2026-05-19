'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        redirect('/login?error=Sesion+no+encontrada')
    }

    const fullName = formData.get('fullName') as string
    const cbuAlias = formData.get('cbuAlias') as string

    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            full_name: fullName,
            cbu_alias: cbuAlias,
            email: user.email,
        })

    if (error) {
        redirect('/dashboard/profile?error=No+se+pudo+actualizar+el+perfil')
    }

    revalidatePath('/dashboard/profile')
    redirect('/dashboard')
}

'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createGroup(formData: FormData) {
    console.log("=== INICIO DE ACCIÓN: createGroup ===");
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        console.error("ERROR DE SESIÓN:", userError);
        redirect('/login?error=Sesion+no+encontrada')
    }
    console.log("USUARIO LOGUEADO:", { id: user.id, email: user.email });

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    
    // Generar un código de invitación aleatorio único de 6 caracteres (ej: "A9F3X2")
    const invite_code = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log("DATOS RECIBIDOS DEL FORMULARIO:", { name, description, invite_code });

    // Asegurar que el usuario tenga un registro en la tabla 'profiles' para evitar violar la clave foránea
    console.log("Asegurando que exista el perfil del usuario...");
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            email: user.email,
            full_name: user.email?.split('@')[0] || 'Usuario'
        }, { onConflict: 'id' })

    if (profileError) {
        console.error("ERROR AL ASEGURAR EL PERFIL DEL USUARIO:", profileError);
        redirect(`/dashboard/groups/create?error=${encodeURIComponent("Error al crear perfil en base de datos: " + profileError.message)}`)
    }

    // 1. Crear el grupo
    console.log("Insertando grupo en Supabase...");
    const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
            name,
            description,
            created_by: user.id,
            invite_code
        })
        .select()
        .single()

    if (groupError || !group) {
        console.error("ERROR AL CREAR EL GRUPO EN SUPABASE:", groupError);
        const errMsg = groupError?.message || "No se pudo crear el grupo";
        redirect(`/dashboard/groups/create?error=${encodeURIComponent(errMsg)}`)
    }
    console.log("GRUPO CREADO EXITOSAMENTE:", group);

    // 2. Agregar al creador como miembro del grupo
    console.log("Asignando creador como miembro admin...");
    const { error: memberError } = await supabase
        .from('group_members')
        .insert({
            group_id: group.id,
            user_id: user.id,
            role: 'admin',
            joined_at: new Date().toISOString()
        })

    if (memberError) {
        console.error("ERROR AL ASIGNAR MIEMBRO:", memberError);
        const errMsg = memberError?.message || "Grupo creado pero error al asignar miembro";
        redirect(`/dashboard/groups/create?error=${encodeURIComponent(errMsg)}`)
    }
    console.log("MIEMBRO ASIGNADO CON ÉXITO.");

    console.log("Revalidando path '/dashboard' y redirigiendo a:", `/dashboard/groups/${group.id}`);
    console.log("=== FIN DE ACCIÓN: createGroup ===");

    revalidatePath('/dashboard')
    redirect(`/dashboard/groups/${group.id}`)
}

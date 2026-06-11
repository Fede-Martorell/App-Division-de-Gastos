
'use client'

import { createGroup } from '../actions'
import { use } from 'react'

export default function CreateGroupPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const { error } = use(searchParams)

    const handleSubmit = async (formData: FormData) => {
        try {
            await createGroup(formData);
        } catch (err) {
            console.error("Error al ejecutar la acción:", err);
        }
    };

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ maxWidth: '440px' }}>
                <h1 style={{ color: 'var(--foreground)', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>Crear Nuevo Grupo</h1>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginBottom: '28px' }}>Organiza tus gastos con amigos o familia</p>

                <div style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px' }}>
                    <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }} htmlFor="name">Nombre del Grupo</label>
                            <input id="name" name="name" type="text" placeholder="Ej. Viaje a Mendoza 🏔️" required style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--foreground)', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
                        </div>

                        <div>
                            <label style={{ color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }} htmlFor="description">Descripción (Opcional)</label>
                            <textarea id="description" name="description" placeholder="Ej. Gastos de alojamiento, comida y combustible" rows={3} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--foreground)', fontSize: '15px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
                        </div>

                        {error && (
                            <p style={{ fontSize: '14px', fontWeight: 500, color: '#f43f5e', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', padding: '12px', borderRadius: '10px' }}>{error}</p>
                        )}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <a href="/dashboard" style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--muted-foreground)', textAlign: 'center', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>Cancelar</a>
                            <button type="submit" style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '15px', boxShadow: '0 8px 24px rgba(124, 58, 237, 0.35)' }}>Crear Grupo</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

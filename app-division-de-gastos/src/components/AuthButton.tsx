'use client'

import { useFormStatus } from 'react-dom'

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
}

export function AuthButton({ children, className, ...props }: AuthButtonProps) {
    const { pending } = useFormStatus()

    return (
        <button
            {...props}
            disabled={pending || props.disabled}
            className={`${className} ${pending ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
            {pending ? 'Cargando...' : children}
        </button>
    )
}

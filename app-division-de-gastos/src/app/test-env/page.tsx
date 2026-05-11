export default function TestEnvPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return (
        <div className="p-10 font-mono text-lg">
            <h1 className="mb-6 text-2xl font-bold">Diagnóstico de Conexión</h1>

            <div className="mb-4">
                <strong>Supabase URL: </strong>
                {supabaseUrl ? (
                    <span className="text-green-600">✅ Encontrada ({supabaseUrl})</span>
                ) : (
                    <span className="text-red-600 font-bold">❌ NO ENCONTRADA (Está vacía)</span>
                )}
            </div>

            <div>
                <strong>Supabase Key: </strong>
                {supabaseKey ? (
                    <span className="text-green-600">✅ Encontrada (Empieza con {supabaseKey.substring(0, 10)}...)</span>
                ) : (
                    <span className="text-red-600 font-bold">❌ NO ENCONTRADA (Está vacía)</span>
                )}
            </div>
        </div>
    )
}
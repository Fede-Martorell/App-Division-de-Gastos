export default function DashboardLoading() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <div style={{ height: '32px', width: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '8px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                    <div style={{ height: '20px', width: '300px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {[1, 2, 3].map((i) => (
                    <div key={i} style={{ height: '120px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                        <div style={{ height: '40px', width: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', marginBottom: '16px' }} />
                        <div style={{ height: '20px', width: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }} />
                    </div>
                ))}
            </div>

            <div style={{ height: '400px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                <div style={{ height: '24px', width: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '24px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} style={{ height: '60px', width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }} />
                    ))}
                </div>
            </div>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .5; }
                }
            `}</style>
        </div>
    )
}

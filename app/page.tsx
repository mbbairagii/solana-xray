import { SimulateButton } from '@/components/SimulateButton';
import { HoverCard } from '@/components/HoverCard';

const FEATURES = [
  { icon: '🔬', title: 'Simulate Before Signing', desc: 'Dry-run any transaction against live chain state. Nothing executes, nothing is signed.' },
  { icon: '🔍', title: 'Instruction Decoder', desc: 'Every raw instruction translated into plain language — transfers, approvals, closures, mints.' },
  { icon: '🛡️', title: 'Risk Scoring', desc: 'Scored 0–100 across unknown programs, unlimited approvals, authority changes, and more.' },
  { icon: '🌲', title: 'CPI Call Tree', desc: 'The full cross-program invocation chain. What your wallet shows is never the full picture.' },
  { icon: '💳', title: 'Account State Diff', desc: 'Every account before and after. SOL balances, token amounts, ownership — all surfaced.' },
  { icon: '🚨', title: 'Scam Pattern Detection', desc: 'NFT authority hijacks, drain patterns, delegate traps, unlimited approvals — caught automatically.' },
];

const STEPS = [
  { n: '01', title: 'Drop a transaction', desc: 'Paste a signature from your history or a base64 transaction you were asked to sign.' },
  { n: '02', title: 'Simulate against mainnet', desc: 'Runs against live chain state — no fees, no signing, no consequences.' },
  { n: '03', title: 'Read the full picture', desc: 'Every instruction explained. Every risk flagged. In plain language or full dev detail.' },
];

const C = {
  bg: '#07090B',
  card: '#0C0F12',
  border: 'rgba(255,255,255,0.06)',
  textPrimary: '#F1F5F9',
  textSecondary: '#8896A5',
  textMuted: '#3D4F5C',
  textFaint: '#1A2530',
  hi: '#7EB8C9',
  hiDim: 'rgba(126,184,201,0.1)',
  hiBorder: 'rgba(126,184,201,0.22)',
};

export default function LandingPage() {
  return (
    <main style={{ minHeight: '100vh', background: C.bg, color: C.textSecondary, fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden' }}>

      <BgDistortion />

      {/* ── Nav ── */}
      <nav style={{ position: 'relative', zIndex: 10, borderBottom: `1px solid ${C.border}`, padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>🧬</span>
          <span style={{ fontWeight: 700, fontSize: '14px', color: C.textPrimary, letterSpacing: '-0.3px' }}>TX X-Ray</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          <span style={{ fontSize: '12px', color: C.textMuted }}>Solana Mainnet</span>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', zIndex: 10, maxWidth: '740px', margin: '0 auto', padding: '110px 24px 80px', textAlign: 'center' }}>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: C.hiDim, border: `1px solid ${C.hiBorder}`,
          borderRadius: '999px', padding: '5px 16px', fontSize: '11px',
          color: C.hi, fontWeight: 600, letterSpacing: '1.5px', marginBottom: '36px',
        }}>
          SOLANA · TRANSACTION SIMULATOR
        </div>

        <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 58px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-2px', marginBottom: '22px', color: C.textPrimary }}>
          Know what you're signing<br />
          <span style={{ color: C.hi }}>before you sign it.</span>
        </h1>

        <p style={{ fontSize: '16px', color: C.textMuted, maxWidth: '460px', margin: '0 auto 44px', lineHeight: 1.85 }}>
          Most exploits happen because users sign without reading. TX X-Ray decodes every instruction, flags every risk, and tells you exactly what a transaction will do — in plain language.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <SimulateButton label="Open the Simulator →" padding="13px 34px" />
          <span style={{ fontSize: '11px', color: C.textFaint }}>No wallet connection required</span>
        </div>

        {/* Mock card */}
        <div style={{ marginTop: '72px', background: 'rgba(12,15,18,0.85)', backdropFilter: 'blur(12px)', border: `1px solid ${C.border}`, borderRadius: '16px', overflow: 'hidden', textAlign: 'left', boxShadow: '0 30px 80px rgba(0,0,0,0.8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '12px 18px', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(239,68,68,0.45)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(234,179,8,0.45)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(34,197,94,0.45)' }} />
            <span style={{ marginLeft: '10px', fontSize: '11px', color: C.textFaint, fontFamily: 'JetBrains Mono, monospace' }}>simulation-result.json</span>
          </div>
          <div style={{ padding: '22px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', lineHeight: 2.1, color: C.textMuted }}>
            <div style={{ color: C.textFaint }}>{'// decoded transaction · pump.fun swap'}</div>
            <div><span style={{ color: '#8896A5' }}>"summary"</span><span>: </span><span style={{ color: C.textSecondary }}>"Swap 6.68 WSOL for 15.8M CLAW via Pump.fun AMM"</span></div>
            <div><span style={{ color: '#8896A5' }}>"riskScore"</span><span>: </span><span style={{ color: '#F59E0B', fontWeight: 700 }}>38</span><span style={{ color: C.textFaint }}>  // REVIEW</span></div>
            <div><span style={{ color: '#8896A5' }}>"programs"</span><span>: [</span><span style={{ color: C.textSecondary }}>"Token Program"</span><span>, </span><span style={{ color: '#F87171' }}>"Pump.fun AMM ⚠"</span><span>]</span></div>
            <div><span style={{ color: '#8896A5' }}>"warning"</span><span>: </span><span style={{ color: '#FCD34D' }}>"Unverified program in CPI chain"</span></div>
            <div><span style={{ color: '#8896A5' }}>"computeUnits"</span><span>: </span><span style={{ color: C.textSecondary }}>77_271</span></div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ position: 'relative', zIndex: 10, borderTop: `1px solid ${C.border}`, padding: '80px 24px', background: 'rgba(7,9,11,0.6)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <SectionLabel>How it works</SectionLabel>
          <SectionTitle>Three steps to full transparency</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {STEPS.map((s) => (
              <div key={s.n} style={{ background: 'rgba(12,15,18,0.8)', border: `1px solid ${C.border}`, borderRadius: '16px', padding: '26px', position: 'relative', overflow: 'hidden' }}>
                <span style={{ position: 'absolute', top: '8px', right: '14px', fontSize: '52px', fontWeight: 900, color: 'rgba(255,255,255,0.018)', lineHeight: 1, userSelect: 'none' }}>{s.n}</span>
                <p style={{ fontSize: '11px', color: C.hi, fontWeight: 600, marginBottom: '10px', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px', opacity: 0.75 }}>{s.n}</p>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: C.textPrimary }}>{s.title}</h3>
                <p style={{ fontSize: '13px', color: C.textMuted, lineHeight: 1.75, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ position: 'relative', zIndex: 10, borderTop: `1px solid ${C.border}`, padding: '80px 24px', background: 'rgba(7,9,11,0.6)' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <SectionLabel>What it does</SectionLabel>
          <SectionTitle>Everything under the hood</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '10px' }}>
            {FEATURES.map((f) => (
              <HoverCard
                key={f.title}
                style={{ background: 'rgba(12,15,18,0.8)', borderRadius: '14px', padding: '22px' }}
              >
                <span style={{ fontSize: '22px', display: 'block', marginBottom: '12px' }}>{f.icon}</span>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: C.textPrimary, marginBottom: '7px' }}>{f.title}</h3>
                <p style={{ fontSize: '13px', color: C.textMuted, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </HoverCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position: 'relative', zIndex: 10, borderTop: `1px solid ${C.border}`, padding: '100px 24px', textAlign: 'center', background: 'rgba(7,9,11,0.5)' }}>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '14px', color: C.textPrimary }}>
          Blind signatures are how people get drained.
        </h2>
        <p style={{ fontSize: '15px', color: C.textMuted, marginBottom: '36px', maxWidth: '420px', margin: '0 auto 36px', lineHeight: 1.8 }}>
          It takes 10 seconds to simulate a transaction. That's all the time you need to know if it's safe.
        </p>
        <SimulateButton label="Simulate a Transaction →" padding="13px 40px" />
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 10, background: 'rgba(7,9,11,0.7)', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: C.textFaint }}>
          <span>🧬</span><span>TX X-Ray · Built on Solana</span>
        </div>
        <div style={{ fontSize: '12px', color: C.textMuted }}>
          Designed & Developed by <span style={{ color: C.textPrimary, fontWeight: 700 }}>Mohini</span>
        </div>
      </footer>

      <style>{`
        @keyframes grain {
          0%, 100% { transform: translate(0,0); }
          20% { transform: translate(-1%,-1%); }
          40% { transform: translate(1%,1%); }
          60% { transform: translate(-1%,1%); }
          80% { transform: translate(1%,-1%); }
        }
      `}</style>
    </main>
  );
}

function BgDistortion() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
      willChange: 'transform',
      transform: 'translateZ(0)',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/x1.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        opacity: 0.22,
        filter: 'grayscale(80%) contrast(1.1)',
      }} />

      <div style={{
        position: 'absolute', inset: '-5%',
        backgroundImage: 'url(/x1.jpeg)',
        backgroundSize: '120% 120%',
        backgroundPosition: 'center',
        opacity: 0.06,
        filter: 'blur(60px) grayscale(100%)',
        mixBlendMode: 'screen',
      }} />

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(7,9,11,0.45) 0%, rgba(7,9,11,0.25) 30%, rgba(7,9,11,0.6) 70%, rgba(7,9,11,0.95) 100%)',
      }} />

      <div style={{
        position: 'absolute', inset: '-50%',
        width: '200%', height: '200%',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '180px 180px',
        opacity: 0.03,
        animation: 'grain 1.2s steps(1) infinite',
        mixBlendMode: 'overlay',
      }} />

      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 40% at 35% 35%, rgba(126,184,201,0.03) 0%, transparent 65%)',
      }} />
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p style={{ textAlign: 'center', fontSize: '10px', color: '#7EB8C9', fontWeight: 700, letterSpacing: '2px', marginBottom: '10px', opacity: 0.65 }}>
      {children.toUpperCase()}
    </p>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 style={{ textAlign: 'center', fontSize: 'clamp(22px, 3.2vw, 32px)', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: '40px', color: '#F1F5F9' }}>
      {children}
    </h2>
  );
}

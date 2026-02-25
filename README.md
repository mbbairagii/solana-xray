# Solana TX X-Ray 🧬

A transaction simulator and risk explainer for Solana. Paste any transaction
signature or raw base64 — X-Ray decodes every instruction, scores the risk,
and tells you exactly what it does before you sign anything.

Built as a tool I genuinely wish existed when I first started interacting
with Solana dApps.

---

## What it does

- **Simulates transactions** against live mainnet state — no signing, no fees,
  no consequences
- **Decodes every instruction** into plain language — transfers, approvals,
  mints, closures
- **Risk scoring** from 0–100 across unknown programs, unlimited approvals,
  authority changes, and drain patterns
- **CPI call tree** — visualizes the full cross-program invocation chain,
  not just the surface-level instruction
- **Account state diff** — shows every account before and after: SOL balances,
  token amounts, ownership
- **Scam pattern detection** — catches NFT authority hijacks, delegate traps,
  unlimited approvals automatically

---

## Stack

- **Next.js 15** (App Router, Server + Client Components)
- **React** with TypeScript
- **@solana/web3.js** for RPC calls and transaction parsing
- **Solana Wallet Adapter** for Phantom/wallet connectivity
- **Custom risk engine** — no third-party scoring, built from scratch

---

## How to run

```bash
git clone https://github.com/mbbairagii/solana-xray
cd solana-xray
npm install

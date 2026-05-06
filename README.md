# Neon Lattice Sorter — Base App

Mobile-first **sorting puzzle** (swipe to swap neighbors) with cyberpunk neon UI, plus a **daily on-chain check-in** on Base mainnet (Foundry `CheckIn`).

## Layout

- **`web/`** — Next.js App Router (Vercel **Root Directory** = `web`)
- **`contracts/`** — Foundry: `CheckIn.sol`

## Quick start

```bash
cd contracts && forge test
cd web && npm install && npm run dev
```

## Production

- **Live app:** [https://sorting-visualizer-six-chi.vercel.app](https://sorting-visualizer-six-chi.vercel.app)  
- Set the same `NEXT_PUBLIC_SITE_URL` in Vercel project env. Base verification uses `<meta name="base:app_id" content="…" />` from `NEXT_PUBLIC_BASE_APP_ID` in the root layout.

## Environment (`web/.env.local`)

Copy from [`web/.env.example`](web/.env.example). Deploy `CheckIn`, set `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS`, register on [base.dev](https://www.base.dev), and set `NEXT_PUBLIC_BASE_APP_ID` plus `NEXT_PUBLIC_BUILDER_CODE` (or `NEXT_PUBLIC_BUILDER_CODE_SUFFIX`).

## Check-in contract

```bash
cd contracts
forge create src/CheckIn.sol:CheckIn --rpc-url "$BASE_RPC_URL" --private-key "$KEY"
```

Put the deployed address in `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS`.

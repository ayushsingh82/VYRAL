# HEAT

**HEAT** is a leverage trading platform for cultural / popularity assets — celebrities, news, pop culture, sports, RWA, pre-IPO. Users post **KAI** as collateral and go long or short on a subject's popularity with up to **20x leverage**. Win if the mark price moves your way; get liquidated if loss reaches 95% of collateral.

This repo contains:
- **Smart contracts** (`contracts/`) — Solidity 0.8.24 + Hardhat. KAI ERC20, per-subject `HeatMarket`, and a `HeatMarketFactory`.
- **Next.js app** (`src/`) — React UI wired to the contracts via [viem](https://viem.sh).

See [`plan.md`](./plan.md) for the architecture and implementation checklist.

## Quick start

Three terminals.

### 1. Start a local Hardhat node

```bash
cd contracts
npm install        # first time only
npm run node       # http://127.0.0.1:8545, chainId 31337
```

### 2. Deploy contracts + seed markets

```bash
cd contracts
npm run deploy:local
```

This deploys `KAIToken` and `HeatMarketFactory`, creates 7 seeded markets (Islam Makhachev, Mr Beast, Pokemon Go, Tariff, OpenAI, S&P500, Ondo), funds each market's insurance pool with 1M KAI, and writes `addresses.local.json` into both `contracts/` and `src/app/lib/` so the frontend picks them up.

### 3. Start the Next.js app

```bash
npm install        # first time only
npm run dev
```

Open `http://localhost:3000`.

**To trade**: click **Connect Wallet** (MetaMask, etc. — add the local network: RPC `http://127.0.0.1:8545`, chainId `31337`, currency ETH). Import one of the Hardhat default private keys to get test ETH for gas. Click **Get Test KAI** in the navbar to mint 10,000 KAI to your wallet. Click any market tile or the **Open Position** button to choose long/short, leverage, and collateral.

## Contract architecture

- `KAIToken` — ERC20, `mint()` is public for the test faucet.
- `HeatMarket` — One per subject. State: `markPrice`, `longOI`, `shortOI`, `insuranceFund`, per-user `Position`. Methods: `openPosition`, `closePosition`, `liquidate`, oracle-only `updatePrice`, anyone-may `fundInsurance`. P&L = `size * (mark - entry) / entry` (inverted for shorts). Liquidation triggers at 95% loss; liquidator earns 5% of forfeited collateral.
- `HeatMarketFactory` — Owner-only `createMarket`, indexes by category, emits `MarketCreated`.

**Counterparty pool**: profitable PnL is paid from each market's `insuranceFund`, which is replenished by losing trades and liquidations. This is a simplification — production would add a funding rate / vAMM. See `plan.md` "Out of scope".

## Tests

```bash
cd contracts
npm test
```

18 specs covering KAI faucet/transfers, market open/close P&L for longs and shorts, leverage cap, liquidation threshold + bounty, OI accounting, sentiment %, oracle gating, insurance fund debits/credits, factory ownership + category indexing.

## Frontend integration (viem)

- `src/app/lib/chain.ts` — viem public + wallet clients targeting local Hardhat (chainId 31337).
- `src/app/lib/abi.ts` / `abi.json` — re-exported ABIs from compiled artifacts.
- `src/app/lib/addresses.ts` / `addresses.local.json` — populated by the deploy script.
- `src/app/lib/markets.ts` — high-level read/write helpers (`getMarketSnapshot`, `openPosition`, `closePosition`, `faucetMintKai`, etc.).
- `src/app/hooks/useWallet.ts` — connect / disconnect / chain switching against `window.ethereum`.
- `src/app/hooks/useMarket.ts` — polls a market's snapshot + the user's position every 6s.

To redeploy after a contract change, re-run `npm run deploy:local` from `contracts/`. The script copies the new ABIs/addresses into the frontend automatically; refresh the browser.

# VYRAL

**Leverage trading on virality.**

VYRAL is a perpetual-style trading protocol where users go **long** or **short** on the *popularity* of cultural subjects — celebrities, news, pop culture, sports, RWA, pre-IPO — with up to **20x leverage**, settled in the protocol's quote asset **VYR**.

| | |
|---|---|
| **Stack** | Next.js 15 · React 19 · Tailwind 4 · viem 2 · Solidity 0.8.24 · Hardhat 2 |
| **Local chain** | Hardhat node, chainId `31337` |
| **Status** | Local devnet only. Not audited. Do not deploy to mainnet without further work. |
| **License** | MIT |

---

## Table of contents

1. [What is VYRAL?](#what-is-vyral)
2. [Architecture](#architecture)
3. [Quick start](#quick-start)
4. [Project layout](#project-layout)
5. [Smart contracts](#smart-contracts)
6. [Frontend integration (viem)](#frontend-integration-viem)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Environment & configuration](#environment--configuration)
10. [Production checklist](#production-checklist)
11. [Roadmap](#roadmap)
12. [License](#license)

---

## What is VYRAL?

Most prediction and attention markets settle once and pay out. VYRAL treats *popularity* as a continuously priced asset and lets users take levered directional positions on it:

- **Subjects** — One market per subject (e.g. "Mr Beast", "OpenAI", "Tariff", "S&P500"). Each has its own price feed and order book of long/short positions.
- **VYR** — ERC‑20 collateral and quote token. All P&L is denominated in VYR.
- **Leverage** — 1×…20× per position. Notional size = collateral × leverage.
- **Mark price** — Posted by a designated oracle role. In production this would be a Chainlink/Pyth-style aggregator or a signed off-chain feed; locally we ship a manual `updatePrice` for demos and tests.
- **Liquidation** — Anyone may liquidate a position whose unrealised loss reaches 95% of posted collateral. The liquidator earns a 5% bounty on the forfeited collateral; the remainder accrues to the per-market insurance fund.
- **Insurance fund** — A pool of VYR per market that backs profitable PnL. Losses (forfeited collateral, liquidations) replenish it; profits are paid from it. Seeded at deploy time.

The UI maps directly onto these primitives: a featured **Live Stream** market with price/OI/volume/sentiment, two grids of additional markets, and an open-position modal with a leverage slider.

## Architecture

```
┌─────────────────────────┐   read   ┌──────────────────────────┐
│  Next.js (App Router)   │ ───────▶ │ viem PublicClient (HTTP) │
│  client components      │          └──────────────────────────┘
│  hooks: useWallet,      │
│  useMarket              │   write  ┌──────────────────────────┐
│                         │ ───────▶ │ viem WalletClient        │
└─────────────────────────┘          │ (window.ethereum, EIP-1193)│
                                     └──────────────┬─────────────┘
                                                    │ JSON-RPC
                                                    ▼
                              ┌─────────────────────────────────────┐
                              │ Hardhat node @ http://127.0.0.1:8545│
                              │                                     │
                              │  VyralToken (ERC20, VYR)            │
                              │  VyralMarketFactory                 │
                              │    └─ VyralMarket  ×  N             │
                              └─────────────────────────────────────┘
```

## Quick start

Three terminals. The project is the `my-app/` directory.

### 1. Start a local Hardhat node

```bash
cd my-app/contracts
npm install           # first time only
npm run node          # JSON-RPC at http://127.0.0.1:8545, chainId 31337
```

### 2. Deploy the contracts and seed markets

```bash
cd my-app/contracts
npm run deploy:local
```

This:
- Deploys `VyralToken` and `VyralMarketFactory`.
- Creates 7 seeded markets matching the UI (Islam Makhachev, Mr Beast, Pokemon Go, Tariff, OpenAI, S&P500, Ondo).
- Funds each market's insurance pool with 1,000,000 VYR.
- Writes `addresses.local.json` into both `contracts/` and `src/app/lib/`.
- Refreshes the frontend `abi.json` so the UI sees the latest interface.

### 3. Start the Next.js app

```bash
cd my-app
npm install           # first time only
npm run dev           # http://localhost:3000
```

### 4. Trade

1. Click **Connect Wallet** in the navbar. The app will request a switch to network `31337` (Vyral Local). If your wallet doesn't have it, it will offer to add it (RPC `http://127.0.0.1:8545`, currency ETH).
2. Import one of Hardhat's default keys (printed by `npm run node`) into your wallet to get test ETH for gas.
3. Click **Get Test VYR** to mint 10,000 VYR to your account via the public faucet on `VyralToken`.
4. Click any market tile or **Open Position** on the featured market — choose long/short, leverage (slider 1×–20×), and collateral, then submit. The app handles VYR approval + the `openPosition` call.
5. Re-open the modal to **Close** the position. P&L settles against the market's insurance pool.

## Project layout

```
my-app/
├── contracts/                        # Hardhat workspace
│   ├── contracts/
│   │   ├── VyralToken.sol            # ERC20 collateral (VYR), public faucet
│   │   ├── VyralMarket.sol           # Per-subject leverage market
│   │   └── VyralMarketFactory.sol    # Market creation + category index
│   ├── test/
│   │   ├── VyralToken.test.ts
│   │   ├── VyralMarket.test.ts
│   │   └── VyralMarketFactory.test.ts
│   ├── scripts/deploy.ts             # Local deployment + market seeding
│   ├── hardhat.config.ts
│   └── package.json
├── src/app/
│   ├── lib/
│   │   ├── chain.ts                  # viem public/wallet clients, VYRAL_CHAIN
│   │   ├── abi.ts / abi.json         # Re-exported contract ABIs
│   │   ├── addresses.ts              # Typed address book
│   │   ├── addresses.local.json      # Written by deploy script
│   │   └── markets.ts                # Read/write helpers (open, close, faucet, fmt*)
│   ├── hooks/
│   │   ├── useWallet.ts              # Connect / chain switch / event listeners
│   │   └── useMarket.ts              # Polls market snapshot + user position
│   ├── components/
│   │   ├── Navbar.tsx                # Connect, balance, Get Test VYR
│   │   ├── Landing.tsx               # Splits markets into featured / grids
│   │   ├── StreamingBox.tsx          # Featured market + sentiment
│   │   ├── MarketTile.tsx            # Grid tile with live price/volume
│   │   ├── PopularBox.tsx
│   │   ├── PopularNews.tsx
│   │   ├── OpenPositionModal.tsx     # Long/short + leverage slider + close
│   │   └── Footer.tsx
│   ├── layout.tsx
│   └── page.tsx
├── plan.md                           # Implementation plan + decisions
└── README.md
```

## Smart contracts

### `VyralToken.sol`

Standard OpenZeppelin ERC20 (`name="Vyral"`, `symbol="VYR"`, 18 decimals).

- `mint(address,uint256)` — public for testnet/local. **Remove or gate before mainnet.**
- `faucet()` — mints `FAUCET_AMOUNT` (10,000 VYR) to caller.

### `VyralMarket.sol`

One contract per subject. Holds all positions, OI, the insurance fund, and the mark price.

| Function | Caller | Effect |
|---|---|---|
| `openPosition(collateral, leverage, isLong)` | trader | Pulls VYR collateral, opens position, books OI, updates volume. |
| `closePosition()` | trader | Settles P&L: collateral ± pnl, updates insurance fund, transfers payout. |
| `liquidate(user)` | anyone | Closes a position when unrealised loss ≥ 95% of collateral. Pays caller a 5% bounty on the forfeited collateral; remainder accrues to insurance. |
| `fundInsurance(amount)` | anyone | Deposits VYR into the per-market insurance pool. |
| `updatePrice(newPrice)` | oracle | Sets `markPrice` (1e18-scaled). |
| `setOracle(addr)` | oracle | Rotates the oracle. |
| `getMarketSnapshot()` | view | `{markPrice, longOI, shortOI, longPctBps, shortPctBps, volumeAccum}`. |
| `getPosition(user)` | view | Position + unrealised P&L + liquidatable flag. |

**Constants**

| | |
|---|---|
| `MAX_LEVERAGE` | 20 |
| `LIQUIDATION_THRESHOLD_BPS` | 9500 (95%) |
| `LIQUIDATION_BOUNTY_BPS` | 500 (5%) |
| `PRICE_SCALE` | 1e18 |

**P&L formula** — for a position with size `S` (notional VYR), entry `E`, mark `M`:

```
pnl_long  = S × (M − E) / E
pnl_short = S × (E − M) / E
payout    = clamp(collateral + pnl, 0, type(uint128).max)
```

### `VyralMarketFactory.sol`

Owner-gated `createMarket(subject, category, imageUrl, initialPrice)` deploys a `VyralMarket` and indexes it. Discovery views: `getAllMarkets()`, `getMarketsByCategory(category)`, `isMarket(addr)`.

## Frontend integration (viem)

The frontend uses raw [viem](https://viem.sh) — no `wagmi`, no Web3Modal — to keep the runtime footprint minimal and the integration explicit.

- **`src/app/lib/chain.ts`** — `VYRAL_CHAIN` (id 31337), memoised `PublicClient` over HTTP, and a `WalletClient` factory bound to `window.ethereum`.
- **`src/app/lib/markets.ts`** — All on-chain entry points:
  - reads: `getMarketSnapshot`, `getPosition`, `getVyrBalance`, `getVyrAllowance`
  - writes: `openPosition`, `closePosition`, `ensureVyrApproval`, `faucetMintVyr`
  - formatting: `fmtVyr`, `fmtPct`, `fmtPrice`, `fmtSignedVyr`
- **`src/app/hooks/useWallet.ts`** — connect / disconnect, listens to `accountsChanged` and `chainChanged`, automatically prompts a switch to chainId 31337.
- **`src/app/hooks/useMarket.ts`** — polls market snapshot + the user's position every 6 seconds. Replace the interval with a websocket / block-subscription transport for production.

## Testing

```bash
cd my-app/contracts
npm test
```

**18 specs**, all passing, covering:

- `VyralToken` — metadata, mint, faucet, transfers.
- `VyralMarket` — open long/short, OI accounting, leverage cap rejection, single-position-per-user invariant, profit settlement, loss settlement with payout floor at 0, short profit, liquidation at threshold with correct bounty / residual, refusal of healthy liquidations, sentiment %, oracle-only price updates, oracle rotation, insurance fund debit on profit / credit on loss.
- `VyralMarketFactory` — owner-only creation, category indexing, `MarketCreated` event payload, wiring of VYR + oracle into created markets.

Frontend validation: `npx tsc --noEmit`, `npx eslint src --max-warnings 0`, `npx next build` all clean.

## Deployment

### Local (Hardhat)

```bash
cd my-app/contracts
npm run node                 # terminal A
npm run deploy:local         # terminal B
```

Outputs `addresses.local.json` (chain id, token, factory, oracle, deployer, markets[]) and refreshes `src/app/lib/abi.json`.

### Other networks

The deploy script targets whatever network Hardhat is configured to use. Add a network to `contracts/hardhat.config.ts`:

```ts
networks: {
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL!,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
  },
},
```

Then:

```bash
npm run compile
npx hardhat run scripts/deploy.ts --network sepolia
```

Copy the resulting addresses + ABI into a new `addresses.<network>.json` and switch the frontend `VYRAL_CHAIN` in `src/app/lib/chain.ts` accordingly. A multi-network address-book pattern (e.g. `addresses[chainId]`) is the recommended next step.

## Environment & configuration

The local stack runs without any environment variables. For non-local deployments you'll want:

| Variable | Where | Purpose |
|---|---|---|
| `SEPOLIA_RPC_URL` | `contracts/.env` | RPC endpoint for Hardhat deploys |
| `DEPLOYER_PRIVATE_KEY` | `contracts/.env` | Funded deployer (do not commit) |
| `NEXT_PUBLIC_CHAIN_ID` | `my-app/.env.local` | Overrides `VYRAL_CHAIN.id` (planned) |
| `NEXT_PUBLIC_RPC_URL` | `my-app/.env.local` | Public RPC (planned) |

`.env*` is gitignored by the Next.js template.

## Production checklist

This repo is a working local-devnet implementation. Before any mainnet (or even public testnet) deployment, treat at minimum the following as required:

- [ ] **Audit** `VyralMarket` carefully — the insurance-fund accounting and liquidation paths are the highest-risk surfaces.
- [ ] **Replace public `mint()`** on `VyralToken` with a role-gated bridge / vesting contract, or remove the function entirely if VYR is bridged.
- [ ] **Real oracle**: swap the `oracle` role for a Chainlink / Pyth feed (or a signed report verified on-chain). The current `updatePrice` is a placeholder.
- [ ] **Funding rate / vAMM**: introduce a mechanism that keeps long/short open interest balanced so the insurance fund isn't the only counterparty. Today large directional skew can drain it.
- [ ] **Multi-position support**: today one position per user per market. Production users will want partial closes, scale-ins, or hedged positions.
- [ ] **Reentrancy guard** on `openPosition` / `closePosition` / `liquidate` (currently low risk because settlement happens before transfer, but worth defence-in-depth).
- [ ] **Price/price-impact bounds** — sanity-check oracle updates against a TWAP and circuit-break on abnormal moves.
- [ ] **Per-market collateral / position caps** to bound insurance-fund exposure.
- [ ] **Upgradeability strategy** — proxy, governance timelock, or explicitly immutable.
- [ ] **Frontend**: switch from HTTP polling to websocket / `watchContractEvent`, add error toasts, surface gas estimates, and add address-book per chainId.
- [ ] **Monitoring**: forwarding `PositionOpened`, `PositionClosed`, `PositionLiquidated`, `InsuranceFunded` to an indexer (Ponder / Subsquid).

## Roadmap

- Funding-rate accrual between longs and shorts.
- Multiple positions per user per market.
- Chainlink/Pyth oracle adapter.
- L2 deployment (Base / Arbitrum) + multi-chain address book.
- Subgraph + leaderboard.
- Position transfers / liquidation auctions.

## License

[MIT](LICENSE) © 2026

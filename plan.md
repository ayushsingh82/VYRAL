# HEAT — Project Completion Plan

## Product summary (derived from current UI)

**HEAT** is a perpetual-style leverage trading platform where users go **long / short** on the *popularity* of cultural subjects (celebrities, news, pop culture, sports, RWA, pre-IPO, etc.) with up to **20x leverage**, settled in the protocol's native quote token **KAI**.

UI surfaces today (static / hardcoded):
- Categories chips: `Trending, Top Gainers, Celebrities, Pre-IPO, RWA, Sports, Pop Culture`
- A featured **Live Stream** card with: subject, leverage badge, price (KAI), open interest, volume.
- A **Market Sentiment** panel: long %, short %, long KAI size, short KAI size, sentiment bar.
- Two grids (**Popular Culture** and **Popular News**) of market tiles: name, image, volume, gain %.
- Navbar with **Connect Wallet** button (not wired).

## What we are building to complete it

1. Smart contracts (Solidity, Hardhat) for KAI token + per-subject leverage markets.
2. Hardhat tests (TypeScript) covering happy path + edge cases (leverage cap, liquidation, P&L).
3. viem-based on-chain integration layer in the Next.js app that replaces hardcoded data with live reads and adds wallet connect + open/close position writes.

---

## Architecture

```
my-app/
├── contracts/                  # Hardhat project (Solidity sources + tests)
│   ├── contracts/
│   │   ├── KAIToken.sol        # ERC20 collateral / quote token, mint-for-test
│   │   ├── HeatMarket.sol      # Per-subject leverage market (long/short, OI, P&L, liq)
│   │   └── HeatMarketFactory.sol # Deploys + tracks markets; provides discovery
│   ├── test/
│   │   ├── KAIToken.test.ts
│   │   ├── HeatMarket.test.ts
│   │   └── HeatMarketFactory.test.ts
│   ├── scripts/
│   │   └── deploy.ts           # Local hardhat node deployment, emits addresses
│   ├── hardhat.config.ts
│   ├── package.json
│   └── tsconfig.json
└── src/app/
    ├── lib/
    │   ├── chain.ts            # viem clients (public + wallet), chain config
    │   ├── abi.ts              # Re-exported ABIs from compiled contracts
    │   ├── addresses.ts        # Deployed addresses (local + future testnet)
    │   └── markets.ts          # High-level read/write helpers (open, close, getMarket)
    ├── hooks/
    │   ├── useWallet.ts        # Connect / account / chain state
    │   └── useMarket.ts        # Per-market live reads
    └── components/             # Existing UI, wired to hooks
```

### Contract design (concise)

`KAIToken` — Standard ERC20 (`name=Kai`, `symbol=KAI`, 18 decimals). Adds a public `mint(address,uint256)` so local users can fund test wallets via the UI's "Get Test KAI" action.

`HeatMarket` — One market per subject. State:
- `subject` (string), `category` (string)
- `markPrice` (uint, scaled 1e18) — updated by `priceOracle` role
- `longOI`, `shortOI` (uint, KAI notional)
- `positions[address]` → `{ size, collateral, entryPrice, isLong, leverage }`
- `MAX_LEVERAGE = 20`, `LIQUIDATION_THRESHOLD_BPS = 9500` (95% collateral loss → liquidatable)

External methods:
- `openPosition(uint collateral, uint8 leverage, bool isLong)`
- `closePosition()` — settles P&L, returns collateral ± pnl
- `liquidate(address user)` — anyone may call when position underwater past threshold; rewards caller a small bounty
- `updatePrice(uint newPrice)` — oracle role only
- View: `getMarketSnapshot()` → `(markPrice, longOI, shortOI, longPct, shortPct, volumeAccum)`
- View: `getPosition(address)` → full struct + unrealized P&L

`HeatMarketFactory` — `createMarket(subject, category, initialPrice)` deploys a `HeatMarket`, stores it in `allMarkets`, emits `MarketCreated`. View: `getMarketsByCategory(string)`.

### Frontend integration (viem)

- Use raw **viem** (no wagmi) to stay dependency-light. `createPublicClient` for reads, `createWalletClient` over `window.ethereum` for writes.
- `useWallet` exposes `{ address, connect, disconnect, chainId }`.
- `useMarket(address)` polls (or refetches on block) `getMarketSnapshot` + user `getPosition`.
- Replace hardcoded arrays in `StreamingBox`, `PopularBox`, `PopularNews` with reads from the factory and one market each.
- Add an **Open Position** modal (collateral input, leverage slider 1–20x, long/short toggle) on the featured Live Stream card.
- Navbar **Connect Wallet** button wired to `useWallet`; truncated address when connected.

---

## Step-by-step plan (with checkboxes)

### Phase 1 — Contracts scaffolding
- [x] 1.1 Create `my-app/contracts/` Hardhat project (package.json, tsconfig, hardhat.config.ts)
- [x] 1.2 Install deps: `hardhat`, `@nomicfoundation/hardhat-toolbox-viem`, `viem`, `chai`, `@types/node`, `typescript`, `@openzeppelin/contracts`
- [x] 1.3 Configure `hardhat.config.ts` for Solidity 0.8.24, optimizer, local network

### Phase 2 — Smart contracts
- [x] 2.1 Implement `KAIToken.sol` (ERC20 + public mint for test)
- [x] 2.2 Implement `HeatMarket.sol` with open / close / liquidate / price update + view helpers
- [x] 2.3 Implement `HeatMarketFactory.sol` with createMarket + indices
- [x] 2.4 Compile cleanly (`npx hardhat compile`)

### Phase 3 — Hardhat tests
- [x] 3.1 `KAIToken.test.ts` — mint, transfer, decimals
- [x] 3.2 `HeatMarket.test.ts` — open long/short, leverage cap, P&L on price up/down, close, liquidation path, OI accounting, sentiment %
- [x] 3.3 `HeatMarketFactory.test.ts` — create market, indexing by category, market discovery
- [x] 3.4 `npx hardhat test` all green

### Phase 4 — Local deployment
- [x] 4.1 `scripts/deploy.ts` deploys KAI + factory + seeds initial markets (Islam Makhachev, Mr Beast, Pokemon Go, Tariff, OpenAI, S&P500, Ondo) and writes `addresses.local.json`
- [x] 4.2 Add `npm run` shortcuts: `compile`, `test`, `node`, `deploy:local`

### Phase 5 — Frontend integration (viem)
- [x] 5.1 Add `viem` to root `my-app/package.json` deps
- [x] 5.2 `src/app/lib/chain.ts` — viem public/wallet client factories targeting local hardhat (chainId 31337) with override for future testnets
- [x] 5.3 `src/app/lib/abi.ts` + `src/app/lib/addresses.ts` — typed ABIs and address registry
- [x] 5.4 `src/app/lib/markets.ts` — `getAllMarkets`, `getMarketSnapshot`, `getUserPosition`, `openPosition`, `closePosition`, `approveKai`
- [x] 5.5 `src/app/hooks/useWallet.ts` — connect via window.ethereum, persisted account
- [x] 5.6 `src/app/hooks/useMarket.ts` — live read of market + position
- [x] 5.7 Wire `Navbar.tsx` Connect Wallet to `useWallet`
- [x] 5.8 Replace hardcoded data in `StreamingBox`, `PopularBox`, `PopularNews` with live reads from factory; keep the same look-and-feel
- [x] 5.9 Add `OpenPositionModal` triggered from the featured market card (collateral, leverage slider, long/short)
- [x] 5.10 Add **Get Test KAI** action (mints KAI to connected wallet via `KAIToken.mint`)

### Phase 6 — Verification
- [x] 6.1 `npx hardhat test` — all tests pass
- [x] 6.2 Next.js typecheck / lint clean for new files
- [x] 6.3 Update root `README.md` with run instructions (hardhat node, deploy, dev server)

---

## Out of scope (deliberate, documented for honesty)
- Real price oracle — using an `oracle` role that posts prices. Hookup to Chainlink / Pyth left as TODO.
- Funding rate mechanism between longs and shorts (typical perp design).
- Cross-margin / multi-position per user per market (one position per user per market for now).
- Multi-chain support beyond a single configured chain.
- Image / metadata storage (subjects still use URLs hardcoded in the seed script, surfaced via factory).

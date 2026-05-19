"use client";

import { type Address, type Hash, formatUnits, parseUnits, maxUint256 } from "viem";
import { addresses } from "./addresses";
import { VyralMarketAbi, VyralTokenAbi } from "./abi";
import { getPublicClient, getWalletClient } from "./chain";

export type MarketSnapshot = {
  markPrice: bigint;
  longOI: bigint;
  shortOI: bigint;
  longPctBps: bigint;
  shortPctBps: bigint;
  volumeAccum: bigint;
};

export type PositionView = {
  open: boolean;
  isLong: boolean;
  leverage: number;
  collateral: bigint;
  size: bigint;
  entryPrice: bigint;
  unrealizedPnl: bigint;
  liquidatable: boolean;
};

export async function getMarketSnapshot(market: Address): Promise<MarketSnapshot> {
  const client = getPublicClient();
  const raw = (await client.readContract({
    address: market,
    abi: VyralMarketAbi,
    functionName: "getMarketSnapshot",
  })) as MarketSnapshot;
  return raw;
}

export async function getPosition(market: Address, user: Address): Promise<PositionView> {
  const client = getPublicClient();
  const raw = (await client.readContract({
    address: market,
    abi: VyralMarketAbi,
    functionName: "getPosition",
    args: [user],
  })) as PositionView;
  return raw;
}

export async function getVyrBalance(user: Address): Promise<bigint> {
  const client = getPublicClient();
  return (await client.readContract({
    address: addresses.vyr,
    abi: VyralTokenAbi,
    functionName: "balanceOf",
    args: [user],
  })) as bigint;
}

export async function getVyrAllowance(owner: Address, spender: Address): Promise<bigint> {
  const client = getPublicClient();
  return (await client.readContract({
    address: addresses.vyr,
    abi: VyralTokenAbi,
    functionName: "allowance",
    args: [owner, spender],
  })) as bigint;
}

// ---------- writes ----------

export async function ensureVyrApproval(
  account: Address,
  spender: Address,
  amount: bigint
): Promise<Hash | null> {
  const current = await getVyrAllowance(account, spender);
  if (current >= amount) return null;
  const wallet = getWalletClient(account);
  if (!wallet) throw new Error("No injected wallet");
  return wallet.writeContract({
    account,
    address: addresses.vyr,
    abi: VyralTokenAbi,
    functionName: "approve",
    args: [spender, maxUint256],
    chain: undefined,
  });
}

export async function openPosition(
  account: Address,
  market: Address,
  collateralVyr: string, // decimal string
  leverage: number,
  isLong: boolean
): Promise<Hash> {
  const wallet = getWalletClient(account);
  if (!wallet) throw new Error("No injected wallet");
  const collateral = parseUnits(collateralVyr, 18);

  const approvalHash = await ensureVyrApproval(account, market, collateral);
  if (approvalHash) {
    await getPublicClient().waitForTransactionReceipt({ hash: approvalHash });
  }

  return wallet.writeContract({
    account,
    address: market,
    abi: VyralMarketAbi,
    functionName: "openPosition",
    args: [collateral, leverage, isLong],
    chain: undefined,
  });
}

export async function closePosition(account: Address, market: Address): Promise<Hash> {
  const wallet = getWalletClient(account);
  if (!wallet) throw new Error("No injected wallet");
  return wallet.writeContract({
    account,
    address: market,
    abi: VyralMarketAbi,
    functionName: "closePosition",
    args: [],
    chain: undefined,
  });
}

export async function faucetMintVyr(account: Address): Promise<Hash> {
  const wallet = getWalletClient(account);
  if (!wallet) throw new Error("No injected wallet");
  return wallet.writeContract({
    account,
    address: addresses.vyr,
    abi: VyralTokenAbi,
    functionName: "faucet",
    args: [],
    chain: undefined,
  });
}

// ---------- formatting helpers ----------

export const fmtVyr = (v: bigint, digits = 2) => {
  const s = formatUnits(v, 18);
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(digits)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(digits)}K`;
  return n.toFixed(digits);
};

export const fmtPct = (bps: bigint, digits = 2) =>
  `${(Number(bps) / 100).toFixed(digits)}%`;

export const fmtPrice = (v: bigint, digits = 2) =>
  Number(formatUnits(v, 18)).toFixed(digits);

export const fmtSignedVyr = (v: bigint, digits = 2) => {
  const n = Number(formatUnits(v, 18));
  return `${n >= 0 ? "+" : ""}${n.toFixed(digits)}`;
};

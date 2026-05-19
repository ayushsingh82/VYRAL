"use client";

import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  http,
  type Address,
  type PublicClient,
  type WalletClient,
} from "viem";

export const VYRAL_CHAIN = defineChain({
  id: 31337,
  name: "Vyral Local (Hardhat)",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
});

let _publicClient: PublicClient | undefined;

export function getPublicClient(): PublicClient {
  if (!_publicClient) {
    _publicClient = createPublicClient({
      chain: VYRAL_CHAIN,
      transport: http(),
    });
  }
  return _publicClient;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, cb: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, cb: (...args: unknown[]) => void) => void;
    };
  }
}

export function getWalletClient(account: Address): WalletClient | null {
  if (typeof window === "undefined" || !window.ethereum) return null;
  return createWalletClient({
    account,
    chain: VYRAL_CHAIN,
    transport: custom(window.ethereum),
  });
}

export function hasInjectedWallet(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

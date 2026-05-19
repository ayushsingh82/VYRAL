"use client";

import { useCallback, useEffect, useState } from "react";
import type { Address } from "viem";
import { hasInjectedWallet, VYRAL_CHAIN } from "../lib/chain";

type State = {
  address: Address | null;
  chainId: number | null;
  connecting: boolean;
  error: string | null;
};

export function useWallet() {
  const [state, setState] = useState<State>({
    address: null,
    chainId: null,
    connecting: false,
    error: null,
  });

  const refresh = useCallback(async () => {
    if (!hasInjectedWallet()) return;
    try {
      const accounts = (await window.ethereum!.request({
        method: "eth_accounts",
      })) as string[];
      const chainIdHex = (await window.ethereum!.request({
        method: "eth_chainId",
      })) as string;
      setState((s) => ({
        ...s,
        address: (accounts[0] as Address) ?? null,
        chainId: parseInt(chainIdHex, 16),
      }));
    } catch {
      // ignore
    }
  }, []);

  const connect = useCallback(async () => {
    if (!hasInjectedWallet()) {
      setState((s) => ({ ...s, error: "No wallet detected. Install MetaMask." }));
      return;
    }
    setState((s) => ({ ...s, connecting: true, error: null }));
    try {
      const accounts = (await window.ethereum!.request({
        method: "eth_requestAccounts",
      })) as string[];
      const chainIdHex = (await window.ethereum!.request({
        method: "eth_chainId",
      })) as string;
      let chainId = parseInt(chainIdHex, 16);
      if (chainId !== VYRAL_CHAIN.id) {
        try {
          await window.ethereum!.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${VYRAL_CHAIN.id.toString(16)}` }],
          });
          chainId = VYRAL_CHAIN.id;
        } catch {
          // Try to add the chain.
          try {
            await window.ethereum!.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${VYRAL_CHAIN.id.toString(16)}`,
                  chainName: VYRAL_CHAIN.name,
                  rpcUrls: [...VYRAL_CHAIN.rpcUrls.default.http],
                  nativeCurrency: VYRAL_CHAIN.nativeCurrency,
                },
              ],
            });
            chainId = VYRAL_CHAIN.id;
          } catch {
            // Stay on current chain, error surfaced below.
          }
        }
      }
      setState({
        address: (accounts[0] as Address) ?? null,
        chainId,
        connecting: false,
        error: chainId !== VYRAL_CHAIN.id ? `Switch to chain ${VYRAL_CHAIN.id}` : null,
      });
    } catch (e) {
      setState((s) => ({
        ...s,
        connecting: false,
        error: e instanceof Error ? e.message : "Connect failed",
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({ address: null, chainId: null, connecting: false, error: null });
  }, []);

  useEffect(() => {
    refresh();
    if (!hasInjectedWallet()) return;
    const onAccounts = (...args: unknown[]) => {
      const accounts = (args[0] ?? []) as string[];
      setState((s) => ({ ...s, address: (accounts[0] as Address) ?? null }));
    };
    const onChain = (...args: unknown[]) => {
      const chainIdHex = args[0] as string;
      setState((s) => ({ ...s, chainId: parseInt(chainIdHex, 16) }));
    };
    window.ethereum!.on?.("accountsChanged", onAccounts);
    window.ethereum!.on?.("chainChanged", onChain);
    return () => {
      window.ethereum!.removeListener?.("accountsChanged", onAccounts);
      window.ethereum!.removeListener?.("chainChanged", onChain);
    };
  }, [refresh]);

  return { ...state, connect, disconnect };
}

export const shortAddr = (a?: string | null) =>
  a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";

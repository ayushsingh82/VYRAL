import abis from "./abi.json";

// Cast as `const` Abi tuples for viem's type inference.
import type { Abi } from "viem";

export const KAITokenAbi = abis.KAIToken as Abi;
export const HeatMarketAbi = abis.HeatMarket as Abi;
export const HeatMarketFactoryAbi = abis.HeatMarketFactory as Abi;

import local from "./addresses.local.json";

export type MarketSeed = {
  subject: string;
  category: string;
  imageUrl: string;
  initialPrice: string;
  featured?: boolean;
  address: string;
};

export type AddressBook = {
  chainId: number;
  kai: `0x${string}`;
  factory: `0x${string}`;
  oracle: `0x${string}`;
  deployer: `0x${string}`;
  markets: MarketSeed[];
};

// `as unknown as AddressBook` because JSON gives us plain strings; the deploy
// script guarantees the hex prefix.
export const addresses: AddressBook = local as unknown as AddressBook;

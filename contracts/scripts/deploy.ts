import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// Subjects mirror the UI mockup so the frontend has live data out of the box.
type Seed = {
  subject: string;
  category: string;
  imageUrl: string;
  initialPrice: string; // KAI (decimal string)
  featured?: boolean;
};

const SEEDS: Seed[] = [
  {
    subject: "Islam Makhachev",
    category: "Sports",
    imageUrl:
      "https://ca-times.brightspotcdn.com/dims4/default/32fcbe0/2147483647/strip/false/crop/6786x4500+0+0/resize/1486x985!/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2Fd7%2F2b%2Fcfa941e04a0781f1c14dde3bddb7%2Fhttps-delivery-gettyimages.com%2Fdownloads%2F2194651858",
    initialPrice: "2.45",
    featured: true,
  },
  {
    subject: "Mr Beast",
    category: "Pop Culture",
    imageUrl:
      "https://static-www.adweek.com/wp-content/uploads/2025/01/mr-beast-buy-tiktok-2025.jpg?w=1200",
    initialPrice: "1.25",
  },
  {
    subject: "Pokemon Go",
    category: "Pop Culture",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHnvg_o69CX26f-mHQ808Uf1Q6PHIxrgQ0Bg&s",
    initialPrice: "0.89",
  },
  {
    subject: "Tariff",
    category: "Trending",
    imageUrl:
      "https://www.hindustantimes.com/ht-img/img/2025/09/19/550x309/USA-TRUMP-BRITAIN-5_1758247334681_1758247371957.JPG",
    initialPrice: "2.1",
  },
  {
    subject: "OpenAI",
    category: "Pre-IPO",
    imageUrl:
      "https://static01.nyt.com/images/2024/10/02/business/00openai-deal-hfo/00openai-deal-hfo-videoSixteenByNine3000-v2.jpg",
    initialPrice: "3.4",
  },
  {
    subject: "S&P500",
    category: "RWA",
    imageUrl:
      "https://themarketperiodical.com/wp-content/uploads/2025/08/1P4MteiiFbiYc8DJWk9z8CRPvzEXpwbpp-696x392.jpeg",
    initialPrice: "5.7",
  },
  {
    subject: "Ondo",
    category: "RWA",
    imageUrl:
      "https://media.architecturaldigest.com/photos/5da74823d599ec0008227ea8/master/pass/GettyImages-946087016.jpg",
    initialPrice: "1.8",
  },
];

const INSURANCE_PER_MARKET = ethers.parseEther("1000000"); // 1M KAI

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying from ${deployer.address}`);

  const KAI = await ethers.getContractFactory("KAIToken");
  const kai = await KAI.deploy(deployer.address);
  await kai.waitForDeployment();
  console.log(`KAIToken          → ${await kai.getAddress()}`);

  const Factory = await ethers.getContractFactory("HeatMarketFactory");
  const factory = await Factory.deploy(
    await kai.getAddress(),
    deployer.address, // deployer doubles as oracle for local dev
    deployer.address
  );
  await factory.waitForDeployment();
  console.log(`HeatMarketFactory → ${await factory.getAddress()}`);

  // Mint plenty of KAI for the deployer (insurance seeding + faucet headroom).
  await (await kai.mint(deployer.address, ethers.parseEther("100000000"))).wait();

  type MarketRecord = Seed & { address: string };
  const markets: MarketRecord[] = [];

  for (const seed of SEEDS) {
    const tx = await factory.createMarket(
      seed.subject,
      seed.category,
      seed.imageUrl,
      ethers.parseEther(seed.initialPrice)
    );
    const receipt = await tx.wait();
    const event = receipt!.logs
      .map((l) => {
        try {
          return factory.interface.parseLog(l as any);
        } catch {
          return null;
        }
      })
      .find((e) => e?.name === "MarketCreated");
    const marketAddr = event!.args.market as string;

    // Seed insurance fund so profitable trades have a counterparty pool.
    const market = await ethers.getContractAt("HeatMarket", marketAddr);
    await (await kai.approve(marketAddr, INSURANCE_PER_MARKET)).wait();
    await (await market.fundInsurance(INSURANCE_PER_MARKET)).wait();

    console.log(`  market: ${seed.subject.padEnd(18)} → ${marketAddr}`);
    markets.push({ ...seed, address: marketAddr });
  }

  const out = {
    chainId: 31337,
    kai: await kai.getAddress(),
    factory: await factory.getAddress(),
    oracle: deployer.address,
    deployer: deployer.address,
    markets,
  };

  // Write addresses file for both the local Hardhat repo and the Next.js app.
  const localPath = path.join(__dirname, "..", "addresses.local.json");
  fs.writeFileSync(localPath, JSON.stringify(out, null, 2));
  console.log(`Wrote ${localPath}`);

  const frontendDir = path.join(__dirname, "..", "..", "src", "app", "lib");
  if (fs.existsSync(frontendDir)) {
    const frontPath = path.join(frontendDir, "addresses.local.json");
    fs.writeFileSync(frontPath, JSON.stringify(out, null, 2));
    console.log(`Wrote ${frontPath}`);

    // Also refresh ABIs so a contract change is fully picked up by the frontend.
    const abis: Record<string, unknown> = {};
    for (const name of ["KAIToken", "HeatMarket", "HeatMarketFactory"]) {
      const artifactPath = path.join(
        __dirname,
        "..",
        "artifacts",
        "contracts",
        `${name}.sol`,
        `${name}.json`
      );
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
      abis[name] = artifact.abi;
    }
    const abiPath = path.join(frontendDir, "abi.json");
    fs.writeFileSync(abiPath, JSON.stringify(abis, null, 2));
    console.log(`Wrote ${abiPath}`);
  } else {
    console.log(`(skipping frontend copy; ${frontendDir} not present yet)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

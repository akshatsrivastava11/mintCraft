# MintCraft — Register, Monetize & Mint AI Models on Solana

> **Tagline:** Register AI models, monetize usage, and mint AI‑generated content as NFTs — all on Solana.

MintCraft is a decentralized marketplace where AI generates content (art, music, text, code) that's instantly minted as NFTs on Solana, with built‑in ownership tracking and monetization. Users can also register their own AI models and earn from usage fees.

---


## Features

* **Model Registry** — Creators register AI models on‑chain with metadata, pricing, and payout addresses.
* **Usage Metering** — Every model invocation emits a verifiable usage record; fees are split to model owners.
* **Instant Minting** — Generated outputs can be minted standard NFTs with proper attribution.
* **Marketplace** — Browse models, preview capabilities, invoke with inputs, and purchase outputs.
* **Attribution & Provenance** — On‑chain links from NFT → prompt → model version → signer to verify origin.
* **Programmable Fees** — Usage fees, platform fees, and royalty settings configurable per model.
* **Creator Earnings** — Automatic distribution to the model owner wallet(s).

## Tech Stack

* **Blockchain:** Solana • Rust • Anchor
* **Web:** Next.js • TypeScript • Tailwind CSS
* **Backend:** Express • tRPC
* **Data:** Prisma • PostgreSQL
* **Storage:** IPFS (gateway/pinning of choice)
* **Tooling:** codama (Solana codegen) • zod (runtime schemas)

## Demo 
https://vimeo.com/1108440671?share=copy

---

## Architecture

```
           +-------------------+                 +-------------------+
           |  Next.js Client   |  tRPC (HTTP)    |    Express API    |
           |  Tailwind + TS    +---------------->+  tRPC Router      |
           +---------+---------+                 +-----+-------------+
                     |                                   |
                     |                                   | Prisma
                     |                                   v
                     |                            +-------------+
                     |                            | PostgreSQL  |
                     |                            +------+------+
                     |                                   |
                     |   Solana Web3 / Anchor            |
                     v                                   |
             +-------+--------+                          |
             |  Anchor Prog   |<-------------------------+
             |  (Model/NFT)   |
             +-------+--------+
                     |
                     | Asset CIDs
                     v
               +-----+-----+
               |   IPFS    |
               +-----------+
```

**High‑level flow**

1. Creator registers a **Model** on‑chain with price, payout address, and metadata (includes IPFS CID for docs/cards).
2. User invokes a model via the API; backend computes price, takes payment (on‑chain), and records a **Usage**.
3. Output artifact is uploaded to IPFS; user can **Mint** it as an NFT with attribution to the model & prompt.
4. Royalties/fees settle to creator and platform wallets.

---

## Monetization & Royalties

* **Usage Fee:** Set per model (e.g., lamports per prompt ).
* **Platform Fee:** Percentage of usage fee routed to `treasury` from `GlobalState`.
* **Creator Royalty:** Set on minted NFTs via metadata; secondary sales route royalties using standard marketplaces.

---

## Getting Started

### Prerequisites

* Node.js >= 18, pnpm or npm
* Rust toolchain, Solana CLI, Anchor CLI
* PostgreSQL >= 14
* An IPFS node or pinning service account


### Install & Bootstrap

```bash
# Clone
git clone https://github.com/yourname/mintcraft
cd mintcraft

# Install (pnpm recommended)
pnpm install

# Anchor deps
anchor --version   # ensure installed
solana --version   # ensure installed
```

### Run Locally

**1) Start local validator (optional)**

```bash
solana-test-validator --reset
```

**2) Build & deploy program**
For every individual programs 
```bash
cd programs/programName
anchor build
anchor deploy  # writes program ID to target/idl and Anchor.toml
```

**3) Database**

```bash
# In project root
pnpm prisma generate
pnpm prisma migrate dev
```

**4) Server (Express + tRPC)**

```bash
cd server
pnpm dev
```

**5) App (Next.js)**

```bash
cd ../app
pnpm dev
```

Open **[http://localhost:3000](http://localhost:3000)**.

---

## Contributing

PRs welcome! Please open an issue to discuss substantial changes.

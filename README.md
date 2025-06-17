# HamsterSwap 🐹🔄

<br />
<p align="center">
  <img src="https://cavies.xyz/assets/images/logo.png" alt="CaviesLabs" />
</p>

<h3 align="center">
  <strong>Decentralized P2P Token Marketplace - Trade Directly with Other Users</strong>
</h3>

<p align="center">
     <a href="https://swap.hamsterbox.xyz">
        Launch DApp
    </a> |
    <a href="https://cavies.xyz/">
        About Cavies
    </a>
</p>

<p align="center">
  <a href="https://github.com/CaviesLabs/hamsterswap/">
    <img alt="GitHub Repository Stars Count" src="https://img.shields.io/github/stars/CaviesLabs/hamsterswap?style=social" />
  </a>
    <a href="https://twitter.com/CaviesLabs">
        <img alt="Follow Us on Twitter" src="https://img.shields.io/twitter/follow/CaviesLabs?style=social" />
    </a>
    <a href="https://linkedin.com/company/cavieslabs">
        <img alt="Follow Us on LinkedIn" src="https://img.shields.io/badge/LinkedIn-Follow-black?style=social&logo=linkedin" />
    </a>
</p>

<p align="center">
    <a href="#">
        <img alt="Build Status" src="https://build.cavies.xyz/buildStatus/icon?job=hamsterswap%2Fhamsterswap-backend%2Fdevelop" />
    </a>
    <a href="https://github.com/CaviesLabs/hamsterswap">
        <img alt="License" src="https://img.shields.io/github/license/CaviesLabs/hamsterswap" />
    </a>
    <a href="https://github.com/CaviesLabs/hamsterswap/pulls">
        <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" />
    </a>
</p>

---

HamsterSwap is a decentralized peer-to-peer marketplace built on Solana that enables users to create swap proposals and trade tokens directly with each other. Users can offer their tokens in exchange for specific tokens they want, creating a trustless P2P trading environment without the need for traditional liquidity pools.

## **What we deliver out-of-the-box** 📦

✅ **P2P Swap Proposals** - Create swap offers for any token pair  
✅ **Trustless Trading** - Secure escrow system with smart contracts  
✅ **Browse Marketplace** - Discover swap proposals from other users  
✅ **Multi-Token Support** - Trade any SPL tokens on Solana  
✅ **Flexible Terms** - Set your own rates and expiration times  
✅ **Instant Settlement** - Atomic swaps with immediate finality  
✅ **User Reputation** - Build trust through trading history  
✅ **Mobile Responsive** - Trade on any device, anywhere  

## **How It Works** 🔄

1. **Create Proposal** - Offer your tokens in exchange for desired tokens
2. **Set Terms** - Define exchange rates, quantities, and expiration
3. **Deposit Collateral** - Your tokens are held in escrow
4. **Get Matched** - Other users can browse and accept your proposal
5. **Execute Trade** - Smart contract handles the atomic swap
6. **Complete** - Both parties receive their tokens instantly

## **Architecture Overview** 🏗️

This monorepo contains three main components:

### **hamsterswap-program** 🦀
- **Solana smart contracts** written in Rust using the Anchor framework
- Handles swap proposals, escrow management, and atomic execution
- Deployed on Solana mainnet with program ID: `EdeRcNsVGU1s1NXZZo8FhLD8iePxvoUCdbvwVGnj778f`

### **hamsterswap-backend** ⚙️
- **NestJS-based API server** providing proposal indexing and matching
- Real-time proposal feeds and search functionality
- User reputation system and trading history
- Notification system for proposal updates

### **hamsterswap-frontend** 🖥️
- **Next.js React application** with intuitive marketplace UI
- Wallet integration (Phantom, Solflare, Ledger, etc.)
- Proposal creation and browsing interface
- User dashboard and trading history

## **Our Tech Stack** 🛠

**Smart Contracts & Blockchain**
- [Rust](https://rustup.rs/) - Systems programming language for smart contracts
- [Anchor](https://anchor-lang.com/) - Solana development framework
- [Solana](https://solana.com/) - High-performance blockchain

**Backend Services**
- [Node.js](https://nodejs.org/) - Runtime environment
- [NestJS](https://nestjs.com/) - Scalable backend framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe development
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Redis](https://redis.io/) - Caching and session management

**Frontend Application**
- [React](https://reactjs.org/) - UI library
- [Next.js](https://nextjs.org/) - Full-stack React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe development
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter) - Wallet integration

**Development & DevOps**
- [Yarn](https://yarnpkg.com/) - Package manager
- [Docker](https://www.docker.com/) - Containerization
- [Jenkins](https://www.jenkins.io/) - CI/CD pipeline

## **Getting Started** 🚀

### **Prerequisites** 📋

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Yarn](https://yarnpkg.com/) package manager
- [Rust](https://rustup.rs/) (for smart contract development)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor CLI](https://book.anchor-lang.com/getting_started/installation.html)

### **Step 1: Clone the Repository** 🧰

```bash
git clone https://github.com/CaviesLabs/hamsterswap.git
cd hamsterswap
```

### **Step 2: Install Dependencies** ⏳

```bash
# Install dependencies for all workspaces
yarn install

# Or install individually for each component
cd hamsterswap-frontend && yarn install
cd hamsterswap-backend && yarn install  
cd hamsterswap-program && yarn install
```

### **Step 3: Environment Configuration** ⚙️

1. **Frontend Configuration**
   ```bash
   cd hamsterswap-frontend
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

2. **Backend Configuration**
   ```bash
   cd hamsterswap-backend
   cp example.config.json config.json
   # Edit config.json with your settings
   ```

3. **Program Configuration**
   ```bash
   cd hamsterswap-program
   # Configure Anchor.toml for your deployment target
   ```

### **Step 4: Run Development Environment** 🔥

**Start the Backend Server:**
```bash
cd hamsterswap-backend
yarn start:dev
```

**Start the Frontend Application:**
```bash
cd hamsterswap-frontend
yarn dev
```

**Build and Test Smart Contracts:**
```bash
cd hamsterswap-program
anchor build
anchor test
```

### **Step 5: Access the Application** 🌐

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/api-docs

## **Smart Contract Addresses** 📜

| Network | Program ID |
|---------|------------|
| **Mainnet** | `EdeRcNsVGU1s1NXZZo8FhLD8iePxvoUCdbvwVGnj778f` |
| **Devnet** | `EdeRcNsVGU1s1NXZZo8FhLD8iePxvoUCdbvwVGnj778f` |

## **API Documentation** 📚

Our REST API provides comprehensive access to:
- Active swap proposals and marketplace listings
- User trading history and reputation scores  
- Proposal search and filtering capabilities
- Real-time proposal status updates

Visit our [API documentation](https://api-docs.hamsterswap.xyz) for detailed endpoints and examples.

## **Testing** 🧪

### **Frontend Testing**
```bash
cd hamsterswap-frontend
yarn test
yarn test:e2e
```

### **Backend Testing**
```bash
cd hamsterswap-backend
yarn test
yarn test:e2e
```

### **Smart Contract Testing**
```bash
cd hamsterswap-program
anchor test
```

## **Deployment** 🚀

### **Frontend Deployment**
```bash
cd hamsterswap-frontend
yarn build
yarn start
```

### **Backend Deployment**
```bash
cd hamsterswap-backend
yarn build
yarn start:prod
```

### **Smart Contract Deployment**
```bash
cd hamsterswap-program
anchor build
anchor deploy --provider.cluster mainnet
```

## **Contributing** 🤝

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`  
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### **Development Guidelines**

- Follow existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

### **Reporting Issues** 🐛

Found a bug or have a feature request? Please [create an issue](https://github.com/CaviesLabs/hamsterswap/issues/new/choose) on GitHub.

## **Security** 🔒

Security is our top priority. Our smart contracts have been audited by leading security firms. If you discover a security vulnerability, please report it responsibly:

- **Email**: security@cavies.xyz
- **Bug Bounty Program**: Coming soon

## **Roadmap** 🗺️

- [ ] **Q1 2025**: Advanced proposal filtering and search
- [ ] **Q2 2025**: Multi-chain marketplace expansion  
- [ ] **Q3 2025**: Reputation system and user ratings
- [ ] **Q4 2025**: Mobile application and push notifications

## **Community** 👥

Join our growing community:

- **Twitter**: [@CaviesLabs](https://twitter.com/CaviesLabs)
- **Discord**: [Join our server](https://discord.gg/cavieslabs)
- **Telegram**: [HamsterSwap Community](https://t.me/hamsterswap)
- **LinkedIn**: [CaviesLabs](https://linkedin.com/company/cavieslabs)

## **License** 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## **Support** ❤️

**HamsterSwap is and always will be Open Source, released under MIT Licence.**

How you can help us:
- **⭐ Star this repository** if you find it useful
- **🐛 Report bugs** and help us improve  
- **💡 Suggest features** to make HamsterSwap better
- **📢 Spread the word** - tell your friends and colleagues
- **🤝 Contribute** - check out our contribution guidelines

---

<p align="center">
  <strong>Built with ❤️ by the CaviesLabs Team</strong>
</p>

<p align="center">
  <a href="https://cavies.xyz">
    <img src="https://img.shields.io/badge/Made%20by-CaviesLabs-blue?style=flat-square" alt="Made by CaviesLabs" />
  </a>
</p>

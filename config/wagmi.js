import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";

// Define localhost chain manually
const localhost = {
  id: 1337,
  name: 'Localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: { name: 'Localhost', url: 'http://localhost:8545' },
  },
  testnet: true,
};

export const config = getDefaultConfig({
  appName: "Play-to-Earn Blockchain Game",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [localhost],
  transports: {
    [localhost.id]: http("http://127.0.0.1:8545"),
  },
  ssr: true,
});

export { localhost };

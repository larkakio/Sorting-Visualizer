import { createConfig, http, createStorage, cookieStorage } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { injected, walletConnect, baseAccount } from "wagmi/connectors";

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

const wcId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export const config = createConfig({
  chains: [base, mainnet],
  connectors: [
    injected(),
    baseAccount({ appName: "Neon Lattice Sorter" }),
    ...(wcId
      ? [
          walletConnect({
            projectId: wcId,
            showQrModal: true,
            metadata: {
              name: "Neon Lattice Sorter",
              description: "Cyberpunk sorting game on Base",
              url:
                process.env.NEXT_PUBLIC_SITE_URL ?? "https://localhost:3000",
              icons: [
                new URL(
                  "/app-icon.jpg",
                  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
                ).href,
              ],
            },
          }),
        ]
      : []),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
});

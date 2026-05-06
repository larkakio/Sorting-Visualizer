import { createConfig, http, createStorage, cookieStorage } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { injected, walletConnect, baseAccount } from "wagmi/connectors";

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

const wcId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

/** Production host; used when NEXT_PUBLIC_SITE_URL is unset (e.g. WalletConnect metadata). */
const defaultSiteUrl = "https://sorting-visualizer-six-chi.vercel.app";

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
              url: process.env.NEXT_PUBLIC_SITE_URL ?? defaultSiteUrl,
              icons: [
                new URL(
                  "/app-icon.jpg",
                  process.env.NEXT_PUBLIC_SITE_URL ?? defaultSiteUrl,
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

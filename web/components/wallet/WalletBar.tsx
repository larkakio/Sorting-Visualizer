"use client";

import {
  useAccount,
  useChainId,
  useConnect,
  useConnectors,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

function useBodyScrollLock(active: boolean) {
  const prev = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (!active) return;
    prev.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev.current ?? "";
    };
  }, [active]);
}

export function WalletBar({ className = "" }: { className?: string }) {
  const { address, isConnected, status } = useAccount();
  const chainId = useChainId();
  const connectors = useConnectors();
  const { connectAsync, isPending: isConnectPending } = useConnect();
  const { disconnectAsync, isPending: isDisconnectPending } =
    useDisconnect();
  const { switchChainAsync, isPending: isSwitchPending } = useSwitchChain();

  const [mounted, setMounted] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  useBodyScrollLock(sheetOpen);

  const short =
    address?.slice(0, 6) && address?.slice(-4)
      ? `${address.slice(0, 6)}…${address.slice(-4)}`
      : "";

  async function onPickConnector(id: string) {
    const c = connectors.find((x) => x.id === id);
    if (!c) return;
    await connectAsync({ connector: c, chainId: base.id });
    setSheetOpen(false);
  }

  const wrongNetwork = isConnected && chainId !== base.id;

  let sheet: ReactNode = null;
  if (mounted && sheetOpen) {
    sheet = createPortal(
      <div
        className="fixed inset-0 z-[9999] flex flex-col justify-end bg-black/70 backdrop-blur-sm"
        role="presentation"
        onClick={() => setSheetOpen(false)}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Connect wallet"
          className="max-h-[min(70vh,520px)] w-full overflow-hidden rounded-t-2xl border border-[var(--neon-cyan-dim)] bg-[#070b12] shadow-[0_0_40px_rgba(0,255,255,0.15)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="font-ui text-sm font-semibold tracking-wide text-white/90">
              Connect wallet
            </span>
            <button
              type="button"
              className="rounded-lg px-3 py-1 text-sm text-[var(--neon-magenta)] hover:bg-white/5"
              onClick={() => setSheetOpen(false)}
              aria-label="Close wallet list"
            >
              Close
            </button>
          </div>
          <div className="max-h-[55vh] space-y-2 overflow-y-auto px-3 py-3 mb-[env(safe-area-inset-bottom)]">
            {connectors.length === 0 ? (
              <p className="font-ui px-1 text-sm text-white/60">
                No browser wallet detected. Open in the Base App or a wallet
                browser, or add WalletConnect in project settings.
              </p>
            ) : (
              connectors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  disabled={isConnectPending}
                  className="font-ui w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/90 transition hover:border-[var(--neon-cyan)] hover:bg-white/10 disabled:opacity-50"
                  onClick={() => onPickConnector(c.id)}
                >
                  <span className="font-medium">{c.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  return (
    <header
      className={`flex flex-wrap items-center gap-3 border-b border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md ${className}`}
    >
      <div className="min-w-0 flex-1">
        <p className="font-display text-xs uppercase tracking-[0.25em] text-[var(--neon-cyan)]">
          Base
        </p>
        <p className="font-ui truncate text-sm text-white/80">Wallet</p>
      </div>

      {wrongNetwork && (
        <div className="flex w-full basis-full items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 sm:basis-auto sm:w-auto">
          <span className="font-ui text-xs text-amber-200">Wrong network</span>
          <button
            type="button"
            disabled={isSwitchPending}
            className="font-ui rounded-lg bg-amber-500/90 px-2 py-1 text-xs font-semibold text-black disabled:opacity-50"
            onClick={() => switchChainAsync({ chainId: base.id })}
          >
            Switch to Base
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <span className="font-mono text-xs text-white/70">{short}</span>
            <button
              type="button"
              disabled={isDisconnectPending}
              className="font-ui rounded-xl border border-white/20 px-3 py-2 text-xs text-white/80 hover:bg-white/10 disabled:opacity-50"
              onClick={() => disconnectAsync()}
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={status === "connecting" || isConnectPending}
            className="font-ui rounded-xl bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-violet)] px-4 py-2 text-sm font-bold text-black shadow-[0_0_20px_rgba(0,255,255,0.4)] disabled:opacity-50"
            onClick={() => setSheetOpen(true)}
          >
            Connect wallet
          </button>
        )}
      </div>
      {sheet}
    </header>
  );
}

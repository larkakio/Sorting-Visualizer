import { CheckInPanel } from "@/components/check-in/CheckInPanel";
import { SortingGame } from "@/components/game/SortingGame";
import { WalletBar } from "@/components/wallet/WalletBar";

export default function Home() {
  return (
    <div className="neon-page-bg holo-drift flex min-h-dvh flex-col">
      <WalletBar />
      <main className="mx-auto w-full max-w-lg flex-1 space-y-8 overflow-y-auto overflow-x-hidden px-4 pb-10 pt-6">
        <header className="space-y-2 text-center">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[var(--neon-cyan)]">
            Base // Sorting visualizer
          </p>
          <h1 className="font-display text-3xl font-black leading-tight text-white [text-shadow:0_0_40px_rgba(0,245,255,0.35)] sm:text-4xl">
            Neon Lattice Sorter
          </h1>
          <p className="font-ui text-sm text-white/55">
            Reorder the energy columns — mobile swipes only, ascending charge.
          </p>
        </header>

        <SortingGame />

        <CheckInPanel />

        <footer className="font-ui pb-[env(safe-area-inset-bottom)] text-center text-xs text-white/35">
          English UI — standard web + wallet for Base App.
        </footer>
      </main>
    </div>
  );
}

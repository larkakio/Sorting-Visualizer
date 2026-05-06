"use client";

import { base } from "wagmi/chains";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { useState } from "react";
import { checkInAbi } from "@/lib/abi/checkIn";
import { getBuilderDataSuffix } from "@/lib/builderSuffix";

const zero = "0x0000000000000000000000000000000000000000" as const;

function contractAddress(): `0x${string}` | undefined {
  const raw = process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS;
  if (!raw || raw === zero) return undefined;
  return raw as `0x${string}`;
}

export function CheckInPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const addr = contractAddress();
  const [lastError, setLastError] = useState<string | null>(null);

  const { data: lastDay, refetch } = useReadContract({
    chainId: base.id,
    address: addr,
    abi: checkInAbi,
    functionName: "lastCheckInDay",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(addr && address) },
  });

  const { data: streak } = useReadContract({
    chainId: base.id,
    address: addr,
    abi: checkInAbi,
    functionName: "streak",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(addr && address) },
  });

  async function onCheckIn() {
    setLastError(null);
    if (!addr || !address) return;
    const baseId = base.id;
    try {
      if (chainId !== baseId) {
        await switchChainAsync({ chainId: baseId });
      }
      const dataSuffix = getBuilderDataSuffix();
      await writeContractAsync({
        address: addr,
        abi: checkInAbi,
        functionName: "checkIn",
        chainId: baseId,
        value: BigInt(0),
        ...(dataSuffix ? { dataSuffix } : {}),
      });
      await refetch();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      setLastError(msg);
    }
  }

  const busy = isSwitching || isWriting;

  return (
    <section className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
      <h2 className="font-display text-lg font-bold tracking-wide text-white">
        Daily check-in
      </h2>
      <p className="font-ui mt-1 text-sm text-white/60">
        One on-chain check-in per calendar day on Base. You only pay L2 gas —
        no fee to the contract.
      </p>

      {!addr ? (
        <p className="font-ui mt-3 text-sm text-amber-200/90">
          Set <code className="text-xs">NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS</code>{" "}
          after deploying the CheckIn contract.
        </p>
      ) : null}

      <dl className="font-ui mt-4 grid grid-cols-2 gap-2 text-sm">
        <dt className="text-white/50">Streak</dt>
        <dd className="text-[var(--neon-cyan)]">
          {streak != null ? String(streak) : "—"}
        </dd>
        <dt className="text-white/50">Last day index</dt>
        <dd className="text-white/80">
          {lastDay != null ? String(lastDay) : "—"}
        </dd>
      </dl>

      {lastError ? (
        <p className="font-ui mt-3 text-sm text-red-300/90">{lastError}</p>
      ) : null}

      <button
        type="button"
        disabled={!isConnected || !addr || busy}
        className="font-ui mt-4 w-full rounded-xl bg-gradient-to-r from-[var(--neon-violet)] to-[var(--neon-magenta)] py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(255,0,255,0.25)] disabled:opacity-40"
        onClick={() => void onCheckIn()}
      >
        {busy ? "Working…" : "Check in on Base"}
      </button>
    </section>
  );
}

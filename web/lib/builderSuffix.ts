import { Attribution } from "ox/erc8021";
import type { Hex } from "viem";

export function getBuilderDataSuffix(): Hex | undefined {
  const override = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX;
  if (override && /^0x[0-9a-fA-F]+$/.test(override)) {
    return override as Hex;
  }

  const raw = process.env.NEXT_PUBLIC_BUILDER_CODE?.trim();
  if (!raw) return undefined;

  const code = raw.startsWith("bc_") ? raw : raw;
  return Attribution.toDataSuffix({ codes: [code] });
}

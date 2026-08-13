export type PostToken = { value: string; kind: "text" | "mention" | "tag" | "url" };

export function getPostUrlMeta(value: string) {
  try {
    const { hostname, pathname } = new URL(value);
    const host = hostname.toLowerCase();
    const isSolanaExplorer = /(^|\.)(explorer\.solana\.com|solscan\.io|solana\.fm|xray\.helius\.xyz)$/.test(host);
    const isEvmExplorer = /(etherscan|basescan|arbiscan|polygonscan|bscscan|snowtrace|ftmscan|lineascan|scrollscan|zksync|mantlescan|blastscan|blockscout|routescan|oklink|sonicscan|celoscan|gnosisscan)/.test(host);
    const isExplorerRoute = /\/(tx|address|token|block|account|accounts)(\/|$)/i.test(pathname);
    const isExplorer = isSolanaExplorer || isEvmExplorer || (isExplorerRoute && /(explorer|scan)/.test(host));
    return { isExplorer, label: isSolanaExplorer ? "Open Solana explorer" : isExplorer ? "Open blockchain explorer" : "Open external link" };
  } catch {
    return { isExplorer: false, label: "Open external link" };
  }
}

export function tokenizePostBody(body: string): PostToken[] {
  return body.split(/(https?:\/\/[^\s<>"']*[^\s<>"'.,!?;:)\]}>]|[@#][a-zA-Z0-9_]+(?:[.-][a-zA-Z0-9_]+)*)/g).filter(Boolean).map((value) => ({
    value,
    kind: /^https?:\/\//i.test(value) ? "url" : value.startsWith("@") ? "mention" : value.startsWith("#") ? "tag" : "text",
  }));
}

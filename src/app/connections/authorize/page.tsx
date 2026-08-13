import { AuthGate } from "@/modules/auth/components/AuthGate";
import { OAuthConsentView } from "@/modules/auth/components/OAuthConsentView";

export default async function OAuthAuthorizePage({ searchParams }: { searchParams: Promise<{ request_id?: string }> }) {
  const { request_id: requestId = "" } = await searchParams;
  const returnPath = `/connections/authorize${requestId ? `?request_id=${encodeURIComponent(requestId)}` : ""}`;
  return <AuthGate requireOnboarding={false} returnPath={returnPath}><OAuthConsentView requestId={requestId} /></AuthGate>;
}

import { apiRequest, mutationHeaders } from "@/lib/api/client";

export type InterestOption = { slug: string; label: string };
export type OnboardingInput = { displayName: string; username: string; birthDate: string; bio: string; interests: string[] };

export async function getInterests() {
  const response = await apiRequest<{ data: { interests: InterestOption[] } }>("/api/v1/users/interests");
  return response.data.interests;
}

export async function getUsernameAvailability(username: string) {
  const response = await apiRequest<{ data: { username: string; available: boolean } }>(`/api/v1/users/username-availability?username=${encodeURIComponent(username)}`);
  return response.data;
}

export function completeOnboarding(input: OnboardingInput) {
  const version = process.env.NEXT_PUBLIC_POLICY_VERSION ?? "2026-08-10";
  return apiRequest<{ data: { user: unknown } }>("/api/v1/users/me/onboarding", {
    method: "POST",
    headers: mutationHeaders(),
    body: JSON.stringify({
      display_name: input.displayName,
      username: input.username,
      birth_date: input.birthDate,
      bio: input.bio,
      interest_slugs: input.interests,
      policy_consents: [{ type: "terms", version }, { type: "privacy", version }],
    }),
  });
}

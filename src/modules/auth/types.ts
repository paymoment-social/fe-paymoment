export type SessionUser = {
  id: string;
  email: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  roles: Array<"moderator" | "admin">;
  entitlement: {
    verified: boolean;
    verified_at: string | null;
    points_balance: number;
    verified_threshold: number;
  };
};

export type SessionResponse = { data: { user: SessionUser }; meta: { request_id: string } };

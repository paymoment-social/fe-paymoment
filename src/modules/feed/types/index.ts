export type FeedAuthor = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified?: boolean;
  bio?: string;
  followers: number;
  following: number;
  box: number;
  relationship?: "none" | "pending" | "following" | "blocked" | "muted";
};

export type FeedPost = {
  id: string;
  author: FeedAuthor;
  body: string;
  tag?: string;
  tags?: string[];
  mentions?: string[];
  createdAt: string;
  createdAtValue?: string;
  likes: number;
  replies: number;
  reposts: number;
  reward: number;
  version?: number;
  views?: number;
  liked?: boolean;
  bookmarked?: boolean;
  reposted?: boolean;
  pinned?: boolean;
  rewardClaimed?: boolean;
  isOwner?: boolean;
  media?: string[];
  mediaTypes?: string[];
  card?: { eyebrow: string; title: string; description: string };
  article?: { eyebrow: string; title: string; description: string; contentHtml: string; banner?: { image?: string; color: string; position: "left" | "center" | "right" }; bannerMediaId?: string; draftVersion?: number; status?: "draft" | "published" };
  poll?: {
    question: string;
    status: "open" | "closed";
    voterVisibility: "public" | "anonymous";
    allowVoteChange: boolean;
    totalVotes: number;
    viewerOptionId?: string;
    endsAt?: string;
    options: { id: string; label: string; voterIds: string[]; voteCount: number }[];
  };
  quotedPost?: FeedPost;
  activityType?: "post" | "repost";
  activityAt?: string;
  repostedBy?: FeedAuthor;
};

export type CreateMomentInput = { body: string; media?: string };

export type FeedReply = {
  id: string;
  postId: string;
  parentId?: string;
  author: FeedAuthor;
  body: string;
  createdAt: string;
  likes: number;
  media?: string;
  liked?: boolean;
  isOwner?: boolean;
};

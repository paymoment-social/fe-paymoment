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
};

export type FeedPost = {
  id: string;
  author: FeedAuthor;
  body: string;
  tag?: string;
  createdAt: string;
  likes: number;
  replies: number;
  reposts: number;
  reward: number;
  media?: string[];
  card?: { eyebrow: string; title: string; description: string };
  quotedPost?: FeedPost;
};

export type CreateMomentInput = { body: string; media?: string };

export type FeedReply = {
  id: string;
  postId: string;
  author: FeedAuthor;
  body: string;
  createdAt: string;
  likes: number;
  media?: string;
};

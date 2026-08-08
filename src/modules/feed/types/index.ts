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
  tags?: string[];
  mentions?: string[];
  createdAt: string;
  likes: number;
  replies: number;
  reposts: number;
  reward: number;
  media?: string[];
  card?: { eyebrow: string; title: string; description: string };
  article?: { eyebrow: string; title: string; description: string; contentHtml: string; banner?: { image?: string; color: string; position: "left" | "center" | "right" } };
  poll?: { question: string; options: { id: string; label: string; voterIds: string[] }[] };
  quotedPost?: FeedPost;
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
};

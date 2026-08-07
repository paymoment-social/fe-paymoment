import type { FeedAuthor, FeedPost, FeedReply } from "../types";

export const CURRENT_USER: FeedAuthor = {
  id: "me",
  name: "Bayu Mahardika",
  handle: "bayu.builds",
  avatar: "https://i.pravatar.cc/160?img=12",
  verified: true,
  bio: "Building useful things at the intersection of product, payments, and AI.",
  followers: 1840,
  following: 286,
  box: 1250,
};

export const PEOPLE: FeedAuthor[] = [
  { id: "u1", name: "Taufik Hidayat", handle: "taufik.dev", avatar: "https://i.pravatar.cc/160?img=11", verified: true, followers: 9830, following: 410, box: 2340 },
  { id: "u2", name: "Anin Nurhayani", handle: "aninnurhayani", avatar: "https://i.pravatar.cc/160?img=47", verified: true, followers: 6420, following: 322, box: 1890 },
  { id: "u3", name: "Tokyo", handle: "tokyoo920", avatar: "https://i.pravatar.cc/160?img=8", verified: true, followers: 4300, following: 201, box: 1250 },
  { id: "u4", name: "Rasyid", handle: "rasyid_dzn", avatar: "https://i.pravatar.cc/160?img=14", followers: 2940, following: 532, box: 980 },
  { id: "u5", name: "Jo Developer", handle: "developer.jo", avatar: "https://i.pravatar.cc/160?img=33", followers: 2100, following: 189, box: 720 },
];

export const FEED_QUERY_KEY = ["paymoment", "feed"] as const;

export const SEED_REPLIES: Record<string, FeedReply[]> = {
  p1: [
    { id: "p1-r1", postId: "p1", author: PEOPLE[0], body: "This is exactly the workflow small teams need. Paying suppliers without switching tabs is a huge win.", createdAt: "1h", likes: 8 },
    { id: "p1-r2", postId: "p1", author: PEOPLE[1], body: "The approval guardrails are the part I am most excited about. Fast, but still controlled.", createdAt: "48m", likes: 5 },
    { id: "p1-r3", postId: "p1", author: PEOPLE[3], body: "Would love to see recurring invoice support next.", createdAt: "31m", likes: 3, media: "/moments/paybox-team.jpg" },
    { id: "p1-r4", postId: "p1", author: PEOPLE[4], body: "AI payments finally feel practical instead of just a demo.", createdAt: "12m", likes: 2 },
  ],
  p2: [
    { id: "p2-r1", postId: "p2", author: PEOPLE[2], body: "A wallet with spending policies is the missing primitive for useful agents.", createdAt: "3h", likes: 14 },
    { id: "p2-r2", postId: "p2", author: PEOPLE[0], body: "The activity history makes this much easier to trust.", createdAt: "2h", likes: 7 },
    { id: "p2-r3", postId: "p2", author: PEOPLE[3], body: "This would save our finance team so much repetitive work.", createdAt: "1h", likes: 4 },
  ],
  p3: [
    { id: "p3-r1", postId: "p3", author: PEOPLE[1], body: "Invisible payments are the best payments. Great work!", createdAt: "5h", likes: 9 },
    { id: "p3-r2", postId: "p3", author: PEOPLE[4], body: "The new checkout feels noticeably faster on mobile.", createdAt: "4h", likes: 6 },
  ],
};

export const SEED_POSTS: FeedPost[] = [
  {
    id: "p1",
    author: PEOPLE[2],
    body: "PayBox makes paying invoices so effortless.\nI just asked AI to pay my supplier and it’s done in seconds.\nNo switching apps. No hassle.\nThis is the future of business payments. 🚀",
    tag: "#PayBoxMoment",
    createdAt: "2h",
    likes: 45,
    replies: SEED_REPLIES.p1.length,
    reposts: 8,
    reward: 10,
    media: [
      "/moments/paybox-checkout.jpg",
      "/moments/paybox-card.jpg",
      "/moments/paybox-team.jpg",
    ],
  },
  {
    id: "p2",
    author: PEOPLE[1],
    body: "I love the idea of PayBox being my AI-powered financial assistant. From tracking expenses to paying, everything in one place. Super simple, super powerful. 🔥",
    createdAt: "5h",
    likes: 128,
    replies: SEED_REPLIES.p2.length,
    reposts: 19,
    reward: 18,
    card: {
      eyebrow: "PayBox for AI agents",
      title: "Give your agent a wallet it can actually use.",
      description: "Guardrails, approvals, and programmable spending—all in one secure workspace.",
    },
  },
  {
    id: "p3",
    author: PEOPLE[0],
    body: "Just shipped our fastest checkout yet. Payments should feel invisible so builders can focus on the product experience.",
    tag: "#BuildInPublic",
    createdAt: "8h",
    likes: 92,
    replies: SEED_REPLIES.p3.length,
    reposts: 11,
    reward: 14,
    media: ["/moments/paybox-dashboard.jpg"],
  },
];

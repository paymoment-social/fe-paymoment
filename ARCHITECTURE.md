# PayMoment architecture

PayMoment is a Next.js App Router modular monolith. It uses frontend feature micro-modules: each product capability owns its UI, state, data access, contracts, and helpers, while deployment remains one Next.js application.

```txt
src/
├─ app/                         # Thin framework entrypoints only
│  ├─ page.tsx                  # For-you route
│  ├─ (social)/[section]/       # Discover, messages, rewards, etc.
│  └─ (social)/post/[id]/       # Shareable moment detail
├─ components/ui/               # shadcn primitives shared by 2+ modules
├─ lib/                         # Framework/library-neutral shared helpers
├─ providers/                   # App-level Query and UI providers
└─ modules/
   ├─ shell/                    # Navigation and responsive three-column frame
   ├─ feed/                     # Moments, composer, reactions, social actions
   ├─ discover/                 # Search, people, and trending topics
   ├─ notifications/            # Activity and read state
   ├─ messages/                 # Conversations and virtualized messages
   ├─ rewards/                  # Box balance, catalog, and leaderboard
   ├─ profile/                  # Profile display and editing
   └─ bookmarks/                # Saved-moment filters and composition
```

Every product module follows this shape when the layer has a real job:

```txt
modules/<feature>/
├─ components/                  # Feature-owned views and UI
├─ hooks/                       # TanStack Query and feature orchestration
├─ context/                     # Ephemeral feature UI state
├─ services/                    # API boundary or mock transport
├─ store/                       # Persisted client state, only when required
├─ types/                       # Public feature contracts
├─ constants/                   # Query keys and stable feature data
├─ utils/                       # Pure feature-only helpers
└─ index.ts                     # The only supported cross-module entrypoint
```

## Dependency rules

1. `app` imports module public entrypoints and stays thin.
2. A module may import another module only through `@/modules/<feature>`.
3. Module internals never import from another module's `components`, `hooks`, `services`, or `store` path.
4. shadcn source lives in `components/ui`; product-specific composition stays inside its owning module.
5. TanStack Query owns server-like state. Zustand owns persisted low-cost interactions. Context owns temporary feature UI state.
6. Next.js App Router owns URL routing; TanStack Router is intentionally not added because two routers would duplicate responsibility.
7. A new folder is added only when it contains real behavior. Empty architecture ceremony is discouraged.

## Adding a feature

Create `modules/<feature>`, define its contract and public `index.ts`, keep the route page to one import, and expose only the smallest API required by other modules. Replace mock services with HTTP implementations without changing hooks or views whenever the returned contract stays the same.

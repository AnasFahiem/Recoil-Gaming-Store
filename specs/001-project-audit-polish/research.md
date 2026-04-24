# Research: Project Audit and Polish

## Code Review and Refactoring
- **Decision**: Use `next/image` to replace unoptimized `<img>` tags.
- **Rationale**: Next.js automatically optimizes images via `<Image />`, solving performance warnings from ESLint and Lighthouse.
- **Alternatives considered**: Continue using standard `<img>` tags and rely on external CDNs or manual compression (rejected due to Next.js providing a robust built-in solution).

## Performance Optimization
- **Decision**: Wrap key components in `React.memo`, `useMemo`, and `useCallback` and optimize the Cart Context dependency array.
- **Rationale**: The user complained about unnecessary re-renders. `useMemo` avoids recalculating complex derived states (like `total`), while fixing the dependency array in `src/contexts/cart-context.tsx` prevents constant hook firing.
- **Alternatives considered**: Migrating state to Zustand or Redux (rejected because Context is sufficient for now and migrating would take too long for an immediate fix).

## Backend/Full-Stack Audit
- **Decision**: Review Supabase policies and query caching.
- **Rationale**: The user specifically requested a full-stack audit. Optimizing `product-page-content.tsx` and the database connection is essential.
- **Alternatives considered**: Only focusing on frontend (rejected due to user clarification).

## UX/UI Polish
- **Decision**: Introduce `framer-motion` for micro-interactions.
- **Rationale**: The user wanted "premium and fluid" aesthetics. Framer Motion is already in the `package.json`, making it the easiest and most performant way to add staggered fade-ins and hover interactions.
- **Alternatives considered**: Pure CSS animations (rejected due to complexity with React mounting/unmounting).

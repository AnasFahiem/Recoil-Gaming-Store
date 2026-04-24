---
description: "Task list for Project Audit and Polish"
---

# Tasks: Project Audit and Polish

**Input**: Design documents from `specs/001-project-audit-polish/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify project readiness and lint configuration in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Update or install any required performance libraries (`framer-motion` check) in `package.json`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - System Maintainability and Quality Audit (Priority: P1) 🎯 MVP

**Goal**: Codebase refactored, free of anti-patterns, and deprecated code. Backend audit complete.

**Independent Test**: Can be fully tested by running automated linters, unit tests, and verifying the build succeeds.

### Implementation for User Story 1

- [ ] T003 [P] [US1] Replace `<img>` with `<Image>` component in `src/components/pages/product-page-content.tsx`
- [x] T004 [P] [US1] Replace `<img>` with `<Image>` component in `src/components/layout/background-effects.tsx`
- [ ] T005 [P] [US1] Replace `<img>` with `<Image>` component in `src/components/features/search-bar.tsx`
- [ ] T006 [P] [US1] Replace `<img>` with `<Image>` component in `src/components/features/cart-drawer.tsx`
- [ ] T007 [P] [US1] Replace `<img>` with `<Image>` component in `src/app/checkout/page.tsx`
- [ ] T008 [P] [US1] Replace `<img>` with `<Image>` component in `src/app/admin/product/[id]/page.tsx`
- [ ] T009 [P] [US1] Replace `<img>` with `<Image>` component in `src/app/user/page.tsx`
- [x] T010 [P] [US1] Replace `<img>` with `<Image>` component in `src/components/ui/logo.tsx`
- [ ] T011 [P] [US1] Fix missing `useEffect` dependency (`mergeGuestCartToUser`) in `src/contexts/cart-context.tsx`
- [ ] T012 [P] [US1] Audit Supabase Row Level Security policies (manual or automated check)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Deep Performance Optimization (Priority: P1)

**Goal**: Application loads instantly and responds smoothly without unnecessary re-renders.

**Independent Test**: Can be tested independently by running React Profiler and Lighthouse.

### Implementation for User Story 2

- [ ] T013 [P] [US2] Implement `React.memo` and `useMemo` optimizations in `src/components/pages/product-page-content.tsx`
- [ ] T014 [P] [US2] Implement `React.memo` and `useMemo` optimizations in `src/components/pages/shop-page-content.tsx`
- [ ] T015 [US2] Review and optimize data fetching logic and client-side caching in `src/components/pages/shop-page-content.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently without lag.

---

## Phase 5: User Story 3 - UX/UI Polish and Smoothness (Priority: P2)

**Goal**: UI is visually appealing, consistent, and fluid with subtle animations.

**Independent Test**: Visual inspection on desktop and mobile viewports.

### Implementation for User Story 3

- [ ] T016 [P] [US3] Add `framer-motion` stagger animations to grid in `src/components/pages/shop-page-content.tsx`
- [ ] T017 [P] [US3] Add `framer-motion` hover micro-interactions to buttons in `src/components/ui/container.tsx`
- [ ] T018 [P] [US3] Standardize padding and margins in `src/components/layout/navbar.tsx`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: User Story 4 - Feature Ideation and Expansion (Priority: P3)

**Goal**: Provide high-impact, innovative feature suggestions.

### Implementation for User Story 4

- [ ] T019 [P] [US4] Document the 4 proposed feature ideas into `docs/future-features.md`

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T020 Run `npm run lint` and `npm run build` to verify zero warnings
- [ ] T021 Quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Stories (Phase 3+)**: All depend on Foundational phase completion. User Stories 1, 2, 3, 4 can proceed in parallel.
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### Parallel Opportunities
- Replacing images across multiple files (`T003` to `T010`) can be done entirely in parallel.
- Component optimizations (`T013`, `T014`, `T016`, `T017`) can be done in parallel as they touch different files/areas.

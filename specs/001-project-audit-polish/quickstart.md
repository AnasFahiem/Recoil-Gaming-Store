# Quickstart: Project Audit and Polish

Since this is an audit rather than a new system, the quickstart consists of verifying the changes.

## Verification Steps
1. Run `npm run lint` and ensure there are no warnings regarding `<img>` tags.
2. Run `npm run build` to verify that optimizations did not break the build.
3. Open the application in the browser and navigate between shop and product pages to verify the new `framer-motion` animations trigger correctly and that performance feels smooth.
4. Check the React Profiler to verify that no unnecessary re-renders are occurring on the cart context.

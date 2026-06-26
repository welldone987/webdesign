# Repository Guidelines

## Project Structure & Module Organization

This repository is planned as a static personal website monorepo. The current source of truth is `personal-site-plan.md`; read it before making structural or design changes.

Target structure:

```text
apps/
  photography/   # current implementation focus
  home/          # reserved for the future landing site
  resume/        # reserved for the future resume site
```

For `apps/photography`, keep React source in `src/`, reusable UI in `src/components/`, typed data models in `src/types/`, photo metadata in `src/data/`, content in `src/content/`, and static images under `public/images/photography/`.

## Build, Test, and Development Commands

Once `apps/photography` is initialized, run commands from that directory unless a root workspace script is added.

```bash
npm install       # install dependencies
npm run dev       # start the Vite development server
npm run typecheck # run TypeScript checks without emitting files
npm run test      # run unit/component tests
npm run build     # build the static site into dist/
```

Cloudflare Pages should use `apps/photography` as the root directory, `npm run build` as the build command, and `dist` as the output directory.

## Coding Style & Naming Conventions

Use React + Vite + TypeScript + Tailwind CSS. Prefer functional components and typed props. Name components in `PascalCase` such as `GalleryGrid.tsx`; name hooks and utilities in `camelCase`. Keep Tailwind classes readable and local to the component unless a shared style is justified.

Do not introduce backend services, authentication, analytics, or database dependencies for the first version. Keep animation with Framer Motion restrained and focused on image browsing.

## Testing Guidelines

Use TypeScript checks and production builds as the minimum quality gate. Add Vitest for data utilities and component behavior, especially photo filtering, empty states, and metadata validation. Use Playwright later for browser smoke tests: homepage loads, gallery renders, category filtering works, and the photo viewer opens/closes on desktop and mobile.

Name tests close to the code they cover, for example `GalleryGrid.test.tsx` or `photos.test.ts`.

## Commit & Pull Request Guidelines

No commit history is currently available, so use concise imperative commits such as `Add photography gallery layout` or `Validate photo metadata`. Pull requests should describe the visible change, list test/build commands run, and include screenshots for UI changes.

## Security & Asset Guidelines

Do not commit secrets, phone numbers, government IDs, server credentials, or uncompressed original photos. Prefer WebP or AVIF, fixed dimensions or `aspect-ratio`, lazy loading, and metadata-driven updates through JSON or Markdown.

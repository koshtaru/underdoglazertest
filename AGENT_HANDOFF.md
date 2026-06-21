# AGENT HANDOFF — underdoglazertest

> Full project context for the next AI coding agent. Terse, directive, "AI speak." Read fully before editing. This is a **project handoff**, not just a changelog — recent session work is summarized near the end.

---

## 1. PROJECT
- **What**: Marketing + small admin SPA for **Underdog Lazer** — custom laser engraving, Woodville TX. Audience is **~90% mobile**; owner reviews on a phone (portrait AND landscape).
- **Repo**: `koshtaru/underdoglazertest`.
- **Prod domain**: `underdoglazer.com`. **Test/staging**: `underdoglazertest.netlify.app` (Netlify).
- **People**: business owner = Todd (`todd.underdoglazer@gmail.com`, receives contact-form emails); developer/account = James / "Crawford Digital" (`james.crawford07@gmail.com`).
- **Hosting**: Netlify (static `dist/` + serverless Functions). Firebase project storage bucket `lazerengraving-deb21.firebasestorage.app`.

## 2. STACK
- **Frontend**: React 19, Vite 7, React Router DOM, react-helmet-async (SEO/meta), lucide-react (icons), @dnd-kit (admin drag/drop), react-hook-form + yup (forms), react-dropzone (uploads), react-ga4 + web-vitals (analytics).
- **Backend**: Netlify Functions (`netlify/functions/*`), firebase-admin (Firestore + Storage via service account), @google-analytics/data (GA4 Data API).
- **Auth/DB**: Firebase Auth (email/password) + Cloud Firestore. `firestore.rules` at repo root.
- **Styling**: hand-written CSS, **not Tailwind utilities** (tailwind/postcss are installed but the app uses `src/styles/global.css` (public) + `src/styles/admin.css` (admin), BEM-ish naming, CSS custom properties).

## 3. DIRECTORY MAP (src)
```
src/
  main.jsx                # entry; sets history.scrollRestoration='manual' + scroll-to-top on load
  App.jsx                 # providers + router + route table (see §4)
  index.css               # minimal base
  config/firebase.js      # initializes firebase app + exports `auth` (client SDK). NO firestore here.
  contexts/
    AuthContext.jsx       # Firebase auth, role lookup, hasPermission(); gates children behind loading spinner
    GalleryContext.jsx    # wraps useGalleryStorage; exposes images + CRUD + refetch
  hooks/
    useGalleryStorage.js  # fetches/persists gallery via Netlify funcs; sends Bearer token; exposes refetch()
    useAnalytics.js       # admin dashboard analytics data (calls apiService)
  services/
    apiService.js         # client → /.netlify/functions/analytics-* (sends Bearer token), caching, fallbacks
    analyticsService.js   # GA4 client-side pageview tracking (react-ga4)
    performanceService.js # web-vitals
  components/
    Header.jsx            # fixed top nav (public). Footer.jsx
    admin/ProtectedRoute.jsx  # redirects to /admin/login; enforces requiredRole
    admin/AdminLayout.jsx     # admin shell + role-filtered sidebar nav
    admin/LoginForm.jsx
  pages/
    Home.jsx, About.jsx, Gallery.jsx, Contact.jsx   # public
    GallerySimple.jsx                                 # alt gallery (check App.jsx for which is routed)
    admin/Dashboard.jsx, Analytics.jsx, AdminGallery.jsx, AdminGallerySimple.jsx
  api/dev-image-upload.js  # dev-only helper
  styles/global.css, styles/admin.css
```

## 4. APP WIRING & ROUTING (`src/App.jsx`)
- Provider nesting: `HelmetProvider > AuthProvider > GalleryProvider > Router > Suspense(lazy pages) > AppLayout`.
- `AuthProvider` renders a **loading spinner until Firebase auth resolves**, so everything below (incl. `GalleryProvider`'s initial fetch) mounts only after `auth.currentUser` is known.
- `AppLayout`: renders `<Header/>` for non-`/admin` routes, the `<Routes>`, and `<Footer/>` for non-admin. Tracks GA pageviews on location change.
- Routes:
  - Public: `/` `/about` `/gallery` `/contact`
  - `/admin/login` (LoginForm)
  - `/admin/*` → `<ProtectedRoute><AdminLayout/></ProtectedRoute>` with nested: `dashboard`, `analytics` (viewer+), `gallery` (requiredRole `content-manager`), `users` + `settings` (requiredRole `admin`).
- **Pages are NOT wrapped in `<main className="main">`** (which would add `margin-top: var(--header-height)`). Heroes are full-bleed under the fixed header and must self-offset (see §8). Exception: `Gallery.jsx` wraps its grid in `<main className="main">`, but its hero is still full-bleed.

## 5. AUTH & ROLES (`src/contexts/AuthContext.jsx`)
- Firebase email/password. On login / `onAuthStateChanged`, reads role from Firestore `users/{uid}.role`.
- `ROLE_HIERARCHY = { admin:3, 'content-manager':2, viewer:1 }`; default role `viewer`.
- `hasPermission(requiredRole)` compares hierarchy. Used by `ProtectedRoute` (route gating) and `AdminLayout` (nav filtering).
- Client role is **UI-only**; server enforcement is via ID-token verification in functions + Firestore rules (writes denied to clients).

## 6. GALLERY DATA FLOW
- Source of truth: **Firestore** `gallery` collection — per-image docs (`image-*`, `documentType:'image'`) + a `metadata` doc. Image binaries are in **Firebase Storage** (public URLs) after the storage migration; older data may be base64 in Firestore.
- Read path: client `useGalleryStorage.fetchGallery()` → `GET /.netlify/functions/gallery-get`. Sends `Authorization: Bearer <idToken>` when logged in. **Admins get all images; anonymous get only `visible !== false`.**
- Write path (admin): `gallery-update.js`, `image-upload.js`, `update-image-metadata.js` — all require a valid admin token (`verifyAuthToken`). Functions use firebase-admin (service account) and **bypass Firestore rules**, so they must self-authenticate.
- `GalleryProvider` is app-wide and fetches on mount. `AdminGallery` calls `refetch()` on mount so a freshly-logged-in admin (SPA nav, no reload) still receives hidden images.
- **Homepage "Our Work" samples are HARD-CODED** in `Home.jsx` (`workSamples` array) — they do NOT come from the gallery API. (Relevant to the perf item in §11.)

## 7. BACKEND — NETLIFY FUNCTIONS (`netlify/functions/`)
- Shared helper `firebase-admin.js`: lazy-inits Admin SDK from `GOOGLE_APPLICATION_CREDENTIALS_JSON`; exports `getFirestore`, `getStorage`, `verifyAuthToken(authHeader)` (throws `{statusCode:401}` on bad/missing Bearer token), `admin`.
- Endpoints:
  - `gallery-get.js` — public read (optional auth → hidden images for admins).
  - `gallery-update.js`, `image-upload.js`, `update-image-metadata.js` — admin CRUD (token-gated).
  - `analytics-overview-v2.js`, `analytics-top-pages.js`, `analytics-traffic-sources.js`, legacy `analytics-overview.js` — GA4 Data API for the admin dashboard (token-gated, CORS `ALLOWED_ORIGIN`). Need `GA_PROPERTY_ID` + service-account creds.
  - `gallery-migrate.js`, `gallery-migrate-v2.js`, `migrate-to-storage.js`, `migrate-gallery-now.js` — one-off data migrations (token-gated). `test-fix.js` is leftover scaffolding.
- **MODULE-STYLE GOTCHA**: mixed CJS/ESM. CJS files use `require`/`exports.handler`. ESM files use `export const handler`. An ESM file (top-level `import`) that needs the admin helper must use:
  ```js
  import { createRequire } from 'module';
  const require = createRequire(import.meta.url);
  const { verifyAuthToken } = require('./firebase-admin');
  ```
  Files already calling bare `require('crypto')` in-handler may bare-`require('./firebase-admin')` too. Match the file's existing idiom.
- Auth header pattern for any new mutating/sensitive function: `await verifyAuthToken(event.headers.authorization)` at top of `try`; map `error.statusCode===401` → 401 response; CORS origin = `process.env.ALLOWED_ORIGIN || 'https://underdoglazer.com'`.

## 8. STYLING / LAYOUT MODEL & GOTCHAS  (read before touching headers/heroes)
- `--header-height: 70px`. `.header` is `position: fixed`, `z-index: 1000`. Content is full-bleed beneath it (see §4) → sections that sit at the top must self-offset (`padding-top: var(--header-height)`), not assume a wrapper does it.
- Hero class taxonomy:
  - **Home**: `.hero` + `.hero__tagline` (NO `.hero__title`). Logo-first, intentionally `~100svh`. Background **video is desktop-only** via `Home.jsx useIsDesktop()` = `matchMedia('(min-width:768px) and (min-height:500px)')`; phones/landscape-phones show the static `.hero` CSS background `/img/hero-background.jpg` instead of the 6.4MB `.mp4`.
  - **Inner (About/Gallery/Contact)**: `.about-hero`/`.gallery-hero`/`.contact-hero`, each `> .X-hero__content > h1.hero__title + p.hero__subtitle`. The three **share** `.hero__title`/`.hero__subtitle` → editing those classes affects all three and NOT home. Unified sizing: `min-height: max(280px, 56vh); padding-top: var(--header-height); box-sizing: border-box`.
- Responsive breakpoints in use: `@media (max-width:767px)` (portrait phone), `@media (min-width:768px) and (max-height:600px)` (home landscape), `@media (max-height:600px)` (inner-hero landscape typography).
- Font sizes use `clamp(min, vw, max)` (CSS vars `--font-size-*`). Note the `vw` term can drop the size below the desktop cap on narrow widths WITHOUT any media query (e.g. a 3rem-cap title computes ~32px at 390px wide). Don't confuse this with a bug.
- `main.jsx`: `history.scrollRestoration='manual'` + scroll-to-top on load (refresh starts at top; preserves `#anchor` jumps). Hero CTA "How It Works" scrolls to `#how-it-works` (has `scroll-margin-top: var(--header-height)`).

## 9. ENV & CONFIG
- Client (Vite, **public by design**, baked into bundle): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `GOOGLE_ANALYTICS_MEASUREMENT_ID`.
- Server (Netlify env, **secret**): `GOOGLE_APPLICATION_CREDENTIALS_JSON` (service-account JSON — Firestore Admin + GA Data API). Functions also reference `GA_PROPERTY_ID` and `ALLOWED_ORIGIN` (ensure these are set in Netlify; `.env.example` may be incomplete).
- `.env` is gitignored. `.env.example` has placeholders only (no real secrets committed — verified).
- `netlify.toml`: publish `dist`, build `npm run build`, NODE_VERSION 20, functions dir `netlify/functions`; **Netlify Forms** `name="contact"` emails Todd; HTTPS + www→non-www redirects; security headers (`Permissions-Policy`, etc.). Contact form detection file: `public/contact.html`.

## 10. DEV COMMANDS & VERIFICATION
- `npm run dev` → Vite on **:5173**. `npm run build` (must pass; chunk>500kB warning is known/expected). `npm run lint` (ESLint flat config; **pre-existing `scripts/*.js` `no-undef` failures are NOT yours** — ignore, but add no new errors). `npm run preview`.
- **Netlify Functions do NOT run under `npm run dev`** → `/.netlify/functions/*` calls fail locally; app falls back (gallery shows "Gallery Unavailable", auth/analytics no-op). Expected. (Use `netlify dev` if you need functions locally.)
- **Playwright verification (use for ANY UI change)**: global install at `/opt/node22/lib/node_modules/playwright`; browsers at `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`. ESM import shim (playwright is CJS):
  ```js
  import pw from '/opt/node22/lib/node_modules/playwright/index.js';
  const { chromium } = pw;
  // newContext({ viewport }), goto('http://localhost:5173/...'), measure getComputedStyle / getBoundingClientRect, page.screenshot()
  ```
  Run: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node /tmp/x.mjs`.
  Sandbox limits: headless Chromium has **no H.264** (hero mp4 won't play in-test — verify via element/network, not playback); the **live netlify site won't render JS** in-sandbox (use local dev); Google Fonts fails on cert (cosmetic).

## 11. GIT / PR WORKFLOW
- Feature branch: **`claude/security-review-syhrml`**. **Direct push to `main` is BLOCKED** by a safety classifier → ship via PR (GitHub MCP `create_pull_request` → `merge_pull_request`), then resync local main with `git fetch origin main && git merge --ff-only origin/main`.
- Per-change recipe used: stash → checkout feature branch → `git merge --ff-only origin/main` → pop → commit → push → PR → merge → resync main.
- Commit trailer (keep):
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  Claude-Session: <url>
  ```
- Safety backup branch exists: **`backup/main-20260620`** (don't delete). Don't put model ids/marketing names in commits/PRs/code.

## 12. RECENT SESSION WORK (already merged to main)
- **Security**: added `verifyAuthToken` gating to all migration + analytics functions and tightened CORS; deleted leaky debug endpoints `analytics-test.js` / `analytics-test-simple.js`; `gallery-get` optional-auth for hidden images; client now sends Bearer tokens (`apiService.js`, `useGalleryStorage.js`); `AdminLayout` nav role-filtered + removed email `console.log`; confirmed `firestore.rules` deny client writes.
- **UI/UX** (mostly `global.css` + `Home.jsx`): fixed mobile hero logo cutoff; "How it works" mobile grid; hero CTA `See Our Work`→`How It Works`; created `/public/img/hero-background.jpg` (video poster/bg) + made hero video desktop-only + dropped dead `.webm`; landscape fixes (page-hero titles no longer hidden under header, unified inner-hero heights, landscape title scaled down); scroll-to-top on refresh.

## 13. OUTSTANDING / PARKED (prioritize with owner)
1. **Homepage weight (~7.2MB)**: `public/img/hero-background.mp4` 6.4MB (compress ~1–2MB, 720p, faststart); `public/img/gallery/corporate-underdog-business-card.jpg` **1.82MB** (also slated for content removal); logos are uncompressed PNGs.
2. **Firebase/Firestore (~700KB) loads on the public homepage for nothing** — `GalleryProvider` is app-wide but the homepage doesn't use gallery data (hard-coded `workSamples`). Lazy-load Firebase / scope provider to admin+gallery routes.
3. **Owner content (awaiting assets)**: swap homepage work-sample photos for owner's best shots; remove the old business-card image; possibly add a 3–5 photo collage; logo "bigger/cleaner" largely done.
4. **Optional tap-to-call/text hero CTA** — needs a real phone number (none in code; only a `(555)` placeholder in `docs/`).
5. **Do NOT chase**: owner reported Gallery landscape hero title "looked smaller" than About/Contact. Verified current code renders all three inner heroes **identically** (Playwright measurement + screenshots; SPA = single shared stylesheet, so per-page CSS divergence is impossible). Concluded a deploy-propagation/refresh artifact, not a code bug. If it recurs after hard refresh, the only lever is `@media (max-height:600px) .hero__title` size — confirm desired size with owner first.

## 14. OWNER COMMUNICATION
- Non-technical. Reviews on phone (portrait + landscape). Wants plain-language explanations + screenshots of the actual result. **Verify visually before claiming done.** Confirm ambiguous design/irreversible choices before implementing. Keep the home page's big logo-first hero intact unless told otherwise.

# Fundi: Product & Build Plan

> Working name. "Fundi" is the SA word for a skilled tradesperson. Easy to rename later.

A directory of local service providers in South Africa (plumbers, electricians,
solar installers, gate motor techs, cleaners, etc.). Customers search by service
and area, compare **prices** and **ratings**, then contact the provider directly
by **phone or WhatsApp**. Providers list themselves for free and publish their
prices, which keeps pricing transparent and competitive.

---

## 1. Goals

| For customers | For providers |
| --- | --- |
| Find someone trustworthy, nearby, fast | Get found by local customers for free |
| Know what a fair price is *before* calling | Show off reviews and credentials |
| Contact directly. No middleman, no booking fee | Get leads straight to their phone or WhatsApp |

**Out of scope for the MVP:** in-app payments, booking calendars, escrow, chat. These are big
builds, and in SA most work is arranged over WhatsApp anyway.

## 2. Core features (MVP)

1. **Browse & search** by category, keyword, province or city, minimum rating and max price. Sort by rating, reviews or price.
2. **Provider profiles** with bio, verified badge, years of experience, area served, and services with prices.
3. **Price transparency**
   - Every service has a price and a unit: fixed, from, per hour, call-out fee, or per m².
   - Each price is compared with the average for the same service ("12% below avg").
   - A "What should it cost?" page shows min, average and max prices per service in each category.
   - Reviews can record what the customer **actually paid**.
4. **Ratings & reviews**: 1–5 stars, a comment, and optionally the service used and price paid.
5. **Contact**: tap to call, or WhatsApp with a pre-filled message (`wa.me`).
6. **Provider sign-up**: a 4-step form (about you, services & prices, area, confirm with POPIA consent).

## 3. SA-specific considerations

- **Currency:** ZAR, whole rands, formatted `en-ZA`.
- **Phone numbers:** accept `082…`, `27…` and `+27…`, and store as E.164 (`+27821234567`).
- **WhatsApp first:** the main way people contact tradespeople.
- **Call-out fees** are standard, so they are a first-class price unit.
- **Load-shedding:** Solar & Inverters and Gate Motors are top-level categories.
- **Mobile-first:** most users are on phones and some on low-end devices or expensive data. Keep the bundle small and the app installable as a PWA.
- **POPIA:** providers explicitly consent to their contact details being published. Add a privacy policy, data deletion on request, and an Information Officer before launch.
- **Trust signals:** professional registrations (PIRB for plumbers, ECSA/DoEL for electricians, SAPCA for pest control) can be verified manually to earn the "Verified" badge.
- **Languages:** English first, with Afrikaans/isiZulu/isiXhosa later (i18n-ready strings).

## 4. Data model

```
categories        id, name, icon, description
providers         id, user_id, name, business_name, bio, phone, whatsapp,
                  province, city, suburbs[], years_experience, verified,
                  available_24h, rating_avg, rating_count, created_at
provider_categories  provider_id, category_id
services          id, provider_id, category_id, name, price, unit
reviews           id, provider_id, author_user_id, rating, comment,
                  service_name, price_paid, created_at, status
users             id, phone (OTP login), display_name, role (customer|provider|admin)
reports           id, target_type, target_id, reason, created_at   (moderation)
```

`rating_avg` / `rating_count` are denormalised (updated by trigger) so listings sort fast.

TypeScript mirror: `web/src/types/index.ts`.

## 5. Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | React + TypeScript + Vite + Tailwind | Fast, small, easy to hire for |
| Routing | React Router | Simple SPA routes |
| Backend (Phase 2) | **Supabase** (Postgres, Auth, Storage, Row-Level Security) | Managed, cheap free tier, SQL, phone OTP auth built in |
| Search (later) | Postgres full-text + PostGIS for "near me" | No extra infrastructure until it's needed |
| Hosting | Vercel / Netlify / Cloudflare Pages | Free tier, global CDN |
| Mobile | PWA first, then Capacitor/React Native if needed | One codebase |

The UI never touches data directly. Everything goes through `web/src/lib/api.ts`,
so swapping the in-memory mock for Supabase is a one-file change.

## 6. Phased build

### ✅ Phase 0: Plan (this document)

### ✅ Phase 1: UI skeleton with mock data (done)
- [x] Project scaffold (Vite, React, TS, Tailwind)
- [x] Domain types and a mock data layer (`lib/api.ts`), with new providers and reviews saved in localStorage
- [x] Home: search, category grid, top rated
- [x] Search/browse with filters and sorting, synced to the URL so results can be shared
- [x] Provider profile with price-vs-market badges, reviews, and a review form
- [x] "What should it cost?" price comparison page
- [x] Provider sign-up wizard with SA phone validation and POPIA consent
- [x] Mobile layout with a fixed Call/WhatsApp bar

### ✅ Phase 1.5: Look, feel & standout features (done)
- [x] Brand refresh: logo, self-hosted fonts, palette, icon set, skeleton loaders, page transitions
- [x] App-style bottom tab bar on phones; filters fold away on mobile search
- [x] **"Is my quote fair?" checker**: verdict vs market range, cheaper rated fundis, questions to ask
- [x] **"Need help now"**: emergency types → 24/7 fundis, "while you wait" safety steps
- [x] Richer reviews: star breakdown, "Known for" tags, photo uploads with lightbox
- [x] **My Fundis**: saved providers and recently viewed
- [x] Share a provider via WhatsApp / native share / copy link
- [x] Installable PWA: manifest, app icons, offline support, home-screen shortcuts
- [x] Live on GitHub Pages, auto-deployed on every push

### ✅ Phase 1.6: Second polish round (done)
- [x] **Shortlist** up to 3 fundis from any card or profile, with a floating tray
- [x] **Compare side by side**: rating, badges, experience, areas and every price, best in each row marked
- [x] **Get quotes**: describe the job once, send a pre-written WhatsApp (or SMS) to each fundi, track who's been sent, saved under My Fundis
- [x] **Earned badges**: Top rated {trade} in {city}, Best value (% below market), 10+ years
- [x] **QR business card** for providers: downloadable PNG card, QR-only image, print
- [x] **Listing strength meter** on sign-up and on the provider's own listing
- [x] **Dark mode**: follows the phone's setting, with a toggle in the header

### Later polish ideas
- [ ] "Quick to respond" badge (needs reply tracking, so after Phase 2)
- [ ] Before/after work gallery on profiles
- [ ] Afrikaans / isiZulu / isiXhosa translations

### ✅ Phase 2: Real backend (built, waiting on your Supabase project)
- [x] Supabase schema in `supabase/migrations`: listings, services, categories, reviews, profiles, photo storage
- [x] Row-level security plus column-level grants: anyone reads; owners edit only their own listing; one review per customer per fundi; no self-reviews; ratings and Verified can't be self-set
- [x] Ratings kept in sync by a database trigger; one-transaction `upsert_my_listing` RPC
- [x] 46 automated security tests on real Postgres (`supabase/tests`), run on every push by GitHub Actions
- [x] Sign-in with a 6-digit code (email now; SMS once an SMS provider is connected)
- [x] Data layer switches to Supabase when configured; otherwise demo mode on sample data
- [x] Provider dashboard: edit profile, photo, services, prices, area and 24/7 availability
- [x] Sign-up and reviews require an account; display name on reviews; account page
- [x] Profile and review photo uploads to Supabase Storage
- [ ] **You:** create the Supabase project and connect it ([docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md))
- [ ] Custom SMTP (and later SMS) sender before launch
- [ ] Move My Fundis (saved, shortlist, quote requests) from the device to the account

### Phase 3: Trust & quality
- [x] One review per user per provider; reviewers must be logged in (done in Phase 2)
- [ ] Admin screen: verify fundis, hide listings/reviews (database functions already exist)
- [ ] Report or flag reviews and listings, plus an admin moderation queue
- [ ] Verification flow: upload registration/ID, admin approves, "Verified" badge
- [ ] Providers can reply to reviews
- [ ] Standard service names per category, so price comparisons group correctly (sign-up already suggests existing names)

### Phase 4: Location & discovery
- [ ] Geolocation "near me" with PostGIS distance sorting
- [ ] Suburb autocomplete
- [ ] SEO pages, e.g. `/plumbers/johannesburg/sandton` (server-rendered or prerendered)
- [ ] PWA: installable, offline shell, low-data mode

### Phase 5: Launch & monetisation
- [ ] Soft launch in **one metro** (e.g. Johannesburg East or Cape Town Northern Suburbs) and onboard 50–100 providers by hand
- [ ] Analytics (privacy-friendly), lead tracking (how many call/WhatsApp taps each provider gets)
- [ ] Revenue options (customers always free):
  - Featured / top-of-list placement
  - "Pro" subscription: more photos, lead stats, verified badge fast-track
  - Lead notifications by SMS/WhatsApp Business API
- [ ] POPIA compliance pack: privacy policy, T&Cs, data deletion request flow

## 7. Open questions

1. **Name & branding:** keep "Fundi" or pick another?
2. **Launch area:** which city or suburbs first?
3. **Reviews:** require a logged-in phone number (fewer fake reviews), or allow anonymous reviews?
4. **Prices:** should providers be *required* to list a call-out fee?
5. **Monetisation timing:** free for the first X months to build supply?

## 8. Running the prototype

```bash
cd web
npm install
npm run dev         # http://localhost:5173 (demo mode unless .env.local has Supabase keys)
npm run build       # typecheck + production build
npm run lint
npm run test:unit   # data mapping tests
npm run test:db     # migrations + security tests (needs a local Postgres; see supabase/tests/run.sh)
```

# Spain vs Argentina Final Event Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the expired Spain vs Belgium promotion with a polished Spain vs Argentina World Cup Final hero and route every event booking CTA to a new verified Google Form.

**Architecture:** A focused `event-promotion` configuration module owns event data and the active-window helper. The homepage hero and mobile sticky CTA consume that shared module, while the existing live-data hero remains the automatic fallback. The public Google Form is created first so its exact URL can be covered by regression checks before production code changes.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.7, Tailwind CSS 4, Node assertion scripts, Google Forms, Vercel.

## Global Constraints

- Event: The Final Roar, Spain vs Argentina, World Cup 2026 Final.
- Schedule: Sunday, 19 July 2026 at 11:00 PM IST onwards.
- Venue: 711 Rest O' Cafe, Seven Eleven Club, Kanakia Park, Mira Bhayandar.
- Price: INR 850 per person with unlimited buffet included.
- Promotion cutoff: `2026-07-20T05:00:00+05:30`.
- Reuse UPI `nikunjjadhav786@okicici`, payment QR, and WhatsApp `9619073067`.
- Do not submit a fake booking during verification.
- Keep the standard homepage hero as the inactive fallback.
- Do not add dependencies or build a general event administration system.

---

### Task 1: Create and Verify the Google Form

**Files:**
- Read: `public/assets/events/spain-belgium-payment-qr.jpeg`
- Read: `D:\final-roar-flags-price-850.png`

**Interfaces:**
- Consumes: The confirmed event details and unchanged payment system.
- Produces: `publicFormUrl: string`, the published respondent URL consumed by Tasks 2 and 3.

- [ ] **Step 1: Duplicate the previous event form**

Open the existing Spain vs Belgium form in the signed-in Google account, create a copy named `Roar Arena - The Final Roar: Spain vs Argentina`, and keep the existing three-section structure.

- [ ] **Step 2: Replace the event identity**

Set the title and description to:

```text
Roar Arena - The Final Roar: Spain vs Argentina

World Cup 2026 Final live screening
Sunday, 19 July 2026 | 11:00 PM onwards
711 Rest O' Cafe, Seven Eleven Club, Kanakia Park, Mira Bhayandar
INR 850 per person | Unlimited buffet included
```

Use the supplied event creative as the form header and keep the existing Roar Arena theme treatment.

- [ ] **Step 3: Configure Booking Details**

The first section must contain:

```text
Full Name (required short answer)
WhatsApp Number (required short answer)
Email Address (optional short answer)
Number of Seats (required dropdown: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
```

- [ ] **Step 4: Configure Payment**

Keep the existing QR image and use this exact copy:

```text
Pay INR 850 x your selected number of seats.
UPI ID: nikunjjadhav786@okicici
After payment, send the payment screenshot on WhatsApp to 9619073067.
Venue map: https://maps.app.goo.gl/NEqUUcoWJxMukPMZ8
```

- [ ] **Step 5: Configure Confirmation and publish**

The final section must contain required short-answer questions for `UPI Transaction / UTR Reference` and `Type DONE after sending the screenshot on WhatsApp`. Set the submission message to:

```text
Thank you. Your request for Spain vs Argentina on 19 July 2026 at 11:00 PM at 711 Rest O' Cafe has been received. Your seats are confirmed after payment verification. For payment support, WhatsApp 9619073067.
```

Publish the form and capture the public respondent URL, never the editor URL.

- [ ] **Step 6: Verify without submitting**

Open `publicFormUrl` in a clean tab. Confirm required-field validation, navigate through all three sections with temporary values, verify the QR, UPI, WhatsApp, map link, and final Submit button, then clear the draft without submitting.

---

### Task 2: Write Failing Event Regression Checks

**Files:**
- Modify: `scripts/ui-ux-regression-check.mjs`
- Test: `scripts/ui-ux-regression-check.mjs`

**Interfaces:**
- Consumes: `publicFormUrl` from Task 1.
- Produces: Failing assertions that define the new event configuration, hero copy, poster, booking links, and mobile CTA behavior.

- [ ] **Step 1: Extend test inputs**

Read the shared event module and mobile CTA when present:

```js
const eventPromotionPath = new URL('../lib/config/event-promotion.ts', import.meta.url)
const eventPromotion = existsSync(eventPromotionPath) ? read('lib/config/event-promotion.ts') : ''
const mobileStickyCta = read('components/layout/mobile-sticky-cta.tsx')
const eventSurface = `${eventPromotion}\n${home}\n${mobileStickyCta}`
```

- [ ] **Step 2: Replace old-event assertions**

Add assertions for:

```js
assert.match(eventSurface, /2026-07-20T05:00:00\+05:30/, 'event promotion must expire after the final screening window')
assert.match(eventSurface, /Spain vs Argentina/, 'event promotion must announce Spain vs Argentina')
assert.match(eventSurface, /World Cup 2026 Final/, 'event promotion must identify the final')
assert.match(eventSurface, /711 Rest O' Cafe/, 'event promotion must show the venue')
assert.match(eventSurface, /Kanakia Park, Mira Bhayandar/, 'event promotion must show the venue area')
assert.match(eventSurface, /Unlimited buffet included/i, 'event promotion must show the buffet package')
assert.match(eventSurface, /\\u20b9850/i, 'event promotion must show the INR 850 price')
assert.match(eventSurface, /spain-argentina-final-screening\.png/, 'event promotion must use the supplied final poster')
assert.match(eventSurface, /Book Now/, 'mobile sticky CTA must promote event booking')
assert.match(eventSurface, /isEventPromotionActive/, 'hero and mobile CTA must share the promotion cutoff helper')
assert.doesNotMatch(eventSurface, /Spain vs Belgium|AV Sports Arena|Quarter-Final|\\u20b9299/i, 'expired event details must be removed')
assert.equal(existsSync(new URL('../public/assets/events/spain-argentina-final-screening.png', import.meta.url)), true, 'new event poster must exist')
```

Add an assertion containing the exact `publicFormUrl` from Task 1 and assert that the previous Spain vs Belgium form URL is absent.

- [ ] **Step 3: Run the regression script and verify RED**

Run:

```powershell
node scripts/ui-ux-regression-check.mjs
```

Expected: FAIL because the current source still contains Spain vs Belgium details and the new poster/configuration do not exist.

---

### Task 3: Implement the Shared Event Promotion

**Files:**
- Create: `lib/config/event-promotion.ts`
- Create: `public/assets/events/spain-argentina-final-screening.png`
- Modify: `components/home/home-experience.tsx`
- Modify: `components/layout/mobile-sticky-cta.tsx`
- Test: `scripts/ui-ux-regression-check.mjs`

**Interfaces:**
- Consumes: `publicFormUrl` from Task 1 and the failing checks from Task 2.
- Produces: `eventPromotion`, `EVENT_PROMOTION_END_ISO`, and `isEventPromotionActive(now?: Date): boolean` for both UI surfaces.

- [ ] **Step 1: Add the poster asset**

Copy `D:\final-roar-flags-price-850.png` byte-for-byte to `public/assets/events/spain-argentina-final-screening.png`.

- [ ] **Step 2: Create the shared configuration**

Create `lib/config/event-promotion.ts` with this shape and the exact respondent URL produced by Task 1:

```ts
export const EVENT_PROMOTION_END_ISO = '2026-07-20T05:00:00+05:30'

export const eventPromotion = {
  campaignName: 'The Final Roar',
  poster: '/assets/events/spain-argentina-final-screening.png',
  eyebrow: 'Live Screening',
  fixture: 'Spain vs Argentina',
  competition: 'World Cup 2026 Final',
  stage: 'Final',
  dayLabel: 'Sunday',
  date: 'Sunday, July 19',
  time: '11:00 PM IST onwards',
  price: '\u20b9850',
  priceQualifier: 'per person',
  package: 'Unlimited buffet included',
  venue: "711 Rest O' Cafe",
  venueDetail: 'Seven Eleven Club',
  area: 'Kanakia Park, Mira Bhayandar',
  bookingUrl: EVENT_REGISTRATION_FORM_URL,
  badges: ['Limited seats', 'Big screen', 'Final night vibes'],
} as const

export function isEventPromotionActive(now = new Date()) {
  return now.getTime() < Date.parse(EVENT_PROMOTION_END_ISO)
}
```

Define `EVENT_REGISTRATION_FORM_URL` immediately above the object using the exact `publicFormUrl` from Task 1.

- [ ] **Step 3: Make the hero data-driven**

Import `eventPromotion`, `EVENT_PROMOTION_END_ISO`, and `isEventPromotionActive`. Remove the local old-event constants and helper. Replace every hard-coded fixture, venue, package, stage, alt text, ticker phrase, and date label in `EventHeroSection` with the corresponding `eventPromotion` property. Use this body copy:

```tsx
Roar Arena brings the {eventPromotion.competition} to the big screen. Watch the final with an unlimited buffet and a full match-night crowd.
```

Keep `Book Your Seat Now` linked to `eventPromotion.bookingUrl` and retain the existing normal-hero fallback.

- [ ] **Step 4: Make the mobile CTA event-aware**

Convert `mobile-sticky-cta.tsx` to a client component. Initialize active state with `isEventPromotionActive()`, re-check at cutoff and every minute, and replace only the first configured button while active:

```ts
const buttons = isEventActive
  ? [{ label: 'Book Now', href: eventPromotion.bookingUrl }, ...siteConfig.mobileStickyCtA.buttons.slice(1)]
  : siteConfig.mobileStickyCtA.buttons
```

- [ ] **Step 5: Run the regression script and verify GREEN**

Run:

```powershell
node scripts/ui-ux-regression-check.mjs
```

Expected: `UI/UX regression checks passed`.

- [ ] **Step 6: Commit the event implementation**

Stage only the event configuration, poster, hero, mobile CTA, and regression script. Commit with:

```text
feat: launch Spain Argentina final event
```

---

### Task 4: Verify and Release Production

**Files:**
- Verify: `lib/config/event-promotion.ts`
- Verify: `components/home/home-experience.tsx`
- Verify: `components/layout/mobile-sticky-cta.tsx`
- Verify: `scripts/ui-ux-regression-check.mjs`

**Interfaces:**
- Consumes: The committed event implementation and `publicFormUrl`.
- Produces: A production deployment whose hero and mobile CTA both open the verified public Form.

- [ ] **Step 1: Run static verification**

Run each command and require exit code 0:

```powershell
node scripts/ui-ux-regression-check.mjs
npm run typecheck
npm run build
git diff --check
```

- [ ] **Step 2: Verify responsive UI locally**

Start the Next.js development server. Inspect desktop at 1440x1000 and mobile at 390x844. Confirm the poster is visible, copy does not overlap or truncate, the next section remains discoverable, and both booking CTAs open the exact `publicFormUrl`.

- [ ] **Step 3: Verify page behavior**

Confirm there are no console errors, the event hero is active before the cutoff, the normal hero code remains present as fallback, external links open safely, and the mobile sticky CTA still includes Instagram and Facebook.

- [ ] **Step 4: Push and deploy**

Push the verified commits to `main`. Use the existing Vercel project linkage to deploy or promote the exact tested commit to production.

- [ ] **Step 5: Verify production**

Open `https://roararenaindia.vercel.app`, confirm the new poster and event details, open the hero and mobile booking links, and verify both resolve to `publicFormUrl`. Confirm the public form returns HTTP 200 and the previous form URL is absent from production HTML.

- [ ] **Step 6: Record the release**

Record the implementation commit, production deployment identifier, form URL verification, and current runtime in automation memory without recording account credentials or browser session data.

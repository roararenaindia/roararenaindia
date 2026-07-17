# Spain vs Argentina Final Event Design

## Objective

Promote Roar Arena's Spain vs Argentina World Cup 2026 Final live screening as the homepage's primary experience, collect paid seat reservations through a new Google Form, and restore the standard live-sports hero automatically after the event.

## Confirmed Event Details

- Event name: The Final Roar
- Fixture: Spain vs Argentina
- Competition: World Cup 2026 Final
- Date: Sunday, 19 July 2026
- Time: 11:00 PM IST onwards
- Venue: 711 Rest O' Cafe, Seven Eleven Club
- Area: Kanakia Park, Mira Bhayandar
- Price: INR 850 per person
- Package: Unlimited buffet included
- Selling points: Limited seats, big screen, final night vibes
- Supplied poster: `D:\final-roar-flags-price-850.png`

## Chosen Approach

Reuse and improve the existing temporary-event hero pattern. A single event-promotion configuration will own the poster, copy, schedule, booking URL, and badges. The homepage hero and mobile sticky CTA will consume the same configuration.

This keeps the implementation focused while removing the previous event's hard-coded fixture, venue, and package text from the component. A poster-only hero was rejected because it weakens accessibility and conversion. A general event-management system was rejected because it is unnecessary for this one scheduled promotion.

## Homepage Experience

The event hero replaces the normal live-data hero only while the promotion is active. Its first viewport contains:

- A `Live Screening` eyebrow and `The Final Roar` campaign cue.
- `Spain vs Argentina` as the primary heading.
- `World Cup 2026 Final` and concise event copy.
- Date and time panel: Sunday, 19 July; 11:00 PM onwards.
- Venue panel: 711 Rest O' Cafe, Seven Eleven Club; Kanakia Park, Mira Bhayandar.
- Package panel: unlimited buffet included; INR 850 per person.
- Primary `Book Your Seat Now` CTA linked to the new public Google Form.
- Secondary Instagram CTA.
- The supplied poster displayed prominently with descriptive alt text.
- Match, stage, and price summary labels plus the existing marquee treatment.

On mobile, the first sticky action changes from `Join Community` to `Book Now` and opens the same form while the event is active. The existing Instagram and Facebook actions remain unchanged. The sticky CTA returns to its normal configuration after the event.

The promotion starts immediately when deployed and ends at `2026-07-20T05:00:00+05:30`. Both hero and mobile CTA use the same active-state helper and re-check the cutoff in the browser so an open page can return to normal without a reload.

## Assets

Copy the supplied square poster to `public/assets/events/spain-argentina-final-screening.png` without recompression. Create an event-specific Google Form header from the supplied creative so the booking form is visually consistent with the homepage. The existing payment QR remains unchanged because the payment system is confirmed to be the same.

## Google Form

Create a new published form titled `Roar Arena - The Final Roar: Spain vs Argentina` with Roar Arena styling and three sections.

### 1. Booking Details

- Full name, required.
- WhatsApp number, required.
- Email address, optional.
- Number of seats, required, with choices from 1 through 10.

### 2. Payment

- State the price as INR 850 per person and instruct the customer to pay INR 850 multiplied by the selected seat count.
- Show the existing payment QR.
- Show the existing UPI ID `nikunjjadhav786@okicici`.
- Show payment-support WhatsApp number `9619073067`.
- Link to the confirmed venue location: `https://maps.app.goo.gl/NEqUUcoWJxMukPMZ8`.
- Instruct the customer to send the payment screenshot to the WhatsApp number before continuing.

### 3. Confirmation

- Require the UPI transaction or UTR reference.
- Require the customer to type `DONE` after sending the screenshot on WhatsApp.
- Include a final acknowledgement that the booking is confirmed only after payment verification.

The confirmation message thanks the customer, repeats the event date, time, and venue, and directs payment questions to the support WhatsApp number. Verification must exercise required-field validation and section navigation without submitting a fake response.

## Data Flow and Failure Handling

The event configuration initially uses no booking URL. After the Google Form is created and published, its public URL is added to the configuration and consumed by both booking CTAs. The page must never link to the form editor URL.

External links open in a new tab with safe link attributes. The normal homepage hero remains the fallback if the promotion is inactive. A missing poster or booking URL must fail the regression checks rather than silently publishing a broken campaign.

## Verification and Release

- Update regression checks for the new fixture, date, cutoff, venue, price, package, poster, form URL, and booking CTA.
- Run the UI regression script, typecheck, and production build.
- Start the site and verify the event hero at desktop and mobile sizes.
- Confirm the poster loads, text does not overflow, and hero/mobile booking CTAs open the exact public form URL.
- Verify the public form header, all three sections, required validation, payment details, map link, and confirmation message without submitting a response.
- Publish the verified changes to the production site and confirm the production homepage and public form are reachable.

## Out of Scope

- Changing payment ownership, UPI details, QR code, or WhatsApp support number.
- Building a reusable event administration interface.
- Collecting a file upload inside Google Forms.
- Creating or submitting test bookings.

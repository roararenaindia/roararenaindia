export const EVENT_PROMOTION_END_ISO = '2026-07-20T05:00:00+05:30'
export const EVENT_REGISTRATION_FORM_URL = 'https://forms.gle/TyLA2zmmmeWR6axp7'

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
  mapUrl: 'https://maps.app.goo.gl/NEqUUcoWJxMukPMZ8',
  badges: ['Limited seats', 'Big screen', 'Final night vibes'],
} as const

export function isEventPromotionActive(now = new Date()) {
  return now.getTime() < Date.parse(EVENT_PROMOTION_END_ISO)
}

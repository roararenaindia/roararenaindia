export type ArenaPostTeam = {
  name: string
  logo: string
}

export type ArenaPost = {
  id: string
  title: string
  category: string
  type: 'Result' | 'Fixtures' | 'Preview' | 'Announcement' | string
  description: string
  image: string
  logo: string
  teams: ArenaPostTeam[]
  caption: string
  permalink?: string
  timestamp?: string
}

const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/roararenaindia/'
const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://www.facebook.com/RoarArena'
const xUrl = process.env.NEXT_PUBLIC_X_URL || 'https://x.com/RoarArenaIndia'
const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL || 'https://whatsapp.com/channel/0029Vb8bGxc7oQhX9QvoPG1R'
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'roararenaindia@gmail.com'
const contactSubject = encodeURIComponent('Roar Arena collaboration')

export const siteConfig = {
  brand: {
    name: 'Roar Arena',
    tagline: 'Where Fans Come Alive.',
    campaignLine: 'One Game. One Crowd. One Roar.',
    description:
      'Roar Arena is a sports fan experience startup building live screenings, watch parties, fan meetups, and matchday community events in India.',
  },
  links: {
    instagram: instagramUrl,
    facebook: facebookUrl,
    x: xUrl,
    whatsappChannel: whatsappUrl,
    contact: `mailto:${contactEmail}?subject=${contactSubject}`,
    contactEmail,
  },
  navigation: [
    { label: 'Home', href: '#home' },
    { label: 'Stories', href: '#updates' },
    { label: 'Matches', href: '#matches' },
    { label: 'Building', href: '#building' },
    { label: 'Events', href: '#events' },
    { label: 'Community', href: '#community' },
  ],
  hero: {
    eyebrow: 'Sports fan experience startup',
    headline: 'Feel the Game.\nJoin the Roar.',
    subheadline:
      'Roar Arena is building live sports screening events, fan meetups, watch parties, and matchday experiences for real sports fans.',
    support:
      'Until our first events go live, follow us for match updates, results, upcoming fixtures, and the stories that make sports feel alive.',
    trustLine: 'Live screenings and fan events coming soon. Match updates live now.',
    primaryCta: 'Join Channel',
    secondaryCta: 'Follow Instagram',
    badges: ['Coming soon events', 'Match updates live now', 'Upcoming fixtures', 'Result posts', 'Fan community'],
    ticker: [
      'Where Fans Come Alive',
      'Feel the Game. Join the Roar.',
      'One Game. One Crowd. One Roar.',
      'Live screenings coming soon',
      'Watch parties planned',
      'Fan meetups in progress',
      'Upcoming fixtures',
      'Latest results',
      'Community watch picks',
      'Instagram feed',
      'X updates',
      'WhatsApp channel',
    ],
  },
  posts: [] as ArenaPost[],
  features: [
    {
      title: 'Live screenings',
      description: 'Big matches on big screens with real crowd energy. Coming soon as Roar Arena grows its city-based community.',
    },
    {
      title: 'Watch parties',
      description: 'Curated match nights for fans who want more than a quiet couch and a muted group chat.',
    },
    {
      title: 'Fan meetups',
      description: 'Community-first gatherings for football, cricket, basketball, F1, and the sports people argue about all week.',
    },
    {
      title: 'Tournaments and local events',
      description: 'Future turf battles, local competitions, creator meetups, and sports community moments for real squads.',
    },
  ],
  futureEvents: [
    {
      title: 'FIFA Nights',
      tag: 'Coming soon',
      description: 'Live football screening experiences for the games fans plan their week around.',
      logo: '/assets/leagues/fifa-world-cup-dark.png',
      lightLogo: '/assets/leagues/fifa-world-cup-2026-light.png',
      logoFrame: 'clear',
    },
    {
      title: 'NBA Watch Nights',
      tag: 'Coming soon',
      description: 'Basketball watch parties for big games, finals, city rivalries, and loud fourth quarters.',
      logo: '/assets/leagues/nba.svg',
      lightLogo: '/assets/leagues/nba-light.svg',
      logoFrame: 'default',
    },
    {
      title: 'IPL Screenings',
      tag: 'Coming soon',
      description: 'Cricket nights built for loud fans, big moments, and last-over chaos.',
      logo: '/assets/leagues/ipl.svg',
      lightLogo: '/assets/leagues/ipl-light.svg',
      logoFrame: 'default',
    },
    {
      title: 'F1 Race Weekends',
      tag: 'Coming soon',
      description: 'Race-day screenings, fan reactions, podium drama, and motorsport energy.',
      logo: '/assets/leagues/formula-1.svg',
      lightLogo: '/assets/leagues/formula-1-red.svg',
      logoFrame: 'default',
    },
    {
      title: 'Turf Battles',
      tag: 'Coming soon',
      description: 'Future 5v5 and 7v7 local turf tournaments for squads.',
      logo: '/logos/logo-icon-dark-transparent.png',
      lightLogo: '/logos/logo-icon-light-transparent.png',
      logoFrame: 'default',
    },
  ],
  sports: [
    { name: 'FIFA World Cup', label: 'Football', logo: '/assets/leagues/fifa-world-cup-dark.png', lightLogo: '/assets/leagues/fifa-world-cup-2026-light.png', logoFrame: 'clear' },
    { name: 'NBA', label: 'Basketball', logo: '/assets/leagues/nba.svg', lightLogo: '/assets/leagues/nba-light.svg', logoFrame: 'default' },
    { name: 'IPL', label: 'Cricket', logo: '/assets/leagues/ipl.svg', lightLogo: '/assets/leagues/ipl-light.svg', logoFrame: 'default' },
    { name: 'Formula 1', label: 'Racing', logo: '/assets/leagues/formula-1.svg', lightLogo: '/assets/leagues/formula-1-red.svg', logoFrame: 'default' },
    { name: 'ICC Cricket', label: 'Cricket', logo: '/assets/leagues/icc-cricket-official.png', lightLogo: '/assets/leagues/icc-cricket-official.png', logoFrame: 'dark-chip' },
    { name: 'MLB', label: 'Baseball', logo: '/assets/leagues/mlb.svg', lightLogo: '/assets/leagues/mlb.svg', logoFrame: 'default' },
    { name: 'NFL', label: 'American football', logo: '/assets/leagues/nfl.svg', lightLogo: '/assets/leagues/nfl.svg', logoFrame: 'dark-chip' },
    { name: 'NHL', label: 'Hockey', logo: '/assets/leagues/nhl.svg', lightLogo: '/assets/leagues/nhl.svg', logoFrame: 'light-chip' },
    { name: 'UFC', label: 'Fight night', logo: '/assets/leagues/ufc-official.png', lightLogo: '/assets/leagues/ufc-official.png', logoFrame: 'light-chip' },
    { name: 'Premier League', label: 'Club football', logo: '/assets/leagues/premier-league.svg', lightLogo: '/assets/leagues/premier-league.svg', logoFrame: 'dark-chip' },
    { name: 'Champions League', label: 'European nights', logo: '/assets/leagues/uefa-champions-league-official-dark.jpg', lightLogo: '/assets/leagues/uefa-champions-league-official-light.jpg', logoFrame: 'default' },
    { name: 'Olympics', label: 'Global stage', logo: '/assets/leagues/olympics-official.svg', lightLogo: '/assets/leagues/olympics-official.svg', logoFrame: 'light-chip' },
    { name: 'MotoGP', label: 'Moto racing', logo: '/assets/leagues/motogp.svg', lightLogo: '/assets/leagues/motogp.svg', logoFrame: 'light-chip' },
    { name: 'Wimbledon', label: 'Tennis', logo: '/assets/leagues/wimbledon.svg', lightLogo: '/assets/leagues/wimbledon.svg', logoFrame: 'default' },
    { name: 'PGA Tour', label: 'Golf', logo: '/assets/leagues/pga-tour-official.svg', lightLogo: '/assets/leagues/pga-tour-official.svg', logoFrame: 'default' },
    { name: 'The Masters', label: 'Golf major', logo: '/assets/leagues/the-masters-official.png', lightLogo: '/assets/leagues/the-masters-official.png', logoFrame: 'light-chip' },
  ],
  footer: {
    disclaimer:
      'Roar Arena is an independent sports fan experience startup. We are not affiliated with any league, team, tournament, or broadcaster unless officially stated.',
    copyright: '© 2026 Roar Arena. All rights reserved.',
  },
  mobileStickyCtA: {
    buttons: [
      { label: 'Join Channel', href: whatsappUrl },
      { label: 'Instagram', href: instagramUrl },
      { label: 'Facebook', href: facebookUrl },
    ],
  },
} as const

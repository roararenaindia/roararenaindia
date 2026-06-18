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
const xUrl = process.env.NEXT_PUBLIC_X_URL || 'https://x.com/RoarArenaIndia'
const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL || 'https://whatsapp.com/channel/0029Vb8bGxc7oQhX9QvoPG1R'
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'apex36office@gmail.com'
const contactSubject = encodeURIComponent('Roar Arena collaboration')

export const siteConfig = {
  brand: {
    name: 'Roar Arena',
    tagline: 'Where fans come alive.',
    description:
      'Roar Arena is a sports fan experience startup building live screenings, watch parties, fan meetups, and matchday community events in India.',
  },
  links: {
    instagram: instagramUrl,
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
    headline: 'Watch the game.\nFeel the roar.',
    subheadline:
      'Roar Arena is building live sports screening events, fan meetups, watch parties, and matchday experiences for real sports fans.',
    support:
      'Until our first events go live, follow us for match updates, results, upcoming fixtures, and the stories that make sports feel alive.',
    trustLine: 'Live screenings and fan events coming soon. Match updates live now.',
    primaryCta: 'Join Channel',
    secondaryCta: 'Follow Instagram',
    badges: ['Coming soon events', 'Match updates live now', 'Upcoming fixtures', 'Result posts', 'Fan community'],
    ticker: [
      'Where fans come alive',
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
  posts: [
    {
      id: 'knicks-champions-2026',
      title: 'Knicks Are Champions',
      category: 'NBA Finals 2026',
      type: 'Result',
      description: 'New York finished the run and turned the Finals into a city-wide roar.',
      image: '/posts/knicks-champions.png',
      logo: '/assets/leagues/nba.svg',
      teams: [
        { name: 'New York Knicks', logo: '/assets/teams/nba/new-york-knicks.png' },
        { name: 'San Antonio Spurs', logo: '/assets/teams/nba/san-antonio-spurs.png' },
      ],
      caption: 'NEW YORK DID IT. The Knicks are champions. A city full of belief. A moment made for the roar.',
      permalink: xUrl,
      timestamp: '2026-06-15T04:00:00.000Z',
    },
    {
      id: 'germany-curacao-boss-fight',
      title: 'Boss Fight Energy',
      category: 'FIFA World Cup 2026',
      type: 'Result',
      description: 'Germany opened with pressure, goals, and pure boss fight energy.',
      image: '/posts/germany-curacao-boss-fight.png',
      logo: '/assets/leagues/fifa-world-cup.png',
      teams: [
        { name: 'Germany', logo: '/assets/teams/fifa/germany.png' },
        { name: 'Curaçao', logo: '/assets/leagues/fifa-world-cup.png' },
      ],
      caption: 'Germany loaded into the World Cup like a final boss. 7-1. No chill. No soft launch.',
      permalink: instagramUrl,
      timestamp: '2026-06-14T22:00:00.000Z',
    },
    {
      id: 'brazil-morocco-one-save',
      title: 'One Last Save',
      category: 'FIFA World Cup 2026',
      type: 'Result',
      description: 'Morocco pushed the story to the edge. Brazil held on when it mattered.',
      image: '/posts/brazil-morocco-one-save.png',
      logo: '/assets/leagues/fifa-world-cup.png',
      teams: [
        { name: 'Brazil', logo: '/assets/teams/fifa/brazil.png' },
        { name: 'Morocco', logo: '/assets/teams/fifa/morocco.png' },
      ],
      caption: 'Underdog? Nah. Morocco came in like a hell hound. One last save kept the story from flipping.',
      permalink: instagramUrl,
      timestamp: '2026-06-13T22:00:00.000Z',
    },
    {
      id: 'fifa-fixtures',
      title: 'Fixtures Keep Moving',
      category: 'FIFA World Cup 2026',
      type: 'Fixtures',
      description: 'The schedule keeps changing. Roar Arena keeps the board ready.',
      image: '/posts/fifa-fixtures.png',
      logo: '/assets/leagues/fifa-world-cup.png',
      teams: [
        { name: 'USA', logo: '/assets/teams/fifa/usa.png' },
        { name: 'Germany', logo: '/assets/teams/fifa/germany.png' },
        { name: 'Brazil', logo: '/assets/teams/fifa/brazil.png' },
        { name: 'Spain', logo: '/assets/teams/fifa/spain.png' },
      ],
      caption: 'Fixtures, scores, and storylines keep moving. Roar Arena is built to move with them.',
      permalink: xUrl,
      timestamp: '2026-06-15T02:00:00.000Z',
    },
  ],
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
      logo: '/assets/leagues/fifa-world-cup.png',
    },
    {
      title: 'NBA Watch Nights',
      tag: 'Coming soon',
      description: 'Basketball watch parties for big games, finals, city rivalries, and loud fourth quarters.',
      logo: '/assets/leagues/nba.svg',
    },
    {
      title: 'IPL Screenings',
      tag: 'Coming soon',
      description: 'Cricket nights built for loud fans, big moments, and last-over chaos.',
      logo: '/assets/leagues/ipl.svg',
    },
    {
      title: 'F1 Race Weekends',
      tag: 'Coming soon',
      description: 'Race-day screenings, fan reactions, podium drama, and motorsport energy.',
      logo: '/assets/leagues/formula-1.svg',
    },
    {
      title: 'Turf Battles',
      tag: 'Coming soon',
      description: 'Future 5v5 and 7v7 local turf tournaments for squads.',
      logo: '/logos/logo-icon-dark-transparent.png',
    },
  ],
  sports: [
    { name: 'FIFA World Cup', label: 'Football', logo: '/assets/leagues/fifa-world-cup.png' },
    { name: 'NBA', label: 'Basketball', logo: '/assets/leagues/nba.svg' },
    { name: 'IPL', label: 'Cricket', logo: '/assets/leagues/ipl.svg' },
    { name: 'Formula 1', label: 'Racing', logo: '/assets/leagues/formula-1.svg' },
    { name: 'ICC Cricket', label: 'Cricket', logo: '/assets/leagues/icc-cricket.png' },
    { name: 'MLB', label: 'Baseball', logo: '/assets/leagues/mlb.svg' },
    { name: 'NFL', label: 'American football', logo: '/assets/leagues/nfl.svg' },
    { name: 'NHL', label: 'Hockey', logo: '/assets/leagues/nhl.svg' },
    { name: 'UFC', label: 'Fight night', logo: '/assets/leagues/ufc-official.png' },
    { name: 'Premier League', label: 'Club football', logo: '/assets/leagues/premier-league.svg' },
    { name: 'Champions League', label: 'European nights', logo: '/assets/leagues/uefa-champions-league.png' },
    { name: 'Olympics', label: 'Global stage', logo: '/assets/leagues/olympics.png' },
    { name: 'MotoGP', label: 'Moto racing', logo: '/assets/leagues/motogp.svg' },
    { name: 'Wimbledon', label: 'Tennis', logo: '/assets/leagues/wimbledon.svg' },
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
    ],
  },
} as const

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
      'Roar Arena turns match scores, upcoming fixtures, and social posts into one live fan hub for the moments people actually talk about.',
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
    { label: 'Live', href: '#live' },
    { label: 'Stories', href: '#updates' },
    { label: 'Engine', href: '#engine' },
    { label: 'Sports', href: '#sports' },
    { label: 'Connect', href: '#connect' },
  ],
  hero: {
    eyebrow: 'Scores. Stories. Schedule.',
    headline: 'Your matchday\nlives here.',
    subheadline:
      'Roar Arena tracks the games, results, and posts fans care about. Same energy from feed to site.',
    primaryCta: 'Join Channel',
    secondaryCta: 'See Matches',
    badges: ['Live scores', 'Upcoming fixtures', 'Latest results', 'Instagram sync', 'Admin control'],
    ticker: [
      'Where fans come alive',
      'Live scores',
      'Upcoming fixtures',
      'Latest results',
      'Fan-first stories',
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
      logo: '/assets/leagues/nba.png',
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
      title: 'Live score engine',
      description: 'FIFA fixtures, results, winners, and upcoming games refresh through the backend instead of hardcoded sections.',
    },
    {
      title: 'One post, everywhere',
      description: 'Use Instagram as the master feed. X, WhatsApp, and the website stay aligned around the same creative.',
    },
    {
      title: 'Hero that changes',
      description: 'Live match first. Next big fixture second. Fresh result third. The top story keeps rotating.',
    },
    {
      title: 'Human override',
      description: 'Admin can pin, hide, feature, or correct stories when the fan moment needs taste, not just automation.',
    },
  ],
  futureEvents: [
    {
      title: 'World Cup Nights',
      tag: 'Football watch party',
      description: 'Big-screen match nights for the fixtures fans actually plan their day around.',
      logo: '/assets/leagues/fifa-world-cup.png',
    },
    {
      title: 'Finals Watch',
      tag: 'Basketball energy',
      description: 'NBA-style watch parties, recap posts, and city-vs-city fan moments after every major game.',
      logo: '/assets/leagues/nba.png',
    },
    {
      title: 'Race Weekend',
      tag: 'Speed culture',
      description: 'Qualifying, race day, podium reactions, and short-form stories for motorsport fans.',
      logo: '/assets/leagues/formula-1.png',
    },
    {
      title: 'Fight Night',
      tag: 'Main-event mode',
      description: 'Fight cards, weigh-in hype, results, and reaction posts built for combat sports communities.',
      logo: '/assets/leagues/ufc.png',
    },
    {
      title: 'Local Arena',
      tag: 'Community sport',
      description: 'A future home for local tournaments, fan screenings, creators, and matchday meetups.',
      logo: '/logo-icon.png',
    },
  ],
  sports: [
    { name: 'FIFA World Cup', label: 'Football', logo: '/assets/leagues/fifa-world-cup.png' },
    { name: 'NBA', label: 'Basketball', logo: '/assets/leagues/nba.png' },
    { name: 'IPL', label: 'Cricket', logo: '/assets/leagues/ipl.png' },
    { name: 'Formula 1', label: 'Racing', logo: '/assets/leagues/formula-1.png' },
    { name: 'UFC', label: 'Fight night', logo: '/assets/leagues/ufc.png' },
    { name: 'Premier League', label: 'Club football', logo: '/assets/leagues/premier-league.png' },
    { name: 'Champions League', label: 'European nights', logo: '/assets/leagues/uefa-champions-league.png' },
    { name: 'Olympics', label: 'Global stage', logo: '/assets/leagues/olympics.png' },
  ],
  footer: {
    disclaimer:
      'Roar Arena is an independent fan experience brand and is not affiliated with any league, team, or tournament unless stated.',
    copyright: '© 2026 Roar Arena. All rights reserved.',
  },
  mobileStickyCtA: {
    buttons: [
      { label: 'Join Channel', href: whatsappUrl },
      { label: 'Follow X', href: xUrl },
    ],
  },
} as const

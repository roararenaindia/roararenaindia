export type TemplateKind = 'result' | 'fixtures' | 'preview'

export type TemplateTeam = {
  name: string
  short?: string
  logo?: string
  score?: string | number
  tag?: string
}

export type TemplateFixture = {
  home: string
  away: string
  homeLogo?: string
  awayLogo?: string
  time?: string
  meta?: string
}

export type InstagramTemplateInput = {
  kind: TemplateKind
  headline?: string
  eyebrow?: string
  league?: string
  date?: string
  venue?: string
  brandLogo?: string
  leagueLogo?: string
  home?: TemplateTeam
  away?: TemplateTeam
  fixtures?: TemplateFixture[]
  footer?: string
  note?: string
}

export const defaultInstagramTemplate: InstagramTemplateInput = {
  kind: 'result',
  headline: 'MATCH RESULT',
  eyebrow: 'FIFA WORLD CUP 2026',
  league: 'FIFA World Cup 2026',
  date: 'June 13, 2026',
  venue: 'Los Angeles Stadium',
  brandLogo: '/logos/logo-lockup-dark-transparent.png',
  leagueLogo: '/assets/leagues/fifa-world-cup.png',
  home: {
    name: 'USA',
    short: 'USA',
    logo: '/assets/teams/fifa/usa.png',
    score: 4,
    tag: 'WIN',
  },
  away: {
    name: 'Paraguay',
    short: 'PAR',
    logo: '/assets/teams/fifa/paraguay.png',
    score: 1,
  },
  footer: 'WHERE FANS COME ALIVE',
  note: 'Group D',
}

export const defaultFixturesTemplate: InstagramTemplateInput = {
  kind: 'fixtures',
  headline: "TODAY'S FIXTURES",
  eyebrow: 'FIFA WORLD CUP 2026',
  league: 'FIFA World Cup 2026',
  date: 'June 13, 2026',
  brandLogo: '/logos/logo-lockup-dark-transparent.png',
  leagueLogo: '/assets/leagues/fifa-world-cup.png',
  fixtures: [
    {
      home: 'Qatar',
      away: 'Switzerland',
      homeLogo: '/logos/logo-icon-dark-transparent.png',
      awayLogo: '/logos/logo-icon-dark-transparent.png',
      time: '3:00 PM ET',
      meta: 'Group B',
    },
    {
      home: 'Brazil',
      away: 'Morocco',
      homeLogo: '/assets/teams/fifa/brazil.png',
      awayLogo: '/assets/teams/fifa/morocco.png',
      time: '6:00 PM ET',
      meta: 'Group C',
    },
    {
      home: 'Haiti',
      away: 'Scotland',
      homeLogo: '/logos/logo-icon-dark-transparent.png',
      awayLogo: '/logos/logo-icon-dark-transparent.png',
      time: '9:00 PM ET',
      meta: 'Group C',
    },
  ],
  footer: 'WHERE FANS COME ALIVE',
}

export const defaultPreviewTemplate: InstagramTemplateInput = {
  kind: 'preview',
  headline: 'UP NEXT',
  eyebrow: 'FIFA WORLD CUP 2026',
  league: 'FIFA World Cup 2026',
  date: 'June 13, 2026',
  venue: 'New York New Jersey Stadium',
  brandLogo: '/logos/logo-lockup-dark-transparent.png',
  leagueLogo: '/assets/leagues/fifa-world-cup.png',
  home: {
    name: 'Brazil',
    short: 'BRA',
    logo: '/assets/teams/fifa/brazil.png',
  },
  away: {
    name: 'Morocco',
    short: 'MAR',
    logo: '/assets/teams/fifa/morocco.png',
  },
  footer: 'WHERE FANS COME ALIVE',
  note: 'Match Preview',
}

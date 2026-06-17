import AssetLogo from '@/components/asset-logo'

const sports = [
  {
    title: 'FIFA Nights',
    label: 'Football',
    logo: '/assets/leagues/fifa-world-cup.png',
    copy: 'Fixtures, results, watch nights, and football fan moments.',
  },
  {
    title: 'NBA Watch Nights',
    label: 'Basketball',
    logo: '/assets/leagues/nba.png',
    copy: 'Finals updates, game previews, and watch-chat energy.',
  },
  {
    title: 'IPL Screenings',
    label: 'Cricket',
    logo: '/assets/leagues/ipl.png',
    copy: 'Big-screen cricket nights built for groups and cities.',
  },
  {
    title: 'F1 Race Weekends',
    label: 'Formula 1',
    logo: '/assets/leagues/formula-1.png',
    copy: 'Race weekends, live reactions, and Grand Prix watch plans.',
  },
  {
    title: 'Cricket Coverage',
    label: 'ICC',
    logo: '/assets/leagues/icc-cricket.png',
    copy: 'International cricket updates and future screening drops.',
  },
  {
    title: 'Olympics Mode',
    label: 'Multi-sport',
    logo: '/assets/leagues/olympics.png',
    copy: 'Global sporting moments, fan coverage, and community hype.',
  },
] as const

export default function SportsWeCover() {
  return (
    <section id="sports" className="relative overflow-hidden bg-background py-16 sm:py-20 lg:py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute -right-1/4 bottom-1/3 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Sports we cover</p>
            <h2 className="mt-3 font-display text-5xl uppercase leading-none text-foreground sm:text-6xl">
              One arena. Every big night.
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-muted-foreground md:text-right">
            Focused coverage for the sports that create actual crowd energy, not random filler.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sports.map((sport) => (
            <article
              key={sport.title}
              className="group relative min-h-[210px] overflow-hidden rounded-[1.75rem] border border-border bg-card p-6 transition duration-300 hover:-translate-y-1.5 hover:border-primary/45 hover:shadow-soft-glow"
            >
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl transition group-hover:bg-primary/20" />
              <div className="relative z-10 flex items-center gap-5">
                <AssetLogo
                  src={sport.logo}
                  alt={`${sport.title} logo`}
                  className="h-28 w-28 shrink-0 rounded-[1.5rem] border-primary/15 bg-black/35 p-1.5 transition group-hover:border-primary/45"
                  imgClassName="scale-110"
                />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">{sport.label}</p>
                  <h3 className="mt-2 font-display text-4xl uppercase leading-[0.9] text-foreground">{sport.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{sport.copy}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

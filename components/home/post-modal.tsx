'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, MessageCircle, X } from '@/components/ui/icon-set'
import { useEffect, useRef } from 'react'
import AssetLogo from '@/components/brand/asset-logo'
import { ArenaPost, siteConfig } from '@/lib/config/site-data'
import { resolveLeagueLogoFrame, resolveLeagueLogoLight } from '@/lib/domain/league-logos'

type PostModalProps = {
  isOpen: boolean
  onClose: () => void
  post: ArenaPost
}

function isWimbledonPost(post: ArenaPost) {
  return /\b(wimbledon|tennis|grand slam|singles)\b/i.test(`${post.category} ${post.title} ${post.description} ${post.caption}`)
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('') || 'RA'
}

function isWidePostLogo(category: string, logo: string) {
  return /\b(formula\s*1|formula one|f1)\b/i.test(`${category} ${logo}`)
}

export default function PostModal({ isOpen, onClose, post }: PostModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const fullCaption = post.caption || post.description
  const showTeamStrip = post.teams.length > 0 && !isWimbledonPost(post)
  const postLogoLight = resolveLeagueLogoLight(post.category, post.logo)
  const postLogoFrame = resolveLeagueLogoFrame(post.category, post.logo)
  const widePostLogo = isWidePostLogo(post.category, post.logo)

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="post-modal-title"
          className="fixed inset-0 z-[80] grid place-items-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-black/72 backdrop-blur-md"
            onClick={onClose}
            aria-label="Close post preview"
          />

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-2xl md:grid md:grid-cols-[1.08fr_0.92fr]"
          >
            <div className="relative h-[min(42vh,320px)] shrink-0 bg-surface md:h-auto md:min-h-[680px]">
              <img src={post.image} alt={post.title} className="h-full w-full object-contain p-3 sm:p-4" />
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5 sm:p-7 md:max-h-[92vh] lg:p-9">
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-border bg-surface text-foreground transition hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="pr-12">
                <div className="flex items-center gap-3">
                  <AssetLogo
                    src={post.logo}
                    lightSrc={postLogoLight}
                    lightFrame={postLogoFrame}
                    alt={`${post.category} logo`}
                    variant="stage"
                    tone="strong"
                    className={`shrink-0 rounded-xl ${widePostLogo ? 'h-14 w-20' : 'h-14 w-14'}`}
                    imgClassName={widePostLogo ? 'scale-105' : ''}
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <span className="max-w-full whitespace-nowrap rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary">{post.category}</span>
                      <span className="whitespace-nowrap rounded-full border border-border bg-surface px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">{post.type}</span>
                    </div>
                  </div>
                </div>

                <h2 id="post-modal-title" className="mt-5 font-display text-4xl uppercase leading-none text-foreground sm:text-5xl">
                  {post.title}
                </h2>
              </div>

              {showTeamStrip ? (
                <div className="mt-5 rounded-[1rem] border border-border bg-surface p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Teams in this post</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {post.teams.map((team) => {
                      const teamLogo = team.logo?.trim()

                      return (
                        <div key={team.name} className="flex w-[5.85rem] min-w-0 flex-col items-center rounded-xl border border-border bg-card p-3 text-center">
                          <div className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-xl bg-primary/10 text-lg leading-none text-primary">
                            {teamLogo ? (
                              <img src={teamLogo} alt={`${team.name} logo`} className="max-h-[2.85rem] max-w-[3.75rem] object-contain" loading="lazy" decoding="async" />
                            ) : (
                              <span className="font-display uppercase">{initialsFromName(team.name)}</span>
                            )}
                          </div>
                          <p className="mt-2 w-full break-words text-center text-[10px] font-black uppercase leading-4 text-foreground">{team.name}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {fullCaption ? (
                <div className="mt-6 rounded-[1rem] border border-border bg-surface p-5">
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Caption</p>
                  <p className="mt-3 text-sm leading-7 text-foreground">{fullCaption}</p>
                </div>
              ) : null}

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <a
                  href={post.permalink || siteConfig.links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black uppercase tracking-[0.11em] text-primary-foreground transition hover:shadow-glow"
                >
                  Open Instagram <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href={siteConfig.links.whatsappCommunity}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-black uppercase tracking-[0.11em] text-foreground transition hover:border-primary/50"
                >
                  WhatsApp <MessageCircle className="h-4 w-4" />
                </a>
              </div>

              <p className="mt-auto pt-8 text-xs leading-6 text-muted-foreground">
                Roar Arena is an independent fan experience brand. Match visuals are shown for fan coverage and community updates.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

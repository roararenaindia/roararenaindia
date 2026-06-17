'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import AssetLogo from '@/components/asset-logo'
import PostModal from '@/components/post-modal'
import { ArenaPost, siteConfig } from '@/lib/site-data'
import { usePublicHome } from '@/components/use-public-home'

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export default function LatestFromArena() {
  const { data } = usePublicHome()
  const livePosts = data.posts as ArenaPost[] | undefined
  const posts = (livePosts?.length && livePosts[0]?.logo && livePosts[0]?.teams ? livePosts : siteConfig.posts) as ArenaPost[]
  const [selectedPost, setSelectedPost] = useState<ArenaPost | null>(null)

  useEffect(() => {
    if (selectedPost && !posts.some((post) => post.id === selectedPost.id)) {
      setSelectedPost(null)
    }
  }, [posts, selectedPost])

  return (
    <section className="relative overflow-hidden bg-background py-16 sm:py-20 lg:py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Social feed</p>
            <h2 className="mt-3 font-display text-5xl uppercase leading-none text-foreground sm:text-6xl">Latest from the Arena</h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-muted-foreground md:text-right">
            Results, previews, fixtures, and matchday visuals. This section is ready to auto-sync from Instagram once credentials are connected.
          </p>
        </div>

        <motion.div
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {posts.map((post) => (
            <motion.article key={post.id} variants={item} className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-soft-glow transition duration-300 hover:-translate-y-1.5 hover:border-primary/45">
              <button type="button" onClick={() => setSelectedPost(post)} className="relative aspect-square w-full overflow-hidden bg-surface text-left" aria-label={`View ${post.title} post`}>
                <img src={post.image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]" loading="lazy" decoding="async" />
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-2xl border border-white/15 bg-black/55 p-2 backdrop-blur-xl">
                  <AssetLogo src={post.logo} alt={`${post.category} logo`} className="h-10 w-10 rounded-xl border-white/10 bg-black/60 p-1.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white">{post.type}</p>
                    <p className="text-[10px] font-bold text-white/70">{post.category}</p>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-4">
                  <div className="flex -space-x-2">
                    {post.teams.slice(0, 4).map((team) => (
                      <div key={team.name} className="relative h-9 w-9 rounded-full border border-white/20 bg-black/70 p-1 shadow-lg">
                        <img src={team.logo} alt={`${team.name} logo`} className="h-full w-full object-contain p-1" loading="lazy" decoding="async" />
                      </div>
                    ))}
                    {post.teams.length > 4 && (
                      <div className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-primary text-[10px] font-black text-white">
                        +{post.teams.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              </button>

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h3 className="font-display text-3xl uppercase leading-none text-foreground">{post.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{post.description}</p>
                <button
                  type="button"
                  onClick={() => setSelectedPost(post)}
                  className="mt-5 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-primary transition hover:bg-primary hover:text-primary-foreground"
                >
                  View Complete Post
                </button>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>

      {selectedPost && <PostModal isOpen={Boolean(selectedPost)} onClose={() => setSelectedPost(null)} post={selectedPost} />}
    </section>
  )
}

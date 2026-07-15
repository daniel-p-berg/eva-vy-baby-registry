import Image from "next/image";
import { ArrowDown, Heart, ShieldCheck, Sparkles } from "lucide-react";

import { ItemCard } from "@/components/item-card";
import { getPublicItems, getSiteContent } from "@/lib/public-data";

export const dynamic = "force-dynamic";

const storyPhotos = [
  {
    number: "01",
    title: "First adventures",
    subtitle: "Beach days",
    image: "/story/story-01.jpg",
    alt: "Daniel and Ngân smiling together near palm trees and surfboards.",
  },
  {
    number: "02",
    title: "Vietnam nights",
    subtitle: "Hoi An",
    image: "/story/story-02.jpg",
    alt: "Daniel and Ngân standing together at night in front of a lantern-lit Vietnamese courtyard.",
  },
  {
    number: "03",
    title: "Traditions",
    subtitle: "Áo dài",
    image: "/story/story-03.jpg",
    alt: "Daniel and Ngân wearing traditional Vietnamese áo dài outfits.",
  },
  {
    number: "04",
    title: "Engaged",
    subtitle: "Next chapter",
    image: "/story/story-04.jpg",
    alt: "Daniel and Ngân posing together for an engagement portrait.",
  },
  {
    number: "05",
    title: "Married",
    subtitle: "Our wedding",
    image: "/story/story-05.jpg",
    alt: "Daniel and Ngân kissing during their wedding celebration.",
  },
  {
    number: "06",
    title: "Eva Vy",
    subtitle: "First peek",
    image: "/story/story-06-ultrasound.jpg",
    alt: "Ultrasound image of baby Eva Vy.",
  },
] as const;

const storyGif = {
  title: "Bonus silliness",
  subtitle: "Photo booth loop",
  video: "/story/photo-booth-loop.mp4",
  alt: "Daniel and Ngân wearing playful photo booth glasses and props.",
} as const;

export default async function HomePage() {
  const [items, siteContent] = await Promise.all([
    getPublicItems(),
    getSiteContent(),
  ]);
  const storyParagraphs = siteContent.story_body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <main>
      <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24">
        <div className="pointer-events-none absolute left-[7%] top-16 size-3 rounded-full bg-peach-200" />
        <div className="pointer-events-none absolute right-[9%] top-32 size-5 rotate-12 rounded-sm bg-sage-300/50" />
        <div className="pointer-events-none absolute bottom-16 left-[20%] size-2 rounded-full bg-peach-300" />

        <div className="mx-auto max-w-6xl text-center">
          <span className="pill">
            <Sparkles className="mr-1.5 size-3" aria-hidden="true" />
            A little celebration
          </span>
          <h1 className="serif mx-auto mt-6 max-w-3xl text-5xl font-bold leading-[0.98] tracking-[-0.04em] text-ink sm:text-7xl">
            Welcome, little{" "}
            <span className="relative inline-block text-peach-700">
              Eva Vy
              <svg
                className="absolute -bottom-2 left-0 w-full text-peach-300"
                viewBox="0 0 210 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8.5C49 2 138 2.5 207 6"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
            We&apos;re so grateful to celebrate with you. Choose a gift or
            contribute to a group fund—every thoughtful gesture helps us get
            ready for Eva Vy&apos;s arrival.
          </p>
          <a href="#registry" className="button-primary mt-8">
            Explore the registry
            <ArrowDown className="size-4" aria-hidden="true" />
          </a>

          <section
            aria-labelledby="story-heading"
            className="mx-auto mt-14 max-w-6xl rounded-[2rem] border border-white bg-white/65 p-4 text-left shadow-soft backdrop-blur sm:rounded-[2.5rem] sm:p-5 lg:p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {storyPhotos.map((photo, index) => {
                const isEva = index === storyPhotos.length - 1;
                return (
                  <div
                    key={photo.number}
                    className={`group relative aspect-square overflow-hidden rounded-[1.5rem] border border-peach-100 bg-gradient-to-br shadow-sm ${
                      isEva
                        ? "from-sage-100 via-white to-peach-100"
                        : "from-peach-50 via-white to-sage-50"
                    }`}
                  >
                    <Image
                      src={photo.image}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                      priority={index < 3}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
                    <div className="absolute right-3 top-3 rounded-full bg-white/85 px-2 py-1 text-[10px] font-black tracking-[0.12em] text-peach-700 shadow-sm">
                      {photo.number}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                      <p className="text-sm font-bold">{photo.title}</p>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/75">
                        {photo.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 overflow-hidden rounded-[1.75rem] border border-peach-100 bg-ink text-left shadow-sm">
              <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
                <div className="relative aspect-[3/2] min-h-72 overflow-hidden lg:min-h-0">
                  <video
                    aria-label={storyGif.alt}
                    autoPlay
                    className="size-full object-cover"
                    loop
                    muted
                    playsInline
                    preload="metadata"
                  >
                    <source src={storyGif.video} type="video/mp4" />
                  </video>
                </div>
                <div className="flex flex-col justify-center bg-gradient-to-br from-ink to-peach-700 p-5 text-white sm:p-7">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-peach-100">
                    {storyGif.subtitle}
                  </p>
                  <h3 className="serif mt-2 text-3xl font-bold tracking-tight">
                    {storyGif.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/80">
                    A tiny preview of the household energy Eva Vy is joining:
                    soft hearts, questionable props, and absolutely no shortage
                    of bits.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-5 rounded-[1.5rem] bg-peach-50/70 p-5 sm:p-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-peach-700">
                  Before Eva Vy
                </p>
                <h2
                  id="story-heading"
                  className="serif mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
                >
                  {siteContent.story_title}
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-6 text-stone-600 sm:text-base sm:leading-7">
                {(storyParagraphs.length
                  ? storyParagraphs
                  : ["We’ll add our story here soon."]
                ).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </section>

          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
            {[
              [Heart, "Choose", "Pick one or more gifts"],
              [ShieldCheck, "Reserve", "We safely record your claim"],
              [Sparkles, "Send", "Pay with your preferred app"],
            ].map(([Icon, title, text]) => (
              <div
                key={String(title)}
                className="flex items-center gap-3 rounded-2xl border border-white bg-white/60 p-3.5"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-peach-100 text-peach-700">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <strong className="block text-sm">{String(title)}</strong>
                  <span className="text-xs text-stone-500">{String(text)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="registry"
        className="border-t border-peach-100 bg-white/30 px-4 py-16 sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.17em] text-peach-700">
                Gifts & group funds
              </p>
              <h2 className="serif mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
                A few things we&apos;ll love
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-stone-600">
              Add as many gifts as you like. For group funds, choose a suggested
              amount or enter your own.
            </p>
          </div>

          {items.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-4xl border border-peach-100 bg-white p-12 text-center shadow-soft">
              <h2 className="serif text-2xl font-bold">Registry coming soon</h2>
              <p className="mt-2 text-sm text-stone-600">
                Please check back for Eva Vy&apos;s gift list.
              </p>
            </div>
          )}
        </div>
      </section>

      <footer className="px-4 py-10 text-center text-sm text-stone-500">
        <p className="serif text-lg font-bold text-ink">Thank you for loving Eva Vy.</p>
        <p className="mt-1">Made with care for our family and friends.</p>
      </footer>
    </main>
  );
}

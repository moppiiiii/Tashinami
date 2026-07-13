import { createFileRoute } from "@tanstack/react-router";

import { DrinkShelf } from "@/components/drinks/drink-shelf";
import { AdaptiveHeader } from "@/components/layout/adaptive-header";
import { Footer } from "@/components/layout/footer";
import { userQueryOptions } from "@/server/auth";

// 公開ページ（未ログインでも閲覧可）。飲み方ガイドの入口＝器の並ぶ棚。
// コンテンツは src/content/drinks の静的データ。loader で user だけ ensure し、
// ログイン中はアプリのナビを出す（AdaptiveHeader）。
export const Route = createFileRoute("/drinks/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(userQueryOptions()),
  head: () => ({
    meta: [
      { title: "飲み方ガイド — 嗜み（Tashinami）" },
      {
        name: "description",
        content:
          "ビール・ワイン・日本酒・焼酎・ウイスキー・カクテル。適温、器、注ぎ方、合わせる肴を、カテゴリごとにまとめました。",
      },
    ],
  }),
  component: DrinksIndexPage,
});

function DrinksIndexPage() {
  return (
    <main className="tashinami-lp min-h-dvh">
      <div className="mx-auto w-full max-w-5xl px-6">
        <AdaptiveHeader />

        <section className="animate-lp-rise py-8 text-center motion-reduce:animate-none md:py-12">
          <p className="font-latin text-amber-bright text-lg tracking-[0.01em] italic">
            その一杯を、いちばん美味しく。
          </p>
          <h1 className="font-jp-serif mt-3 text-3xl leading-tight font-semibold md:text-5xl">
            飲み方を、知る。
          </h1>
          <p className="text-rice-dim mx-auto mt-5 max-w-lg leading-relaxed">
            同じ酒でも、温度と器と注ぎ方で、まるで別のものになる。
            記録する前に、まず一杯を整える。
          </p>
        </section>

        <section className="animate-lp-rise pb-4 [animation-delay:120ms] motion-reduce:animate-none">
          <DrinkShelf />
          <p className="text-rice-dim mt-6 text-center text-sm">
            器を選ぶと、その一杯の適温・器・手順・肴がひらく。
          </p>
        </section>

        <Footer />
      </div>
    </main>
  );
}

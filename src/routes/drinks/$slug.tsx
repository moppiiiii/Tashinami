import { createFileRoute, notFound } from "@tanstack/react-router";

import { DrinkGuideView } from "@/components/drinks/drink-guide";
import { AdaptiveHeader } from "@/components/layout/adaptive-header";
import { Footer } from "@/components/layout/footer";
import { getDrinkGuide } from "@/content/drinks";
import { userQueryOptions } from "@/server/auth";

// 公開ページ（未ログインでも閲覧可）。カテゴリ 1 つ分の飲み方。
// slug は categories.slug と同じ値（beer / wine / sake / shochu / whisky / cocktail）。
// ガイドを持たない slug（other など）は notFound へ落とす。
export const Route = createFileRoute("/drinks/$slug")({
  loader: async ({ context, params }) => {
    const guide = getDrinkGuide(params.slug);
    if (!guide) throw notFound();
    // ログイン中はアプリのナビを出す（AdaptiveHeader）。
    await context.queryClient.ensureQueryData(userQueryOptions());
    return guide;
  },
  head: ({ loaderData: guide }) => ({
    meta: guide
      ? [
          { title: `${guide.name}の飲み方 — 嗜み（Tashinami）` },
          {
            name: "description",
            content: `${guide.name}の適温・器・${guide.stepsTitle}・合わせる肴。${guide.tagline}`,
          },
        ]
      : [],
  }),
  component: DrinkGuidePage,
});

function DrinkGuidePage() {
  const guide = Route.useLoaderData();

  return (
    <main className="tashinami-lp min-h-dvh">
      <div className="mx-auto w-full max-w-5xl px-6">
        <AdaptiveHeader />
        <div className="animate-lp-rise py-6 motion-reduce:animate-none md:py-10">
          <DrinkGuideView guide={guide} />
        </div>
        <Footer />
      </div>
    </main>
  );
}

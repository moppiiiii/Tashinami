import { createFileRoute, Link } from "@tanstack/react-router";

import creatorImg from "@/assets/creator.webp";
import { Chip } from "@/components/common/chip";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { pageHead } from "@/lib/seo";

// 公開ページ（未ログインでも閲覧可）。制作者（運営者）自身の紹介。
// 画像・外部リンクなど作り込む余地があるため、legal（md）とは分けて JSX で実装する。
// TODO: X アカウント・ポートフォリオが用意できたら、準備中の表示をリンクに差し替える。

export const Route = createFileRoute("/creator")({
  head: () =>
    pageHead({
      title: "制作者について — 嗜み（Tashinami）",
      description: "嗜み（Tashinami）を制作している個人開発者の紹介です。",
      path: "/creator",
    }),
  component: CreatorPage,
});

function CreatorPage() {
  return (
    <main className="tashinami-lp min-h-dvh">
      <div className="mx-auto w-full max-w-3xl px-6">
        <Header />

        <section className="animate-lp-rise py-8 motion-reduce:animate-none md:py-12">
          <p className="text-rice-dim mb-2 text-[0.68rem] font-bold tracking-[0.28em] uppercase">
            Creator
          </p>
          <h1 className="font-jp-serif text-3xl font-semibold md:text-4xl">
            制作者について
          </h1>
          <p className="text-rice-dim mt-3 max-w-md leading-relaxed">
            いねにこ
            と申します。嗜み（Tashinami）を一人でつくっている個人開発者です。
          </p>

          <img
            src={creatorImg}
            alt="制作者"
            className="mt-8 w-full max-w-[240px] rounded-2xl border border-[color:var(--ink-line)]"
          />

          <div className="mt-10 space-y-8">
            <div className="space-y-2">
              <h2 className="font-jp-serif text-xl font-semibold">
                つくっている人
              </h2>
              <p className="text-rice-dim text-sm leading-relaxed">
                普段は Web
                アプリの開発をしています。お酒自体も好きですが、その夜の一杯にまつわる記憶を残したいと思い、自分のために
                Tashinami をつくりはじめました。
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="font-jp-serif text-xl font-semibold">
                なぜ Tashinami をつくったか
              </h2>
              <p className="text-rice-dim text-sm leading-relaxed">
                「たくさん飲んだ量」ではなく、一杯ずつと向き合い、その記憶を静かに積み重ねる場所がほしかった——それがこのサービスの出発点です。ほどよく、品よく、味わう。記録が溜まるほど、自分の好み・行きつけ・季節の移ろいが立ち上がってくる。そんな体験を目指しています。
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Chip>X（旧Twitter） ・ 準備中</Chip>
            <Chip>ポートフォリオ ・ 準備中</Chip>
          </div>

          <p className="text-rice-dim mt-8 text-sm">
            ご意見・不具合の報告などは
            <Link to="/contact" className="text-amber-bright mx-1">
              お問い合わせ
            </Link>
            からお願いします。
          </p>
        </section>

        <Footer />
      </div>
    </main>
  );
}

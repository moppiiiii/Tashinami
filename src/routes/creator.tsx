import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import creatorImg from "@/assets/creator.webp";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

// 公開ページ（未ログインでも閲覧可）。制作者（運営者）自身の紹介。
// 画像・外部リンクなど作り込む余地があるため、legal（md）とは分けて JSX で実装する。
const X_HANDLE = "your_handle"; // TODO: 実アカウントに差し替え
const PORTFOLIO_URL = "https://your-portfolio.example"; // TODO: 実 URL に差し替え

export const Route = createFileRoute("/creator")({
  head: () => ({
    meta: [
      { title: "制作者について — 嗜み（Tashinami）" },
      {
        name: "description",
        content: "嗜み（Tashinami）を制作している個人開発者の紹介です。",
      },
    ],
  }),
  component: CreatorPage,
});

function CreatorPage() {
  return (
    <main className="tashinami-lp min-h-dvh">
      <div className="mx-auto w-full max-w-3xl px-6">
        <Header />

        <section className="lp-rise py-8 md:py-12">
          <p className="lp-eyebrow mb-2">Creator</p>
          <h1 className="lp-serif text-3xl md:text-4xl">制作者について</h1>
          <p className="lp-dim mt-3 max-w-md leading-relaxed">
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
              <h2 className="lp-serif text-xl">つくっている人</h2>
              <p className="lp-dim text-sm leading-relaxed">
                普段は Web
                アプリの開発をしています。お酒自体も好きですが、その夜の一杯にまつわる記憶を残したいと思い、自分のために
                Tashinami をつくりはじめました。
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="lp-serif text-xl">なぜ Tashinami をつくったか</h2>
              <p className="lp-dim text-sm leading-relaxed">
                「たくさん飲んだ量」ではなく、一杯ずつと向き合い、その記憶を静かに積み重ねる場所がほしかった——それがこのサービスの出発点です。ほどよく、品よく、味わう。記録が溜まるほど、自分の好み・行きつけ・季節の移ろいが立ち上がってくる。そんな体験を目指しています。
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href={`https://x.com/${X_HANDLE}`}
              target="_blank"
              rel="noreferrer"
              className="lp-ghost no-underline"
            >
              X（旧Twitter）
              <ExternalLink size={16} />
            </a>
            <a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noreferrer"
              className="lp-ghost no-underline"
            >
              ポートフォリオ
              <ExternalLink size={16} />
            </a>
          </div>

          <p className="lp-dim mt-8 text-sm">
            ご意見・不具合の報告などは
            <Link to="/contact" className="lp-amber mx-1">
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

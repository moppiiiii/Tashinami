import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Library,
  MapPin,
  NotebookPen,
  Sparkles,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";
import { Chip } from "@/components/common/chip";
import { Meter } from "@/components/common/meter";
import { Footer } from "@/components/layout/footer";
import { DrinkImage } from "@/components/zukan/drink-image";

// 公開ランディング（未ログインでも見える）。コンセプト（docs/concept.md）の
// 世界観を伝えるだけの薄いページ。データはすべてダミー。
export const Route = createFileRoute("/")({
  component: Landing,
});

// ── ダミーデータ ───────────────────────────────────────────────
// ヒーローで重ねて見せる“一杯カード”。カテゴリの幅も一望できるよう選ぶ。
// slug は categories マスタと同じ値。器の絵と差し色がこれで決まる。
const showcase = {
  front: {
    name: "響 17年",
    category: "ウイスキー",
    slug: "whisky",
    rating: 9.2,
    place: "BAR 灯 · 神楽坂",
    date: "2026.6.28",
    note: "余韻に蜜と樽。長い夜のはじまり。",
  },
  left: {
    name: "醸し人九平次",
    category: "日本酒",
    slug: "sake",
    rating: 8.8,
  },
  right: {
    name: "甲州 きいろ香",
    category: "ワイン",
    slug: "wine",
    rating: 7.6,
  },
};

const features = [
  {
    icon: NotebookPen,
    title: "記録",
    body: "一杯を、数タップで。銘柄・場所・その夜の気分まで、負担なく残す。",
  },
  {
    icon: Library,
    title: "図鑑",
    body: "何と初めて出会ったか。出会った酒屋も蔵も、そのまま棚に灯る。",
  },
  {
    icon: Trophy,
    title: "TOP10",
    body: "お気に入りの一杯を、季節ごとにランキング。好みが輪郭を持つ。",
  },
  {
    icon: Sparkles,
    title: "年次サマリー",
    body: "一年の記録を、一夜の物語に。振り返って、また注ぎたくなる。",
  },
];

const topList = [
  { rank: 1, name: "響 17年", category: "ウイスキー", score: 9.2 },
  { rank: 2, name: "醸し人九平次", category: "日本酒", score: 8.8 },
  { rank: 3, name: "アードベッグ 10年", category: "ウイスキー", score: 8.6 },
  { rank: 4, name: "ドンナフガータ", category: "ワイン", score: 8.3 },
  { rank: 5, name: "常山 純米", category: "日本酒", score: 8.1 },
];

const wrappedStats = [
  { label: "この一年", value: "128", unit: "杯" },
  { label: "出会った銘柄", value: "47", unit: "種" },
  { label: "いちばんの夜", value: "BAR 灯", sub: "神楽坂 · 12回" },
  { label: "首位カテゴリ", value: "ウイスキー", sub: "全体の 41%" },
];

// ── ページ ─────────────────────────────────────────────────────
function Landing() {
  return (
    <main className="tashinami-lp">
      <div className="mx-auto w-full max-w-6xl px-6">
        <SiteHeader />
        <Hero />
        <Features />
        <Reflection />
        <ClosingCta />
        <Footer />
      </div>
    </main>
  );
}

function SiteHeader() {
  return (
    <header className="flex items-center justify-between py-6">
      <Link to="/" className="flex items-baseline gap-2 no-underline">
        <span className="font-jp-serif text-xl font-semibold text-[color:var(--rice)]">
          嗜み
        </span>
        <span className="text-rice-dim text-[0.68rem] font-bold tracking-[0.28em] uppercase">
          Tashinami
        </span>
      </Link>
      <nav className="flex items-center gap-6">
        <a
          href="#features"
          className="text-rice-dim hover:text-amber-bright hidden text-sm transition-colors sm:inline"
        >
          機能
        </a>
        <a
          href="#reflection"
          className="text-rice-dim hover:text-amber-bright hidden text-sm transition-colors sm:inline"
        >
          振り返り
        </a>
        <Link
          to="/drinks"
          className="text-rice-dim hover:text-amber-bright hidden text-sm no-underline transition-colors sm:inline"
        >
          飲み方
        </Link>
        <Link
          to="/concept"
          className="text-rice-dim hover:text-amber-bright hidden text-sm no-underline transition-colors sm:inline"
        >
          コンセプト
        </Link>
        <Button asChild variant="ghost">
          <Link to="/login" className="text-sm no-underline">
            ログイン
          </Link>
        </Button>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="grid items-center gap-12 py-12 md:grid-cols-2 md:py-20">
      <div className="animate-lp-rise motion-reduce:animate-none">
        <p className="font-latin text-amber-bright mb-4 text-lg tracking-[0.01em] italic">
          その夜の、一杯目。
        </p>
        <h1 className="font-jp-serif text-4xl leading-[1.15] font-semibold md:text-6xl">
          飲んだ一杯を、
          <br />
          静かに残す。
        </h1>
        <p className="text-rice-dim mt-6 max-w-md text-base leading-relaxed">
          銘柄も、出会った場所も、あの夜の気分も。ひと口ずつ書き留めていく、大人のための一杯日記。
          一年後、それはあなたの物語になる。
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link to="/login" className="no-underline">
              はじめる
              <ArrowRight size={18} />
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <a href="#features" className="no-underline">
              できることを見る
            </a>
          </Button>
        </div>
        <p className="text-rice-dim mt-6 text-sm">
          ビール・ワイン・日本酒・ウイスキー — すべての一杯を、ひとつの棚に。
        </p>
      </div>

      <div className="animate-lp-rise flex justify-center [animation-delay:120ms] motion-reduce:animate-none">
        <RecordShowcase />
      </div>
    </section>
  );
}

// signature：実際の“一杯カード”を重ねて浮かせる。プロダクトそのものを主役に。
function RecordShowcase() {
  return (
    <div className="lp-showcase">
      <div className="lp-showcase__glow" />
      <div className="lp-showcase__deck">
        {/* 背面の 2 枚（カテゴリの幅を示す） */}
        <GhostCard drink={showcase.left} side="l" />
        <GhostCard drink={showcase.right} side="r" />

        {/* 手前の 1 枚（詳細まで見せる） */}
        <Card as="article" className="lp-showcase__front p-6">
          {/* 器は見出し帯の専用列。ほかのどの要素とも重ならない。 */}
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Chip>{showcase.front.category}</Chip>
                <span className="text-rice-dim text-xs">
                  {showcase.front.date}
                </span>
              </div>
              <h3 className="font-jp-serif mt-2.5 truncate text-xl leading-snug font-semibold">
                {showcase.front.name}
              </h3>
              <p className="text-rice-dim mt-1.5 flex items-center gap-1 text-xs">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">{showcase.front.place}</span>
              </p>
            </div>
            <DrinkImage slug={showcase.front.slug} size={76} eager />
          </div>

          <p className="mt-4 text-sm leading-relaxed">{showcase.front.note}</p>
          <div className="mt-5 flex items-center gap-3">
            <Meter percent={showcase.front.rating * 10} className="flex-1" />
            <span className="font-latin text-amber-bright text-sm tabular-nums">
              {showcase.front.rating.toFixed(1)}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function GhostCard({
  drink,
  side,
}: {
  drink: { name: string; category: string; slug: string; rating: number };
  side: "l" | "r";
}) {
  return (
    <Card
      as="article"
      className={`lp-showcase__ghost lp-showcase__ghost--${side} p-6`}
    >
      {/* 手前のカードと同じ骨格。器は隠れる位置でも動かさない。 */}
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <Chip>{drink.category}</Chip>
          <h3 className="font-jp-serif mt-2.5 truncate text-lg leading-snug font-semibold">
            {drink.name}
          </h3>
        </div>
        <DrinkImage slug={drink.slug} size={76} glow={false} />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Meter percent={drink.rating * 10} className="flex-1" />
        <span className="font-latin text-amber-bright text-sm tabular-nums">
          {drink.rating.toFixed(1)}
        </span>
      </div>
    </Card>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-8 py-12 md:py-16">
      <div className="mb-10 max-w-xl">
        <p className="text-rice-dim mb-2 text-[0.68rem] font-bold tracking-[0.28em] uppercase">
          できること
        </p>
        <h2 className="font-jp-serif text-2xl font-semibold md:text-4xl">
          記録は、やがて物語になる。
        </h2>
        <p className="text-rice-dim mt-4 leading-relaxed">
          残すのは今夜の一杯。積み重なれば、地図が灯り、順位が生まれ、一年の物語が編まれる。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card as="article" hover key={feature.title} className="p-6">
            <Chip className="mb-4 size-10 justify-center rounded-full p-0">
              <feature.icon size={18} />
            </Chip>
            <h3 className="font-jp-serif text-lg font-semibold">
              {feature.title}
            </h3>
            <p className="text-rice-dim mt-2 text-sm leading-relaxed">
              {feature.body}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Reflection() {
  return (
    <section id="reflection" className="scroll-mt-8 py-12 md:py-16">
      <div className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_1fr]">
        {/* TOP10 プレビュー */}
        <Card className="p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-rice-dim mb-2 text-[0.68rem] font-bold tracking-[0.28em] uppercase">
                2026 · これまでの TOP10
              </p>
              <h2 className="font-jp-serif text-2xl font-semibold">
                好きな一杯が、並ぶ。
              </h2>
            </div>
            <Trophy className="text-amber-bright" size={22} />
          </div>
          <ol className="space-y-1">
            {topList.map((item) => (
              <li
                key={item.rank}
                className="flex items-center gap-4 rounded-lg px-2 py-3"
              >
                <span className="font-latin text-amber w-6 text-lg font-bold tabular-nums">
                  {item.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{item.name}</p>
                  <p className="text-rice-dim text-xs">{item.category}</p>
                </div>
                <span className="font-latin text-amber-bright text-sm tabular-nums">
                  {item.score.toFixed(1)}
                </span>
              </li>
            ))}
          </ol>
          <div className="via-ink-line mt-2 h-px bg-linear-to-r from-transparent to-transparent" />
          <p className="text-rice-dim mt-4 text-xs">
            …このあとに 10 位まで続く。TOP10 は季節ごとにも切り替わる。
          </p>
        </Card>

        {/* 年次サマリー（Wrapped）プレビュー */}
        <div className="lp-wrapped p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-rice-dim text-[0.68rem] font-bold tracking-[0.28em] uppercase">
              2026 WRAPPED
            </p>
            <Sparkles className="text-amber-bright" size={20} />
          </div>
          <h2 className="font-jp-serif text-2xl leading-snug font-semibold md:text-3xl">
            あなたの一年を、
            <br />
            一夜の物語に。
          </h2>

          <div className="mt-6 grid grid-cols-2 gap-4">
            {wrappedStats.map((stat) => (
              <Card key={stat.label} className="p-4">
                <p className="text-rice-dim text-xs">{stat.label}</p>
                <p className="font-jp-serif mt-1 text-2xl leading-none font-semibold">
                  {stat.value}
                  {stat.unit ? (
                    <span className="text-rice-dim ml-1 text-sm">
                      {stat.unit}
                    </span>
                  ) : null}
                </p>
                {stat.sub ? (
                  <p className="text-amber-bright mt-1 text-xs">{stat.sub}</p>
                ) : null}
              </Card>
            ))}
          </div>

          <p className="mt-6 inline-flex rounded-full border border-[rgba(207,146,71,0.3)] bg-[rgba(207,146,71,0.1)] px-4 py-2 text-sm">
            あなたは{" "}
            <span className="text-amber-bright mx-1">『余韻を追いかける』</span>{" "}
            タイプ。
          </p>
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="py-16 text-center md:py-24">
      <p className="font-latin text-amber-bright mb-4 text-lg tracking-[0.01em] italic">
        さあ、一杯目を。
      </p>
      <h2 className="font-jp-serif mx-auto max-w-2xl text-3xl leading-tight font-semibold md:text-5xl">
        今夜の一杯から、はじめる。
      </h2>
      <div className="mt-8 flex justify-center">
        <Button asChild>
          <Link to="/login" className="no-underline">
            記録をはじめる
            <ArrowRight size={18} />
          </Link>
        </Button>
      </div>
    </section>
  );
}

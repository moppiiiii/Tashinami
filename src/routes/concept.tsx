import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/common/button";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { pageHead } from "@/lib/seo";

// 公開ページ（未ログインでも閲覧可）。docs/concept.md の §1（コンセプト）と
// §9（非目標）を、機能紹介ではなく読み物として提示する。LP が語らない
// 「やらないこと」を明言する場所。
export const Route = createFileRoute("/concept")({
  head: () =>
    pageHead({
      title: "コンセプト — 嗜み（Tashinami）",
      description:
        "嗜み（Tashinami）は飲んだ量を競うアプリではありません。大切にすること、やらないことを記します。",
      path: "/concept",
    }),
  component: ConceptPage,
});

const values = [
  {
    term: "記録が、負担にならない。",
    desc: "飲んだ直後の、指がうまく動かない夜でも。数タップで残せることを守ります。",
  },
  {
    term: "振り返りが、楽しい。",
    desc: "TOP10、地図、年次サマリー。積み重ねが「自分の物語」として返ってくること。",
  },
  {
    term: "佇まいが、良い。",
    desc: "大人が使って気恥ずかしくない、落ち着いた美しさ。バーの間接照明のような。",
  },
];

const nonGoals = [
  {
    term: "飲んだ量や回数を、煽る。",
    desc: "連続記録も、ノルマも、達成バッジもありません。飲まなかった夜を責めない。",
  },
  {
    term: "フォローとタイムラインのある SNS。",
    desc: "基本は自分だけの記録です。見せたい一杯だけ、リンクで手渡しできます。",
  },
  {
    term: "終始ふざけた UI。",
    desc: "遊び心は、記録できた瞬間と、一年の振り返りにだけ。ふだんは静かにしています。",
  },
];

function ConceptPage() {
  return (
    <main className="tashinami-lp min-h-dvh">
      <div className="mx-auto w-full max-w-3xl px-6">
        <Header />

        <article className="animate-lp-rise flex flex-col gap-18 py-8 motion-reduce:animate-none md:py-12">
          <section className="flex flex-col gap-5">
            <p className="text-rice-dim text-[0.68rem] font-bold tracking-[0.28em] uppercase">
              Concept
            </p>
            <h1 className="font-jp-serif text-3xl leading-[1.25] font-semibold text-balance md:text-5xl">
              飲む量ではなく、
              <br />
              飲み方の話をします。
            </h1>

            <div className="flex flex-col gap-2 border-l border-[rgba(207,146,71,0.35)] pl-6">
              <p className="font-jp-serif text-2xl font-semibold">
                嗜む
                <span className="text-rice-dim ml-2 text-base font-normal">
                  たしなむ
                </span>
              </p>
              <p className="font-jp-serif text-amber-bright text-lg">
                ほどよく、品よく、味わうこと。
              </p>
            </div>

            <p className="text-rice-dim leading-relaxed">
              嗜み（Tashinami）は、たくさん飲んだ量を競うためのアプリではありません。一杯ずつと向き合い、その記憶を静かに積み重ねるための場所です。記録が溜まるほど、自分の好み、行きつけ、季節の移ろいが、少しずつ輪郭を持ちはじめます。
            </p>
          </section>

          <section className="flex flex-col gap-7">
            <div className="flex flex-col gap-2">
              <p className="text-rice-dim text-[0.68rem] font-bold tracking-[0.28em] uppercase">
                大切にすること
              </p>
              <h2 className="font-jp-serif text-2xl font-semibold md:text-3xl">
                三つだけ、決めています。
              </h2>
            </div>

            <div className="flex flex-col gap-6">
              {values.map((value) => (
                <div
                  key={value.term}
                  className="grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-1.5"
                >
                  <span className="bg-amber mt-2.5 size-1.5 rounded-full" />
                  <p className="font-jp-serif text-lg font-semibold">
                    {value.term}
                  </p>
                  <p className="text-rice-dim col-start-2 text-sm leading-relaxed">
                    {value.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-7">
            <div className="flex flex-col gap-2">
              <p className="text-rice-dim text-[0.68rem] font-bold tracking-[0.28em] uppercase">
                やらないこと
              </p>
              <h2 className="font-jp-serif text-2xl font-semibold md:text-3xl">
                つくらないものも、決めています。
              </h2>
            </div>

            <ul className="flex list-none flex-col gap-5 p-0">
              {nonGoals.map((nonGoal) => (
                <li key={nonGoal.term}>
                  <span className="font-jp-serif text-rice-dim decoration-amber text-lg line-through decoration-[1.5px]">
                    {nonGoal.term}
                  </span>
                  <p className="text-rice-dim mt-1.5 text-sm leading-relaxed opacity-80">
                    {nonGoal.desc}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="border-ink-line flex flex-col items-start gap-5 border-t pt-12">
            <p className="font-latin text-amber-bright text-lg tracking-[0.01em] italic">
              さあ、一杯目を。
            </p>
            <h2 className="font-jp-serif text-2xl leading-tight font-semibold text-balance md:text-4xl">
              今夜の一杯から、はじめる。
            </h2>
            <Button asChild>
              <Link to="/login" className="no-underline">
                記録をはじめる
                <ArrowRight size={18} />
              </Link>
            </Button>
            <p className="text-rice-dim text-sm">
              つくっている人のことは
              <Link to="/creator" className="text-amber-bright mx-1">
                制作者について
              </Link>
              に書いています。
            </p>
          </section>
        </article>

        <Footer />
      </div>
    </main>
  );
}

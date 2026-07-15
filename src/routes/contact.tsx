import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

import { Card } from "@/components/common/card";
import { Chip } from "@/components/common/chip";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { pageHead } from "@/lib/seo";

// 連絡先。プラポリ・利用規約が案内する問い合わせ窓口の実体。
// TODO: X アカウントを用意したら、ハンドルとプロフィールへのリンクに差し替える。
export const Route = createFileRoute("/contact")({
  head: () =>
    pageHead({
      title: "お問い合わせ — 嗜み（Tashinami）",
      description: "嗜み（Tashinami）のお問い合わせ窓口は準備中です。",
      path: "/contact",
    }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <main className="tashinami-lp min-h-dvh">
      <div className="mx-auto w-full max-w-3xl px-6">
        <Header />

        <section className="animate-lp-rise py-8 motion-reduce:animate-none md:py-12">
          <p className="text-rice-dim mb-2 text-[0.68rem] font-bold tracking-[0.28em] uppercase">
            Contact
          </p>
          <h1 className="font-jp-serif text-3xl font-semibold md:text-4xl">
            お問い合わせ
          </h1>
          <p className="text-rice-dim mt-3 max-w-md leading-relaxed">
            ご意見・ご要望、不具合のご報告をお寄せいただける窓口を準備しています。開設までもうしばらくお待ちください。
          </p>

          <Card className="mt-8 p-6 md:p-8">
            <div className="flex items-center gap-3">
              <Chip className="flex size-10 items-center justify-center rounded-full p-0">
                <MessageCircle size={18} />
              </Chip>
              <div className="min-w-0">
                <p className="text-rice-dim text-xs">X（旧Twitter）</p>
                <p className="font-jp-serif truncate text-lg font-semibold">
                  準備中
                </p>
              </div>
            </div>
            <p className="text-rice-dim mt-4 text-sm leading-relaxed">
              X の DM
              で受け付ける予定です。アカウントを用意でき次第、ここに掲載します。
            </p>
          </Card>
        </section>

        <Footer />
      </div>
    </main>
  );
}

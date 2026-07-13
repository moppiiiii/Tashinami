import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, MessageCircle } from "lucide-react";

import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";
import { Chip } from "@/components/common/chip";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

// 連絡先。プラポリ・利用規約が案内する問い合わせ窓口の実体。
// 問い合わせは X（旧Twitter）の DM で受け付ける。
const X_HANDLE = "your_handle"; // TODO: 実アカウントに差し替え
const X_URL = `https://x.com/${X_HANDLE}`;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "お問い合わせ — 嗜み（Tashinami）" },
      {
        name: "description",
        content:
          "嗜み（Tashinami）へのお問い合わせは X の DM で受け付けています。",
      },
    ],
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
            ご意見・ご要望、不具合のご報告などは X（旧Twitter）の DM
            で受け付けています。いただいた内容には、数日以内を目安にお返事します。
          </p>

          <Card className="mt-8 p-6 md:p-8">
            <div className="flex items-center gap-3">
              <Chip className="flex size-10 items-center justify-center rounded-full p-0">
                <MessageCircle size={18} />
              </Chip>
              <div className="min-w-0">
                <p className="text-rice-dim text-xs">X（旧Twitter）</p>
                <p className="font-jp-serif truncate text-lg font-semibold">
                  @{X_HANDLE}
                </p>
              </div>
            </div>
            <p className="text-rice-dim mt-4 text-sm leading-relaxed">
              下のボタンからプロフィールを開き、DM よりご連絡ください。
            </p>
            <div className="mt-5">
              <Button asChild>
                <a
                  href={X_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="no-underline"
                >
                  X で問い合わせる
                  <ExternalLink size={16} />
                </a>
              </Button>
            </div>
          </Card>
        </section>

        <Footer />
      </div>
    </main>
  );
}

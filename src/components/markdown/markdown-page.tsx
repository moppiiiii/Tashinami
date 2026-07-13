import Markdown from "react-markdown";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

import styles from "./markdown-page.module.css";

export function MarkdownPage({ markdown }: { markdown: string }) {
  return (
    <main className="tashinami-lp min-h-dvh">
      <div className="mx-auto w-full max-w-3xl px-6">
        <Header />
        <article
          className={`animate-lp-rise motion-reduce:animate-none ${styles.body} py-8 md:py-12`}
        >
          <Markdown>{markdown}</Markdown>
        </article>
        <Footer />
      </div>
    </main>
  );
}

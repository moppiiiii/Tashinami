import { env } from "@/env";

export const APP_TITLE = env.VITE_APP_TITLE ?? "嗜み — Tashinami";
export const APP_DESCRIPTION =
  "飲んだ一杯を静かに残す、大人のための一杯日記。ビール・ワイン・日本酒・ウイスキーの銘柄も、出会った場所も、その夜の気分も。記録は図鑑・TOP10・年次サマリーとなり、一年の物語になる。";
export const APP_URL = env.VITE_APP_URL ?? "http://localhost:3000";
export const OGP_IMAGE = `${APP_URL}/ogp.jpg`;

/**
 * 公開ページの head。title と description だけ上書きしても、SNS のカードは
 * __root の og:*／twitter:* を読むため全ページ同じ顔になる。ここで一緒に差し替える。
 * canonical は __root には置かない（子が足す 1 枚だけにする）。
 */
export function pageHead({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  /** サイトルートからの絶対パス（"/drinks/whisky"）。 */
  path: string;
}) {
  const url = `${APP_URL}${path}`;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

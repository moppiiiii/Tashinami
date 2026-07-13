# スタイリング規約 — Tailwind と CSS の境界

Tashinami のスタイルは 2 箇所にある。

- **`src/styles.css`** — トークンの正本。パレット・書体・`@theme`・`@keyframes`。値の定義はすべてここ。
- **`src/styles.components.css`** — コンポーネント層（`layer(components)` で読み込む）。`lp-*` / `dg-*` の名前付き部品。
- **JSX の `className`** — Tailwind ユーティリティ。

迷ったときに「とりあえず CSS に書く」と、CSS だけが太り続ける。どちらに書くかは以下で機械的に決める。

## 角括弧テスト

**Tailwind の標準ユーティリティと `@theme` トークンだけで書けるなら JSX に書く。**
次の 4 条件のどれかに当たったときだけ `styles.components.css` に置く。

### 条件 1 — 装飾に任意値 `[...]` が要る

読めなくなる／一意でなくなるのは「装飾」の任意値だけ。**寸法の任意値は Tailwind のままでよい。**

| 種類 | 例 | 行き先 |
| --- | --- | --- |
| 寸法 | `grid-cols-[auto_1fr]` `w-[420px]` `top-[11%]` | Tailwind |
| 装飾 | 多層 `background` グラデーション、複合 `box-shadow`、`filter: blur()`、`cubic-bezier()`、`transform: translate(-50%,-50%)` との合成 | CSS |

`shadow-[0_1px_0_rgba(255,236,200,0.08)_inset,0_30px_60px_rgba(0,0,0,0.55)]` のような文字列を書きそうになったら、それは CSS の仕事。

### 条件 2 — `animation` / `@keyframes`

`@keyframes` は `styles.css`、それを使う側は `styles.components.css`。
**`prefers-reduced-motion: reduce` の打ち消しを必ず同じファイルにセットで書く。** これを JSX 側に散らすと打ち消し漏れが必ず出る。

```css
.lp-showcase__glow {
  animation: lp-breathe 6s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .tashinami-lp .lp-showcase__glow {
    animation: none;
  }
}
```

### 条件 3 — `::before` / `::after` の `content`

輪染み（`.tashinami-lp::before`）、棚の灯り（`.dg-shelf::after`）、手順をつなぐ軸（`.dg-step__mark::after`）など。
Tailwind の `before:` 修飾子は使わない。

### 条件 4 — 同じ見た目が 3 箇所以上で再利用される

名前を持つべき部品。ただし**まず React コンポーネント化を検討する**（`src/components/common/`）。
コンポーネントにできず、かつクラス名で配りたいときだけ CSS クラスにする。

## 色は生値で書かない

`styles.components.css` 内の `rgba(207, 146, 71, …)` は `--amber` の生値。新しく書くときは `color-mix()` でトークンから導出する。

```css
/* 避ける */
border: 1px solid rgba(207, 146, 71, 0.3);

/* こう書く */
border: 1px solid color-mix(in oklab, var(--amber) 30%, transparent);
```

カテゴリの差し色は `--dg-accent` を inline style で受け、CSS 側は `var(--dg-accent, var(--amber))` でフォールバックする。

## 器の幅（ページの max-w）

ページの外枠は `main.tashinami-lp > div.mx-auto.w-full.max-w-*.px-6` で統一する。
**幅は「そのページが何を載せる器か」の表明**なので、値を全ページで揃えない。下の段から選ぶ。

| 幅 | 何を載せるか | 例 |
| --- | --- | --- |
| `max-w-6xl` | LP。2 カラムのヒーローと 4 枚グリッドが要る | `/` |
| `max-w-5xl` | 棚（カードを広く並べる） | `/drinks` `/drinks/$slug` |
| `max-w-4xl` | アプリの一覧・棚 | `/home` `/records` `/zukan` |
| `max-w-3xl` | 読み物（1 カラムの散文）。1 行が長くなりすぎない | `/concept` `/creator` `/contact` 規約・プラポリ |
| `max-w-2xl` | 入力フォーム。広げると入力欄が間延びする | `/records/new` `/records/$recordId/edit` |

新しいページはこの 5 段から選ぶ。**当てはまる段が無いと感じたら、まず本当に新しい型かを疑う。**
`5xl`（棚）と `4xl`（一覧）はいずれ寄せる候補。増やすなら、この表に行を足してから使う。

## フッターの出し分け

- **公開ページ** — `Footer`（`src/components/layout/footer.tsx`）。コンセプト・飲み方ガイド・制作者などの回遊導線を含む。
- **ログイン後** — `AppFooter`（`src/components/layout/app-footer.tsx`）。法務（利用規約・プライバシーポリシー）と問い合わせ窓口だけ。登録済みの人にマーケ導線は出さない。
- **フォーム画面**（`/records/new` `/records/$recordId/edit`）— **どちらも置かない**。ヘッダーすら戻りリンクだけに削いだ集中モードなので、下端に帯を足さない。

## 優先順位

`styles.components.css` は `layer(components)` で読み込むので、**呼び出し側の Tailwind ユーティリティが常に勝つ**。
部品はデフォルトの見た目だけを持ち、個別調整は JSX の className で上書きする。CSS 側に `!important` や詳細度稼ぎのセレクタを足さない。

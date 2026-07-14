// 飲み方ガイドのコンテンツ型。DB ではなくコードで持つ静的な読み物
// （編集者は運営者一人・DB 往復ゼロで配信したいため）。
// slug は Supabase の categories.slug と一致させること（器の絵・差し色がこれで決まる）。

/** 適温。目盛り（scale）の上に飲み頃の帯（band）を重ねて描く。 */
export type Temperature = {
  /** 目盛りの下限・上限（℃）。カテゴリごとに違ってよい（ビールと燗では幅が違う）。 */
  scale: { min: number; max: number };
  /** 飲み頃の帯（℃）。scale の内側に収める。 */
  band: { from: number; to: number };
  /** 目盛りに刻む値（℃）。両端を含める。 */
  ticks: number[];
  /** 一覧・札に出す短い表記。例: "6–13℃" */
  short: string;
  /** 温度について、いちばん伝えたい一行。 */
  note: string;
};

/** 器。名前と、それを選ぶ理由。 */
export type Glass = { name: string; note: string };

/** 手順の 1 ステップ。 */
export type Step = { title: string; body: string };

/**
 * 作り方 1 つ分。飲み方（ハイボール・ロック…）や注ぎ方・燗の付け方など、
 * カテゴリの中で手順が分かれるものを 1 件ずつ持つ。
 * meta は見出しに添える短い注記（比率・適温など）。
 */
export type Method = {
  /** タブに出る名前。styles の name と揃えると行き来しやすい。 */
  name: string;
  /** 比率・適温など。無い作り方もある。 */
  meta?: string;
  /** その作り方を一行で。 */
  note: string;
  steps: Step[];
};

/**
 * 見取り図の 1 行。カテゴリによって「何の一覧か」が変わる
 * （ビールならスタイル、焼酎なら割り方、ウイスキーなら飲み方）。
 * meta は右端に出る短い注記（適温・比率など）。無い行もある。
 */
export type StyleRow = { name: string; note: string; meta?: string };

export type DrinkGuide = {
  /** categories.slug と一致（beer / wine / sake / shochu / whisky / cocktail）。 */
  slug: string;
  name: string;
  /** ラテン表記。一覧の器の下と、詳細の札に出る。 */
  latin: string;
  /** 見出しになる一行。 */
  tagline: string;
  /** 見出しの下のリード文。 */
  lead: string;
  temperature: Temperature;
  glasses: Glass[];
  /** 作り方の見出し。カテゴリで変わる（"注ぎ方" / "温度のつけ方" / "割り方"）。 */
  methodsTitle: string;
  /** 作り方。先頭がそのカテゴリの基本（タブの初期選択になる）。 */
  methods: Method[];
  /** 見取り図の見出し（"スタイルの見取り図" / "割り方の見取り図"）。 */
  stylesTitle: string;
  styles: StyleRow[];
  pairings: string[];
  /** 肴の選び方の勘所を一行で。 */
  pairingNote: string;
};

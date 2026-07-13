// このアプリは「日本時間で一杯を数える」。
//
// new Date(iso).getFullYear() のようなローカル依存の読み方をすると、サーバー（UTC）と
// ブラウザ（JST）で結果が変わり、SSR とハイドレーションが食い違う。JST はサマータイムが
// 無いので、+9h してから getUTC* で読めば、どの環境でも同じ壁時計になる。
//
// 保存は ISO（絶対時刻）のまま。ここで固定しているのは表示と入力の解釈だけ。
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const MS_DAY = 86_400_000;

const pad = (n: number) => String(n).padStart(2, "0");

/** 絶対時刻 → 日本時間の壁時計。getUTC* で読む前提の Date を返す。 */
function jstWall(value: string | number | Date): Date | null {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getTime() + JST_OFFSET_MS);
}

/** 今（日本時間の壁時計）。 */
export function jstNow(): Date {
  return new Date(Date.now() + JST_OFFSET_MS);
}

/** その日の 0 時を表す通し番号。日数の引き算用。 */
function jstDayStart(wall: Date): number {
  return Date.UTC(wall.getUTCFullYear(), wall.getUTCMonth(), wall.getUTCDate());
}

/** 「2025.7.13」 */
export function formatJstDate(iso: string): string {
  const w = jstWall(iso);
  if (!w) return "";
  return `${w.getUTCFullYear()}.${w.getUTCMonth() + 1}.${w.getUTCDate()}`;
}

/** 「2.14」（年を出さない短い表記）。 */
export function formatJstMonthDay(iso: string): string {
  const w = jstWall(iso);
  if (!w) return "";
  return `${w.getUTCMonth() + 1}.${w.getUTCDate()}`;
}

/** 月（0〜11、日本時間）。壊れた値なら null。 */
export function jstMonth(iso: string): number | null {
  const w = jstWall(iso);
  return w ? w.getUTCMonth() : null;
}

/** 今日から見て何日前か。壊れた値なら null。 */
export function jstDaysAgo(iso: string, now: Date = jstNow()): number | null {
  const w = jstWall(iso);
  if (!w) return null;
  return Math.round((jstDayStart(now) - jstDayStart(w)) / MS_DAY);
}

/** 同じ月か（日本時間で）。 */
export function isSameJstMonth(iso: string, now: Date = jstNow()): boolean {
  const w = jstWall(iso);
  return (
    w != null &&
    w.getUTCFullYear() === now.getUTCFullYear() &&
    w.getUTCMonth() === now.getUTCMonth()
  );
}

/** 日時入力の値 "YYYY-MM-DDTHH:mm"（日本時間の壁時計）。既定は今。 */
export function toJstInput(value: string | Date = new Date()): string {
  const w = jstWall(value) ?? jstNow();
  return `${w.getUTCFullYear()}-${pad(w.getUTCMonth() + 1)}-${pad(w.getUTCDate())}T${pad(w.getUTCHours())}:${pad(w.getUTCMinutes())}`;
}

/** 日時入力の値（日本時間の壁時計）→ ISO（絶対時刻）。読めなければ undefined。 */
export function fromJstInput(value: string): string | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return undefined;
  const [, y, mo, d, h, mi] = m;
  return new Date(
    Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi)) -
      JST_OFFSET_MS,
  ).toISOString();
}

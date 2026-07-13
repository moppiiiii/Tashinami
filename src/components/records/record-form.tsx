import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDown, Heart } from "lucide-react";
import { useMemo } from "react";

import { buildEncounters, findEncounter } from "@/components/zukan/encounters";
import { useAddRecord } from "@/hooks/use-add-record";
import { useUpdateRecord } from "@/hooks/use-update-record";
import type { Category } from "@/schemas/categories";
import type { DrinkRecord } from "@/schemas/records";
import { recordsQueryOptions } from "@/server/records";

import { NameSuggest } from "./name-suggest";
import type { RevealResult } from "./record-reveal";
import { StarRating } from "./star-rating";

// datetime-local 用に「今」をローカル時刻の "YYYY-MM-DDTHH:mm" へ整形する。
function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 一杯を記録／編集するフォーム。検証は schemas の zod を field 単位で共有し、
// 楽観フック（useAddRecord / useUpdateRecord）で即時に一覧へ反映する。
// record を渡すと編集モードになり、保存後は onUpdated（リヴィールなし）を呼ぶ。
// onSuccess は新規追加時のみ。遷移とリヴィールの起動はページ側の仕事。
export function RecordForm({
  categories,
  record,
  onSuccess,
  onUpdated,
}: {
  categories: Category[];
  record?: DrinkRecord;
  onSuccess?: (result: RevealResult) => void;
  onUpdated?: () => void;
}) {
  const addRecord = useAddRecord();
  const updateRecord = useUpdateRecord();
  const isEdit = record != null;

  // 既知の銘柄（＝図鑑のマス）。サジェストと初/再会の判定に使う。
  // 編集中の一杯は自分自身を数えないよう除いておく（「N杯目」がずれる）。
  const { data: records } = useSuspenseQuery(recordsQueryOptions());
  const encounters = useMemo(
    () =>
      buildEncounters(
        record ? records.filter((r) => r.id !== record.id) : records,
      ),
    [records, record],
  );

  const form = useForm({
    defaultValues: {
      name: record?.name ?? "",
      categoryId: record?.category?.id ?? "",
      rating: (record?.rating ?? null) as number | null,
      isFavorite: record?.isFavorite ?? false,
      memo: record?.memo ?? "",
      drunkAt: toLocalInput(record ? new Date(record.drunkAt) : new Date()),
      placeName: record?.placeName ?? "",
      price: record?.price != null ? String(record.price) : "",
      abv: record?.abv != null ? String(record.abv) : "",
    },
    onSubmit: async ({ value, formApi }) => {
      const name = value.name.trim();

      // 既知の銘柄（＝再会）なら、その出会いが持つカテゴリを引き継ぐ。
      // 選ばずに保存されても図鑑が「未分類」に落ちないよう、ここで拾っておく。
      const known = findEncounter(name, encounters);
      const categoryId = value.categoryId || known?.categoryId || null;
      const category = categories.find((c) => c.id === categoryId) ?? null;

      // フォーム値 → 楽観フック入力（camelCase）。追加・編集で共有する。
      const fields = {
        name,
        categoryId,
        rating: value.rating,
        isFavorite: value.isFavorite,
        memo: value.memo.trim() || null,
        placeName: value.placeName.trim() || null,
        price: value.price === "" ? null : Number(value.price),
        abv: value.abv === "" ? null : Number(value.abv),
        drunkAt: value.drunkAt
          ? new Date(value.drunkAt).toISOString()
          : undefined,
        category: category ? { id: category.id, name: category.name } : null,
      };

      // 編集：更新して閉じるだけ（リヴィール演出は初めての出会いのためのもの）。
      if (record) {
        await updateRecord.mutateAsync({ id: record.id, ...fields });
        onUpdated?.();
        return;
      }

      await addRecord.mutateAsync(fields);
      formApi.reset();
      onSuccess?.({
        name,
        categoryName: category?.name ?? null,
        categorySlug: category?.slug ?? null,
        isFirst: !known,
        revisit: (known?.count ?? 0) + 1,
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      className="lp-card flex flex-col"
    >
      <div className="px-6 pt-6 pb-4 md:px-8 md:pt-8">
        <p className="lp-kicker text-base">
          {isEdit ? "この一杯を、もう一度。" : "今夜の一杯。"}
        </p>
        <h2 className="lp-serif mt-1 text-xl">
          {isEdit ? "編集する" : "記録する"}
        </h2>
      </div>

      <div className="px-6 md:px-8">
        <div className="grid grid-cols-1 gap-5 pb-1 sm:grid-cols-2">
          <form.Field
            name="name"
            validators={{
              onSubmit: ({ value }) =>
                value.trim() ? undefined : "銘柄・名前を入力してください",
            }}
          >
            {(field) => (
              <NameSuggest
                id={field.name}
                name={field.name}
                value={field.state.value}
                invalid={field.state.meta.errors.length > 0}
                isEdit={isEdit}
                encounters={encounters}
                categories={categories}
                onChange={(v) => field.handleChange(v)}
                onBlur={field.handleBlur}
                onPick={(encounter) => {
                  field.handleChange(encounter.name);
                  // 図鑑が知っているカテゴリを連れてくる（未分類の出会いなら触らない）。
                  if (encounter.categoryId) {
                    form.setFieldValue("categoryId", encounter.categoryId);
                  }
                }}
                error={<FieldError errors={field.state.meta.errors} />}
              />
            )}
          </form.Field>

          <form.Field name="categoryId">
            {(field) => (
              <div className="lp-field">
                <label htmlFor={field.name} className="lp-label">
                  カテゴリ
                </label>
                <select
                  id={field.name}
                  name={field.name}
                  className="lp-input"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                >
                  <option value="">未選択</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>

          {/* 評価（★）はカテゴリと横並び。カード表示と同じ★で揃える。 */}
          <form.Field name="rating">
            {(field) => (
              <div className="lp-field">
                <span className="lp-label">評価</span>
                <StarRating
                  value={field.state.value}
                  onChange={(v) => field.handleChange(v)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="isFavorite">
            {(field) => (
              <button
                type="button"
                aria-pressed={field.state.value}
                onClick={() => field.handleChange(!field.state.value)}
                className="lp-ghost justify-self-start text-sm sm:col-span-2"
                style={
                  field.state.value
                    ? {
                        color: "var(--amber-bright)",
                        borderColor: "rgba(207, 146, 71, 0.5)",
                        background: "rgba(207, 146, 71, 0.1)",
                      }
                    : undefined
                }
              >
                <Heart
                  size={16}
                  fill={field.state.value ? "currentColor" : "none"}
                />
                {field.state.value ? "お気に入り" : "お気に入りに追加"}
              </button>
            )}
          </form.Field>

          <form.Field name="memo">
            {(field) => (
              <div className="lp-field sm:col-span-2">
                <label htmlFor={field.name} className="lp-label">
                  メモ
                </label>
                <textarea
                  id={field.name}
                  name={field.name}
                  className="lp-input min-h-24 resize-y"
                  placeholder="香り・余韻・その日のこと…"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          {/* 詳細は既定で畳んでおく（素早い記録を邪魔しない）。 */}
          <div className="lp-divider sm:col-span-2" />
          <details className="group sm:col-span-2">
            <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-sm select-none">
              <span className="lp-dim">詳細 — 日時・場所・価格・度数</span>
              <ChevronDown size={16} className="lp-caret lp-dim shrink-0" />
            </summary>

            <div className="mt-4 space-y-5">
              <form.Field name="drunkAt">
                {(field) => (
                  <div className="lp-field">
                    <label htmlFor={field.name} className="lp-label">
                      日時
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      type="datetime-local"
                      className="lp-input"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="placeName">
                {(field) => (
                  <div className="lp-field">
                    <label htmlFor={field.name} className="lp-label">
                      場所
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      className="lp-input"
                      placeholder="店名・自宅・旅先など"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="price">
                  {(field) => (
                    <div className="lp-field">
                      <label htmlFor={field.name} className="lp-label">
                        価格（円）
                      </label>
                      <input
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={0}
                        inputMode="numeric"
                        className="lp-input"
                        placeholder="1200"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="abv">
                  {(field) => (
                    <div className="lp-field">
                      <label htmlFor={field.name} className="lp-label">
                        度数（%）
                      </label>
                      <input
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        inputMode="decimal"
                        className="lp-input"
                        placeholder="12.5"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>
              </div>
            </div>
          </details>
        </div>
      </div>

      <div className="px-6 pt-6 pb-6 md:px-8 md:pb-8">
        {(isEdit ? updateRecord.isError : addRecord.isError) ? (
          <p className="lp-error mb-3" role="alert">
            {isEdit
              ? "更新に失敗しました。時間をおいて、もう一度お試しください。"
              : "記録に失敗しました。時間をおいて、もう一度お試しください。"}
          </p>
        ) : null}

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <button
              type="submit"
              disabled={isSubmitting}
              className="lp-cta w-full justify-center"
            >
              {isSubmitting
                ? isEdit
                  ? "更新しています…"
                  : "注いでいます…"
                : isEdit
                  ? "この一杯を更新"
                  : "この一杯を残す"}
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

// フィールド検証エラー（zod の issue／文字列）を 1 行で表示する小さなヘルパー。
function FieldError({
  errors,
}: {
  errors: ReadonlyArray<{ message?: string } | string | undefined>;
}) {
  if (errors.length === 0) return null;
  return (
    <p className="lp-error" role="alert">
      {errors
        .map((e) => (typeof e === "string" ? e : e?.message))
        .filter(Boolean)
        .join(", ")}
    </p>
  );
}

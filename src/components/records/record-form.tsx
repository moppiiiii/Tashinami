import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDown, Heart } from "lucide-react";
import { useEffect, useMemo } from "react";

import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";
import { DateTimeField } from "@/components/common/date-time-field";
import { Field, FieldError, Label } from "@/components/common/field";
import { Input, Select, Textarea } from "@/components/common/input";
import { buildEncounters, findEncounter } from "@/components/zukan/encounters";
import { useAddRecord } from "@/hooks/use-add-record";
import { useUpdateRecord } from "@/hooks/use-update-record";
import { fromJstInput, toJstInput } from "@/lib/date";
import { normalizeName } from "@/lib/match";
import type { Category } from "@/schemas/categories";
import type { DrinkRecord } from "@/schemas/records";
import { recordsQueryOptions } from "@/server/records";

import { NameSuggest } from "./name-suggest";
import { PlaceSuggest } from "./place-suggest";
import { buildPlaces } from "./places";
import { RatingInput } from "./rating-input";
import type { RevealResult } from "./record-reveal";

// record を渡すと編集モード。onSuccess は新規追加時のみで、
// 遷移とリヴィールの起動はページ側の仕事。
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

  // 編集中の一杯は自分自身を除く（「N杯目」「この場所で N 杯」がずれる）。
  const { data: records } = useSuspenseQuery(recordsQueryOptions());
  const others = useMemo(
    () => (record ? records.filter((r) => r.id !== record.id) : records),
    [records, record],
  );
  const encounters = useMemo(() => buildEncounters(others), [others]);
  const places = useMemo(() => buildPlaces(others), [others]);

  const form = useForm({
    defaultValues: {
      name: record?.name ?? "",
      categoryId: record?.category?.id ?? "",
      rating: (record?.rating ?? null) as number | null,
      isFavorite: record?.isFavorite ?? false,
      memo: record?.memo ?? "",
      // 記録の日時は JST 固定で整形するのでサーバーとブラウザで一致する（SSR で描ける）。
      // 新規の「今」だけは時計依存なので空にして、マウント後に埋める。
      drunkAt: record ? toJstInput(record.drunkAt) : "",
      placeName: record?.placeName ?? "",
      price: record?.price != null ? String(record.price) : "",
      abv: record?.abv != null ? String(record.abv) : "",
    },
    onSubmit: async ({ value, formApi }) => {
      const name = value.name.trim();

      // 既知の銘柄なら図鑑のカテゴリを引き継ぐ（未分類に落とさない）。
      const known = findEncounter(name, encounters);
      const categoryId = value.categoryId || known?.categoryId || null;
      const category = categories.find((c) => c.id === categoryId) ?? null;

      const fields = {
        name,
        categoryId,
        rating: value.rating,
        isFavorite: value.isFavorite,
        memo: value.memo.trim() || null,
        placeName: value.placeName.trim() || null,
        price: value.price === "" ? null : Number(value.price),
        abv: value.abv === "" ? null : Number(value.abv),
        drunkAt: value.drunkAt ? fromJstInput(value.drunkAt) : undefined,
        category: category ? { id: category.id, name: category.name } : null,
      };

      if (record) {
        await updateRecord.mutateAsync({ id: record.id, ...fields });
        onUpdated?.();
        return;
      }

      await addRecord.mutateAsync(fields);
      formApi.reset();
      onSuccess?.({
        // 殿堂の席と同じ正規化キーで渡す（綴り違いで「未収蔵」に見せない）。
        key: normalizeName(name),
        name,
        categoryName: category?.name ?? null,
        categorySlug: category?.slug ?? null,
        isFirst: !known,
        revisit: (known?.count ?? 0) + 1,
        rating: value.rating,
      });
    },
  });

  useEffect(() => {
    if (record) return;
    form.setFieldValue("drunkAt", toJstInput());
  }, [form, record]);

  return (
    <Card
      as="form"
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      className="flex flex-col"
    >
      <div className="px-6 pt-6 pb-4 md:px-8 md:pt-8">
        <p className="font-latin text-amber-bright text-base tracking-[0.01em] italic">
          {isEdit ? "この一杯を、もう一度。" : "今夜の一杯。"}
        </p>
        <h2 className="font-jp-serif mt-1 text-xl font-semibold">
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
              <Field>
                <Label htmlFor={field.name}>カテゴリ</Label>
                <Select
                  id={field.name}
                  name={field.name}
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
                </Select>
              </Field>
            )}
          </form.Field>

          <form.Field name="rating">
            {(field) => (
              <Field>
                <Label as="span">この一杯の印象</Label>
                <RatingInput
                  value={field.state.value}
                  onChange={(v) => field.handleChange(v)}
                />
                {/* 測るのは「この一杯」。銘柄の順位は殿堂で本人が選ぶ（docs/concept.md §5）。
                    ここを書かないと「点数＝順位」と読まれ、10 点が並んだときに破綻して見える。 */}
                <p className="text-rice-dim text-xs">
                  順位は TOP10 で自分で選びます。
                </p>
              </Field>
            )}
          </form.Field>

          <form.Field name="isFavorite">
            {(field) => (
              <Button
                variant="ghost"
                type="button"
                aria-pressed={field.state.value}
                onClick={() => field.handleChange(!field.state.value)}
                className="justify-self-start text-sm sm:col-span-2"
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
              </Button>
            )}
          </form.Field>

          <form.Field name="memo">
            {(field) => (
              <Field className="sm:col-span-2">
                <Label htmlFor={field.name}>メモ</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  className="min-h-24 resize-y"
                  placeholder="香り・余韻・その日のこと…"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>

          {/* 詳細は既定で畳んでおく（素早い記録を邪魔しない）。
              details は JS 無しでも開くので、ハイドレーション前に押されると DOM に
              open が付き、React が属性差分を警告する。開いた状態が正しいので抑止する。 */}
          <div className="via-ink-line h-px bg-linear-to-r from-transparent to-transparent sm:col-span-2" />
          <details className="group sm:col-span-2" suppressHydrationWarning>
            <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-sm select-none">
              <span className="text-rice-dim">
                詳細 — 日時・出会った場所・価格・度数
              </span>
              <ChevronDown
                size={16}
                className="lp-caret text-rice-dim shrink-0"
              />
            </summary>

            <div className="mt-4 space-y-5">
              <form.Field name="drunkAt">
                {(field) => (
                  <Field>
                    <Label htmlFor={field.name}>日時</Label>
                    <DateTimeField
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={field.handleChange}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="placeName">
                {(field) => (
                  <PlaceSuggest
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    places={places}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="price">
                  {(field) => (
                    <Field>
                      <Label htmlFor={field.name}>価格（円）</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={0}
                        inputMode="numeric"
                        placeholder="1200"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="abv">
                  {(field) => (
                    <Field>
                      <Label htmlFor={field.name}>度数（%）</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        inputMode="decimal"
                        placeholder="12.5"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </Field>
                  )}
                </form.Field>
              </div>
            </div>
          </details>
        </div>
      </div>

      <div className="px-6 pt-6 pb-6 md:px-8 md:pb-8">
        {(isEdit ? updateRecord.isError : addRecord.isError) ? (
          <FieldError
            className="mb-3"
            errors={[
              isEdit
                ? "更新に失敗しました。時間をおいて、もう一度お試しください。"
                : "記録に失敗しました。時間をおいて、もう一度お試しください。",
            ]}
          />
        ) : null}

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full justify-center"
            >
              {isSubmitting
                ? isEdit
                  ? "更新しています…"
                  : "注いでいます…"
                : isEdit
                  ? "この一杯を更新"
                  : "この一杯を残す"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </Card>
  );
}

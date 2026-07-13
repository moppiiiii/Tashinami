import { useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { useRemoveRecord } from "@/hooks/use-remove-record";
import type { DrinkRecord } from "@/schemas/records";

// 削除は編集画面の底に置く。取り消せない操作なので、カードの上には出さない。
// 確認を挟み、外したあとは一覧へ戻る（楽観フックが即座に反映する）。
export function RecordDeleteButton({ record }: { record: DrinkRecord }) {
  const [open, setOpen] = useState(false);
  const removeRecord = useRemoveRecord();
  const navigate = useNavigate();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="lp-ghost text-sm"
          style={{ color: "var(--rice-dim)" }}
        >
          <Trash2 size={14} />
          この一杯を棚から外す
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="lp-overlay fixed inset-0 z-40" />
        <Dialog.Content className="lp-scope lp-modal-in fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
          <div className="lp-card p-6">
            <Dialog.Title className="lp-serif text-lg">
              この一杯を消しますか？
            </Dialog.Title>
            <Dialog.Description className="lp-dim mt-2 text-sm leading-relaxed">
              「{record.name}
              」の記録を棚から外します。この操作は取り消せません。
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close className="lp-ghost text-sm">やめる</Dialog.Close>
              <button
                type="button"
                className="lp-ghost text-sm"
                style={{
                  color: "var(--danger, #d66)",
                  borderColor: "rgba(214, 102, 102, 0.5)",
                }}
                disabled={removeRecord.isPending}
                onClick={() => {
                  removeRecord.mutate({ id: record.id });
                  setOpen(false);
                  void navigate({ to: "/records" });
                }}
              >
                棚から外す
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

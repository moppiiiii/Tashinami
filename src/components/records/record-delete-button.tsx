import { useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";
import { useRemoveRecord } from "@/hooks/use-remove-record";
import type { DrinkRecord } from "@/schemas/records";

// 取り消せないので確認を挟む。外したあとは一覧へ戻る。
export function RecordDeleteButton({ record }: { record: DrinkRecord }) {
  const [open, setOpen] = useState(false);
  const removeRecord = useRemoveRecord();
  const navigate = useNavigate();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          variant="ghost"
          type="button"
          className="text-sm"
          style={{ color: "var(--rice-dim)" }}
        >
          <Trash2 size={14} />
          この一杯を棚から外す
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="lp-overlay fixed inset-0 z-40" />
        <Dialog.Content className="lp-scope lp-modal-in fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
          <Card className="p-6">
            <Dialog.Title className="font-jp-serif text-lg font-semibold">
              この一杯を消しますか？
            </Dialog.Title>
            <Dialog.Description className="text-rice-dim mt-2 text-sm leading-relaxed">
              「{record.name}
              」の記録を棚から外します。この操作は取り消せません。
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <Button asChild variant="ghost">
                <Dialog.Close className="text-sm">やめる</Dialog.Close>
              </Button>
              <Button
                variant="ghost"
                type="button"
                className="text-sm"
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
              </Button>
            </div>
          </Card>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

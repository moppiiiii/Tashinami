import { Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { useSignOut } from "@/hooks/use-sign-out";

// ログイン後の共通ヘッダー。棚・記録・図鑑・飲み方を常に同じ並びで出し、
// 現在地は琥珀で示す。フォーム（記録の新規・編集）は集中させたいので使わない
// （あちらは「記録一覧へ」の戻りリンクだけを持つ）。
const NAV = [
  { to: "/home", label: "棚" },
  { to: "/records", label: "記録" },
  { to: "/zukan", label: "図鑑" },
  { to: "/drinks", label: "飲み方" },
] as const;

export function AuthedHeader() {
  const navigate = useNavigate();
  const signOut = useSignOut();

  return (
    <header className="flex flex-wrap items-center gap-x-5 gap-y-3 py-6">
      <Link to="/home" className="flex items-baseline gap-2 no-underline">
        <span className="lp-serif text-xl text-[color:var(--rice)]">嗜み</span>
        <span className="lp-eyebrow">Tashinami</span>
      </Link>

      {/* 狭い画面ではナビだけ次の行へ落とし、ロゴと操作を 1 行目に残す。 */}
      <nav className="order-last flex w-full items-center gap-5 sm:order-none sm:w-auto sm:flex-1 sm:pl-4">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            // /records/new を開いているときに「記録」を現在地にしない。
            activeOptions={{ exact: true }}
            activeProps={{ className: "lp-amber" }}
            inactiveProps={{ className: "lp-dim" }}
            className="text-sm no-underline"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2 sm:ml-0">
        <Link to="/records/new" className="lp-cta text-sm no-underline">
          <Plus size={16} />
          記録する
        </Link>
        <button
          type="button"
          className="lp-ghost text-sm"
          disabled={signOut.isPending}
          onClick={() =>
            signOut.mutate(undefined, {
              onSuccess: () => navigate({ to: "/login" }),
            })
          }
        >
          {signOut.isPending ? "ログアウト中…" : "ログアウト"}
        </button>
      </div>
    </header>
  );
}

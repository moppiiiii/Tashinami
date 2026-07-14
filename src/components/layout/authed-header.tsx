import { Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { Button } from "@/components/common/button";
import { useSignOut } from "@/hooks/use-sign-out";

const NAV = [
  { to: "/home", label: "棚" },
  { to: "/records", label: "記録" },
  { to: "/zukan", label: "図鑑" },
  { to: "/top10", label: "TOP10" },
  { to: "/places", label: "場所" },
  { to: "/drinks", label: "飲み方" },
] as const;

export function AuthedHeader() {
  const navigate = useNavigate();
  const signOut = useSignOut();

  return (
    <header className="flex flex-wrap items-center gap-x-5 gap-y-3 py-6">
      <Link to="/home" className="flex items-baseline gap-2 no-underline">
        <span className="font-jp-serif text-xl font-semibold text-[color:var(--rice)]">
          嗜み
        </span>
        <span className="text-rice-dim text-[0.68rem] font-bold tracking-[0.28em] uppercase">
          Tashinami
        </span>
      </Link>

      {/* 狭い画面ではナビだけ次の行へ落とし、ロゴと操作を 1 行目に残す。 */}
      <nav className="order-last flex w-full items-center gap-5 sm:order-none sm:w-auto sm:flex-1 sm:pl-4">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeProps={{ className: "text-amber-bright" }}
            inactiveProps={{
              className:
                "text-rice-dim transition-colors hover:text-amber-bright",
            }}
            className="text-sm no-underline"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2 sm:ml-0">
        <Button asChild>
          <Link to="/records/new" className="text-sm no-underline">
            <Plus size={16} />
            記録する
          </Link>
        </Button>
        <Button
          variant="ghost"
          type="button"
          className="text-sm"
          disabled={signOut.isPending}
          onClick={() =>
            signOut.mutate(undefined, {
              onSuccess: () => navigate({ to: "/login" }),
            })
          }
        >
          {signOut.isPending ? "ログアウト中…" : "ログアウト"}
        </Button>
      </div>
    </header>
  );
}

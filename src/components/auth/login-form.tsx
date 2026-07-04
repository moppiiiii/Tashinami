import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";

import { useSignIn } from "@/hooks/use-sign-in";
import { CredentialsSchema } from "@/schemas/auth";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const navigate = useNavigate();
  const signIn = useSignIn();

  const dest = redirectTo ?? "/home";
  const authError = signIn.error;

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: CredentialsSchema },
    onSubmit: async ({ value }) => {
      try {
        await signIn.mutateAsync(value);
        navigate({ href: dest });
      } catch {
        // 失敗はミューテーションの error として表示する（submit 自体は完了扱い）。
      }
    },
  });

  return (
    <main className="tashinami-lp flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="lp-rise w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-flex items-baseline gap-2 no-underline"
          >
            <span className="lp-serif text-2xl text-[color:var(--rice)]">
              嗜み
            </span>
            <span className="lp-eyebrow">Tashinami</span>
          </Link>
        </div>

        <div className="lp-card p-8">
          <p className="lp-kicker text-base">おかえりなさい。</p>
          <h1 className="lp-serif mt-1 text-2xl">ただいまの、一杯へ。</h1>
          <p className="lp-dim mt-2 text-sm">
            メールアドレスでログインして、記録のつづきを。
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit();
            }}
            className="mt-6 space-y-4"
          >
            <form.Field name="email">
              {(field) => (
                <div className="lp-field">
                  <label htmlFor={field.name} className="lp-label">
                    メールアドレス
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    className="lp-input"
                    placeholder="you@example.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                    required
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div className="lp-field">
                  <label htmlFor={field.name} className="lp-label">
                    パスワード
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="current-password"
                    className="lp-input"
                    placeholder="••••••••"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                    required
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            {authError ? (
              <p className="lp-error" role="alert">
                {authError.message}
              </p>
            ) : null}

            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="lp-cta mt-2 w-full justify-center"
                >
                  ログイン
                </button>
              )}
            </form.Subscribe>
          </form>
        </div>

        <p className="mt-6 text-center text-sm">
          <Link to="/" className="lp-amber no-underline">
            ← トップに戻る
          </Link>
        </p>
      </div>
    </main>
  );
}

// フィールド検証エラー（zod の issue）を 1 行で表示する小さなヘルパー。
function FieldError({
  errors,
}: {
  errors: ReadonlyArray<{ message?: string } | undefined>;
}) {
  if (errors.length === 0) return null;
  return (
    <p className="lp-error" role="alert">
      {errors
        .map((e) => e?.message)
        .filter(Boolean)
        .join(", ")}
    </p>
  );
}

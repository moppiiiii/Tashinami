import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";
import { Field, FieldError, Label } from "@/components/common/field";
import { Input } from "@/components/common/input";
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
        // 遷移完了まで await する。ここで返すと遷移までの数百 ms ボタンが再活性化して見える。
        await navigate({ href: dest });
      } catch {
        // 失敗はミューテーションの error として表示する（submit 自体は完了扱い）。
      }
    },
  });

  return (
    <main className="tashinami-lp flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="animate-lp-rise w-full max-w-md motion-reduce:animate-none">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-flex items-baseline gap-2 no-underline"
          >
            <span className="font-jp-serif text-2xl font-semibold text-[color:var(--rice)]">
              嗜み
            </span>
            <span className="text-rice-dim text-[0.68rem] font-bold tracking-[0.28em] uppercase">
              Tashinami
            </span>
          </Link>
        </div>

        <Card className="p-8">
          <p className="font-latin text-amber-bright text-base tracking-[0.01em] italic">
            おかえりなさい。
          </p>
          <h1 className="font-jp-serif mt-1 text-2xl font-semibold">
            ただいまの、一杯へ。
          </h1>
          <p className="text-rice-dim mt-2 text-sm">
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
                <Field>
                  <Label htmlFor={field.name}>メールアドレス</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                    required
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <Field>
                  <Label htmlFor={field.name}>パスワード</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                    required
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            {authError ? <FieldError errors={[authError.message]} /> : null}

            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full justify-center"
                >
                  ログイン
                </Button>
              )}
            </form.Subscribe>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm">
          <Link to="/" className="text-amber-bright no-underline">
            ← トップに戻る
          </Link>
        </p>
      </div>
    </main>
  );
}

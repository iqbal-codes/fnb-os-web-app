"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { ChefHat, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Link, useRouter } from "@/i18n/navigation";
import { useLogin, useSendMagicLink } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const login = useLogin();
  const sendMagicLink = useSendMagicLink();

  const loginSchema = z.object({
    email: z
      .string()
      .min(1, t("errors.required"))
      .email(t("errors.invalidEmail")),
    password: z.string().min(6, t("errors.passwordMin")),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const email = watch("email");

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login.mutateAsync(data);
      toast.success(t("auth.login.title"));
      router.push(result.redirect || "/dashboard");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
    }
  };

  const handleMagicLink = async () => {
    if (!email || !z.string().email().safeParse(email).success) {
      toast.error(t("errors.invalidEmail"));
      return;
    }

    try {
      const result = await sendMagicLink.mutateAsync(email);
      toast.success(result.message);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send magic link";
      toast.error(message);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="text-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-2xl font-bold"
        >
          <ChefHat className="h-8 w-8 text-primary" />
          <span className="text-primary">{t("common.appName")}</span>
        </Link>
      </div>

      <Card className="border-border/50">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">{t("auth.login.title")}</CardTitle>
          <CardDescription>{t("auth.login.subtitle")}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.login.email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.login.emailPlaceholder")}
                  className="pl-10"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.login.password")}</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("auth.login.forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t("auth.login.passwordPlaceholder")}
                  className="pl-10"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full touch-target"
              disabled={login.isPending}
            >
              {login.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {t("auth.login.signIn")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              {t("common.or")}
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full touch-target"
            onClick={handleMagicLink}
            disabled={sendMagicLink.isPending}
          >
            {sendMagicLink.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                {t("auth.login.sendMagicLink")}
              </>
            )}
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.login.noAccount")}{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              {t("auth.login.createOne")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


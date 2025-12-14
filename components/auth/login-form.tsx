"use client";

import { loginSchema } from "@/validators/auth";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { login } from "@/actions/auth";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginSchema,
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        const data = await login(value);

        if (!data.success) {
          toast.error(data.message || "Failed to login. Please try again.");

          return;
        }

        if (data.success) {
          toast.success("Successfully logged in!");
          router.push("/");
          return;
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <form
      id="login-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="w-full space-y-4"
      noValidate
    >
      <FieldGroup>
        <form.Field name="email">
          {(field) => {
            const hasErrors = field.state.meta.errors.length > 0;
            const isInvalid = hasErrors;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-foreground text-xs font-medium"
                >
                  Email
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  className="border-border bg-background/50 dark:bg-background/10 focus-visible:ring-ring text-foreground placeholder:text-muted-foreground h-10 rounded-md transition-all duration-300"
                  disabled={isLoading}
                />
                {hasErrors && (
                  <FieldError
                    errors={field.state.meta.errors}
                    className="text-xs"
                  />
                )}
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="password">
          {(field) => {
            const hasErrors = field.state.meta.errors.length > 0;
            const isInvalid = hasErrors;
            return (
              <Field data-invalid={isInvalid}>
                <div className="flex items-center justify-between">
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-foreground text-xs font-medium"
                  >
                    Password
                  </FieldLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="text-muted-foreground hover:text-primary focus-visible:ring-ring text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    autoComplete="current-password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    className="border-border bg-background/50 dark:bg-background/10 focus-visible:ring-ring text-foreground placeholder:text-muted-foreground h-10 rounded-md pr-10 transition-all duration-300"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/30 absolute top-0 right-0 h-10 w-8 px-0"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
                {hasErrors && (
                  <FieldError
                    errors={field.state.meta.errors}
                    className="text-xs"
                  />
                )}
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>
      <Button
        type="submit"
        form="login-form"
        size="default"
        className="bg-primary hover:bg-primary/90 text-primary-foreground mt-2 h-10 w-full rounded-md font-semibold transition-all duration-300"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2" />
            Signing In...
          </>
        ) : (
          <>Sign In</>
        )}
      </Button>
    </form>
  );
}

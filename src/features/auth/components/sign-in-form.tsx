"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/features/auth/components/password-input";
import { useSignIn } from "@/features/auth/hooks/use-sign-in";
import { getSafeRedirect } from "@/features/auth/safe-redirect";
import {
  type SignInFormValues,
  type SignInInput,
  signInSchema,
} from "@/features/auth/schemas";

const inputClassName = "h-11 bg-card px-3 dark:bg-card";

const GENERIC_ERROR = "Email or password is incorrect.";

export function SignInForm() {
  const router = useRouter();
  const signIn = useSignIn();
  const [formKey, setFormKey] = useState(0);

  const form = useForm<SignInFormValues, unknown, SignInInput>({
    resolver: zodResolver(signInSchema),
    // Show errors after a field is left, then update them as the person types.
    mode: "onTouched",
    shouldFocusError: true,
    defaultValues: { email: "", password: "" },
  });

  /**
   * Clears the form after a successful submit. With cacheComponents, Next keeps
   * a page we navigate away from mounted (hidden), so without this the values,
   * including the password, would still be there when the person comes back.
   * Bumping the key also remounts the inputs, so show/hide toggles reset.
   */
  function clearForm() {
    form.reset();
    signIn.reset();
    setFormKey((key) => key + 1);
  }

  function onSubmit(values: SignInInput) {
    signIn.mutate(values, {
      onSuccess: () => {
        // Read at submit time so the page can be prerendered without
        // waiting on search params.
        const next = new URLSearchParams(window.location.search).get("next");
        clearForm();
        router.replace(getSafeRedirect(next));
        router.refresh();
      },
      // Don't keep a rejected password around; the email stays.
      onError: () => form.resetField("password"),
    });
  }

  // Bad credentials get the same message as anything else that went wrong
  // with the credentials; server failures show their own retry message.
  const serverError = signIn.error
    ? signIn.error.data?.code === "INTERNAL_SERVER_ERROR"
      ? signIn.error.message
      : GENERIC_ERROR
    : null;

  return (
    <form key={formKey} noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-6">
        {serverError && (
          <Alert
            variant="destructive"
            className="border-destructive/50 bg-destructive/10 px-4 py-3"
          >
            <CircleAlertIcon />
            <AlertTitle>You're not signed in</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                {...field}
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={fieldState.invalid}
                disabled={signIn.isPending}
                className={inputClassName}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <PasswordInput
                {...field}
                id="password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
                disabled={signIn.isPending}
                className={inputClassName}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button
          type="submit"
          className="mt-2 h-12 w-full text-base"
          disabled={signIn.isPending}
        >
          {signIn.isPending && <Loader2Icon className="animate-spin" />}
          {signIn.isPending ? "Signing in" : "Sign in"}
        </Button>
      </FieldGroup>
    </form>
  );
}

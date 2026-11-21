"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, type Path, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/features/auth/components/password-input";
import { useSignUp } from "@/features/auth/hooks/use-sign-up";
import {
  PASSWORD_MIN_LENGTH,
  type SignUpFormValues,
  type SignUpInput,
  signUpSchema,
} from "@/features/auth/schemas";

type FieldConfig = {
  name: Path<SignUpFormValues>;
  label: string;
  type?: "text" | "email" | "password";
  autoComplete: string;
  description?: string;
};

const nameFields: FieldConfig[] = [
  { name: "firstName", label: "First name", autoComplete: "given-name" },
  { name: "lastName", label: "Last name", autoComplete: "family-name" },
];

const otherFields: FieldConfig[] = [
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "new-password",
    description: `At least ${PASSWORD_MIN_LENGTH} characters.`,
  },
  {
    name: "confirmPassword",
    label: "Confirm password",
    type: "password",
    autoComplete: "new-password",
  },
];

const inputClassName = "h-11 bg-card px-3 dark:bg-card";

export function SignUpForm() {
  const router = useRouter();
  const signUp = useSignUp();

  const form = useForm<SignUpFormValues, unknown, SignUpInput>({
    resolver: zodResolver(signUpSchema),
    // Show errors after a field is left, then update them as the person types.
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: SignUpInput) {
    signUp.mutate(values, {
      onSuccess: () => {
        toast.success("Account created", {
          description: `Welcome, ${values.firstName}.`,
        });
        router.push("/auth/sign-up/success");
      },
      onError: (error) => {
        // Show server-side field errors next to the matching inputs.
        const fieldErrors = error.data?.fieldErrors ?? {};
        for (const [name, messages] of Object.entries(fieldErrors)) {
          if (messages?.[0]) {
            form.setError(name as Path<SignUpFormValues>, {
              message: messages[0],
            });
          }
        }
      },
    });
  }

  const serverError = signUp.error
    ? signUp.error.data?.fieldErrors
      ? "Check the highlighted fields and try again."
      : signUp.error.message
    : null;

  function renderField({
    name,
    label,
    type,
    autoComplete,
    description,
  }: FieldConfig) {
    return (
      <Controller
        key={name}
        name={name}
        control={form.control}
        render={({ field, fieldState }) => {
          const inputProps = {
            ...field,
            id: name,
            autoComplete,
            "aria-invalid": fieldState.invalid,
            "aria-describedby": description ? `${name}-description` : undefined,
            disabled: signUp.isPending,
            className: inputClassName,
          };
          return (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={name}>{label}</FieldLabel>
              {type === "password" ? (
                <PasswordInput {...inputProps} />
              ) : (
                <Input {...inputProps} type={type ?? "text"} />
              )}
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                description && (
                  <FieldDescription id={`${name}-description`}>
                    {description}
                  </FieldDescription>
                )
              )}
            </Field>
          );
        }}
      />
    );
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-6">
        {serverError && (
          <Alert
            variant="destructive"
            className="border-destructive/50 bg-destructive/10 px-4 py-3"
          >
            <CircleAlertIcon />
            <AlertTitle>Your account wasn't created</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-6 sm:grid-cols-2">
          {nameFields.map(renderField)}
        </div>
        {otherFields.map(renderField)}
        <Button
          type="submit"
          className="mt-2 h-12 w-full text-base"
          disabled={signUp.isPending}
        >
          {signUp.isPending && <Loader2Icon className="animate-spin" />}
          {signUp.isPending ? "Creating account" : "Create account"}
        </Button>
      </FieldGroup>
    </form>
  );
}

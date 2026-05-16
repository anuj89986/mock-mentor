"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import {signIn} from "next-auth/react";
import * as z from "zod";
import { toast } from "sonner";
import { FcGoogle } from "react-icons/fc";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { logInSchema } from "@/Schemas/logInSchema";

const page = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof logInSchema>>({
    resolver: zodResolver(logInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof logInSchema>) => {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
      callbackUrl: "/",
    });

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Sign in successful.");
    router.push(result?.url || "/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_60%)]" />

      <Card className="w-full max-w-md border bg-card text-card-foreground shadow-xl rounded-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold">
            Sign in
          </CardTitle>
          <CardDescription>Enter your details to continue</CardDescription>
        </CardHeader>

        <CardContent>
          <form
            id="form-rhf-demo"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <FieldGroup className="space-y-4">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      {...field}
                      placeholder="you@example.com"
                      className="focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Password</FieldLabel>
                    <Input
                      {...field}
                      type="password"
                      className="focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <FieldDescription>
                      Enter a password with at least 6 characters.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" form="form-rhf-demo" className="w-full">
            Sign In
          </Button>

          <div className="flex items-center my-6 w-full">
            <div className="grow border-t border-gray-500"></div>
            <span className="mx-4 text-gray-400 text-xs uppercase tracking-widest">
              OR
            </span>
            <div className="grow border-t border-gray-500"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <FcGoogle />
            Sign in with Google
          </Button>

          <p className="text-sm text-muted-foreground text-center pt-1">
            New user?{" "}
            <span
              className="underline underline-offset-4 hover:cursor-pointer"
              onClick={() => router.push("/auth/register")}
            >
              Register
            </span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default page;

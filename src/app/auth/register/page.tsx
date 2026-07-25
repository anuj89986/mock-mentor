"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { signUpSchema } from "@/Schemas/signUpSchema";
import { signIn } from "next-auth/react";
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
import axios from "axios";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    try {
      const response = await axios.post("/api/auth/register", data);
      toast.success("Registration Successful", {
        description: response.data.message,
      });
      router.push("/auth/signin");
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3EBDD] px-4 w-full font-sans selection:bg-[#8C5A3C] selection:text-[#FFFDF8]">
      <Card className="w-full max-w-md border border-[#D8CDBD] bg-[#FFFDF8] shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="space-y-2 pt-8 px-8">
          <CardTitle className="text-2xl md:text-3xl font-medium tracking-tight text-[#2B2118]">
            Create account
          </CardTitle>
          <CardDescription className="text-[#8D8175] text-sm">
            Enter your details below to get started.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pt-4">
          <form
            id="form-rhf-demo"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <FieldGroup className="space-y-5">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                    <FieldLabel className="text-sm font-medium text-[#2B2118]">Name</FieldLabel>
                    <Input
                      {...field}
                      placeholder="Name"
                      className="bg-[#FBF7EF] border-[#D8CDBD] text-[#2B2118] placeholder:text-[#8D8175]/60 focus-visible:ring-1 focus-visible:ring-[#8C5A3C] focus-visible:border-[#8C5A3C] rounded-xl h-12 px-4 shadow-none transition-colors"
                    />
                    {fieldState.invalid && (
                      <FieldError className="text-xs text-red-500" errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                    <FieldLabel className="text-sm font-medium text-[#2B2118]">Email</FieldLabel>
                    <Input
                      {...field}
                      placeholder="xyz@gmail.com"
                      className="bg-[#FBF7EF] border-[#D8CDBD] text-[#2B2118] placeholder:text-[#8D8175]/60 focus-visible:ring-1 focus-visible:ring-[#8C5A3C] focus-visible:border-[#8C5A3C] rounded-xl h-12 px-4 shadow-none transition-colors"
                    />
                    {fieldState.invalid && (
                      <FieldError className="text-xs text-red-500" errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                    <FieldLabel className="text-sm font-medium text-[#2B2118]">Password</FieldLabel>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      className="bg-[#FBF7EF] border-[#D8CDBD] text-[#2B2118] placeholder:text-[#8D8175]/60 focus-visible:ring-1 focus-visible:ring-[#8C5A3C] focus-visible:border-[#8C5A3C] rounded-xl h-12 px-4 shadow-none transition-colors"
                    />
                    <FieldDescription className="text-xs text-[#8D8175]">
                      Enter a password with at least 6 characters.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError className="text-xs text-red-500" errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                    <FieldLabel className="text-sm font-medium text-[#2B2118]">Confirm Password</FieldLabel>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      className="bg-[#FBF7EF] border-[#D8CDBD] text-[#2B2118] placeholder:text-[#8D8175]/60 focus-visible:ring-1 focus-visible:ring-[#8C5A3C] focus-visible:border-[#8C5A3C] rounded-xl h-12 px-4 shadow-none transition-colors"
                    />
                    {fieldState.invalid && (
                      <FieldError className="text-xs text-red-500" errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 px-8 pb-8 pt-2">
          <Button 
            type="submit" 
            form="form-rhf-demo" 
            className="w-full bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8] rounded-xl h-12 shadow-sm transition-all font-medium"
          >
            Create Account
          </Button>

          <div className="flex items-center my-2 w-full">
            <div className="grow border-t border-[#D8CDBD]"></div>
            <span className="mx-4 text-[#8D8175] text-[10px] font-medium uppercase tracking-widest">
              OR
            </span>
            <div className="grow border-t border-[#D8CDBD]"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full bg-[#FFFDF8] border-[#D8CDBD] text-[#5C5147] hover:bg-[#FBF7EF] hover:text-[#2B2118] rounded-xl h-12 shadow-sm transition-all font-medium flex items-center justify-center gap-2"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <FcGoogle className="w-5 h-5" />
            Sign up with Google
          </Button>

          <p className="text-sm text-[#8D8175] text-center pt-2">
            Already have an account?{" "}
            <span
              className="font-medium text-[#8C5A3C] underline underline-offset-4 hover:text-[#A06A47] hover:cursor-pointer transition-colors"
              onClick={() => router.push("/auth/signin")}
            >
              Login
            </span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default page;
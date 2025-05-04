"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Mail, Lock, AlertCircle, Eye, EyeOff, Layers } from "lucide-react"; 
import { signInSchema, signInSchemaType } from "@/schemas/signInSchema"; 

export default function SignInForm() {
  const router = useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<signInSchemaType>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: "", password: "" },
  });

  // --- onSubmit Functionality remains identical ---
  const onSubmit = async (data: signInSchemaType) => {
    if (!isLoaded) return;
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const result = await signIn.create({
        identifier: data.identifier,
        password: data.password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard"); 
      } else {
        console.error("Sign-in incomplete:", result);
        setAuthError("Sign-in could not be completed. Please check your credentials."); 
      }
    } catch (error: any) {
      console.error("Sign-in error:", error);
      setAuthError(
        error.errors?.[0]?.longMessage || // Use longMessage for potentially more details
        error.errors?.[0]?.message ||
          "Invalid email or password. Please try again." 
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  // --- End of onSubmit ---

  return (
    // Refined Card styling: softer shadow, consistent padding
    <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="flex flex-col items-center text-center gap-2 p-6 bg-gradient-to-b from-default-100 to-default-50">
         {/* Added Brand Icon */}
         <div className="p-2 bg-primary/10 rounded-full mb-2">
            <Layers className="h-6 w-6 text-primary" />
         </div>
        <h1 className="text-3xl font-bold text-default-900">Welcome Back!</h1>
        <p className="text-default-600">
          Sign in to access your EchoFiles account.
        </p>
      </CardHeader>



      <CardBody className="p-6 md:p-8">

        {authError && (
          <div className="bg-danger/10 text-danger border border-danger/30 p-3 rounded-lg mb-6 flex items-start gap-2 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Input Field */}
          <div>
            <label
              htmlFor="identifier"
              className="block mb-1.5 text-sm font-medium text-default-700"
            >
              Email Address
            </label>
            <Input
              id="identifier"
              type="email"
              placeholder="Enter your email"
              startContent={<Mail className="h-4 w-4 text-default-400" />} 
              isInvalid={!!errors.identifier}
              errorMessage={errors.identifier?.message}
              {...register("identifier")}
              className="w-full"

/>
          </div>

          {/* Password Input Field */}
          <div>

                <label
                  htmlFor="password"
                  className="block mb-1.5 text-sm font-medium text-default-700" // Styled label
                >
                  Password
                </label>

            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              startContent={<Lock className="h-4 w-4 text-default-400" />}
              endContent={
                <Button
                  isIconOnly
                  variant="light" 
                  size="sm"
                  onPress={() => setShowPassword(!showPassword)}
                  type="button"
                  className="text-default-500 hover:text-default-700" 
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              }
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              {...register("password")}
              className="w-full"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            color="primary"
            size="lg" 
            className="w-full mt-2" 
            isLoading={isSubmitting || !isLoaded} // Disable while Clerk loads too
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </CardBody>

      {/* Clerk Captcha element  */}
      <div id="clerk-captcha"></div>

      {/* Cleaner Footer */}
      <CardFooter className="flex justify-center p-6 bg-default-100/60 border-t border-default-200">
        <p className="text-sm text-default-600">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="text-primary hover:underline font-semibold" 
          >
            Sign Up Now
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
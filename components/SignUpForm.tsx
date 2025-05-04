"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Mail, Lock, AlertCircle, CheckCircle, Eye, EyeOff, Layers, ShieldCheck } from "lucide-react"; 
import { signUpSchema, signUpSchemaType } from "@/schemas/signUpSchema";
import { verificationEmailSchema, verificationEmailType } from "@/schemas/verificationEmailSchema"; 
import { cn } from "@/lib/utils"; 
import { addToast } from "@heroui/toast";

export default function SignUpForm() {
  const router = useRouter();
  const { signUp, isLoaded, setActive } = useSignUp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // Keep reset
  } = useForm<signUpSchemaType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", passwordConfirmation: "" },
  });

  const {
    register: registerVerification,
    handleSubmit: handleVerifySubmit,
    formState: { errors: verifyErrors },
    reset: resetVerification, 
  } = useForm<verificationEmailType>({
    resolver: zodResolver(verificationEmailSchema),
    defaultValues: { verificationCode: "" },
  });

  const onSubmit = async (data: signUpSchemaType) => {
    if (!isLoaded) return;
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await signUp.create({ emailAddress: data.email, password: data.password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      reset(); 
      setVerifying(true); 
    } catch (error: any) {
      console.error("Sign-up error:", error);
      setAuthError(
        error.errors?.[0]?.longMessage ||
        error.errors?.[0]?.message ||
          "An error occurred during sign-up. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };



   const handleVerificationSubmit = async (data: verificationEmailType) => {
    if (!isLoaded || !signUp) return;
    setIsSubmitting(true);
    setVerificationError(null);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: data.verificationCode });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard"); 
      } else {
        console.error("Verification incomplete:", result);
        setVerificationError("Verification could not be completed. Invalid code or session expired.");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
       setVerificationError(
         error.errors?.[0]?.longMessage ||
         error.errors?.[0]?.message ||
           "Invalid verification code. Please check and try again." 
       );
    } finally {
      setIsSubmitting(false);
    }
  };


  if (verifying) {
    return (
      <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-lg rounded-xl overflow-hidden">

        <CardHeader className="flex flex-col items-center text-center gap-2 p-6 bg-gradient-to-b from-default-100 to-default-50">
          <div className="p-2 bg-primary/10 rounded-full mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" /> 
          </div>
          <h1 className="text-3xl font-bold text-default-900">Check Your Email</h1>
          <p className="text-default-600">
            Enter the 6-digit code we sent to complete verification.
          </p>
        </CardHeader>

        <CardBody className="p-6 md:p-8">

          {verificationError && (
            <div className="bg-danger/10 text-danger border border-danger/30 p-3 rounded-lg mb-6 flex items-start gap-2 text-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p>{verificationError}</p>
            </div>
          )}

          <form onSubmit={handleVerifySubmit(handleVerificationSubmit)} className="space-y-5">

            <div>
              <label
                htmlFor="verificationCode"
                className="block mb-1.5 text-sm font-medium text-default-700"
              >
                Verification Code
              </label>
              <Input
                id="verificationCode"
                {...registerVerification("verificationCode")}
                type="text"
                inputMode="numeric" 
                maxLength={6} 
                placeholder="Enter 6-digit code"
                className="w-full text-center tracking-[0.3em]" 
                autoFocus
                isInvalid={!!verifyErrors.verificationCode}
                errorMessage={verifyErrors.verificationCode?.message}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full"
              isLoading={isSubmitting || !isLoaded}
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          {/* Resend Code Option */}
          <div className="mt-6 text-center">
            <p className="text-sm text-default-500">
              Didn't receive a code?{" "}
              <button
                onClick={async () => {
                  if (signUp && isLoaded) {
                      setVerificationError(null);
                      try {
                           await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
                           addToast({ title: "Verification Code Resent", description: "Check your email for the new code.", color: "success"});
                      } catch (err) {
                          console.error("Resend code error:", err);
                          setVerificationError("Failed to resend code. Please wait a moment and try again.");
                      }
                  }
                }}
                className="text-primary hover:underline font-semibold disabled:opacity-50" 
                disabled={isSubmitting}
              >
                Resend code
              </button>
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  // --- Sign Up Form  ---
  return (
    <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-lg rounded-xl overflow-hidden">

      <CardHeader className="flex flex-col items-center text-center gap-2 p-6 bg-gradient-to-b from-default-100 to-default-50">
        <div className="p-2 bg-primary/10 rounded-full mb-2">
            <Layers className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-default-900">Create Your Account</h1>
        <p className="text-default-600">
          Join EchoFiles to securely store and sync your files.
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

          <div>
            <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-default-700">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              startContent={<Mail className="h-4 w-4 text-default-400" />}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              {...register("email")}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-default-700">
              Password
            </label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              startContent={<Lock className="h-4 w-4 text-default-400" />}
              endContent={
                <Button isIconOnly variant="light" size="sm" onPress={() => setShowPassword(!showPassword)} type="button" className="text-default-500 hover:text-default-700" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              }
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              {...register("password")}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="passwordConfirmation" className="block mb-1.5 text-sm font-medium text-default-700">
              Confirm Password
            </label>
            <Input
              id="passwordConfirmation"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              startContent={<Lock className="h-4 w-4 text-default-400" />}
              endContent={
                 <Button isIconOnly variant="light" size="sm" onPress={() => setShowConfirmPassword(!showConfirmPassword)} type="button" className="text-default-500 hover:text-default-700" aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              }
              isInvalid={!!errors.passwordConfirmation}
              errorMessage={errors.passwordConfirmation?.message}
              {...register("passwordConfirmation")}
              className="w-full"
            />
          </div>

          <div className="pt-2"> 
            <p className="text-xs text-default-500 leading-relaxed">
              By creating an account, you agree to our{" "}
              <Link href="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</Link> and{" "}
              <Link href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </div>

          {/* Clerk Captcha element */}
          <div id="clerk-captcha"></div>

          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full"
            isLoading={isSubmitting || !isLoaded}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardBody>

      {/* Footer */}
      <CardFooter className="flex justify-center p-6 bg-default-100/60 border-t border-default-200">
        <p className="text-sm text-default-600">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-primary hover:underline font-semibold"
          >
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
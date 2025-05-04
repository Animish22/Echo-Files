import SignUpForm from "@/components/SignUpForm";
import { CloudUpload, Layers } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignUp",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="flex-1 flex justify-center items-center p-6">
        <SignUpForm />
      </main>

      <footer className="bg-default-100 border-t border-default-200 py-6 md:py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
             <div className="flex items-center gap-2 mb-4 md:mb-0">

               <Layers className="h-5 w-5 text-primary" />
               <h2 className="text-lg font-semibold text-default-900">EchoFiles</h2>
             </div>
            <p className="text-default-500 text-sm">
              &copy; {new Date().getFullYear()} EchoFiles. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

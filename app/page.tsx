import { Button } from "@heroui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { Card, CardBody } from "@heroui/card";
import {
  ShieldCheck, 
  FolderSearch,
  Layers, 
  RefreshCw, 
  Share2, 
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar"; 

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-default-50 to-default-100 text-default-800">
      <Navbar />

      {/* Main content */}
      <main className="flex-1">
        {/* Hero section */}
        <section className="py-16 md:py-24 lg:py-32 px-4 md:px-6">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
              {/* Text Content Area */}
              <div className="space-y-6 text-center lg:text-left">
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-default-900 leading-tight">
                    Sync, Store, Access. <br />
                    Your Files, <span className="text-primary">Effortlessly</span>.
                  </h1>
                  <p className="text-lg md:text-xl text-default-600 max-w-lg mx-auto lg:mx-0">
                    EchoFiles provides secure cloud storage that keeps your
                    important files safe, synchronized, and accessible wherever
                    you go.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-4 justify-center lg:justify-start">
                  <SignedOut>
                    <Link href="/sign-up">
                      <Button size="lg" variant="solid" color="primary">
                        Get Started Free
                      </Button>
                    </Link>
                    <Link href="/sign-in">
                      <Button size="lg" variant="light" color="primary"> {/* Changed variant */}
                        Sign In
                      </Button>
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard">
                      <Button
                        size="lg"
                        variant="solid"
                        color="primary"
                        endContent={<ArrowRight className="h-5 w-5" />} // Slightly larger icon
                      >
                        Go to Dashboard
                      </Button>
                    </Link>
                  </SignedIn>
                </div>
              </div>

              <div className="flex justify-center items-center order-first lg:order-last">
                <div className="relative w-72 h-72 md:w-96 md:h-96">

                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-110 opacity-70"></div>
                   <div className="absolute inset-8 bg-primary/5 rounded-full blur-2xl scale-90"></div>

                  <div className="absolute inset-0 flex items-center justify-center animate-pulse-slow">
                    <Layers className="h-28 md:h-40 w-28 md:w-40 text-primary/80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 px-4 md:px-6 bg-default-100/70"> 
          <div className="container mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-default-900">
                Unlock Seamless File Management
              </h2>
              <p className="text-lg text-default-600 max-w-2xl mx-auto">
                EchoFiles offers the essential features you need, designed for simplicity and reliability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 max-w-4xl mx-auto">
              {/* Feature 1: Sync */}
              <Card className="border border-default-200 bg-default-50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                <CardBody className="p-6 md:p-8">
                   <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-5">
                     <RefreshCw className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-2 text-default-900">
                    Effortless Sync
                  </h3>
                  <p className="text-default-600">
                    Keep files updated automatically across all your devices.
                    Work from anywhere, anytime.
                  </p>
                </CardBody>
              </Card>

              {/* Feature 2: Organization */}
              <Card className="border border-default-200 bg-default-50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                <CardBody className="p-6 md:p-8">
                   <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-5">
                     <FolderSearch className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-2 text-default-900">
                    Intuitive Organization
                  </h3>
                  <p className="text-default-600">
                    Simple folders and powerful search make finding exactly what you need a breeze.
                  </p>
                </CardBody>
              </Card>

              {/* Feature 3: Security */}
              <Card className="border border-default-200 bg-default-50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                <CardBody className="p-6 md:p-8">
                   <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-5">
                     <ShieldCheck className="h-6 w-6 text-primary" />
                   </div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-2 text-default-900">
                    Robust Security
                  </h3>
                  <p className="text-default-600">
                    Your data is protected with industry-standard security measures. Privacy you can trust.
                  </p>
                </CardBody>
              </Card>

               {/* Feature 4: Access & Share */}
               <Card className="border border-default-200 bg-default-50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                <CardBody className="p-6 md:p-8">
                   <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-5">
                     <Share2 className="h-6 w-6 text-primary" />
                   </div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-2 text-default-900">
                    Access & Share
                  </h3>
                  <p className="text-default-600">
                    Get your files on any device and share easily with secure, simple links.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-16 md:py-24 px-4 md:px-6 bg-default-50">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-5 text-default-900">
              Ready to Simplify Your Storage?
            </h2>
             <p className="text-lg text-default-600 mb-8 max-w-xl mx-auto">
                Join EchoFiles today and experience the easiest way to manage your digital life.
             </p>
            <SignedOut>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    variant="solid"
                    color="primary"
                    endContent={<ArrowRight className="h-5 w-5" />}
                  >
                    Sign Up Free
                  </Button>
                </Link>
              </div>
            </SignedOut>
            <SignedIn>

               <p className="text-default-600 mb-8">Go to your dashboard to manage your files.</p>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="solid"
                  color="primary"
                  endContent={<ArrowRight className="h-5 w-5" />}
                >
                  Open Dashboard
                </Button>
              </Link>
            </SignedIn>
          </div>
        </section>
      </main>

      {/* Footer - Updated Name */}
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
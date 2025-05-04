import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/DashboardContent"; 
import { Layers } from "lucide-react"; 
import Navbar from "@/components/Navbar"; 
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DashBoard",
};


export default async function Dashboard() {
  const { userId } = await auth(); 
  const user = await currentUser(); 

  if (!userId) {
    redirect("/sign-in");
  }

  // Serialize user data carefully for the client Navbar component
  const serializedUser = user
    ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        username: user.username,
        emailAddress: user.emailAddresses?.[0]?.emailAddress, // Access safely
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-default-100 to-default-50 text-default-800">
      {/* Pass user data to Navbar */}
      <Navbar user={serializedUser} />

      {/* Main content area */}
      <main className="flex-1 container mx-auto py-8 px-4 md:px-6">
        {/* DashboardContent handles the main dashboard UI */}
        <DashboardContent
          userId={userId} 
          userName={
            user?.firstName ||
            user?.username || 
            user?.emailAddresses?.[0]?.emailAddress || 
            "User" 
          }
        />
      </main>

      <footer className="bg-default-100 border-t border-default-200 py-6 mt-12">
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
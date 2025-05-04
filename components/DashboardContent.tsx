"use client";

import { useState, useCallback, useEffect } from "react";
import { Card } from "@heroui/card"; 
import { Tabs, Tab } from "@heroui/tabs";
import { FileText, User, FolderPlus, Upload } from "lucide-react";
import { Button } from "@heroui/button";
import { useSearchParams } from "next/navigation";

import FileUploadModal from "@/components/FileUploadModal"; 
import CreateFolderModal from "@/components/CreateFolderModal";
import FileList from "@/components/FileList";
import UserProfile from "@/components/UserProfile";

interface DashboardContentProps {
  userId: string;
  userName: string;
}

export default function DashboardContent({
  userId,
  userName,
}: DashboardContentProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<string>("files");
  const [refreshTrigger, setRefreshTrigger] = useState(0); // To refresh FileList
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null); // Track current folder
  const [currentFolderPath, setCurrentFolderPath] = useState<string>("My Files"); // For display

  // State for Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  // Set the active tab based on URL parameter on initial load
  useEffect(() => {
    setActiveTab(tabParam === "profile" ? "profile" : "files");
  }, [tabParam]);

  // Callback for successful upload or folder creation to refresh list
  const handleActionSuccess = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Callback for FileList to update the current folder context
  const handleFolderChange = useCallback((folderId: string | null, folderName?: string) => {
      setCurrentFolderId(folderId);
      setCurrentFolderPath(folderId ? `My Files / ${folderName || '...'}` : 'My Files');
      console.log("Navigated to folder:", folderId || 'root');
  }, []);


  return (
    <>
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-default-900 mb-2">
          Welcome back, <span className="text-primary">{userName || "User"}</span>!
        </h1>
        <p className="text-default-600 text-lg">
          Manage your files and settings below.
        </p>
      </div>

      {/* --- Tabs Navigation --- */}
      <div className="mb-6 border-b border-default-200">
        <Tabs
          aria-label="Dashboard Sections"
          color="primary"
          variant="underlined" 
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          classNames={{
            base: "justify-start", 
            tabList: "gap-6 px-0", 
            tab: "py-3 h-auto text-base", 
            cursor: "h-0.5",
          }}
        >
          <Tab
            key="files"
            title={
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>My Files</span>
              </div>
            }
          />
          <Tab
            key="profile"
            title={
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </div>
            }
          />
        </Tabs>
      </div>


      {/* --- Tab Content --- */}
      <div className="mt-6">
        {activeTab === "files" && (
          <div>
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 p-4 bg-default-100 rounded-lg border border-default-200">
              <div className="flex-1">
                  {/*  Current Folder Indicator */}
                  <p className="text-sm font-medium text-default-700 truncate" title={currentFolderPath}>
                      Current Folder: <span className="text-primary">{currentFolderPath}</span>
                  </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  color="primary"
                  variant="flat" 
                  startContent={<FolderPlus className="h-4 w-4" />}
                  onPress={() => setIsFolderModalOpen(true)}
                  className="flex-1 sm:flex-none"
                >
                  New Folder
                </Button>
                <Button
                  color="primary"
                  variant="solid" // Make upload more prominent
                  startContent={<Upload className="h-4 w-4" />}
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex-1 sm:flex-none"
                >
                  Upload File
                </Button>
              </div>
            </div>

            {/* File List Area */}
            <div className="p-4 md:p-6 bg-default-50 rounded-lg border border-default-200 min-h-[300px]">
              <FileList
                userId={userId}
                refreshTrigger={refreshTrigger}
                onFolderChange={handleFolderChange} // Pass callback to handle navigation
              />
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <Card className="border border-default-200 bg-default-50 shadow-sm max-w-3xl mx-auto">
              <div className="p-4 md:p-6">
                 <UserProfile />
              </div>
          </Card>
        )}
      </div>

      {/* --- Modals --- */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        userId={userId}
        currentFolderId={currentFolderId}
        onUploadSuccess={() => {
            setIsUploadModalOpen(false); // Close modal on success
            handleActionSuccess();      // Refresh file list
        }}
      />

      <CreateFolderModal
         isOpen={isFolderModalOpen}
         onOpenChange={setIsFolderModalOpen}
         userId={userId} 
         currentFolderId={currentFolderId}
         onCreateSuccess={() => {
             setIsFolderModalOpen(false); // Close modal on success
             handleActionSuccess();       // Refresh file list 
         }}
       />
    </>
  );
}
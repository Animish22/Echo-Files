"use client";

import {  Home, ChevronRight } from "lucide-react"; 
import { Button } from "@heroui/button";

interface FolderNavigationProps {
  folderPath: Array<{ id: string; name: string }>;
  navigateUp: () => void;
  navigateToPathFolder: (index: number) => void;
}

export default function FolderNavigation({
  folderPath,
  navigateUp,
  navigateToPathFolder,
}: FolderNavigationProps) {

  return (

<div className="flex items-center gap-1.5 text-sm text-default-600 bg-default-100/70 px-3 py-1.5 rounded-md border border-default-200 overflow-x-auto">
      {/* Root/Home Button */}
      <Button
        variant="light" 
        size="sm"
        className={`px-2 font-medium ${folderPath.length === 0 ? "text-primary" : "text-default-600 hover:text-default-900"}`}
        onPress={() => navigateToPathFolder(-1)} // Index -1 for root
        startContent={folderPath.length > 0 ? <Home className="h-4 w-4" /> : undefined} // Show home icon only when not at root
      >
         {folderPath.length === 0 ? "My Files (Root)" : "My Files"}
      </Button>

      {/* Path Segments */}
      {folderPath.map((folder, index) => (
        <div key={folder.id} className="flex items-center gap-1.5">
          <ChevronRight className="h-4 w-4 text-default-400 flex-shrink-0" /> {/* Separator */}
          <Button
            variant="light"
            size="sm"
            onPress={() => navigateToPathFolder(index)}
            // Highlight the last item (current folder)
            className={`px-2 truncate max-w-[150px] sm:max-w-[200px] ${index === folderPath.length - 1 ? "font-semibold text-primary" : "text-default-600 hover:text-default-900"}`}
            title={folder.name}
          >
            {folder.name}
          </Button>
        </div>
      ))}
    </div>
  );
}
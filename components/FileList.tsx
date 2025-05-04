"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Tooltip } from "@heroui/tooltip"; 
import { addToast } from "@heroui/toast";
import { formatDistanceToNow, format } from "date-fns";
import type { File as FileType } from "@/lib/db/schema"; 
import axios from "axios";

import ConfirmationModal from "@/components/ui/ConfirmationModal"; 
import FileEmptyState from "@/components/FileEmptyState"; 
import FileIcon from "@/components/FileIcon"; 
import FileActions from "@/components/FileActions"; 
import FileLoadingState from "@/components/FileLoadingState"; 
import FileTabs from "@/components/FileTabs"; 
import FolderNavigation from "@/components/FolderNavigation"; 
import FileListHeaderActions from "@/components/FileListHeaderActions"; 

import { Star, Folder, ExternalLink, Trash } from "lucide-react"; 

interface FileListProps {
  userId: string;
  refreshTrigger?: number;
  // Pass folder name along with ID for path
  onFolderChange?: (folderId: string | null, folderName?: string) => void;
}

export default function FileList({
  userId,
  refreshTrigger = 0,
  onFolderChange,
}: FileListProps) {
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  // Store path with names
  const [folderPath, setFolderPath] = useState<Array<{ id: string; name: string }>>([]);

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [emptyTrashModalOpen, setEmptyTrashModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  // Fetch files logic 
  const fetchFiles = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      let url = `/api/files?userId=${userId}`;
      if (currentFolderId) {
        url += `&parentId=${currentFolderId}`;
      }
      const response = await axios.get(url);
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
      addToast({
        title: "Error Loading Files",
        description: "Couldn't load files. Please try refreshing.",
        color: "danger",
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [userId, refreshTrigger, currentFolderId]);

  // Filter files based on active tab 
  const filteredFiles = useMemo(() => {
    switch (activeTab) {
      case "starred": return files.filter((file) => file.isStarred && !file.isTrash);
      case "trash": return files.filter((file) => file.isTrash);
      case "all": default: return files.filter((file) => !file.isTrash);
    }
  }, [files, activeTab]);

  // Counts 
  const trashCount = useMemo(() => files.filter((file) => file.isTrash).length, [files]);
  const starredCount = useMemo(() => files.filter((file) => file.isStarred && !file.isTrash).length, [files]);
  const allFilesCount = useMemo(() => files.filter((file) => !file.isTrash).length, [files]);

  // Action handlers 
  const handleStarFile = async (fileId: string) => {
    const originalFiles = [...files];
    const file = files.find((f) => f.id === fileId);
    if (!file) return;

    // Optimistic UI update
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, isStarred: !f.isStarred } : f));

    try {
      await axios.patch(`/api/files/${fileId}/star`);
      addToast({
        title: file.isStarred ? "Removed from Starred" : "Added to Starred",
        color: "success",
      });
    } catch (error) {
      console.error("Error starring file:", error);
      addToast({ title: "Action Failed", description: "Couldn't update star status.", color: "danger" });
      setFiles(originalFiles); // Revert optimistic update on error
    }
  };

  const handleTrashFile = async (fileId: string) => {
    const originalFiles = [...files];
    const file = files.find((f) => f.id === fileId);
     if (!file) return;

    // Optimistic UI update
     setFiles(prev => prev.map(f => f.id === fileId ? { ...f, isTrash: !f.isTrash } : f));

    try {
       const response = await axios.patch(`/api/files/${fileId}/trash`);
       const responseData = response.data;
       addToast({
         title: responseData.isTrash ? "Moved to Trash" : "Restored from Trash",
         color: "success",
       });
    } catch (error) {
        console.error("Error trashing file:", error);
        addToast({ title: "Action Failed", description: "Couldn't update file status.", color: "danger"});
        setFiles(originalFiles); // Revert optimistic update on error
    }
  };

  const handleDeleteFile = async (fileId: string) => {
     const fileToDelete = files.find((f) => f.id === fileId);
     const originalFiles = [...files];
     if (!fileToDelete) return;

    // Optimistic UI update
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setDeleteModalOpen(false); // Close modal immediately

    try {
       const response = await axios.delete(`/api/files/${fileId}/delete`);
       if (response.data.success) {
         addToast({ title: "File Permanently Deleted", color: "success" });
       } else {
         throw new Error(response.data.error || "Failed to delete file");
       }
    } catch (error) {
       console.error("Error deleting file:", error);
       addToast({ title: "Deletion Failed", description: "Could not delete the file.", color: "danger" });
       setFiles(originalFiles); // Revert optimistic update on error
    } finally {
       setSelectedFile(null);
    }
  };

  const handleEmptyTrash = async () => {
     const originalFiles = [...files];
     // Optimistic UI update
     setFiles(prev => prev.filter(f => !f.isTrash));
     setEmptyTrashModalOpen(false); 

     try {
        await axios.delete(`/api/files/empty-trash`);
        addToast({ title: "Trash Emptied", color: "success" });
     } catch (error) {
         console.error("Error emptying trash:", error);
         addToast({ title: "Action Failed", description: "Could not empty trash.", color: "danger" });
         setFiles(originalFiles); // Revert optimistic update on error
     }
  };

  const handleDownloadFile = async (file: FileType) => {
    addToast({ title: "Preparing Download...", color: "primary" });
    try {
        const url = file.type.startsWith("image/")
          ? `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/tr:q-100,orig-true/${file.path}`
          : file.fileUrl;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        addToast({ title: "Download Started", color: "success" });
    } catch (error) {
        console.error("Error downloading file:", error);
        addToast({ title: "Download Failed", color: "danger" });
    }
  };

  // Image viewer logic 
  const openImageViewer = (file: FileType) => {
    if (file.type.startsWith("image/")) {
      const optimizedUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/tr:q-90,w-1600,h-1200,fo-auto/${file.path}`;
      window.open(optimizedUrl, "_blank");
    }
  };

  // Folder navigation logic 
 const navigateToFolder = (folderId: string, folderName: string) => {
    const newPath = [...folderPath, { id: folderId, name: folderName }];
    setFolderPath(newPath);
    setCurrentFolderId(folderId);
    if (onFolderChange) onFolderChange(folderId, folderName);
  };

  const navigateUp = () => {
    if (folderPath.length > 0) {
      const newPath = folderPath.slice(0, -1);
      setFolderPath(newPath);
      const newFolderId = newPath.length > 0 ? newPath[newPath.length - 1].id : null;
      const newFolderName = newPath.length > 0 ? newPath[newPath.length - 1].name : undefined; // Get name if path exists
      setCurrentFolderId(newFolderId);
      if (onFolderChange) onFolderChange(newFolderId, newFolderName); // Pass name
    }
  };

 const navigateToPathFolder = (index: number) => {
    let newFolderId: string | null;
    let newPath: Array<{ id: string; name: string }>;
    let newFolderName: string | undefined;

    if (index < 0) { // Navigate to Root
      newFolderId = null;
      newPath = [];
      newFolderName = undefined; // Root doesn't have a specific parent name in this context
    } else {
      newPath = folderPath.slice(0, index + 1);
      newFolderId = newPath[newPath.length - 1].id;
      newFolderName = newPath[newPath.length - 1].name;
    }
    setFolderPath(newPath);
    setCurrentFolderId(newFolderId);
    if (onFolderChange) onFolderChange(newFolderId, newFolderName); // Pass name
  };

  // Click handler 
  const handleItemClick = (file: FileType) => {
    if (file.isFolder) {
      navigateToFolder(file.id, file.name);
    } else if (file.type.startsWith("image/")) {
      openImageViewer(file);
    }
  };

  // Render loading state
  if (loading) {
    return <FileLoadingState />;
  }

  // Main Render
  return (
    <div className="space-y-4 md:space-y-5">
      {/* --- Integrated Header --- */}
      <div className="space-y-3 md:space-y-4">
        {/* Top Row: Tabs and Global Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <FileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            allFilesCount={allFilesCount}
            starredCount={starredCount}
            trashCount={trashCount}
          />
          <FileListHeaderActions
             activeTab={activeTab}
             trashCount={trashCount}
             onRefresh={() => fetchFiles(false)} // Fetch without main loading indicator
             onEmptyTrash={() => setEmptyTrashModalOpen(true)}
          />
        </div>

        {/* Second Row: Folder Navigation (Conditional) */}
        {activeTab === "all" && (
          <FolderNavigation
            folderPath={folderPath}
            navigateUp={navigateUp}
            navigateToPathFolder={navigateToPathFolder}
          />
        )}
      </div>

      {/* --- Files List/Table --- */}
      <div className="border border-default-200 rounded-lg overflow-hidden bg-default-50">
        {filteredFiles.length === 0 ? (
          <FileEmptyState activeTab={activeTab} />
        ) : (
          <div className="overflow-x-auto">
            <Table
              aria-label={`Files list - ${activeTab} view`}
              selectionMode="none" 
              classNames={{
                base: "min-w-full",

                th: "bg-default-100/80 text-default-600 font-semibold text-sm uppercase tracking-wider px-4 py-3 text-left first:pl-5 last:pr-5",

                td: "px-4 py-3 text-sm text-default-700 border-b border-default-100 last:border-b-0 first:pl-5 last:pr-5",

                wrapper: "p-0 shadow-none",

                tbody: "",
              }}
            >
              <TableHeader>
                <TableColumn key="name">Name</TableColumn>

                <TableColumn key="size" className="hidden md:table-cell w-[100px] text-right">Size</TableColumn>
                <TableColumn key="modified" className="hidden sm:table-cell w-[150px]">Last Modified</TableColumn>
                <TableColumn key="actions" className="w-[130px] text-right">Actions</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow
                    key={file.id}
                    className={`group hover:bg-default-100/70 transition-colors ${
                      file.isFolder || file.type.startsWith("image/") ? "cursor-pointer" : ""
                    }`}
                    // Use onDoubleClick for folder navigation, single click for selection/preview
                    onDoubleClick={() => { if (file.isFolder) handleItemClick(file); }}
                    onClick={() => { if (!file.isFolder && file.type.startsWith("image/")) handleItemClick(file); }}
                  >
                    <TableCell key="name">
                      <div className="flex items-center gap-3">
                        <FileIcon file={file} /> 
                        <span className="font-medium text-default-800 truncate max-w-[150px] sm:max-w-[250px] md:max-w-xs lg:max-w-md" title={file.name}>
                          {file.name}
                        </span>

                         {file.isStarred && !file.isTrash && (
                              <Tooltip content="Starred" size="sm">
                                  <Star className="h-3.5 w-3.5 text-yellow-500 fill-current flex-shrink-0" />
                              </Tooltip>
                          )}
                          {file.type.startsWith("image/") && !file.isFolder && !file.isTrash && (
                              <Tooltip content="Click name to view" size="sm">
                                  <ExternalLink className="h-3.5 w-3.5 text-default-400 group-hover:text-primary flex-shrink-0" />
                              </Tooltip>
                           )}
                      </div>
                    </TableCell>
                     <TableCell key="size" className="hidden md:table-cell text-right">
                       <span className="text-default-600">
                           {/* Size calculation  */}
                           {file.isFolder ? "—" : file.size < 1024 ? `${file.size} B` : file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                       </span>
                    </TableCell>
                    <TableCell key="modified" className="hidden sm:table-cell">
                       <Tooltip content={format(new Date(file.createdAt), "PPpp")} size="sm">
                          <span className="text-default-600">
                            {/* Relative time (no change) */}
                             {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                          </span>
                       </Tooltip>
                    </TableCell>
                    <TableCell key="actions" onClick={(e) => e.stopPropagation()}> {/* Prevent row click */}

                       <FileActions
                         file={file}
                         onStar={handleStarFile}
                         onTrash={handleTrashFile}
                         onDelete={(file) => {
                           setSelectedFile(file);
                           setDeleteModalOpen(true);
                         }}
                         onDownload={handleDownloadFile}
                       />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Confirm Permanent Deletion"
        description={`Permanently delete "${selectedFile?.name}"? This action cannot be undone.`}
        icon={Trash} 
        iconColor="text-danger"
        confirmText="Delete Permanently"
        confirmColor="danger"
        onConfirm={() => {
          if (selectedFile) {
            handleDeleteFile(selectedFile.id);
          }
        }}
        isDangerous={true}
      />

      <ConfirmationModal
        isOpen={emptyTrashModalOpen}
        onOpenChange={setEmptyTrashModalOpen}
        title="Confirm Empty Trash"
        description={`Permanently delete all ${trashCount} items in the trash? This action cannot be undone.`}
        icon={Trash}
        iconColor="text-danger"
        confirmText="Empty Trash"
        confirmColor="danger"
        onConfirm={handleEmptyTrash}
        isDangerous={true}
      />
    </div>
  );
}
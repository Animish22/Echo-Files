"use client";

import { useState, useEffect } from 'react';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { FolderPlus, ArrowRight } from "lucide-react";
import { addToast } from "@heroui/toast";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalProps,
} from "@heroui/modal";
import axios from "axios";

interface CreateFolderModalProps extends Omit<ModalProps, 'children'> {
  userId: string;
  currentFolderId?: string | null;
  onCreateSuccess?: () => void;
}

export default function CreateFolderModal({
    userId,
    currentFolderId = null,
    onCreateSuccess,
    isOpen,
    onOpenChange,
    ...modalProps
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
       setTimeout(() => {
            setFolderName("");
            setCreatingFolder(false);
            setError(null);
       }, 300); 
    }
  }, [isOpen]);

  const handleCreateFolder = async () => {
    setError(null); 
    if (!folderName.trim()) {
      setError("Please enter a valid folder name.");
      return;
    }

    const invalidChars = /[\\/:\*\?"<>\|]/;
    if (invalidChars.test(folderName)) {
        setError('Folder name contains invalid characters.');
        return;
    }


    setCreatingFolder(true);

    try {
      await axios.post("/api/folders/create", {
        name: folderName.trim(),
        userId: userId,
        parentId: currentFolderId,
      });

      addToast({
        title: "Folder Created",
        description: `Folder "${folderName.trim()}" created.`,
        color: "success",
      });

       if (onCreateSuccess) {
         onCreateSuccess(); // Trigger refresh and close modal via parent
       }

    } catch (error: any) {
      console.error("Error creating folder:", error);
      const errorMessage = error.response?.data?.error || "We couldn't create the folder. Please try again.";
      setError(errorMessage); 
      addToast({
        title: "Folder Creation Failed",
        description: errorMessage,
        color: "danger",
      });
    } finally {
      setCreatingFolder(false);
    }
  };

  return (
    <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
         classNames={{
            base: "border border-default-200 bg-default-50",
            header: "border-b border-default-200",
            footer: "border-t border-default-200",
        }}
        {...modalProps}
    >
      <ModalContent>
         {(onClose) => (
            <>
                <ModalHeader className="flex gap-2 items-center">
                    <FolderPlus className="h-5 w-5 text-primary" />
                    <span>Create New Folder</span>
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-2">
                        <Input
                            type="text"
                            label="Folder Name"
                            placeholder="e.g., Project Documents"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder() }} // Submit on Enter
                            autoFocus
                            isInvalid={!!error}
                            errorMessage={error}
                         />
                         <p className="text-xs text-default-500 px-1">
                             Enter a name for the new folder in the current directory ({currentFolderId || 'root'}).
                         </p>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="flat" color="default" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        onPress={handleCreateFolder}
                        isLoading={creatingFolder}
                        isDisabled={!folderName.trim() || creatingFolder}
                        endContent={!creatingFolder && <ArrowRight className="h-4 w-4" />}
                    >
                        Create Folder
                    </Button>
                </ModalFooter>
            </>
         )}
      </ModalContent>
    </Modal>
  );
}
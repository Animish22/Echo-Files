"use client";

import { useState, useRef , useEffect} from "react";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import { Input } from "@heroui/input";
import {
  Upload,
  X,
  FileUp,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
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

interface FileUploadModalProps extends Omit<ModalProps, 'children'> {
  userId: string;
  currentFolderId?: string | null;
  onUploadSuccess?: () => void;
}

export default function FileUploadModal({
  userId,
  currentFolderId = null,
  onUploadSuccess,
  isOpen, 
  onOpenChange, 
  ...modalProps
}: FileUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal closes or opens
  useEffect(() => {
    if (!isOpen) {
        setTimeout(() => { // Delay is reseted slightly to allow closing animation
            setFile(null);
            setUploading(false);
            setProgress(0);
            setError(null);
            setIsSuccess(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }, 300);
    }
  }, [isOpen]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
     setIsSuccess(false); // Reset success state on new drop
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
       validateAndSetFile(droppedFile);
    }
  };

   const validateAndSetFile = (selectedFile: File) => {
     // Reset previous error/success state
     setError(null);
     setIsSuccess(false);

      // Validate file size (5MB limit) - adjust as needed
      const maxSize = 5 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setError(`File size exceeds ${maxSize / (1024*1024)}MB limit.`);
        setFile(null);
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];
      if (!allowedTypes.includes(selectedFile.type)) {
         setError('Invalid file type. Supported: JPG, PNG, GIF, WebP, PDF, TXT');
         setFile(null);
         return;
      }

      setFile(selectedFile);
      setError(null);
  };


  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setIsSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file || uploading || isSuccess) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    if (currentFolderId) {
      formData.append("parentId", currentFolderId);
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    setIsSuccess(false);

    try {
      await axios.post("/api/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        },
      });

       setIsSuccess(true); 
       setProgress(100); // Ensure progress hits 100%
       addToast({
           title: "Upload Successful",
           description: `${file.name} uploaded.`,
           color: "success",
       });

      // Clear the file preview after a short delay on success
      setTimeout(() => {
          // Keep success state true until modal is closed or new file added
          // clearFile(); // Don't clear file immediately, show success checkmark
          if (onUploadSuccess) {
            onUploadSuccess(); // Trigger refresh and potentially close modal via parent
          }
      }, 1000); // Delay for user to see success state

    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = (error as any).response?.data?.error || "Failed to upload file. Please try again.";
      setError(errorMessage);
      addToast({
        title: "Upload Failed",
        description: errorMessage,
        color: "danger",
      });
    } finally {
      setUploading(false);
      // Don't reset progress immediately on error, let user see it stopped
    }
  };

  return (
    <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        size="xl" 
        classNames={{
            base: "border border-default-200 bg-default-50",
            header: "border-b border-default-200",
            footer: "border-t border-default-200",
        }}
        {...modalProps}
     >
      <ModalContent>
        {(onClose) => ( // Use render prop to get onClose
          <>
            <ModalHeader className="flex gap-2 items-center">
              <Upload className="h-5 w-5 text-primary" />
              <span>Upload New File</span>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {/* File drop area */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className={`relative border-2 border-dashed rounded-lg p-6 py-10 text-center transition-colors ${
                    error
                      ? "border-danger bg-danger/5"
                      : isSuccess
                      ? "border-success bg-success/5"
                      : file
                      ? "border-primary bg-primary/5"
                      : "border-default-300 hover:border-primary/50 bg-default-100/30"
                  }`}
                >
                   {/* Hidden file input */}
                    <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".jpg, .jpeg, .png, .gif, .webp, .pdf, .txt" 
                    />

                    {/* Content based on state */}
                    {!file && !isSuccess && (
                      <div className="space-y-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                         <FileUp className="h-10 w-10 mx-auto text-primary/80" />
                         <p className="text-default-600 font-medium">
                             Drag & drop files here or{" "}
                             <span className="text-primary font-semibold">browse</span>
                         </p>
                         <p className="text-xs text-default-500">Max 5MB per file. Supported types: images, PDF, text.</p>
                       </div>
                    )}

                    {file && !isSuccess && (
                        <div className="space-y-3">
                             {/* File Preview */}
                            <div className="flex items-center justify-between text-left bg-default-50 p-3 rounded-md border border-default-200">
                                <div className="flex items-center space-x-3 overflow-hidden">
                                    <div className="p-2 bg-primary/10 rounded-md flex-shrink-0">
                                        <FileUp className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-default-500">
                                            {/* Size calculation */}
                                            {file.size < 1024 ? `${file.size} B` : file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                                        </p>
                                    </div>
                                </div>
                                {!uploading && (
                                     <Button isIconOnly variant="light" size="sm" onClick={clearFile} className="text-default-500 flex-shrink-0">
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            {/* Progress Bar */}
                            {uploading && (
                                <Progress value={progress} color="primary" size="sm" showValueLabel={true} className="max-w-full" />
                            )}
                        </div>
                    )}

                     {isSuccess && file && (
                        <div className="space-y-3 text-center text-success">
                             <CheckCircle className="h-12 w-12 mx-auto" />
                             <p className="font-medium">{file.name} uploaded successfully!</p>
                        </div>
                     )}


                     {/* Error Display */}
                    {error && (
                         <div className="mt-3 bg-danger/10 text-danger p-3 rounded-lg flex items-center gap-2 text-sm justify-center border border-danger/30">
                             <AlertTriangle className="h-4 w-4" />
                             <span>{error}</span>
                             {/* Optionally add a clear button for the error */}
                             <Button isIconOnly variant="light" size="sm" onClick={() => setError(null)} className="text-danger ml-auto -mr-1">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                </div> {/* End Dropzone */}

                {/* Upload Tips (Optional in Modal) */}
                {/* <div className="text-xs text-default-500 space-y-1 mt-3"> ... </div> */}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" color="default" onClick={onClose}>
                 {isSuccess ? 'Close' : 'Cancel'}
              </Button>
              {/* Show Upload button only if a file is selected and not already successfully uploaded */}
              {file && !isSuccess && (
                  <Button
                    color="primary"
                    startContent={<Upload className="h-4 w-4" />}
                    onClick={handleUpload}
                    isLoading={uploading}
                    isDisabled={!!error || uploading}
                   >
                     {uploading ? `Uploading... ${progress}%` : "Upload File"}
                  </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
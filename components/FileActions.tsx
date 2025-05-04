"use client";

import { Star, Trash, X, ArrowUpFromLine, Download, MoreVertical } from "lucide-react";
import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown"; 
import type { File as FileType } from "@/lib/db/schema"; 
import React from 'react'; 

interface FileActionsProps {
  file: FileType;
  onStar: (id: string) => void;
  onTrash: (id: string) => void;
  onDelete: (file: FileType) => void;
  onDownload: (file: FileType) => void;
}

export default function FileActions({
  file,
  onStar,
  onTrash,
  onDelete,
  onDownload,
}: FileActionsProps) {

  // Build an array of dropdown items based on conditions (Did this because using DropDownItem by default was giving a typescript error )
  const dropdownItems = [];

  // Download Action - Only show if not in trash and not a folder
  if (!file.isTrash && !file.isFolder) {
    dropdownItems.push(
      <DropdownItem key="download" startContent={<Download className="h-4 w-4" />} onPress={() => onDownload(file)}>
        Download
      </DropdownItem>
    );
  }

  // Trash/Restore Action - Always show
  dropdownItems.push(
    <DropdownItem
        key="trash-restore"
        startContent={file.isTrash ? <ArrowUpFromLine className="h-4 w-4" /> : <Trash className="h-4 w-4" />}
        onPress={() => onTrash(file.id)}
        className={file.isTrash ? "text-success" : ""}
        color={file.isTrash ? "success" : "default"}
      >
        {file.isTrash ? "Restore" : "Move to Trash"}
      </DropdownItem>
  );

  // Delete Permanently Action - Only show if in trash
  if (file.isTrash) {
    dropdownItems.push(
      <DropdownItem
          key="delete"
          startContent={<X className="h-4 w-4" />}
          onPress={() => onDelete(file)}
          className="text-danger"
          color="danger"
        >
          Delete Permanently
        </DropdownItem>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">

      {/* Star button - Always visible when not in trash */}
      {!file.isTrash && (
        <Button
          variant="light"
          size="sm"
          isIconOnly 
          onPress={() => onStar(file.id)}
          aria-label={file.isStarred ? "Unstar file" : "Star file"}
          className="text-default-500 hover:text-yellow-500 data-[selected=true]:text-yellow-500"
          data-selected={file.isStarred}
        >
          <Star
            className={`h-5 w-5 ${file.isStarred ? "fill-current" : ""}`}
          />
        </Button>
      )}

      {/* Dropdown Menu for other actions */}
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button
              variant="light"
              size="sm"
              isIconOnly
              aria-label="More actions"
              className="text-default-500"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="File Actions Menu">
          {/* Render the array of conditionally added DropdownItems */}
          {dropdownItems}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}

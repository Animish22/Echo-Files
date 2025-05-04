"use client";

import { RefreshCw, Trash } from "lucide-react";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";

interface FileListHeaderActionsProps {
  activeTab: string;
  trashCount: number;
  onRefresh: () => void;
  onEmptyTrash: () => void;
}

export default function FileListHeaderActions({
  activeTab,
  trashCount,
  onRefresh,
  onEmptyTrash,
}: FileListHeaderActionsProps) {
  return (
    // Use flex-shrink-0 to prevent shrinking on small screens
    <div className="flex gap-2 flex-shrink-0">
        <Tooltip content="Refresh file list" size="sm">
            <Button
                variant="light"
                size="sm"
                isIconOnly
                onPress={onRefresh}
                aria-label="Refresh file list"
             >
                <RefreshCw className="h-4 w-4" />
             </Button>
        </Tooltip>

        {/* Only show Empty Trash button when in Trash tab and trash is not empty */}
        {activeTab === "trash" && trashCount > 0 && (
            <Button
                color="danger"
                variant="flat" 
                size="sm"
                onClick={onEmptyTrash}
                startContent={<Trash className="h-4 w-4" />}
                className="whitespace-nowrap" 
            >
                Empty Trash
            </Button>
        )}
    </div>
  );
}
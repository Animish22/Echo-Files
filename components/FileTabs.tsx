"use client";

import React from "react";
import { File, Star, Trash } from "lucide-react";
import { Tabs, Tab } from "@heroui/tabs";
import { cn } from "@/lib/utils"; 

const Badge = ({ count, color = 'default', className }: { count: number, color?: 'default' | 'warning' | 'danger', className?: string }) => {
  if (count === 0) return null; // Don't render badge if count is 0

  const colorClasses = {
    default: 'bg-default-100 text-default-600 border-default-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    danger: 'bg-danger/10 text-danger border-danger/20', // Use danger color from theme
  };

  return (
    <span className={cn(
        "ml-1.5 px-1.5 py-0.5 text-xs font-medium rounded-md border",
        colorClasses[color],
        className
       )}
       aria-hidden="true" // Hide from screen readers, title provides info
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};


interface FileTabsProps {
  activeTab: string;
  onTabChange: (key: string) => void;
  allFilesCount: number; 
  starredCount: number;
  trashCount: number;
}

export default function FileTabs({
  activeTab,
  onTabChange,
  allFilesCount,
  starredCount,
  trashCount,
}: FileTabsProps) {
  return (

<div className="w-full border-b border-default-200">
        <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => onTabChange(key as string)}
            color="primary"
            variant="underlined"
            aria-label="File view filters"
            classNames={{
                base: "w-full overflow-x-auto",
                tabList: "gap-4 sm:gap-6 px-1",
                tab: "py-2.5 px-1 h-auto text-sm sm:text-base", 
                cursor: "h-0.5 rounded-full", 
                tabContent: "group-data-[selected=true]:text-primary group-data-[selected=true]:font-semibold text-default-600" 
            }}
        >
            <Tab
                key="all"
                title={
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <File className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>All Files</span>
                        <Badge count={allFilesCount} color="default" />
                    </div>
                }
             />
            <Tab
                key="starred"
                title={
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Starred</span>
                        <Badge count={starredCount} color="warning" />
                    </div>
                }
             />
            <Tab
                key="trash"
                title={
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <Trash className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Trash</span>
                        <Badge count={trashCount} color="danger" />
                    </div>
                }
            />
        </Tabs>
    </div>
  );
}
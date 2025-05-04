"use client";

import { Folder, FileText, Image as ImageIcon, Music, Video, FileArchive, FileCode, FileSpreadsheet, FileQuestion } from "lucide-react";
import { IKImage } from "imagekitio-next";
import type { File as FileType } from "@/lib/db/schema";

interface FileIconProps {
  file: FileType;
  size?: number; 
}

export default function FileIcon({ file, size = 5 }: FileIconProps) {
  const iconSizeClass = `h-${size} w-${size}`;

  if (file.isFolder) return <Folder className={`${iconSizeClass} text-blue-500 flex-shrink-0`} />;

  const genericType = file.type.split("/")[0]; // 'image', 'video', 'audio', 'application', 'text' 'etc' (video , audio wont come as not in type to be accepted )
  const specificType = file.type.split("/")[1]; // 'png', 'pdf', 'zip' etc.

  switch (genericType) {
    case "image":
      return (
        <div className="h-10 w-10 flex-shrink-0 relative overflow-hidden rounded border border-default-200 bg-default-100">
          <IKImage
            path={file.path}
            transformation={[{ height: 40, width: 40, focus: "auto", quality: 75 }]} 
            loading="lazy"
            lqip={{ active: true }}
            alt={file.name}
            className="object-cover h-full w-full" 
          />
        </div>
      );
      // wont occur because the only allowed mime types are .jpg , .jpeg , .pdf , .wbp , .txt
    case "video":
      return <Video className={`${iconSizeClass} text-purple-500 flex-shrink-0`} />;
      // wont occur because the only allowed mime types are .jpg , .jpeg , .pdf , .wbp , .txt
    case "audio":
      return <Music className={`${iconSizeClass} text-pink-500 flex-shrink-0`} />;
    case "text":
       if (specificType === 'csv') return <FileSpreadsheet className={`${iconSizeClass} text-green-600 flex-shrink-0`} />;
       if (['html', 'css', 'javascript', 'typescript', 'jsx', 'tsx'].includes(specificType)) return <FileCode className={`${iconSizeClass} text-indigo-500 flex-shrink-0`} />;
      return <FileText className={`${iconSizeClass} text-gray-500 flex-shrink-0`} />;

    case "application":
      if (specificType === 'pdf') return <FileText className={`${iconSizeClass} text-red-500 flex-shrink-0`} />;
      if (['zip', 'rar', '7z', 'tar', 'gz'].includes(specificType)) return <FileArchive className={`${iconSizeClass} text-yellow-600 flex-shrink-0`} />;
      if (['vnd.ms-excel', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'spreadsheet'].includes(specificType)) return <FileSpreadsheet className={`${iconSizeClass} text-green-600 flex-shrink-0`} />;
       if (['msword', 'vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(specificType)) return <FileText className={`${iconSizeClass} text-blue-600 flex-shrink-0`} />;

       return <FileText className={`${iconSizeClass} text-orange-500 flex-shrink-0`} />;

    default:
      return <FileQuestion className={`${iconSizeClass} text-gray-400 flex-shrink-0`} />; // Unknown type (wont happend just practicing everything that can actually happen in an app)
  }
}
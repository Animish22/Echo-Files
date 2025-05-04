import {
  text,
  timestamp,
  pgTable,
  boolean,
  uuid,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";


export const files = pgTable("files", {

  id: uuid("id").defaultRandom().primaryKey(),
  parentId: uuid("parent_id"), // parent folder id (null for root items)

  name: text("name").notNull(),
  path: text("path").notNull(), // Entire path to the file/folder
  size: integer("size").notNull(), // 0 for folders
  type: text("type").notNull(), // .jpeg , .jpg , .pdf for images and "folder" for folders

  fileUrl: text("file_url").notNull(), // URL to access the file
  thumbnailUrl: text("thumbnail_url"), // thumbnail for images/documents

  userId: text("user_id").notNull(),

  isFolder: boolean("is_folder").default(false).notNull(), 
  isStarred: boolean("is_starred").default(false).notNull(), 
  isTrash: boolean("is_trash").default(false).notNull(), 

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


// Relations between our schemas  (in this case only self relation between the file schema exist )

export const filesRelations = relations(files, ({ one, many }) => ({

  // each file/folder can have only one parent 
  parent: one(files, {
    fields: [files.parentId], // The foreign key of this table 
    references: [files.id], // The primary key in the parent table 
    relationName: 'FileHierarchy' 
  }),

  // Each folder can have multiple children (files / folders) 
  children: many(files ,{
    relationName: 'FileHierarchy'
  }),
}));


// Help to provide type safety when using the File Schema in your code 
export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;

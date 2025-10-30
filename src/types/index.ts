// src/types.ts
export type Status = 'nuevo' | 'en_atencion' | 'pausado' | 'resuelto' | 'finalizado';
export type Priority = 'baja' | 'media' | 'alta' | 'critica';
export type ModuleCode = 'SCP' | 'CENTURA' | 'WEB';

export type User = {
  id: string;
  username: string;
  nombreCompleto: string;
  flgAtencion: boolean;
  roles?: string[];
};

export type Ticket = {
  id: string;
  subject: string;
  description: string;
  priority: Priority;
  moduleCode: ModuleCode;
  status: Status;
  requesterId: string;
  assigneeId?: string | null;
  createdAt: string;
  updatedAt: string;
  files?: File[];  
};

export type Note = {
  id: string;
  ticketId: string;
  authorId: string;
  note: string;
  createdAt: string;
};

// export type Attachment = {
//   id: string;
//   ticketId: string;
//   filename: string;
//   url: string;
//   createdAt: string;
// };

export type Attachment = {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  url: string; 
  CreatedAt: string;

  // attachmentId: number;
  // originalName: string;
  // contentType: string;
  // sizeBytes: number;
  // storagePath: string;   // por si sirves estático
  // uploadedAt: string;
};

export type NotificationItem = { id: string; text: string; createdAt: string };
export type NotificationFeed = { unread: number; items: NotificationItem[] };

export type MenuItem = { label: string; path: string };

export interface Row {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  headerBg: string;
}

export interface Column {
  id: string;
  label: string;
}

export interface Task {
  id: string;
  label: string;
  owner?: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
}

export interface Reactions {
  idea: number;
  good: number;
  want: number;
}

export interface CellData {
  tasks: Task[];
  comments: Comment[];
  attachments: Attachment[];
  reactions: Reactions;
  aiSummary?: string;
}

export interface BusinessMapData {
  rows: Row[];
  columns: Column[];
  cells: Record<string, CellData>;
}

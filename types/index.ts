export type Category =
  | 'Pothole'
  | 'Streetlight'
  | 'Water_Leak'
  | 'Footpath'
  | 'Drain'
  | 'Other';

export type Status =
  | 'Submitted'
  | 'Under_Review'
  | 'Assigned'
  | 'In_Progress'
  | 'Resolved'
  | 'Rejected';

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export type Role = 'citizen' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // plain for mock only
  role: Role;
  createdAt: string;
}

export interface Issue {
  id: string;
  title: string;
  category: Category;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  imageUrl: string;
  status: Status;
  priority: Priority;
  reporterId: string;
  reporterName: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  resolutionNotes: string;
}

export interface CreateIssueInput {
  title: string;
  category: Category;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  imageUrl: string;
  reporterId: string;
  reporterName: string;
}

export interface UpdateIssueInput {
  status?: Status;
  priority?: Priority;
  assignedTo?: string;
  resolutionNotes?: string;
}

export interface AuthPayload {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface KpiData {
  total: number;
  resolved: number;
  inProgress: number;
  submitted: number;
  avgResolutionDays: number;
  categoryBreakdown: { category: string; count: number }[];
}

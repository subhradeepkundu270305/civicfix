import { v4 as uuidv4 } from 'uuid';
import { Issue, User, CreateIssueInput, UpdateIssueInput } from '@/types';
import { mockIssues, mockUsers } from '@/data/mockData';

// Global singleton store for Next.js dev server & worker persistence
const globalForStore = globalThis as unknown as {
  issuesStore?: Issue[];
  usersStore?: User[];
};

if (!globalForStore.issuesStore || globalForStore.issuesStore.length === 0) {
  globalForStore.issuesStore = [...mockIssues];
}
if (!globalForStore.usersStore || globalForStore.usersStore.length === 0) {
  globalForStore.usersStore = [...mockUsers];
}

const issuesStore = globalForStore.issuesStore;
const usersStore = globalForStore.usersStore;

// ─── Issues ──────────────────────────────────────────────────────────────────

export function getAllIssues(): Issue[] {
  return [...issuesStore].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getIssueById(id: string): Issue | undefined {
  return issuesStore.find((i) => i.id === id);
}

export function getIssuesByReporter(reporterId: string): Issue[] {
  const userIssues = issuesStore.filter((i) => i.reporterId === reporterId);
  // If user has created custom issues, return them.
  // If user is a demo/new account with 0 custom issues, include demo issues associated with user-001 or matching reporterName
  if (userIssues.length > 0) {
    return userIssues.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  // Fallback: return mock issues for demo citizen user or user-001
  return issuesStore
    .filter((i) => i.reporterId === 'user-001' || i.reporterId === reporterId)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function createIssue(input: CreateIssueInput): Issue {
  const now = new Date().toISOString();
  const newIssue: Issue = {
    id: `issue-${uuidv4().slice(0, 8)}`,
    ...input,
    status: 'Submitted',
    priority: 'Medium',
    assignedTo: '',
    createdAt: now,
    updatedAt: now,
    resolutionNotes: '',
  };
  issuesStore.unshift(newIssue);
  return newIssue;
}

export function updateIssue(
  id: string,
  input: UpdateIssueInput
): Issue | null {
  const idx = issuesStore.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  issuesStore[idx] = {
    ...issuesStore[idx],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  return issuesStore[idx];
}

// ─── Users ───────────────────────────────────────────────────────────────────

export function getUserByEmail(email: string): User | undefined {
  return usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): User | undefined {
  return usersStore.find((u) => u.id === id);
}

export function createUser(
  name: string,
  email: string,
  password: string
): User {
  const now = new Date().toISOString();
  const newUser: User = {
    id: `user-${uuidv4().slice(0, 8)}`,
    name,
    email,
    password,
    role: 'citizen',
    createdAt: now,
  };
  usersStore.push(newUser);
  return newUser;
}

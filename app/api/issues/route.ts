import { NextRequest, NextResponse } from 'next/server';
import { getAllIssues, getIssuesByReporter, createIssue } from '@/lib/store';
import { Category, Status, Priority } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') as Status | null;
  const category = searchParams.get('category') as Category | null;
  const priority = searchParams.get('priority') as Priority | null;
  const reporterId = searchParams.get('reporterId');
  const search = searchParams.get('search')?.toLowerCase();

  let issues = reporterId ? getIssuesByReporter(reporterId) : getAllIssues();

  if (status) issues = issues.filter((i) => i.status === status);
  if (category) issues = issues.filter((i) => i.category === category);
  if (priority) issues = issues.filter((i) => i.priority === priority);
  if (reporterId) issues = issues.filter((i) => i.reporterId === reporterId);
  if (search) {
    issues = issues.filter(
      (i) =>
        i.title.toLowerCase().includes(search) ||
        i.address.toLowerCase().includes(search) ||
        i.id.toLowerCase().includes(search) ||
        i.description.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({ issues });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, category, description, latitude, longitude, address, imageUrl, reporterId, reporterName } = body;

    if (!title || !category || !description || !reporterId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const issue = createIssue({
      title,
      category,
      description,
      latitude: parseFloat(latitude) || 28.6139,
      longitude: parseFloat(longitude) || 77.209,
      address: address || 'Location not specified',
      imageUrl: imageUrl || '',
      reporterId,
      reporterName,
    });

    return NextResponse.json({ issue }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

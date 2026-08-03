import { NextRequest, NextResponse } from 'next/server';
import { getIssueById, updateIssue, deleteIssue, citizenEditIssue } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const issue = getIssueById(id);
  if (!issue) {
    return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
  }
  return NextResponse.json({ issue });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, priority, assignedTo, resolutionNotes, reporterId, title, category, description, address, imageUrl } = body;

    // Citizen edit path — reporterId present, no admin fields
    if (reporterId) {
      const updated = citizenEditIssue(id, reporterId, { title, category, description, address, imageUrl });
      if (!updated) {
        return NextResponse.json(
          { error: 'Issue not found, not owned by you, or not editable in current status' },
          { status: 403 }
        );
      }
      return NextResponse.json({ issue: updated });
    }

    // Admin edit path
    const updated = updateIssue(id, { status, priority, assignedTo, resolutionNotes });
    if (!updated) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }
    return NextResponse.json({ issue: updated });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const reporterId = searchParams.get('reporterId');

    const issue = getIssueById(id);
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Citizens can only delete their own Submitted/Under_Review issues
    if (reporterId) {
      if (issue.reporterId !== reporterId) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
      const deletable: string[] = ['Submitted', 'Under_Review'];
      if (!deletable.includes(issue.status)) {
        return NextResponse.json(
          { error: 'Cannot delete a report that is already being processed' },
          { status: 400 }
        );
      }
    }

    const ok = deleteIssue(id);
    if (!ok) return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

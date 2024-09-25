import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/options";
import { executeQuery } from '@/lib/db';
import { format } from 'date-fns';

function getHongKongTime() {
  const now = new Date();
  const hongKongTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Hong_Kong"}));
  return hongKongTime;
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.roles || !session.user.roles.includes("QA_Role_docnum_admin")) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const { id, subject } = body;
  const formattedDate = format(getHongKongTime(), 'yyyy-MM-dd HH:mm:ss');

  if (!id || !subject) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  if (subject.trim().length === 0) {
    return NextResponse.json({ message: 'Document title must contain at least one non-space character' }, { status: 400 });
  }

  try {
    await executeQuery(
      'UPDATE documents SET subject = @p1, modifiedAt = @p2 WHERE id = @p3',
      [subject.trim(), formattedDate, id]
    );

    // Fetch the updated document
    const [updatedDocument] = await executeQuery(
      'SELECT * FROM documents WHERE id = @p1',
      [id]
    );

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error updating subject', error);
    return NextResponse.json({ message: 'Error updating subject' }, { status: 500 });
  }
}
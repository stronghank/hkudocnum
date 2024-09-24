import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import { executeQuery } from '../../../lib/db';
import { format } from 'date-fns';

function getHongKongTime() {
  const now = new Date();
  const hongKongTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Hong_Kong"}));
  return hongKongTime;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log("Session in generate-number route:", JSON.stringify(session, null, 2));

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { subject } = body;

  if (!subject) {
    return NextResponse.json({ message: 'Subject is required' }, { status: 400 });
  }

  try {
    const date = getHongKongTime();
    const month = date.getMonth() + 1;
    const year = date.getFullYear().toString().slice(-2);

    const countResult = await executeQuery(
      'SELECT COUNT(*) as count FROM documents WHERE MONTH(createdAt) = @p1 AND YEAR(createdAt) = @p2',
      [month, date.getFullYear()]
    );
    const count = countResult[0].count + 1;

    const documentNumber = `M${count}/${month}${year}`;

    const staffUid = session.user.uid || '';
    const staffName = session.user.name || '';
    const staffEmail = session.user.email || '';
    const formattedDate = format(getHongKongTime(), 'yyyy-MM-dd HH:mm:ss');

    await executeQuery(
      'INSERT INTO documents (staffUid, staffName, staffEmail, subject, documentNumber, createdAt, modifiedAt) VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7)',
      [staffUid, staffName, staffEmail, subject, documentNumber, formattedDate, formattedDate]
    );

    return NextResponse.json({ documentNumber });
  } catch (error) {
    console.error('Error generating document number', error);
    return NextResponse.json({ message: 'Error generating document number' }, { status: 500 });
  }
}
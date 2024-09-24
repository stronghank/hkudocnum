import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import { executeQuery } from '../../../lib/db';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const documentNumber = searchParams.get('documentNumber');
  const subject = searchParams.get('subject');
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');
  const page = parseInt(searchParams.get('page') || '1');
  const itemsPerPage = parseInt(searchParams.get('itemsPerPage') || '10');

  console.log('Received params:', { 
    staffUid: session.user.uid, 
    documentNumber, 
    subject, 
    fromDate, 
    toDate, 
    page, 
    itemsPerPage 
  });

  if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
    return NextResponse.json({ message: 'Invalid date range: "From" date cannot be later than "To" date' }, { status: 400 });
  }

  try {
    let baseQuery = 'SELECT * FROM documents WHERE staffUid = @p1';
    let countQuery = 'SELECT COUNT(*) as totalCount FROM documents WHERE staffUid = @p1';
    const params: any[] = [session.user.uid];
    let paramCounter = 2;

    if (documentNumber) {
      const condition = ` AND documentNumber LIKE @p${paramCounter}`;
      baseQuery += condition;
      countQuery += condition;
      params.push(`%${documentNumber}%`);
      paramCounter++;
    }

    if (subject) {
      const condition = ` AND subject LIKE @p${paramCounter}`;
      baseQuery += condition;
      countQuery += condition;
      params.push(`%${subject}%`);
      paramCounter++;
    }

    if (fromDate) {
      const condition = ` AND CONVERT(date, createdAt) >= CONVERT(date, @p${paramCounter})`;
      baseQuery += condition;
      countQuery += condition;
      params.push(fromDate);
      paramCounter++;
    }

    if (toDate) {
      const condition = ` AND CONVERT(date, createdAt) <= CONVERT(date, @p${paramCounter})`;
      baseQuery += condition;
      countQuery += condition;
      params.push(toDate);
      paramCounter++;
    }

    console.log('Final base query:', baseQuery);
    console.log('Final count query:', countQuery);
    console.log('Query params:', params);

    // Apply pagination to the filtered results
    let query = `WITH filtered_results AS (${baseQuery})
                 SELECT * FROM filtered_results
                 ORDER BY createdAt DESC
                 OFFSET @p${paramCounter} ROWS FETCH NEXT @p${paramCounter + 1} ROWS ONLY`;
    
    params.push((page - 1) * itemsPerPage, itemsPerPage);

    console.log('Final paginated query:', query);
    console.log('Final query params:', params);

    const results = await executeQuery(query, params);
    const countResult = await executeQuery(countQuery, params.slice(0, -2));
    const totalCount = countResult[0].totalCount;

    console.log('Query results:', results.length);
    console.log('Total count:', totalCount);

    return NextResponse.json({
      results,
      totalPages: Math.ceil(totalCount / itemsPerPage),
      currentPage: page
    });
  } catch (error) {
    console.error('Error querying document history', error);
    return NextResponse.json({ message: 'Error querying document history' }, { status: 500 });
  }
}
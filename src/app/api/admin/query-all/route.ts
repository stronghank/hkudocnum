import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/options";
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  console.log("Query-all API called");
  const session = await getServerSession(authOptions);
  console.log("Session:", session);

  if (!session || !session.user || !session.user.roles || !session.user.roles.includes("QA_Role_docnum_admin")) {
    console.log("Unauthorized access attempt");
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const staffUid = searchParams.get('staffUid');
  const staffName = searchParams.get('staffName');
  const staffEmail = searchParams.get('staffEmail');
  const documentNumber = searchParams.get('documentNumber');
  const subject = searchParams.get('subject');
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');
  const page = parseInt(searchParams.get('page') || '1');
  const itemsPerPage = parseInt(searchParams.get('itemsPerPage') || '10');
  const lastModifiedFromDate = searchParams.get('lastModifiedFromDate');
  const lastModifiedToDate = searchParams.get('lastModifiedToDate');

  console.log("Search Params: ", searchParams);

  if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
    return NextResponse.json({ message: 'Invalid date range: "From" date cannot be later than "To" date' }, { status: 400 });
  }

  try {
    let baseQuery = 'SELECT id, staffUid, staffName, staffEmail, subject, documentNumber, createdAt, modifiedAt FROM documents WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as totalCount FROM documents WHERE 1=1';
    const params: any[] = [];
    let paramCounter = 1;

    if (staffUid) {
      const condition = ` AND staffUid LIKE @p${paramCounter}`;
      baseQuery += condition;
      countQuery += condition;
      params.push(`%${staffUid}%`);
      paramCounter++;
    }

    if (staffName) {
      const condition = ` AND staffName LIKE @p${paramCounter}`;
      baseQuery += condition;
      countQuery += condition;
      params.push(`%${staffName}%`);
      paramCounter++;
    }

    if (staffEmail) {
      const condition = ` AND staffEmail LIKE @p${paramCounter}`;
      baseQuery += condition;
      countQuery += condition;
      params.push(`%${staffEmail}%`);
      paramCounter++;
    }

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

    if (lastModifiedFromDate) {
      const condition = ` AND CONVERT(date, modifiedAt) >= CONVERT(date, @p${paramCounter})`;
      baseQuery += condition;
      countQuery += condition;
      params.push(lastModifiedFromDate);
      paramCounter++;
    }

    if (lastModifiedToDate) {
      const condition = ` AND CONVERT(date, modifiedAt) <= CONVERT(date, @p${paramCounter})`;
      baseQuery += condition;
      countQuery += condition;
      params.push(lastModifiedToDate);
      paramCounter++;
    }

    // Apply pagination to the filtered results
    let query = `WITH filtered_results AS (${baseQuery})
                 SELECT * FROM filtered_results
                 ORDER BY CASE WHEN modifiedAt > createdAt THEN modifiedAt ELSE createdAt END DESC
                 OFFSET @p${paramCounter} ROWS FETCH NEXT @p${paramCounter + 1} ROWS ONLY`;
    
    params.push((page - 1) * itemsPerPage, itemsPerPage);

    const results = await executeQuery(query, params);
    const countResult = await executeQuery(countQuery, params.slice(0, -2));
    const totalCount = countResult[0].totalCount;

    console.log("Query executed successfully");
    return NextResponse.json({
      results,
      totalPages: Math.ceil(totalCount / itemsPerPage),
      currentPage: page
    });
  } catch (error) {
    console.error('Error querying documents', error);
    return NextResponse.json({ message: 'Error querying documents' }, { status: 500 });
  }
}
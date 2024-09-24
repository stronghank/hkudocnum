import { NextResponse } from 'next/server';
import { testConnection } from '../../../lib/db';

export async function GET() {
  const isConnected = await testConnection();
  if (isConnected) {
    return NextResponse.json({ message: "Database connection successful" });
  } else {
    return NextResponse.json({ message: "Database connection failed" }, { status: 500 });
  }
}
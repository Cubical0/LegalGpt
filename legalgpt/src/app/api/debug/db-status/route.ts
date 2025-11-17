import { NextResponse } from 'next/server';
import { getDatabase, User } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDatabase();

    const users = await User.findAll();
    
    const collections = await db.listCollections().toArray();

    const stats = await Promise.all(
      collections.map(async (col) => ({
        name: col.name,
        count: await db.collection(col.name).countDocuments(),
      }))
    );

    return NextResponse.json({
      success: true,
      database: process.env.MONGODB_DB_NAME || 'legalgpt',
      collections: stats,
      userCount: users.length,
      users: users.map((u: any) => ({
        id: u._id?.toString(),
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Database error',
      },
      { status: 500 }
    );
  }
}

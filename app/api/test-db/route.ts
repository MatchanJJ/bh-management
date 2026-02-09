import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      userCount,
      users,
      message: "Database connected successfully" 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: error 
    }, { status: 500 });
  }
}

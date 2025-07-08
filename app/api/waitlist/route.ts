import { NextRequest, NextResponse } from "next/server";
import { db, waitlistRegistrations, waitlistSchema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input with Zod schema (email automatically normalized by schema)
    const validatedData = waitlistSchema.parse(body);
    
    // Check if email already exists
    const existingUser = await db
      .select()
      .from(waitlistRegistrations)
      .where(eq(waitlistRegistrations.email, validatedData.email))
      .limit(1);
    
    if (existingUser.length > 0 && existingUser[0]) {
      // Calculate position for existing user
      const allRegistrations = await db
        .select()
        .from(waitlistRegistrations)
        .orderBy(waitlistRegistrations.createdAt);
      
      const existingRegistration = existingUser[0];
      const position = allRegistrations.findIndex(reg => reg.id === existingRegistration.id) + 1;
      
      return NextResponse.json(
        { 
          success: true, 
          message: "You're already on the waitlist!",
          isExisting: true,
          data: {
            id: existingRegistration.id,
            email: existingRegistration.email,
            position: position,
            createdAt: existingRegistration.createdAt
          }
        },
        { status: 200 }
      );
    }
    
    // Insert new waitlist registration
    const result = await db
      .insert(waitlistRegistrations)
      .values({
        fullName: validatedData.fullName,
        email: validatedData.email,
      })
      .returning();
    
    const newRegistration = result[0];
    
    if (!newRegistration) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to create waitlist registration" 
        },
        { status: 500 }
      );
    }
    
    // Calculate position for new registration
    const allRegistrations = await db
      .select()
      .from(waitlistRegistrations)
      .orderBy(waitlistRegistrations.createdAt);
    
    const position = allRegistrations.findIndex(reg => reg.id === newRegistration.id) + 1;
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Successfully joined the waitlist!",
        isExisting: false,
        data: {
          id: newRegistration.id,
          email: newRegistration.email,
          position: position,
          createdAt: newRegistration.createdAt
        }
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Waitlist registration error:", error);
    
    // Handle Zod validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid input data",
          details: JSON.parse(error.message)
        },
        { status: 400 }
      );
    }
    
    // Handle database errors
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Database error occurred" 
        },
        { status: 500 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { 
        success: false, 
        error: "An unexpected error occurred" 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get total count of registrations
    const registrations = await db.select().from(waitlistRegistrations);
    const totalCount = registrations.length;
    
    return NextResponse.json(
      { 
        success: true, 
        data: { 
          totalRegistrations: totalCount 
        } 
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Get waitlist count error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch waitlist count" 
      },
      { status: 500 }
    );
  }
} 
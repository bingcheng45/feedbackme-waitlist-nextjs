import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, projectSchema } from "@/lib/db/schema";
import { z } from "zod";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate the request body
    const validatedData = projectSchema.parse(body);
    
    // Generate a unique API key
    const apiKey = `fbme_${nanoid(32)}`;
    
    // Create the project
    const [newProject] = await db
      .insert(projects)
      .values({
        name: validatedData.name,
        description: validatedData.description || null,
        domain: validatedData.domain,
        apiKey,
        userId: session.user.id,
      })
      .returning();

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's projects
    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, session.user.id))
      .orderBy(projects.createdAt);

    return NextResponse.json(userProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 
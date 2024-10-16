import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Project from "../../../../models/Project";
export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();

  try {
    // Fetch all projects from the database
    const projects = await Project.find();

    // Return projects data
    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

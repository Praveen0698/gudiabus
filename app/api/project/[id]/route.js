import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Project from "../../../../models/Project";
export const dynamic = "force-dynamic";

// Handler to get firm by ID
export async function GET(req, { params }) {
  await connectDB();

  const { id } = params;
  try {
    // Fetch project by ID
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    // Return project data
    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import connectDB from "../../../../../utils/db";
import Project from "../../../../../models/Project";
export const dynamic = "force-dynamic";

// Handler to get Project by employeeId
export async function GET(req, { params }) {
  await connectDB();
  const { id } = params;
  try {
    const projects = await Project.find({ employeeId: id });

    if (!projects || projects.length === 0) {
      return NextResponse.json(
        { message: "No Projects found for this employee" }
        // { status: 404 }
      );
    }

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

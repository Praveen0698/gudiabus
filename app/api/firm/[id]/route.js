import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Firm from "../../../../models/Firm";
export const dynamic = "force-dynamic";

// Handler to get firm by ID
export async function GET(req, { params }) {
  await connectDB();

  const { id } = params;

  try {
    // Fetch firm by ID
    const firm = await Firm.findById(id);

    if (!firm) {
      return NextResponse.json({ message: "Firm not found" }, { status: 404 });
    }

    // Return firm data
    return NextResponse.json(firm, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

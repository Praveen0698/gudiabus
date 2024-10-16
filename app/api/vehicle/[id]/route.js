import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Vehicle from "../../../../models/Vehicle";
export const dynamic = "force-dynamic";

// Handler to get firm by ID
export async function GET(req, { params }) {
  await connectDB();

  const { id } = params;
  try {
    // Fetch Vehicle by ID
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return NextResponse.json(
        { message: "Vehicle not found" },
        { status: 404 }
      );
    }

    // Return Vehicle data
    return NextResponse.json(vehicle, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

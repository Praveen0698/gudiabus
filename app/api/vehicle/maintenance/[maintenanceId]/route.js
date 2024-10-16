import { NextResponse } from "next/server";
import connectDB from "../../../../../utils/db";
import Maintenance from "../../../../../models/Maintenance";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  await connectDB();
  const { maintenanceId } = params; // Retrieve the maintenance ID from the URL params
  try {
    // Fetch the maintenance document based on its unique ID
    const maintenance = await Maintenance.findById(maintenanceId);

    if (!maintenance) {
      return NextResponse.json(
        { message: "maintenance not found with the provided ID" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "maintenance found", data: maintenance },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}

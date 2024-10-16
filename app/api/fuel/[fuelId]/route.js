import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Fuel from "../../../../models/Fuel";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  await connectDB();
  const { fuelId } = params; // Retrieve the Fuel ID from the URL params
  try {
    // Fetch the Fuel document based on its unique ID
    const fuel = await Fuel.findById(fuelId);
    if (!fuel) {
      return NextResponse.json(
        { message: "Fuel not found with the provided ID" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Fuel found", data: fuel },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Shift from "../../../../models/Shift";
import { ObjectId } from "mongodb"; // Ensure you import ObjectId to work with MongoDB ids

export const dynamic = "force-dynamic";

export async function PUT(req) {
  await connectDB(); // Connect to the database

  const shiftData = await req.json(); // Extract data from the request
  const { id, formData } = shiftData; // Extract the id and the updated formData

  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    // Find the shift by ID and update it with formData
    const updatedShift = await Shift.findByIdAndUpdate(
      id, // The ID to find the document by
      { $set: formData }, // Update the document with new formData
      { new: true } // Return the updated document
    );

    if (!updatedShift) {
      return NextResponse.json({ message: "Shift not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Shift updated successfully", updatedShift },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}

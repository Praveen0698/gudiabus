import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Fuel from "../../../../models/Fuel";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Configure S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const dynamic = "force-dynamic";

// Helper function to delete a file from S3
const deleteS3Object = async (fileUrl) => {
  if (!fileUrl) return; // Skip if no file URL is provided
  const fileKey = fileUrl.replace(/^https:\/\/[^/]+\/(.+)/, "$1"); // Extract S3 key from URL

  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
    });
    await s3.send(command);
    console.log(`Deleted file from S3: ${fileKey}`);
  } catch (error) {
    console.error(`Error deleting file ${fileKey} from S3:`, error);
    throw new Error("Failed to delete file from S3");
  }
};

export async function DELETE(req) {
  await connectDB();
  const { id } = await req.json();

  try {
    // Find the fuel record to check if it exists and retrieve associated file URLs
    const fuelRecord = await Fuel.findById(id);

    if (!fuelRecord) {
      return NextResponse.json({ message: "Fuel not found" }, { status: 404 });
    }

    // Delete associated files from S3, if any
    if (fuelRecord.receiptFile) {
      await deleteS3Object(fuelRecord.receiptFile);
    }

    // Delete the fuel record from the database
    await Fuel.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Fuel deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting fuel:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

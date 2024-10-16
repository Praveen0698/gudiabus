import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Vehicle from "../../../../models/Vehicle";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// AWS Configuration
const {
  AWS_REGION,
  AWS_S3_BUCKET_NAME,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
} = process.env;

if (
  !AWS_REGION ||
  !AWS_S3_BUCKET_NAME ||
  !AWS_ACCESS_KEY_ID ||
  !AWS_SECRET_ACCESS_KEY
) {
  throw new Error("Missing AWS configuration in environment variables.");
}

// Initialize S3 Client
const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// Helper function to delete a file from S3
const deleteS3Object = async (fileKey) => {
  if (!fileKey) return; // If no key, skip deletion

  const command = new DeleteObjectCommand({
    Bucket: AWS_S3_BUCKET_NAME,
    Key: fileKey, // e.g., "rc/169768542.png"
  });

  try {
    await s3.send(command);
    console.log(`Deleted file from S3: ${fileKey}`);
  } catch (error) {
    console.error(`Failed to delete ${fileKey} from S3:`, error);
    throw new Error(`Failed to delete ${fileKey} from S3.`);
  }
};

// Helper function to extract S3 key from the file URL
const getFileKey = (fileUrl) => {
  if (!fileUrl) return null;
  const regex = new RegExp(
    `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/(.+)`
  );
  const match = fileUrl.match(regex);
  return match ? match[1] : null; // Extract the S3 key from the URL
};

export const dynamic = "force-dynamic";

export async function DELETE(req) {
  await connectDB();
  const { id } = await req.json();

  try {
    const deletedVehicle = await Vehicle.findByIdAndDelete(id);

    if (!deletedVehicle) {
      return NextResponse.json(
        { message: "Vehicle not found" },
        { status: 404 }
      );
    }

    // Extract file URLs from the deleted vehicle document
    const {
      rcFile,
      insuranceFile,
      fitnessFile,
      pollutionFile,
      roadTaxFile,
      vehiclePassFile,
      otherFile,
    } = deletedVehicle;

    // Extract S3 keys from URLs and delete the files
    const fileKeys = [
      getFileKey(rcFile),
      getFileKey(insuranceFile),
      getFileKey(fitnessFile),
      getFileKey(pollutionFile),
      getFileKey(roadTaxFile),
      getFileKey(vehiclePassFile),
      getFileKey(otherFile),
    ];

    // Delete all files asynchronously
    await Promise.all(fileKeys.map((key) => key && deleteS3Object(key)));

    return NextResponse.json(
      { message: "Vehicle and related files deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error occurred during vehicle deletion:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

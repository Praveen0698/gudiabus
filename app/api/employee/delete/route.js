import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Employee from "../../../../models/Employee";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Ensure critical environment variables are present
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
  throw new Error("AWS configuration is missing in environment variables.");
}

// Initialize the S3 client
const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// Function to delete an S3 object
async function deleteS3Object(fileKey) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: fileKey,
    });
    await s3.send(command);
    console.log(`File ${fileKey} deleted from S3.`);
  } catch (error) {
    console.error(`Error deleting ${fileKey} from S3:`, error);
    throw new Error(`Failed to delete ${fileKey} from S3.`);
  }
}

// Helper function to extract the S3 key from the full file path
const getFileKey = (filePath) => {
  if (!filePath) return null;
  try {
    const url = new URL(filePath); // Safer way to handle URLs
    return url.pathname.substring(1); // Remove the leading '/'
  } catch (error) {
    console.error("Invalid file path:", filePath, error);
    return null;
  }
};

export const dynamic = "force-dynamic";

export async function DELETE(req) {
  await connectDB();

  try {
    const { id } = await req.json();

    // Attempt to delete the employee record
    const deletedEmployee = await Employee.findByIdAndDelete(id);

    if (!deletedEmployee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    const { aadharFile, dlFile } = deletedEmployee;

    // Extract S3 keys from the employee's files
    const aadharKey = getFileKey(aadharFile);
    const dlKey = getFileKey(dlFile);

    // Delete both files from S3 if they exist
    if (aadharKey) await deleteS3Object(aadharKey);
    if (dlKey) await deleteS3Object(dlKey);

    return NextResponse.json(
      { message: "Employee and related files deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

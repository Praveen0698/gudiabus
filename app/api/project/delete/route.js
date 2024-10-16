import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Project from "../../../../models/Project";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Ensure AWS environment variables are loaded
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

// Helper function to extract the S3 key from a file URL
const getFileKey = (filePath) => {
  if (!filePath) return null;
  try {
    const url = new URL(filePath); // Safe way to handle URLs
    return url.pathname.substring(1); // Remove leading '/'
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

    // Attempt to delete the project record
    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    // Extract S3 file paths from the project (if any)
    const { projectFile, additionalFile } = deletedProject;

    // Extract S3 keys from file URLs
    const projectKey = getFileKey(projectFile);
    const additionalKey = getFileKey(additionalFile);

    // Delete associated files from S3, if they exist
    if (projectKey) await deleteS3Object(projectKey);
    if (additionalKey) await deleteS3Object(additionalKey);

    return NextResponse.json(
      { message: "Project and associated files deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

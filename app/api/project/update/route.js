import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Project from "../../../../models/Project";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid"; // For generating unique filenames

// Configure S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const dynamic = "force-dynamic";

// Helper function to delete an old file from S3
const deleteS3Object = async (fileUrl) => {
  if (!fileUrl) return; // Skip if no file URL is provided
  const fileKey = fileUrl.replace(/^https:\/\/[^/]+\/(.+)/, "$1"); // Extract S3 key from URL

  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
    });
    await s3.send(command);
    console.log(`Deleted old file from S3: ${fileKey}`);
  } catch (error) {
    console.error(`Error deleting file ${fileKey}:`, error);
  }
};

// Helper function to upload a new file to S3
const uploadToS3 = async (base64String, folder) => {
  const base64Pattern = /^data:(.*?);base64,/;
  const matches = base64String.match(base64Pattern);
  const mimeType = matches ? matches[1] : "";
  const fileExtension = mimeType.split("/")[1] || "png";
  const buffer = Buffer.from(base64String.replace(base64Pattern, ""), "base64");

  const filename = `${uuidv4()}.${fileExtension}`;
  const key = `${folder}/${filename}`;

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });

    await s3.send(command);
    console.log(`Uploaded new file to S3: ${key}`);
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("Failed to upload file to S3");
  }
};

// PUT handler to update a project
export async function PUT(req) {
  await connectDB();

  const projectData = await req.json();
  const {
    _id,
    projectName,
    poNumber,
    poFile,
    fleetSize,
    firmName,
    vehicle,
    source,
    destination,
    supervisor,
  } = projectData;

  try {
    // Fetch the existing project to check for existing files
    const existingProject = await Project.findById(_id);
    if (!existingProject) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    // Handle PO file: delete old one if exists, upload a new one if provided
    let poFileUrl = existingProject.poFile;
    if (poFile) {
      if (poFileUrl) {
        await deleteS3Object(poFileUrl); // Delete the old PO file from S3
      }
      poFileUrl = await uploadToS3(poFile, "poFiles"); // Upload new PO file
    }

    // Prepare update data
    const updateData = {
      projectName,
      poNumber,
      fleetSize,
      firmName,
      vehicle,
      source,
      destination,
      supervisor,
      poFile: poFileUrl, // Include the updated or existing PO file URL
    };

    // Update the project in the database
    const updatedProject = await Project.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProject) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Project updated successfully", project: updatedProject },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

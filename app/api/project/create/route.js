import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Project from "../../../../models/Project";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid"; // For generating unique filenames

// Configure the S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const dynamic = "force-dynamic";

export async function POST(req) {
  await connectDB();

  const projectData = await req.json();
  const {
    projectName,
    poNumber,
    poFile,
    fleetSize,
    firmName,
    vehicle,
    source,
    destination,
    supervisor,
    employeeId,
  } = projectData;

  try {
    // Check if the project already exists
    const existingProject = await Project.findOne({ projectName });
    if (existingProject) {
      return NextResponse.json(
        { message: "Project already exists" },
        { status: 400 }
      );
    }

    // Upload PO file to S3 if provided
    let poFileUrl = null;
    if (poFile) {
      poFileUrl = await uploadToS3(poFile, "poFiles");
    }

    // Create a new project
    const newProject = new Project({
      projectName,
      poNumber,
      poFile: poFileUrl,
      fleetSize,
      firmName,
      vehicle,
      source,
      destination,
      supervisor,
      employeeId,
    });

    await newProject.save();
    return NextResponse.json(
      { message: "Project created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}

// Helper function to upload Base64 file to S3
async function uploadToS3(base64String, folder) {
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
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("Failed to upload file to S3");
  }
}

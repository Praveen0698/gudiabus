// import { NextResponse } from "next/server";
// import connectDB from "../../../../../utils/db";
// import Maintenance from "../../../../../models/Maintenance";
// import { ObjectId } from "mongodb"; // Ensure you import ObjectId to work with MongoDB ids

// export const dynamic = "force-dynamic";

// export async function PUT(req) {
//   await connectDB(); // Connect to the database

//   const maintenanceData = await req.json(); // Extract data from the request
//   const { id, formData } = maintenanceData; // Extract the id and the updated formData
//   if (!id || !ObjectId.isValid(id)) {
//     return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
//   }

//   try {
//     // Find the Maintenance by ID and update it with formData
//     const updatedMaintenance = await Maintenance.findByIdAndUpdate(
//       id, // The ID to find the document by
//       { $set: formData }, // Update the document with new formData
//       { new: true } // Return the updated document
//     );

//     if (!updatedMaintenance) {
//       return NextResponse.json(
//         { message: "Maintenance not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       { message: "Maintenance updated successfully", updatedMaintenance },
//       { status: 200 }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       { message: "Server error", error },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import connectDB from "../../../../../utils/db";
import Maintenance from "../../../../../models/Maintenance";
import { ObjectId } from "mongodb"; // For working with MongoDB ids
import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3"; // Import necessary S3 commands

// Configure the S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const dynamic = "force-dynamic";

export async function PUT(req) {
  await connectDB(); // Connect to the database

  const maintenanceData = await req.json(); // Extract data from the request
  const { id, formData } = maintenanceData; // Extract the id and the updated formData
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    // Find the Maintenance by ID to retrieve existing record
    const existingMaintenance = await Maintenance.findById(id);

    if (!existingMaintenance) {
      return NextResponse.json(
        { message: "Maintenance not found" },
        { status: 404 }
      );
    }

    // Function to delete files from S3
    const deleteFileFromS3 = async (filePath) => {
      const key = filePath.split("/uploads/")[1]; // Extract the key from the file path
      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
      });

      try {
        await s3.send(command);
      } catch (error) {
        console.error("Error deleting file from S3:", error);
        throw new Error("Failed to delete file from S3");
      }
    };

    // Delete old files from S3 if they exist in the existing record
    const filesToDelete = [
      existingMaintenance.items.map((item) => item.tyreRotationFile),
      existingMaintenance.items.map((item) => item.odometerFile),
      existingMaintenance.items.map((item) => item.maintenanceFile),
      existingMaintenance.items.map((item) => item.washingFile),
    ]
      .flat()
      .filter((file) => file); // Flatten the array and remove nulls

    await Promise.all(filesToDelete.map(deleteFileFromS3)); // Delete all files in parallel

    // Function to upload base64 files to S3
    const uploadToS3 = async (base64String, folder) => {
      const base64Pattern = /^data:(.*?);base64,/;
      const matches = base64String.match(base64Pattern);
      const mimeType = matches ? matches[1] : "";
      const fileExtension = mimeType.includes("pdf")
        ? "pdf"
        : mimeType.split("/")[1] || "png";

      const buffer = Buffer.from(
        base64String.replace(base64Pattern, ""),
        "base64"
      );
      const filename = `${Date.now()}.${fileExtension}`;
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
    };

    // Process and upload new files if they exist in formData
    const processedItems = await Promise.all(
      formData.items.map(async (item) => ({
        ...item,
        tyreRotationFile: item.tyreRotationFile
          ? await uploadToS3(item.tyreRotationFile, "tyreRotation")
          : item.tyreRotationFile, // Keep existing file if not replaced
        odometerFile: item.odometerFile
          ? await uploadToS3(item.odometerFile, "odometer")
          : item.odometerFile, // Keep existing file if not replaced
        maintenanceFile: item.maintenanceFile
          ? await uploadToS3(item.maintenanceFile, "maintenance")
          : item.maintenanceFile, // Keep existing file if not replaced
        washingFile: item.washingFile
          ? await uploadToS3(item.washingFile, "washing")
          : item.washingFile, // Keep existing file if not replaced
      }))
    );

    // Update the Maintenance record with the new formData and processed items
    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      id,
      { $set: { ...formData, items: processedItems } },
      { new: true }
    );

    return NextResponse.json(
      { message: "Maintenance updated successfully", updatedMaintenance },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating maintenance:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

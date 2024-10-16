// import { NextResponse } from "next/server";
// import connectDB from "../../../../utils/db";
// import Fuel from "../../../../models/Fuel";
// import { ObjectId } from "mongodb"; // Ensure you import ObjectId to work with MongoDB ids

// export const dynamic = "force-dynamic";

// export async function PUT(req) {
//   await connectDB(); // Connect to the database

//   const fuelData = await req.json(); // Extract data from the request
//   const { id, formData } = fuelData; // Extract the id and the updated formData

//   if (!id || !ObjectId.isValid(id)) {
//     return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
//   }

//   try {
//     // Find the Fuel by ID and update it with formData
//     const updatedFuel = await Fuel.findByIdAndUpdate(
//       id, // The ID to find the document by
//       { $set: formData }, // Update the document with new formData
//       { new: true } // Return the updated document
//     );

//     if (!updatedFuel) {
//       return NextResponse.json({ message: "Fuel not found" }, { status: 404 });
//     }

//     return NextResponse.json(
//       { message: "Fuel updated successfully", updatedFuel },
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
import connectDB from "../../../../utils/db";
import Fuel from "../../../../models/Fuel";
import { ObjectId } from "mongodb"; // For working with MongoDB IDs
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3"; // Import DeleteObjectCommand

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
  await connectDB();

  const fuelData = await req.json();
  const { id, formData } = fuelData;

  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    // Function to upload base64 files to S3
    const uploadToS3 = async (base64String, folder) => {
      const base64Pattern = /^data:(.*?);base64,/;
      const matches = base64String.match(base64Pattern);
      const mimeType = matches ? matches[1] : "";
      const fileExtension = mimeType.split("/")[1] || "png";
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

    // Function to delete a file from S3
    const deleteFromS3 = async (fileUrl) => {
      const urlParts = fileUrl.split("/");
      const fileName = urlParts[urlParts.length - 1]; // Extract filename
      const folder = urlParts[urlParts.length - 2]; // Extract folder
      const key = `${folder}/${fileName}`;

      try {
        const command = new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key,
        });
        await s3.send(command);
        console.log(`Deleted ${fileUrl} from S3`);
      } catch (error) {
        console.error("S3 delete error:", error);
      }
    };

    // Fetch the existing fuel record to check for previous file URLs
    const existingFuel = await Fuel.findById(id);
    if (!existingFuel) {
      return NextResponse.json({ message: "Fuel not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData = { ...formData };

    // Check and upload files if they exist in formData
    if (updateData.items) {
      updateData.items = await Promise.all(
        updateData.items.map(async (item) => {
          const updatedItem = {
            ...item,
            odometerFile: item.odometerFile
              ? await uploadToS3(item.odometerFile, "odometerFiles")
              : existingFuel.items?.find((i) => i.id === item.id)?.odometerFile, // Retain existing file if not replaced
            amountFile: item.amountFile
              ? await uploadToS3(item.amountFile, "amountFiles")
              : existingFuel.items?.find((i) => i.id === item.id)?.amountFile, // Retain existing file if not replaced
          };

          // Delete previous files from S3 if they're being replaced
          if (
            item.odometerFile &&
            existingFuel.items?.find((i) => i.id === item.id)?.odometerFile
          ) {
            await deleteFromS3(
              existingFuel.items.find((i) => i.id === item.id).odometerFile
            );
          }
          if (
            item.amountFile &&
            existingFuel.items?.find((i) => i.id === item.id)?.amountFile
          ) {
            await deleteFromS3(
              existingFuel.items.find((i) => i.id === item.id).amountFile
            );
          }

          return updatedItem;
        })
      );
    }

    // Update the fuel record in the database
    const updatedFuel = await Fuel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedFuel) {
      return NextResponse.json({ message: "Fuel not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Fuel updated successfully", updatedFuel },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

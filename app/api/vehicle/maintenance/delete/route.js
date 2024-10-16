// import { NextResponse } from "next/server";
// import connectDB from "../../../../../utils/db";
// import Maintenance from "../../../../../models/Maintenance";
// export const dynamic = "force-dynamic";

// export async function DELETE(req) {
//   await connectDB();
//   const { id } = await req.json();

//   try {
//     const deletedMaintenance = await Maintenance.findByIdAndDelete(id);

//     if (!deletedMaintenance) {
//       return NextResponse.json(
//         { message: "Maintenance not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       { message: "Maintenance deleted successfully" },
//       { status: 200 }
//     );
//   } catch (error) {
//     return NextResponse.json({ message: "Server error" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import connectDB from "../../../../../utils/db";
import Maintenance from "../../../../../models/Maintenance";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"; // Import the necessary S3 commands

// Configure the S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const dynamic = "force-dynamic";

export async function DELETE(req) {
  await connectDB();
  const { id } = await req.json();

  try {
    // Find the maintenance record to delete
    const maintenanceRecord = await Maintenance.findById(id);

    if (!maintenanceRecord) {
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

    // Delete associated files from S3
    const filesToDelete = [
      maintenanceRecord.items.map((item) => item.tyreRotationFile),
      maintenanceRecord.items.map((item) => item.odometerFile),
      maintenanceRecord.items.map((item) => item.maintenanceFile),
      maintenanceRecord.items.map((item) => item.washingFile),
    ]
      .flat()
      .filter((file) => file); // Flatten the array and remove nulls

    await Promise.all(filesToDelete.map(deleteFileFromS3)); // Delete all files in parallel

    // Delete the maintenance record from the database
    await Maintenance.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Maintenance deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error occurred while deleting maintenance:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/constants";
import { SessionAccountService } from "@/lib/services/core/base-account";
import { DocumentStorageAdminService } from "@/lib/services/storage/document-storage.service";
import { Permission, Role } from "node-appwrite";

export const runtime = "nodejs";
// ✅ Increase body size limit for file uploads (default is 4MB)
export const maxDuration = 60; // 60 seconds max for file upload

export async function POST(request: NextRequest) {
  try {
    console.log("📥 Upload request received");

    // ✅ Authenticate user
    const cookieStore = await cookies();
    const session = cookieStore.get(AUTH_COOKIE);

    if (!session) {
      console.log("❌ No session cookie");
      return NextResponse.json(
        { success: false, error: "You must be signed in to upload files" },
        { status: 401 }
      );
    }

    const sessionAccountService = new SessionAccountService();
    const user = await sessionAccountService.get();

    if (!user) {
      console.log("❌ Invalid session");
      return NextResponse.json(
        { success: false, error: "Invalid session" },
        { status: 401 }
      );
    }

    console.log("✅ User authenticated:", user.$id);

    // ✅ Parse FormData
    console.log("📦 Parsing FormData...");
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const companyId = formData.get("companyId") as string | null;

    console.log("📁 File:", file?.name, "Size:", file?.size, "Type:", file?.type);
    console.log("🏢 CompanyId:", companyId);

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "Company ID is required" },
        { status: 400 }
      );
    }

    // ✅ Validate PDF file type
    const allowedTypes = [
      "application/pdf",
      "application/x-pdf",
      "application/acrobat",
      "applications/vnd.pdf",
      "text/pdf",
      "text/x-pdf",
    ];

    const isPdf =
      allowedTypes.includes(file.type) ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type. Only PDF files are allowed. (Received: ${file.type})`,
        },
        { status: 400 }
      );
    }

    // ✅ Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // ✅ Set up permissions
    const permissions: string[] = [
      Permission.read(Role.team(companyId)),
      Permission.update(Role.team(companyId, "owner")),
      Permission.delete(Role.team(companyId, "owner")),
    ];

    // ✅ Upload to Appwrite Storage
    console.log("☁️ Uploading to Appwrite Storage...");
    const documentStorage = new DocumentStorageAdminService();
    const uploadedFile = await documentStorage.uploadFile({
      file,
      permissions,
    });

    console.log("✅ Upload successful:", uploadedFile.$id);

    return NextResponse.json({
      success: true,
      fileId: uploadedFile.$id,
      fileName: uploadedFile.name,
      fileSize: uploadedFile.sizeOriginal,
      mimeType: uploadedFile.mimeType,
    });
  } catch (error) {
    console.error("❌ Upload document API error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to upload document",
      },
      { status: 500 }
    );
  }
}

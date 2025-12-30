import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/constants";
import { SessionAccountService } from "@/lib/services/core/base-account";
import { DocumentStorageAdminService } from "@/lib/services/storage/document-storage.service";
import { Permission, Role } from "node-appwrite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 seconds max for file upload

// ✅ Use native Request instead of NextRequest to avoid body parsing issues
export async function POST(request: Request) {
  try {
    // ✅ Authenticate user
    const cookieStore = await cookies();
    const session = cookieStore.get(AUTH_COOKIE);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to upload files" },
        { status: 401 }
      );
    }

    const sessionAccountService = new SessionAccountService();
    const user = await sessionAccountService.get();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid session" },
        { status: 401 }
      );
    }

    // ✅ Parse FormData with error handling for Next.js 16 Turbopack issue
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (formDataError) {
      console.error("❌ FormData parsing error:", formDataError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse upload data. Please try again."
        },
        { status: 400 }
      );
    }

    const files = formData.getAll("files") as File[];
    const companyId = formData.get("companyId") as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files provided" },
        { status: 400 }
      );
    }

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "Company ID is required" },
        { status: 400 }
      );
    }

    // ✅ Validate all files
    const allowedTypes = [
      "application/pdf",
      "application/x-pdf",
      "application/acrobat",
      "applications/vnd.pdf",
      "text/pdf",
      "text/x-pdf",
    ];
    const maxSize = 10 * 1024 * 1024;

    for (const file of files) {
      const isPdf =
        allowedTypes.includes(file.type) ||
        file.name.toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid file type for ${file.name}. Only PDF files are allowed.`,
          },
          { status: 400 }
        );
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          {
            success: false,
            error: `File too large: ${file.name}. Max size is 10MB.`,
          },
          { status: 400 }
        );
      }
    }

    // ✅ Set up permissions
    const permissions: string[] = [
      Permission.read(Role.team(companyId)),
      Permission.update(Role.team(companyId, "owner")),
      Permission.delete(Role.team(companyId, "owner")),
    ];

    // ✅ Upload all files to Appwrite Storage
    const documentStorage = new DocumentStorageAdminService();
    const uploadedFiles = await documentStorage.uploadMultipleFiles(
      files,
      permissions
    );

    return NextResponse.json({
      success: true,
      files: uploadedFiles.map((file) => ({
        fileId: file.$id,
        fileName: file.name,
        fileSize: file.sizeOriginal,
        mimeType: file.mimeType,
      })),
    });
  } catch (error) {
    console.error("Upload multiple documents API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload documents",
      },
      { status: 500 }
    );
  }
}

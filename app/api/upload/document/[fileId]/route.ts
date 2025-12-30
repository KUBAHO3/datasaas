import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/constants";
import { SessionAccountService } from "@/lib/services/core/base-account";
import { DocumentStorageAdminService } from "@/lib/services/storage/document-storage.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    // ✅ Authenticate user
    const cookieStore = await cookies();
    const session = cookieStore.get(AUTH_COOKIE);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "You must be signed in" },
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

    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: "File ID is required" },
        { status: 400 }
      );
    }

    // ✅ Fetch file metadata from Appwrite Storage
    const documentStorage = new DocumentStorageAdminService();
    const file = await documentStorage.getFile(fileId);

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      file: {
        fileId: file.$id,
        fileName: file.name,
        fileSize: file.sizeOriginal,
        mimeType: file.mimeType,
      },
    });
  } catch (error) {
    console.error("Get file metadata API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch file metadata",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    // ✅ Authenticate user
    const cookieStore = await cookies();
    const session = cookieStore.get(AUTH_COOKIE);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to delete files" },
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

    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: "File ID is required" },
        { status: 400 }
      );
    }

    // ✅ Delete file from Appwrite Storage
    const documentStorage = new DocumentStorageAdminService();
    await documentStorage.deleteFile(fileId);

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete file API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete file",
      },
      { status: 500 }
    );
  }
}

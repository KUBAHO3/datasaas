import { DOCUMENTS_BUCKET_ID } from "@/lib/env-config";
import "server-only";
import {
  AdminStorageService,
  BaseStorageService,
} from "../core/base-storage.service";

export class DocumentStorageService extends BaseStorageService {
  constructor() {
    super(DOCUMENTS_BUCKET_ID);
  }
}

export class DocumentStorageAdminService extends AdminStorageService {
  constructor() {
    super(DOCUMENTS_BUCKET_ID);
  }
}

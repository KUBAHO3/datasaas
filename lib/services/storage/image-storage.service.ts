import "server-only";

import { IMAGES_BUCKET_ID } from "@/lib/env-config";
import {
  AdminStorageService,
  BaseStorageService,
} from "../core/base-storage.service";

export class ImageStorageService extends BaseStorageService {
  constructor() {
    super(IMAGES_BUCKET_ID);
  }
}

export class ImageStorageAdminService extends AdminStorageService {
  constructor() {
    super(IMAGES_BUCKET_ID);
  }
}

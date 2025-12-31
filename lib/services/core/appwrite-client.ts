/**
 * Client-side Appwrite SDK Configuration
 *
 * This file provides Appwrite Web SDK instances for client components.
 * Never use this in server components - use appwrite.ts instead.
 */

import { Client, Account, Databases, Storage, Teams } from "appwrite";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "@/lib/env-config";

// Create and configure the Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

// Export SDK instances for client-side use
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const teams = new Teams(client);

// Export the client instance if needed for advanced use cases
export { client };

"use server";

import { createSafeActionClient } from "next-safe-action";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/constants";
import { signInFormSchema } from "@/lib/schemas/user-schema";

const action = createSafeActionClient({
  handleServerError: (error) => {
    return error.message;
  },
});
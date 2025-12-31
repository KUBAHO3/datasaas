"use server";

import { UserDataAdminModel } from '@/lib/services/models/users.model';
import { UserData } from '@/lib/types/user-types';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';

/**
 * Cached function to fetch user profile data
 * Uses React cache for request deduplication and Next.js unstable_cache for persistence
 */
export const getUserProfile = cache(async (userId: string): Promise<UserData | null> => {
  return unstable_cache(
    async () => {
      try {
        const userDataModel = new UserDataAdminModel();
        const userData = await userDataModel.findByUserId(userId);
        return userData;
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Return null instead of throwing to allow graceful degradation
        return null;
      }
    },
    [`user-profile-${userId}`],
    {
      revalidate: 60, // Cache for 60 seconds
      tags: [`user-profile-${userId}`],
    }
  )();
});

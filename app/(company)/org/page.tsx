import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/access-control/permissions";

export default async function OrgRedirectPage() {
    const userContext = await requireAuth();

    if (userContext.isSuperAdmin && !userContext.companyId) {
        redirect("/admin");
    }

    if (userContext.companyId) {
        redirect(`/org/${userContext.companyId}`);
    }

    redirect("/onboarding");
}

export const dynamic = "force-dynamic";
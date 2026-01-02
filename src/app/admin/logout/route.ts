import { redirect } from "next/navigation";
import { logoutAdmin } from "@/app/actions/admin-actions";

export async function POST() {
    await logoutAdmin();
    redirect("/admin/login");
}

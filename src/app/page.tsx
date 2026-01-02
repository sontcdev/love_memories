import { redirect } from "next/navigation";

export default function Home() {
  // Redirect root to admin login
  redirect("/admin/login");
}

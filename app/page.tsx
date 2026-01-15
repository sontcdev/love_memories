import { redirect } from "next/navigation";

export default function Home() {
    // Redirect to a demo username or admin page
    redirect("/admin");
}

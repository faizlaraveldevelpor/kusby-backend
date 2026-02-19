import { redirect } from "next/navigation";

export default function Home() {
  // Redirect root path directly to admin dashboard
  redirect("/admin");
}

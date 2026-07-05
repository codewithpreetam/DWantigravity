import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return redirect("/auth/signin");
  }

  // Redirect based on user role
  if (user.role === "ADMIN") {
    return redirect("/dashboard/admin");
  } else if (user.role === "EMPLOYER") {
    return redirect("/dashboard/employer");
  } else {
    return redirect("/dashboard/candidate");
  }
}

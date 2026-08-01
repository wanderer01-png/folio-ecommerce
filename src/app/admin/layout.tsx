import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The proxy (src/proxy.ts) already blocks /admin/* for non-admins.
  // This check is defense-in-depth — never rely on a single enforcement layer.
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex max-w-6xl">
      <AdminSidebar />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}

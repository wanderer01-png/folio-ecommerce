import Link from "next/link";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/books", label: "Books" },
  { href: "/admin/orders", label: "Orders" },
];

export function AdminSidebar() {
  return (
    <nav className="flex w-48 shrink-0 flex-col gap-1 border-r p-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="hover:bg-accent rounded-md px-3 py-2 text-sm"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

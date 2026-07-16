import Link from "next/link";

const quickLinks = ["Browse courses", "Categories", "Instructors", "Pricing"];
const resources = ["Help center", "Terms of service", "Privacy policy", "Contact"];

export function FooterSection() {
  return (
    <footer className="border-t py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="text-lg font-semibold tracking-tight">Relay</span>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs leading-relaxed">
              A modern knowledge platform for creators and learners.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick links</p>
            <ul className="space-y-2">
              {quickLinks.map((l) => (
                <li key={l}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Resources</p>
            <ul className="space-y-2">
              {resources.map((l) => (
                <li key={l}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Social</p>
            <ul className="space-y-2">
              {["Twitter", "GitHub", "LinkedIn", "YouTube"].map((s) => (
                <li key={s}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-6 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Relay. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

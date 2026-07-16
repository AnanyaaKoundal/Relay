import { RelayPattern } from "@/components/relay-pattern";
import { CoursePreviewCard } from "@/components/course-preview-card";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full">
      {/* Left — Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative bg-muted/30 overflow-hidden p-12">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <RelayPattern className="size-[500px] text-emerald-600" />
        </div>

        <div className="relative flex flex-col items-center gap-10">
          <CoursePreviewCard />

          <div className="text-center max-w-xs">
            <p className="text-base font-semibold text-foreground">
              Where knowledge moves forward.
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Relay connects creators and learners in a structured, distraction-free environment built for depth.
            </p>
          </div>
        </div>

        {/* trust footer */}
        <div className="absolute bottom-10 flex items-center gap-6 text-[10px] text-muted-foreground/60">
          <span className="flex items-center gap-1.5">
            <span className="size-1 rounded-full bg-emerald-500" />
            Secure authentication
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1 rounded-full bg-emerald-500" />
            Encrypted data
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1 rounded-full bg-emerald-500" />
            Trusted by 85k+ learners
          </span>
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* mobile header */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <span className="text-lg font-semibold tracking-tight">Relay</span>
            <p className="mt-0.5 text-xs text-muted-foreground">Where knowledge moves forward.</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

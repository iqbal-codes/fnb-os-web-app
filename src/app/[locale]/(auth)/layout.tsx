import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-primary/5">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-chart-3/10 rounded-full blur-3xl" />
      </div>

      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}


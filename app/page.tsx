import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold text-sm select-none">
            ES
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            El Sur Driving School
          </span>
        </div>
        <Link
          href="/dashboard"
          className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition-all hover:bg-white/[0.08] hover:text-white"
        >
          Open App
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-24 text-center">
        <div className="mb-6 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-600 flex items-center justify-center text-white font-bold text-2xl select-none shadow-lg shadow-rose-600/20">
            ES
          </div>
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-white mb-4 max-w-2xl leading-tight">
          El Sur Driving School{" "}
          <span className="text-rose-500">Data Explorer</span>
        </h1>

        <p className="text-zinc-400 text-lg max-w-xl mb-10 leading-relaxed">
          Effortlessly manage student records from Google Sheets, edit details
          in real time, and export enrollment PDFs — all in one place.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-rose-600/25 transition-all hover:bg-rose-500 hover:shadow-rose-500/30 hover:-translate-y-0.5 active:translate-y-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 6h18M3 14h10" />
          </svg>
          Open Dashboard
        </Link>

        <p className="mt-4 text-xs text-zinc-500 max-w-sm leading-relaxed">
          <span className="inline-flex items-center gap-1">
            <svg className="w-3 h-3 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <strong className="text-zinc-400 font-medium">Live demo</strong>
          </span>
          {" "}— the Google account is already connected. Click the button above to explore the live student data.
        </p>

        {/* Feature highlights */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full text-left">
          {[
            {
              icon: (
                <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                </svg>
              ),
              title: "Live Sheet Data",
              description: "Pull structured student records directly from your private Google Sheet via OAuth.",
            },
            {
              icon: (
                <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ),
              title: "Inline Editing",
              description: "Open any student record, edit fields in a modal, and save changes instantly.",
            },
            {
              icon: (
                <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M8 12l4 4 4-4M12 4v12" />
                </svg>
              ),
              title: "PDF Export",
              description: "Generate filled enrollment PDFs for any student with one click, ready to download.",
            },
          ].map(({ icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-rose-600/10 border border-rose-500/20 flex items-center justify-center">
                {icon}
              </div>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 py-5 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} El Sur Driving School. All rights reserved.
      </footer>
    </div>
  );
}

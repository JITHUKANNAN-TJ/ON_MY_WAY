export function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-10 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-sm font-semibold">On My Way</span>
        </div>
        <p className="text-sm text-text-secondary">
          &copy; {new Date().getFullYear()} On My Way. Share your journey.
        </p>
      </div>
    </footer>
  );
}

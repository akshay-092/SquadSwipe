const Register = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-lg">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
          SS
        </div>
        <h3 className="text-2xl font-bold text-slate-900">
          Welcome to Squad Swipe
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Decide together in minutes. Create a squad, drop options, and let
          everyone vote.
        </p>
        <button
          type="button"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 cursor-pointer"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 48 48"
            aria-hidden="true"
            className="shrink-0"
          >
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.9 32.9 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.7 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.2-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.6 16.1 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.7 6.1 29.6 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.3 0 10.3-2 14-5.2l-6.5-5.3C29.4 35.4 26.8 36 24 36c-5.3 0-9.8-3.6-11.3-8.5l-6.6 5.1C9.5 39.7 16.3 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.8 7.1l6.5 5.3C37.9 37.4 44 32 44 24c0-1.3-.1-2.2-.4-3.5z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="mt-4 text-xs text-slate-500">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Register;

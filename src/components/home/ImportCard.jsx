"use client";

export default function ImportCard({
  t,
  code,
  error,
  setError,
  handleChange,
  handleClick,
}) {
  return (
    <div className="w-full max-w-[480px] mx-auto min-[900px]:w-[480px] min-[900px]:mx-0 flex-shrink-0 min-[900px]:mt-20">
      <div
        className="rounded-2xl overflow-hidden shadow-lg"
        style={{
          background: "rgba(255,255,255,0.82)",
          border: "1px solid rgba(38,142,134,0.15)",
          backdropFilter: "blur(10px)",
          padding: 10,
        }}
      >
        {/* Form */}
        <div className="px-2 pb-5">
          <p className="font-bold tracking-widest text-sm uppercase text-gray-800 mb-2">
            {t.importLabel}
          </p>
          <form onSubmit={handleClick}>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                handleChange(e.target.value);
                setError(false);
              }}
              placeholder={t.placeholder}
              className="w-full rounded-lg px-4 py-3 text-sm text-gray-800 mb-1 outline-none transition-all"
              style={{
                background: "#f4f4f4",
                border: `1px solid ${error ? "#e53e3e" : "#ddd"}`,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = error ? "#e53e3e" : "#268E86";
                e.target.style.boxShadow = "0 0 0 3px rgba(38,142,134,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = error ? "#e53e3e" : "#ddd";
                e.target.style.boxShadow = "none";
              }}
            />
            {error && (
              <p className="text-red-500 text-xs mt-1 mb-2 tracking-wide">
                {t.invalidCode}
              </p>
            )}
            <div className="mb-3" />
            <button
              type="submit"
              className="w-full py-3 rounded-lg text-white text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90"
              style={{ background: "#268E86" }}
            >
              {t.importButton}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

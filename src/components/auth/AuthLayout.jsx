import BrandLogo from "../common/BrandLogo";

const AuthLayout = ({ eyebrow, title, description, children, footer, compact = false }) => (
  <main className={`relative isolate flex items-center justify-center overflow-x-hidden bg-[#F3F7F4] px-4 py-4 sm:px-6 sm:py-6 ${compact ? "h-dvh overflow-y-hidden" : "min-h-dvh"}`}>
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -right-36 -top-40 h-[28rem] w-[28rem] rounded-full bg-emerald-200/35 blur-[110px]" />
      <div className="absolute -bottom-48 -left-36 h-[28rem] w-[28rem] rounded-full bg-slate-200/50 blur-[110px]" />
    </div>

    <div className="relative grid max-h-full w-full max-w-[1240px] overflow-hidden rounded-[28px] border border-white/90 bg-white shadow-[0_32px_100px_-48px_rgba(15,35,24,0.32)] lg:grid-cols-[1.02fr_0.98fr]">
      <section className="relative hidden flex-col justify-center overflow-hidden bg-[#102D20] px-10 py-10 lg:flex xl:px-14 xl:py-12">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_5%,rgba(52,160,99,0.3),transparent_44%),linear-gradient(145deg,rgba(255,255,255,0.025),transparent_55%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 -left-28 h-80 w-80 rounded-full border border-white/[0.06]" />
        <div className="relative mx-auto w-full max-w-[490px]">
          <div className="mb-9 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-100/90">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.7)]" />
            Inventory workspace
          </div>
          <h2 className="max-w-[440px] text-[2.1rem] font-semibold leading-[1.12] tracking-[-0.045em] text-white xl:text-[2.7rem]">
            Your inventory,<br />working in sync.
          </h2>
          <p className="mt-4 max-w-[410px] text-[15px] leading-6 text-emerald-50/70">
            Manage products, track stock, and keep your inventory organized.
          </p>
          <div aria-hidden="true" className="mt-7 overflow-hidden rounded-[18px] border border-white/70 bg-white p-2.5 shadow-[0_24px_60px_-26px_rgba(0,0,0,0.5)]">
            <svg viewBox="0 0 420 226" fill="none" className="block h-auto w-full">
              <rect x="0.5" y="0.5" width="419" height="225" rx="13.5" fill="#FCFDFC" stroke="#E2E8E5" />
              <path d="M1 14C1 6.82 6.82 1 14 1H406C413.18 1 419 6.82 419 14V34H1V14Z" fill="#F7FAF8" />
              <path d="M1 33.5H419" stroke="#E8EEEA" />
              <circle cx="16" cy="17" r="3" fill="#D6E3DB" />
              <circle cx="27" cy="17" r="3" fill="#D6E3DB" />
              <circle cx="38" cy="17" r="3" fill="#D6E3DB" />
              <rect x="54" y="12" width="92" height="10" rx="5" fill="#E9EFEB" />
              <rect x="345" y="11" width="56" height="12" rx="6" fill="#E8F5EC" />
              <circle cx="354" cy="17" r="3" fill="#199653" />
              <rect x="361" y="14" width="31" height="6" rx="3" fill="#A8D8B8" />

              <rect x="16" y="48" width="120" height="52" rx="8" fill="white" stroke="#E8EEEA" />
              <rect x="27" y="59" width="48" height="6" rx="3" fill="#A6B2AA" />
              <rect x="27" y="73" width="58" height="13" rx="4" fill="#24362B" />
              <rect x="99" y="62" width="25" height="25" rx="7" fill="#EAF6EE" />
              <path d="M106 79V73M112 79V68M118 79V71" stroke="#178A4D" strokeWidth="2.5" strokeLinecap="round" />

              <rect x="150" y="48" width="120" height="52" rx="8" fill="white" stroke="#E8EEEA" />
              <rect x="161" y="59" width="42" height="6" rx="3" fill="#A6B2AA" />
              <rect x="161" y="73" width="53" height="13" rx="4" fill="#24362B" />
              <rect x="233" y="62" width="25" height="25" rx="7" fill="#EFF4FF" />
              <path d="M239 79L243 74L247 77L252 69" stroke="#6884C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

              <rect x="284" y="48" width="120" height="52" rx="8" fill="white" stroke="#E8EEEA" />
              <rect x="295" y="59" width="50" height="6" rx="3" fill="#A6B2AA" />
              <rect x="295" y="73" width="46" height="13" rx="4" fill="#24362B" />
              <rect x="367" y="62" width="25" height="25" rx="7" fill="#FFF5E7" />
              <path d="M374 80V74M380 80V69M386 80V76" stroke="#D69836" strokeWidth="2.5" strokeLinecap="round" />

              <rect x="16" y="112" width="246" height="98" rx="8" fill="white" stroke="#E8EEEA" />
              <rect x="28" y="123" width="74" height="7" rx="3.5" fill="#748179" />
              <rect x="211" y="123" width="37" height="7" rx="3.5" fill="#E4EBE6" />
              <path d="M29 157H249M29 178H249M29 199H249" stroke="#EEF2EF" />
              <path d="M32 185L68 175L101 181L136 151L169 160L207 139L245 146" stroke="#159451" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M32 185L68 175L101 181L136 151L169 160L207 139L245 146V199H32V185Z" fill="url(#sales-fill)" />
              <circle cx="207" cy="139" r="4" fill="white" stroke="#159451" strokeWidth="2" />

              <rect x="276" y="112" width="128" height="98" rx="8" fill="white" stroke="#E8EEEA" />
              <rect x="288" y="123" width="57" height="7" rx="3.5" fill="#748179" />
              <rect x="288" y="143" width="9" height="9" rx="3" fill="#EAF6EE" />
              <rect x="303" y="144" width="42" height="6" rx="3" fill="#CFD8D2" />
              <rect x="367" y="144" width="24" height="6" rx="3" fill="#A6D6B5" />
              <rect x="288" y="163" width="9" height="9" rx="3" fill="#EAF6EE" />
              <rect x="303" y="164" width="51" height="6" rx="3" fill="#CFD8D2" />
              <rect x="367" y="164" width="24" height="6" rx="3" fill="#A6D6B5" />
              <rect x="288" y="183" width="9" height="9" rx="3" fill="#FFF4E5" />
              <rect x="303" y="184" width="37" height="6" rx="3" fill="#CFD8D2" />
              <rect x="367" y="184" width="24" height="6" rx="3" fill="#F0D19D" />
              <defs>
                <linearGradient id="sales-fill" x1="138" y1="139" x2="138" y2="199" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#49B875" stopOpacity=".16" />
                  <stop offset="1" stopColor="#49B875" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-xs font-medium text-emerald-50/65">
            <span>Products</span><span aria-hidden="true" className="text-emerald-400/60">/</span>
            <span>Stock</span><span aria-hidden="true" className="text-emerald-400/60">/</span>
            <span>Sales</span><span aria-hidden="true" className="text-emerald-400/60">/</span>
            <span>Team</span>
          </div>
        </div>
      </section>

      <section className={`flex min-w-0 items-center justify-center bg-white px-5 py-4 sm:px-12 sm:py-10 lg:px-14 xl:px-16 ${compact ? "sm:py-8" : ""}`}>
        <div className="w-full max-w-[400px]">
          <header className="mb-5 sm:mb-8">
            <div className="mb-3 flex items-center gap-2.5 sm:mb-6">
              <BrandLogo size="sm" showMark={false} />
            </div>
            {eyebrow && <p className="mb-2 text-sm font-medium text-emerald-700">{eyebrow}</p>}
            <h1 className="text-[1.7rem] font-semibold leading-tight tracking-[-0.04em] text-slate-900 sm:text-[1.9rem]">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-5 text-slate-600 sm:mt-3 sm:leading-6">
              {description}
            </p>
          </header>
          {children}
          {footer && <div className={compact ? "mt-3 sm:mt-6" : ""}>{footer}</div>}
        </div>
      </section>
    </div>
  </main>
);

export default AuthLayout;

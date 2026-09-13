import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Bell, Menu, X } from 'lucide-react';
import { Icon } from './Icon';
export const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'smartscan', label: 'Smart Scan', icon: 'ScanLine' },
    { id: 'verify', label: 'Verify Document', icon: 'ShieldCheck' },
    { id: 'cyberintel', label: 'Cyber Intelligence', icon: 'ShieldAlert' },
    { id: 'records', label: 'Record Screening', icon: 'Archive' },
    { id: 'history', label: 'Verification History', icon: 'History' },
    { id: 'reports', label: 'Reports', icon: 'FileText' },
];
const secondaryItems = [
    { id: 'integrations', label: 'Integrations', icon: 'Link2' },
    { id: 'settings', label: 'Settings', icon: 'Settings2' },
];
function Logo() {
    return <div className="flex items-center gap-2.5">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-[linear-gradient(140deg,#f9fbfc,#9ca9b7)] text-[#344252] shadow-[inset_0_1px_2px_white,0_8px_15px_-10px_#344252]"><span className="font-display text-lg font-extrabold">Z</span></div>
    <div><div className="font-display text-lg font-extrabold leading-none">ZyID</div><div className="mt-1 text-[9px] font-bold uppercase tracking-[.13em] text-slate-400">Scan. Verify. Protect.</div></div>
  </div>;
}
export function WorkspaceShell({ view, children, onView, profileName = 'ZyID Operator' }) {
    const [, setLocation] = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    useEffect(() => { setLocation(`/${view === 'dashboard' ? '' : view}`); }, [setLocation, view]);
    const navigate = (next) => { onView(next); setMobileOpen(false); };
    const links = (items) => items.map((item) => <button data-testid={`nav-${item.id}`} key={item.id} className={`sidebar-link ${view === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}><Icon name={item.icon} size={17}/><span>{item.label}</span></button>);
    return <div className="zyid-app">
    <div className="relative z-10 flex min-h-[100dvh]">
      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-slate-300/60 bg-white/55 px-4 py-6 lg:flex">
        <div className="mb-8 px-2"><Logo /></div>
        <div className="mb-3 px-3 label-caps">Workspace</div>
        <nav className="space-y-1">{links(NAV_ITEMS)}</nav>
        <div className="mt-7 mb-3 px-3 label-caps">Manage</div>
        <nav className="space-y-1">{links(secondaryItems)}</nav>
        <div className="mt-auto rounded-2xl border border-slate-300/70 bg-[#edf2f5]/85 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#354658]"><span className="h-2 w-2 rounded-full bg-[#69879b]"/> Local demo mode</div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">Results stay in this browser. No government database is contacted.</p>
        </div>
      </aside>
      {mobileOpen && <div className="fixed inset-0 z-50 bg-[#1a2736]/35 lg:hidden" onClick={() => setMobileOpen(false)}>
        <aside className="h-full w-[min(84vw,300px)] bg-[#f9fbfc] p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="mb-8 flex items-center justify-between px-2"><Logo /><button className="matte-button ghost" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18}/></button></div>
          <nav className="space-y-1">{links(NAV_ITEMS)}{links(secondaryItems)}</nav>
        </aside>
      </div>}
      <section className="min-w-0 flex-1">
        <header className="topbar sticky top-0 z-30 flex min-h-[74px] items-center justify-between gap-4 px-[clamp(1rem,3vw,2.5rem)] py-3">
          <div className="flex min-w-0 items-center gap-3"><button className="matte-button ghost lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={19}/></button><div className="min-w-0"><div className="font-display truncate text-[clamp(1rem,1.5vw,1.24rem)] font-extrabold">{titleFor(view)}</div><div className="hidden text-xs text-slate-500 sm:block">{subtitleFor(view)}</div></div></div>
          <div className="flex items-center gap-2"><span className="hidden items-center gap-1.5 rounded-full border border-slate-300 bg-white/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-slate-500 md:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#71899a]"/> Local only</span><button className="matte-button ghost hidden sm:inline-flex" aria-label="Notifications"><Bell size={17}/></button><div className="flex items-center gap-2 rounded-full border border-slate-300 bg-white/70 py-1 pl-1 pr-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d7e0e7] text-xs font-extrabold text-[#364758]">ZO</div><span className="hidden text-xs font-bold text-slate-600 md:block">{profileName}</span></div></div>
        </header>
        <main className="fade-in px-[clamp(1rem,3vw,2.5rem)] py-[clamp(1.2rem,3vw,2.5rem)]">{children}</main>
      </section>
    </div>
  </div>;
}
function titleFor(view) { return ({ dashboard: 'Dashboard', smartscan: 'Smart Scan', verify: 'Verify Document', cyberintel: 'Cyber Intelligence', records: 'Record Screening', history: 'Verification History', reports: 'Reports', integrations: 'Integrations', settings: 'Settings' })[view]; }
function subtitleFor(view) { return ({ dashboard: 'Local document screening overview', smartscan: 'Route mixed uploads into the right verification lane', verify: 'Run structural and format checks in your browser', cyberintel: 'Identity correlation and case intelligence', records: 'Stored verification reports, kept separate from intelligence', history: 'Every verification attempt saved in this workspace', reports: 'Create a printable local verification report', integrations: 'Browser-only connections and import surfaces', settings: 'Appearance, privacy and local storage posture' })[view]; }

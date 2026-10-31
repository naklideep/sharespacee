import { useCallback, useEffect, useState } from "react";
import {
  Activity, ArrowLeft, Ban, CheckCircle2, ClipboardList, LayoutDashboard,
  LoaderCircle, Package, RefreshCw, Search, Shield, ShieldAlert, Trash2, Users, X
} from "lucide-react";
import api from "../services/api";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "resources", label: "Listings", icon: Package },
  { id: "bookings", label: "Bookings", icon: ClipboardList },
  { id: "reports", label: "Reports", icon: ShieldAlert },
];

const panelStyle = { background: "#fff", border: "1px solid #e8e5dc", borderRadius: 16, padding: 18 };
const buttonStyle = { border: "1px solid #ddd8cc", borderRadius: 9, background: "#fff", padding: "8px 11px", cursor: "pointer", fontWeight: 600 };
const muted = { color: "#77766f", fontSize: 13 };

export default function AdminDashboard({ onClose }) {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async (target = tab) => {
    setLoading(true); setError(""); setNotice("");
    try {
      if (target === "overview") {
        const r = await api.get("/admin/stats"); setStats(r.data.data);
      } else {
        const r = await api.get(`/admin/${target}`, target === "users" && query ? { params: { q: query } } : undefined);
        setRows(r.data.data || []);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load admin data. Check your admin access.");
    } finally { setLoading(false); }
  }, [tab, query]);

  useEffect(() => { load(tab); }, [tab, load]);

  const act = async (key, fn, success) => {
    setBusy(key); setError(""); setNotice("");
    try { await fn(); setNotice(success); await load(tab); }
    catch (e) { setError(e.response?.data?.message || "Action failed. Please try again."); }
    finally { setBusy(""); }
  };

  const statCards = stats ? [
    ["Total users", stats.users, Users], ["Active listings", stats.availableResources, Package],
    ["Total bookings", stats.bookings, ClipboardList], ["Open reports", stats.openReports, ShieldAlert],
  ] : [];

  const fmt = (value) => value ? new Date(value).toLocaleDateString() : "—";
  const pill = (value) => <span style={{ fontSize: 11, padding: "4px 8px", borderRadius: 99, background: value === "open" || value === "pending" ? "#fff2d9" : value === "resolved" || value === "approved" ? "#e6f4e9" : "#efeee9", color: "#34342f", textTransform: "capitalize" }}>{value || "—"}</span>;

  return <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "#f6f4ee", color: "#20231f", overflow: "auto", fontFamily: "inherit" }}>
    <header style={{ position: "sticky", top: 0, zIndex: 2, background: "#fff", borderBottom: "1px solid #e7e3d9", padding: "14px clamp(16px,4vw,48px)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ background: "#172b24", color: "#fff", borderRadius: 12, padding: 10 }}><Shield size={22}/></div>
        <div><strong style={{ fontSize: 18 }}>ShareSpace Admin</strong><div style={muted}>Platform control centre</div></div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button style={buttonStyle} onClick={() => load()} title="Refresh"><RefreshCw size={16}/></button>
        <button style={buttonStyle} onClick={onClose}><X size={17}/> Close</button>
      </div>
    </header>
    <div style={{ maxWidth: 1440, margin: "0 auto", padding: "26px clamp(14px,4vw,48px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
        <div><div style={{ ...muted, letterSpacing: 2, textTransform: "uppercase" }}>Administration</div><h1 style={{ fontFamily: "Georgia,serif", fontWeight: 500, fontSize: "clamp(28px,4vw,42px)", margin: "5px 0" }}>{tabs.find(t => t.id === tab)?.label}</h1><p style={muted}>Manage the ShareSpace community and activity.</p></div>
        {tab === "users" && <div style={{ display: "flex", gap: 8 }}><input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && load("users")} placeholder="Search name or email" style={{ border: "1px solid #ddd8cc", borderRadius: 9, padding: "10px 12px", minWidth: 220 }}/><button style={buttonStyle} onClick={() => load("users")}><Search size={16}/></button></div>}
      </div>
      <nav style={{ display: "flex", gap: 7, overflowX: "auto", marginBottom: 22, paddingBottom: 5 }}>
        {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ ...buttonStyle, display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap", background: tab === t.id ? "#172b24" : "#fff", color: tab === t.id ? "#fff" : "#30332e", borderColor: tab === t.id ? "#172b24" : "#ddd8cc" }}><t.icon size={15}/>{t.label}</button>)}
      </nav>
      {error && <div role="alert" style={{ ...panelStyle, borderColor: "#e8b5ae", color: "#9b3026", marginBottom: 14 }}>{error}</div>}
      {notice && <div role="status" style={{ ...panelStyle, borderColor: "#b9d9bd", color: "#286337", marginBottom: 14 }}>{notice}</div>}
      {loading ? <div style={{ ...panelStyle, textAlign: "center", padding: 50 }}><LoaderCircle className="spin" style={{ animation: "spin 1s linear infinite" }}/> Loading admin data…</div> : <>
        {tab === "overview" && stats && <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 13, marginBottom: 18 }}>
            {statCards.map(([label,value,Icon]) => <div key={label} style={panelStyle}><div style={{ display: "flex", justifyContent: "space-between", color: "#77766f" }}><span>{label}</span><Icon size={18}/></div><div style={{ fontSize: 32, fontWeight: 650, marginTop: 12 }}>{Number(value || 0).toLocaleString()}</div></div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
            <section style={panelStyle}><h3 style={{ marginTop: 0 }}>Platform snapshot</h3>{[["All listings",stats.resources],["Available listings",stats.availableResources],["Suspended users",stats.blockedUsers],["Pending bookings",stats.pendingBookings],["All reports",stats.reports]].map(([k,v])=><div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #efede7" }}><span style={muted}>{k}</span><strong>{v}</strong></div>)}</section>
            <section style={panelStyle}><h3 style={{ marginTop: 0 }}>Booking statuses</h3>{(stats.bookingStatuses || []).length ? stats.bookingStatuses.map(x=><div key={x._id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #efede7" }}><span>{pill(x._id)}</span><strong>{x.count}</strong></div>) : <p style={muted}>No booking activity yet.</p>}</section>
          </div>
          <section style={{ ...panelStyle, marginTop: 14 }}><h3 style={{ marginTop: 0 }}>Recent bookings</h3>{(stats.recentBookings || []).length ? stats.recentBookings.map(b=><div key={b._id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "11px 0", borderBottom: "1px solid #efede7", flexWrap: "wrap" }}><div><strong>{b.resource?.title || "Listing"}</strong><div style={muted}>{b.borrower?.name || "Member"} → {b.owner?.name || "Owner"} · {fmt(b.createdAt)}</div></div>{pill(b.status)}</div>) : <p style={muted}>No bookings yet.</p>}</section>
        </>}
        {tab === "users" && <section style={panelStyle}><h3 style={{ marginTop: 0 }}>Community members ({rows.length})</h3>{rows.map(u=><div key={u._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 0", borderBottom: "1px solid #efede7", flexWrap: "wrap" }}><div><strong>{u.name}</strong><div style={muted}>{u.email} · {u.college || "College not set"} · {u.role}</div></div><div style={{ display: "flex", alignItems: "center", gap: 9 }}>{u.isBlocked && pill("suspended")}<button disabled={u.role === "admin" || busy === u._id} style={buttonStyle} onClick={() => act(u._id, () => api.patch(`/admin/users/${u._id}/block`, { isBlocked: !u.isBlocked }), u.isBlocked ? "User restored." : "User suspended.")}>{u.isBlocked ? <><CheckCircle2 size={14}/> Restore</> : <><Ban size={14}/> Suspend</>}</button></div></div>)}</section>}
        {tab === "resources" && <section style={panelStyle}><h3 style={{ marginTop: 0 }}>Resource listings ({rows.length})</h3>{rows.map(r=><div key={r._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #efede7", flexWrap: "wrap" }}><div><strong>{r.title}</strong><div style={muted}>{r.category} · {r.location} · Owner: {r.ownerId?.name || r.ownerName || "Unknown"}</div></div><div style={{ display: "flex", gap: 8, alignItems: "center" }}>{pill(r.isAvailable ? "available" : "paused")}<button disabled={busy === r._id} style={buttonStyle} onClick={() => act(r._id, () => api.patch(`/admin/resources/${r._id}/availability`, { isAvailable: !r.isAvailable }), "Listing updated.")}>{r.isAvailable ? "Pause" : "Activate"}</button><button disabled={busy === r._id} style={{ ...buttonStyle, color: "#a12d25" }} onClick={() => window.confirm(`Permanently delete "${r.title}"?`) && act(r._id, () => api.delete(`/admin/resources/${r._id}`), "Listing deleted.")}><Trash2 size={14}/></button></div></div>)}</section>}
        {tab === "bookings" && <section style={panelStyle}><h3 style={{ marginTop: 0 }}>All bookings ({rows.length})</h3>{rows.map(b=><div key={b._id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 0", borderBottom: "1px solid #efede7", flexWrap: "wrap" }}><div><strong>{b.resource?.title || "Deleted listing"}</strong><div style={muted}>{b.borrower?.name || "Borrower"} → {b.owner?.name || "Owner"} · {fmt(b.startDate)} – {fmt(b.endDate)}</div></div>{pill(b.status)}</div>)}</section>}
        {tab === "reports" && <section style={panelStyle}><h3 style={{ marginTop: 0 }}>Reported content ({rows.length})</h3>{rows.map(r=><div key={r._id} style={{ padding: "13px 0", borderBottom: "1px solid #efede7" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><strong>{r.reason}</strong>{pill(r.status)}</div><div style={muted}>Reported by {r.reporter?.name || "Member"} · {r.resource?.title || r.reportedUser?.name || "Account"} · {fmt(r.createdAt)}</div>{r.details && <p style={{ margin: "8px 0", fontSize: 14 }}>{r.details}</p>}<div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>{["reviewing","resolved","dismissed"].map(status=><button key={status} disabled={busy === r._id} style={buttonStyle} onClick={() => act(r._id, () => api.patch(`/admin/reports/${r._id}`, { status }), `Report marked ${status}.`)}>{status[0].toUpperCase()+status.slice(1)}</button>)}</div></div>)}</section>}
      </>}
      <p style={{ ...muted, textAlign: "center", marginTop: 24 }}>ShareSpace administration · Data is loaded directly from your database</p>
    </div>
  </div>;
}

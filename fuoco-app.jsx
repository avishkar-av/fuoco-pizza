import { useState, useEffect, useCallback } from "react";

// ─── STORAGE HELPERS ───────────────────────────────────────────────────────────
const DB = {
  async get(key) {
    try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; }
    catch { return null; }
  },
  async set(key, val) {
    try { await window.storage.set(key, JSON.stringify(val)); return true; }
    catch { return false; }
  }
};

// ─── DEFAULT SEED DATA ──────────────────────────────────────────────────────────
const SEED_MENU = [
  { id: "m1", name: "Margherita Vera", desc: "San Marzano tomato, fior di latte, fresh basil, EVOO", price: 499, tag: "Classic", emoji: "🍕", available: true },
  { id: "m2", name: "Diavola", desc: "Spicy Calabrian salami, smoked mozzarella, chilli oil, wild oregano", price: 649, tag: "Chef's Pick", emoji: "🌶️", available: true },
  { id: "m3", name: "Bianca Foresta", desc: "Truffle cream, wild mushrooms, taleggio, rosemary", price: 749, tag: "Signature", emoji: "🫒", available: true },
  { id: "m4", name: "Carbonara", desc: "Guanciale, pecorino romano, egg yolk cream, black pepper", price: 699, tag: "Fan Favourite", emoji: "🥓", available: true },
  { id: "m5", name: "Verde", desc: "Pistachio pesto, buffalo ricotta, roasted zucchini, pine nuts", price: 599, tag: "Veg", emoji: "🥬", available: true },
  { id: "m6", name: "Il Fuoco", desc: "Ghost pepper oil, nduja, smoked scamorza, honey drizzle", price: 849, tag: "House Special", emoji: "🔥", available: true },
];

const ADMIN_PASS = "fuoco2024";

// ─── STYLES ─────────────────────────────────────────────────────────────────────
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Bebas+Neue&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  :root {
    --char:#0d0905; --ember:#c94a1a; --gold:#d4a832;
    --cream:#f5ede0; --ash:#8a7a6a; --smoke:#1a110a;
    --card:#1e1510; --border:rgba(138,122,106,0.18);
    --success:#2ecc71; --danger:#e74c3c;
  }
  html { scroll-behavior:smooth; }
  body { background:var(--char); color:var(--cream); font-family:'Cormorant Garamond',serif; overflow-x:hidden; }
  input, textarea, select {
    background:rgba(255,255,255,0.04); border:1px solid var(--border);
    color:var(--cream); padding:0.75rem 1rem; font-family:'Cormorant Garamond',serif;
    font-size:1rem; width:100%; outline:none; transition:border-color 0.3s;
    border-radius:2px;
  }
  input:focus, textarea:focus, select:focus { border-color:var(--ember); }
  select option { background:var(--smoke); }
  button { cursor:pointer; border:none; font-family:'Cormorant Garamond',serif; }
  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:var(--smoke); }
  ::-webkit-scrollbar-thumb { background:var(--ember); }
`;

// ─── TINY COMPONENTS ───────────────────────────────────────────────────────────
const Badge = ({ children, color = "ember" }) => (
  <span style={{
    fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase",
    border: `1px solid var(--${color})`, color: `var(--${color})`,
    padding: "0.2rem 0.55rem", borderRadius: "2px", whiteSpace: "nowrap"
  }}>{children}</span>
);

const Btn = ({ children, onClick, variant = "primary", style = {}, type = "button", disabled = false }) => {
  const styles = {
    primary: { background: "var(--ember)", color: "var(--cream)", padding: "0.75rem 1.8rem", fontSize: "0.85rem", letterSpacing: "0.15em", textTransform: "uppercase", transition: "background 0.3s,transform 0.2s", borderRadius: "2px" },
    ghost: { background: "transparent", color: "var(--cream)", padding: "0.75rem 1.8rem", fontSize: "0.85rem", letterSpacing: "0.15em", textTransform: "uppercase", border: "1px solid var(--border)", transition: "border-color 0.3s,color 0.3s", borderRadius: "2px" },
    danger: { background: "var(--danger)", color: "#fff", padding: "0.5rem 1rem", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "2px" },
    success: { background: "var(--success)", color: "#fff", padding: "0.5rem 1rem", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "2px" },
    gold: { background: "var(--gold)", color: "var(--char)", padding: "0.5rem 1rem", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "2px", fontWeight: "bold" },
  };
  return <button type={type} onClick={onClick} disabled={disabled} style={{ ...styles[variant], opacity: disabled ? 0.5 : 1, ...style }}>{children}</button>;
};

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
    <div style={{ background: "var(--smoke)", border: "1px solid var(--border)", padding: "2rem", width: "100%", maxWidth: "520px", maxHeight: "85vh", overflowY: "auto", borderRadius: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", color: "var(--cream)" }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", color: "var(--ash)", fontSize: "1.4rem", cursor: "pointer" }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

const Toast = ({ msg, type }) => (
  <div style={{
    position: "fixed", bottom: "2rem", right: "2rem", zIndex: 9999,
    background: type === "success" ? "var(--success)" : "var(--danger)",
    color: "#fff", padding: "1rem 1.5rem", borderRadius: "4px",
    fontSize: "0.9rem", fontFamily: "'Cormorant Garamond',serif",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)", letterSpacing: "0.05em"
  }}>{msg}</div>
);

// ─── CUSTOMER: NAV ──────────────────────────────────────────────────────────────
const Nav = ({ setView, cart, setShowCart }) => (
  <nav style={{
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "1.2rem 3rem",
    background: "linear-gradient(to bottom,rgba(13,9,5,0.97),transparent)",
    backdropFilter: "blur(4px)"
  }}>
    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.8rem", letterSpacing: "0.15em", color: "var(--ember)", cursor: "pointer" }}
      onClick={() => setView("home")}>
      FU<span style={{ color: "var(--gold)" }}>O</span>CO
    </div>
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
      {["menu", "reserve"].map(v => (
        <button key={v} onClick={() => setView(v)} style={{
          background: "none", color: "var(--cream)", fontSize: "0.8rem",
          letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.75,
          transition: "opacity 0.3s", fontFamily: "'Cormorant Garamond',serif"
        }}>{v === "menu" ? "Menu" : "Reserve"}</button>
      ))}
      <button onClick={() => setShowCart(true)} style={{
        background: "var(--ember)", color: "var(--cream)", padding: "0.55rem 1.2rem",
        fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase",
        fontFamily: "'Cormorant Garamond',serif", borderRadius: "2px"
      }}>
        🛒 Cart {cart.length > 0 && <span style={{ background: "var(--gold)", color: "var(--char)", borderRadius: "50%", padding: "0 5px", marginLeft: "4px", fontSize: "0.7rem", fontWeight: "bold" }}>{cart.reduce((s, i) => s + i.qty, 0)}</span>}
      </button>
    </div>
  </nav>
);

// ─── CUSTOMER: HERO ─────────────────────────────────────────────────────────────
const Hero = ({ setView }) => (
  <section style={{ position: "relative", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(ellipse 60% 80% at 50% 100%,rgba(201,74,26,0.35) 0%,transparent 65%),var(--char)"
    }} />
    <div style={{ position: "relative", textAlign: "center", zIndex: 2 }}>
      <p style={{ fontSize: "0.75rem", letterSpacing: "0.4em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "1.5rem" }}>
        Artisan Wood-Fired Pizza · Est. 2019
      </p>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(4rem,12vw,10rem)", fontWeight: 900, lineHeight: 0.9, color: "var(--cream)" }}>
        Born from<br /><em style={{ fontStyle: "italic", color: "var(--ember)" }}>Fire</em>
      </h1>
      <p style={{ fontSize: "1.1rem", fontStyle: "italic", color: "var(--ash)", marginTop: "1.5rem" }}>
        Neapolitan tradition. Obsessive craft. Every pizza, a performance.
      </p>
      <div style={{ marginTop: "2.5rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
        <Btn onClick={() => setView("menu")}>Order Now</Btn>
        <Btn variant="ghost" onClick={() => setView("reserve")}>Reserve Table</Btn>
      </div>
    </div>
  </section>
);

// ─── CUSTOMER: MENU PAGE ────────────────────────────────────────────────────────
const MenuPage = ({ menu, cart, setCart }) => {
  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };
  const available = menu.filter(m => m.available);

  return (
    <div style={{ padding: "8rem 3rem 4rem", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <p style={{ fontSize: "0.75rem", letterSpacing: "0.4em", textTransform: "uppercase", color: "var(--ember)", marginBottom: "0.75rem" }}>The Craft</p>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 700, color: "var(--cream)" }}>
          Fired with <em style={{ color: "var(--gold)" }}>Purpose</em>
        </h2>
      </div>
      {available.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--ash)", fontStyle: "italic", fontSize: "1.1rem" }}>Menu is being updated. Check back soon.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1px" }}>
          {available.map(item => (
            <div key={item.id} style={{
              background: "var(--card)", border: "1px solid var(--border)",
              padding: "2rem", transition: "border-color 0.3s,transform 0.3s",
              position: "relative", borderRadius: "2px"
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,74,26,0.4)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{item.emoji}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.25rem", fontWeight: 700, color: "var(--cream)", flex: 1, marginRight: "0.5rem" }}>{item.name}</div>
                <Badge>{item.tag}</Badge>
              </div>
              <p style={{ fontSize: "0.9rem", fontStyle: "italic", color: "var(--ash)", lineHeight: 1.6, marginBottom: "1.5rem" }}>{item.desc}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.6rem", color: "var(--gold)" }}>₹{item.price}</div>
                <Btn onClick={() => addToCart(item)} style={{ padding: "0.5rem 1.2rem", fontSize: "0.75rem" }}>Add to Cart</Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── CUSTOMER: CART ─────────────────────────────────────────────────────────────
const Cart = ({ cart, setCart, onClose, onPlaceOrder }) => {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [notes, setNotes] = useState("");

  const updateQty = (id, delta) => setCart(prev =>
    prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0)
  );

  const handleOrder = () => {
    if (!name.trim() || !phone.trim()) return alert("Please enter your name and phone number.");
    onPlaceOrder({ name, phone, notes, items: cart, total, status: "Pending", createdAt: new Date().toISOString() });
  };

  return (
    <Modal title="Your Order" onClose={onClose}>
      {cart.length === 0 ? (
        <p style={{ color: "var(--ash)", fontStyle: "italic", textAlign: "center", padding: "2rem 0" }}>Your cart is empty.</p>
      ) : (
        <>
          <div style={{ marginBottom: "1.5rem" }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ color: "var(--cream)", fontSize: "0.95rem" }}>{item.emoji} {item.name}</div>
                  <div style={{ color: "var(--ash)", fontSize: "0.8rem" }}>₹{item.price} each</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <button onClick={() => updateQty(item.id, -1)} style={{ background: "var(--border)", color: "var(--cream)", width: "28px", height: "28px", borderRadius: "2px", fontSize: "1rem" }}>−</button>
                  <span style={{ color: "var(--gold)", fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.2rem", minWidth: "20px", textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} style={{ background: "var(--ember)", color: "var(--cream)", width: "28px", height: "28px", borderRadius: "2px", fontSize: "1rem" }}>+</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", paddingTop: "0.5rem" }}>
            <span style={{ color: "var(--ash)", textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.8rem" }}>Total</span>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.8rem", color: "var(--gold)" }}>₹{total}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <input placeholder="Your Name *" value={name} onChange={e => setName(e.target.value)} />
            <input placeholder="Phone Number *" value={phone} onChange={e => setPhone(e.target.value)} />
            <textarea placeholder="Special instructions (optional)" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>
          <Btn onClick={handleOrder} style={{ width: "100%", justifyContent: "center", display: "block", textAlign: "center" }}>Place Order</Btn>
        </>
      )}
    </Modal>
  );
};

// ─── CUSTOMER: RESERVE PAGE ─────────────────────────────────────────────────────
const ReservePage = ({ onReserve }) => {
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "", guests: "2", notes: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date || !form.time) return alert("Please fill all required fields.");
    onReserve({ ...form, status: "Confirmed", createdAt: new Date().toISOString() });
    setForm({ name: "", phone: "", date: "", time: "", guests: "2", notes: "" });
  };

  return (
    <div style={{ padding: "8rem 3rem 4rem", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <p style={{ fontSize: "0.75rem", letterSpacing: "0.4em", textTransform: "uppercase", color: "var(--ember)", marginBottom: "0.75rem" }}>Book a Table</p>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem,5vw,3rem)", color: "var(--cream)" }}>
          Your table is <em style={{ color: "var(--gold)" }}>waiting</em>
        </h2>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input placeholder="Your Name *" value={form.name} onChange={e => set("name", e.target.value)} />
        <input placeholder="Phone Number *" value={form.phone} onChange={e => set("phone", e.target.value)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <input type="date" value={form.date} onChange={e => set("date", e.target.value)} min={new Date().toISOString().split("T")[0]} />
          <input type="time" value={form.time} onChange={e => set("time", e.target.value)} />
        </div>
        <select value={form.guests} onChange={e => set("guests", e.target.value)}>
          {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>)}
        </select>
        <textarea placeholder="Any special requests?" value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} />
        <Btn type="submit" style={{ width: "100%", textAlign: "center", display: "block", marginTop: "0.5rem" }}>Confirm Reservation</Btn>
      </form>
    </div>
  );
};

// ─── ADMIN: LOGIN ───────────────────────────────────────────────────────────────
const AdminLogin = ({ onLogin }) => {
  const [pass, setPass] = useState(""); const [err, setErr] = useState(false);
  const handle = () => { if (pass === ADMIN_PASS) { onLogin(); } else { setErr(true); setTimeout(() => setErr(false), 2000); } };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--smoke)" }}>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "3rem", width: "100%", maxWidth: "380px", borderRadius: "4px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "2.5rem", color: "var(--ember)", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>FU<span style={{ color: "var(--gold)" }}>O</span>CO</div>
        <p style={{ color: "var(--ash)", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "2rem" }}>Admin Access</p>
        <input type="password" placeholder="Enter password" value={pass} onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handle()}
          style={{ marginBottom: "1rem", borderColor: err ? "var(--danger)" : undefined }} />
        {err && <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>Wrong password</p>}
        <Btn onClick={handle} style={{ width: "100%", display: "block", textAlign: "center" }}>Enter</Btn>
        <p style={{ marginTop: "1rem", color: "var(--ash)", fontSize: "0.75rem", fontStyle: "italic" }}>Password: fuoco2024</p>
      </div>
    </div>
  );
};

// ─── ADMIN: DASHBOARD ───────────────────────────────────────────────────────────
const AdminDash = ({ menu, setMenu, orders, setOrders, reservations, setReservations, onLogout, toast }) => {
  const [tab, setTab] = useState("orders");
  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: "", desc: "", price: "", tag: "", emoji: "🍕", available: true });
  const [showAdd, setShowAdd] = useState(false);

  const tabs = ["orders", "reservations", "menu"];
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const todayRes = reservations.filter(r => r.date === new Date().toISOString().split("T")[0]).length;

  const updateOrderStatus = async (idx, status) => {
    const updated = orders.map((o, i) => i === idx ? { ...o, status } : o);
    setOrders(updated); await DB.set("fuoco-orders", updated);
    toast("Order updated", "success");
  };

  const updateResStatus = async (idx, status) => {
    const updated = reservations.map((r, i) => i === idx ? { ...r, status } : r);
    setReservations(updated); await DB.set("fuoco-reservations", updated);
    toast("Reservation updated", "success");
  };

  const deleteMenuItem = async (id) => {
    if (!confirm("Delete this item?")) return;
    const updated = menu.filter(m => m.id !== id);
    setMenu(updated); await DB.set("fuoco-menu", updated);
    toast("Item deleted", "success");
  };

  const toggleAvailable = async (id) => {
    const updated = menu.map(m => m.id === id ? { ...m, available: !m.available } : m);
    setMenu(updated); await DB.set("fuoco-menu", updated);
  };

  const saveEdit = async () => {
    const updated = menu.map(m => m.id === editItem.id ? editItem : m);
    setMenu(updated); await DB.set("fuoco-menu", updated);
    setEditItem(null); toast("Item saved", "success");
  };

  const addItem = async () => {
    if (!newItem.name || !newItem.price) return alert("Name and price required.");
    const item = { ...newItem, id: "m" + Date.now(), price: Number(newItem.price), available: true };
    const updated = [...menu, item];
    setMenu(updated); await DB.set("fuoco-menu", updated);
    setNewItem({ name: "", desc: "", price: "", tag: "", emoji: "🍕", available: true });
    setShowAdd(false); toast("Item added!", "success");
  };

  const STATUS_COLORS = { Pending: "var(--ember)", Preparing: "var(--gold)", Ready: "var(--success)", Done: "var(--ash)", Confirmed: "var(--success)", Cancelled: "var(--danger)" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--smoke)" }}>
      {/* Admin Nav */}
      <div style={{ background: "var(--char)", borderBottom: "1px solid var(--border)", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.5rem", color: "var(--ember)", letterSpacing: "0.15em" }}>
          FU<span style={{ color: "var(--gold)" }}>O</span>CO <span style={{ color: "var(--ash)", fontSize: "0.9rem", fontFamily: "'Cormorant Garamond',serif", letterSpacing: "0.2em", textTransform: "uppercase" }}>Admin</span>
        </div>
        <Btn variant="ghost" onClick={onLogout} style={{ fontSize: "0.75rem", padding: "0.4rem 1rem" }}>Logout</Btn>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", maxWidth: "900px", margin: "2rem auto", padding: "0 2rem" }}>
        {[
          { label: "Total Orders", val: orders.length, sub: `${pendingOrders} pending`, color: "var(--ember)" },
          { label: "Reservations", val: reservations.length, sub: `${todayRes} today`, color: "var(--gold)" },
          { label: "Menu Items", val: menu.filter(m => m.available).length, sub: `${menu.length} total`, color: "var(--success)" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "1.5rem", borderRadius: "2px" }}>
            <div style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ash)", marginBottom: "0.5rem" }}>{s.label}</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "2.5rem", color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--ash)", marginTop: "0.3rem", fontStyle: "italic" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "2px", maxWidth: "900px", margin: "0 auto", padding: "0 2rem 1rem" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "0.6rem 1.5rem", fontSize: "0.8rem", letterSpacing: "0.15em",
            textTransform: "uppercase", fontFamily: "'Cormorant Garamond',serif",
            background: tab === t ? "var(--ember)" : "var(--card)",
            color: "var(--cream)", border: "1px solid var(--border)", borderRadius: "2px",
            transition: "background 0.2s"
          }}>{t}</button>
        ))}
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 2rem 4rem" }}>

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <div>
            {orders.length === 0 ? <p style={{ color: "var(--ash)", fontStyle: "italic", textAlign: "center", padding: "3rem" }}>No orders yet.</p> : (
              [...orders].reverse().map((o, ri) => {
                const idx = orders.length - 1 - ri;
                return (
                  <div key={idx} style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "1.5rem", marginBottom: "1px", borderRadius: "2px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <div>
                        <div style={{ color: "var(--cream)", fontFamily: "'Playfair Display',serif", fontSize: "1.1rem" }}>📦 {o.name} <span style={{ color: "var(--ash)", fontSize: "0.85rem", fontFamily: "'Cormorant Garamond',serif" }}>· {o.phone}</span></div>
                        <div style={{ color: "var(--ash)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{new Date(o.createdAt).toLocaleString()}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.3rem", color: "var(--gold)" }}>₹{o.total}</span>
                        <span style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: STATUS_COLORS[o.status] || "var(--ash)", border: `1px solid ${STATUS_COLORS[o.status] || "var(--border)"}`, padding: "0.2rem 0.5rem" }}>{o.status}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--ash)", marginBottom: "0.75rem", fontStyle: "italic" }}>
                      {o.items.map(i => `${i.emoji} ${i.name} ×${i.qty}`).join("  ·  ")}
                    </div>
                    {o.notes && <div style={{ fontSize: "0.82rem", color: "var(--ash)", marginBottom: "0.75rem" }}>📝 {o.notes}</div>}
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {["Pending", "Preparing", "Ready", "Done"].map(s => (
                        <button key={s} onClick={() => updateOrderStatus(idx, s)} style={{
                          padding: "0.3rem 0.75rem", fontSize: "0.7rem", letterSpacing: "0.12em",
                          textTransform: "uppercase", fontFamily: "'Cormorant Garamond',serif",
                          background: o.status === s ? STATUS_COLORS[s] : "transparent",
                          color: o.status === s ? "#fff" : "var(--ash)",
                          border: `1px solid ${o.status === s ? STATUS_COLORS[s] : "var(--border)"}`,
                          cursor: "pointer", borderRadius: "2px", transition: "all 0.2s"
                        }}>{s}</button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* RESERVATIONS TAB */}
        {tab === "reservations" && (
          <div>
            {reservations.length === 0 ? <p style={{ color: "var(--ash)", fontStyle: "italic", textAlign: "center", padding: "3rem" }}>No reservations yet.</p> : (
              [...reservations].reverse().map((r, ri) => {
                const idx = reservations.length - 1 - ri;
                return (
                  <div key={idx} style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "1.5rem", marginBottom: "1px", borderRadius: "2px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ color: "var(--cream)", fontFamily: "'Playfair Display',serif", fontSize: "1.1rem" }}>🪑 {r.name} <span style={{ color: "var(--ash)", fontSize: "0.85rem", fontFamily: "'Cormorant Garamond',serif" }}>· {r.phone}</span></div>
                        <div style={{ color: "var(--gold)", fontSize: "0.9rem", marginTop: "0.35rem", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.1em" }}>
                          {r.date} @ {r.time} · {r.guests} guest{r.guests > 1 ? "s" : ""}
                        </div>
                        {r.notes && <div style={{ color: "var(--ash)", fontSize: "0.82rem", marginTop: "0.25rem", fontStyle: "italic" }}>📝 {r.notes}</div>}
                        <div style={{ color: "var(--ash)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{new Date(r.createdAt).toLocaleString()}</div>
                      </div>
                      <span style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: STATUS_COLORS[r.status] || "var(--ash)", border: `1px solid ${STATUS_COLORS[r.status] || "var(--border)"}`, padding: "0.2rem 0.5rem" }}>{r.status}</span>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                      {["Confirmed", "Cancelled"].map(s => (
                        <button key={s} onClick={() => updateResStatus(idx, s)} style={{
                          padding: "0.3rem 0.75rem", fontSize: "0.7rem", letterSpacing: "0.12em",
                          textTransform: "uppercase", fontFamily: "'Cormorant Garamond',serif",
                          background: r.status === s ? STATUS_COLORS[s] : "transparent",
                          color: r.status === s ? "#fff" : "var(--ash)",
                          border: `1px solid ${r.status === s ? STATUS_COLORS[s] : "var(--border)"}`,
                          cursor: "pointer", borderRadius: "2px", transition: "all 0.2s"
                        }}>{s}</button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* MENU TAB */}
        {tab === "menu" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
              <Btn onClick={() => setShowAdd(true)} style={{ fontSize: "0.8rem" }}>+ Add Item</Btn>
            </div>
            {menu.map(item => (
              <div key={item.id} style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "1.25rem 1.5rem", marginBottom: "1px", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "2px", opacity: item.available ? 1 : 0.5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                  <span style={{ fontSize: "1.5rem" }}>{item.emoji}</span>
                  <div>
                    <div style={{ color: "var(--cream)", fontFamily: "'Playfair Display',serif" }}>{item.name}</div>
                    <div style={{ color: "var(--ash)", fontSize: "0.82rem", fontStyle: "italic" }}>{item.desc}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.3rem", color: "var(--gold)" }}>₹{item.price}</span>
                  <button onClick={() => toggleAvailable(item.id)} style={{
                    padding: "0.25rem 0.6rem", fontSize: "0.65rem", letterSpacing: "0.12em",
                    textTransform: "uppercase", fontFamily: "'Cormorant Garamond',serif",
                    background: item.available ? "rgba(46,204,113,0.15)" : "rgba(231,76,60,0.15)",
                    color: item.available ? "var(--success)" : "var(--danger)",
                    border: `1px solid ${item.available ? "var(--success)" : "var(--danger)"}`,
                    cursor: "pointer", borderRadius: "2px"
                  }}>{item.available ? "Live" : "Off"}</button>
                  <Btn variant="gold" onClick={() => setEditItem({ ...item })} style={{ padding: "0.3rem 0.7rem", fontSize: "0.7rem" }}>Edit</Btn>
                  <Btn variant="danger" onClick={() => deleteMenuItem(item.id)} style={{ padding: "0.3rem 0.7rem", fontSize: "0.7rem" }}>Del</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <Modal title="Edit Menu Item" onClose={() => setEditItem(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input placeholder="Emoji" value={editItem.emoji} onChange={e => setEditItem(p => ({ ...p, emoji: e.target.value }))} />
            <input placeholder="Name" value={editItem.name} onChange={e => setEditItem(p => ({ ...p, name: e.target.value }))} />
            <textarea placeholder="Description" value={editItem.desc} onChange={e => setEditItem(p => ({ ...p, desc: e.target.value }))} rows={2} />
            <input type="number" placeholder="Price (₹)" value={editItem.price} onChange={e => setEditItem(p => ({ ...p, price: Number(e.target.value) }))} />
            <input placeholder="Tag (e.g. Signature)" value={editItem.tag} onChange={e => setEditItem(p => ({ ...p, tag: e.target.value }))} />
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <Btn onClick={saveEdit}>Save Changes</Btn>
              <Btn variant="ghost" onClick={() => setEditItem(null)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Add Menu Item" onClose={() => setShowAdd(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input placeholder="Emoji" value={newItem.emoji} onChange={e => setNewItem(p => ({ ...p, emoji: e.target.value }))} />
            <input placeholder="Name *" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} />
            <textarea placeholder="Description" value={newItem.desc} onChange={e => setNewItem(p => ({ ...p, desc: e.target.value }))} rows={2} />
            <input type="number" placeholder="Price (₹) *" value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))} />
            <input placeholder="Tag (e.g. Classic)" value={newItem.tag} onChange={e => setNewItem(p => ({ ...p, tag: e.target.value }))} />
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <Btn onClick={addItem}>Add to Menu</Btn>
              <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── ROOT APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState("customer"); // "customer" | "admin"
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [view, setView] = useState("home");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);

  // Load DB
  useEffect(() => {
    (async () => {
      const m = await DB.get("fuoco-menu");
      const o = await DB.get("fuoco-orders");
      const r = await DB.get("fuoco-reservations");
      setMenu(m || SEED_MENU);
      setOrders(o || []);
      setReservations(r || []);
      if (!m) await DB.set("fuoco-menu", SEED_MENU);
      setLoading(false);
    })();
  }, []);

  const showToast = (msg, type = "success") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePlaceOrder = async (order) => {
    const updated = [...orders, order];
    setOrders(updated);
    await DB.set("fuoco-orders", updated);
    setCart([]);
    setShowCart(false);
    showToast("🔥 Order placed! We'll fire it up shortly.", "success");
    setView("home");
  };

  const handleReserve = async (res) => {
    const updated = [...reservations, res];
    setReservations(updated);
    await DB.set("fuoco-reservations", updated);
    showToast("🪑 Table reserved! See you soon.", "success");
    setView("home");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--char)" }}>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "3rem", color: "var(--ember)", letterSpacing: "0.2em", animation: "pulse 1.5s infinite" }}>
        FUOCO
      </div>
    </div>
  );

  return (
    <>
      <style>{G}</style>
      {toastMsg && <Toast msg={toastMsg.msg} type={toastMsg.type} />}

      {/* Mode toggle — floating */}
      <div style={{ position: "fixed", bottom: "1.5rem", left: "1.5rem", zIndex: 200, display: "flex", gap: "0.5rem" }}>
        <button onClick={() => { setMode("customer"); setAdminLoggedIn(false); }} style={{
          padding: "0.5rem 1rem", fontSize: "0.7rem", letterSpacing: "0.15em",
          textTransform: "uppercase", fontFamily: "'Cormorant Garamond',serif",
          background: mode === "customer" ? "var(--ember)" : "rgba(30,21,16,0.9)",
          color: "var(--cream)", border: "1px solid var(--border)", cursor: "pointer", borderRadius: "2px"
        }}>Customer</button>
        <button onClick={() => setMode("admin")} style={{
          padding: "0.5rem 1rem", fontSize: "0.7rem", letterSpacing: "0.15em",
          textTransform: "uppercase", fontFamily: "'Cormorant Garamond',serif",
          background: mode === "admin" ? "var(--ember)" : "rgba(30,21,16,0.9)",
          color: "var(--cream)", border: "1px solid var(--border)", cursor: "pointer", borderRadius: "2px"
        }}>Admin</button>
      </div>

      {mode === "admin" ? (
        adminLoggedIn
          ? <AdminDash menu={menu} setMenu={setMenu} orders={orders} setOrders={setOrders} reservations={reservations} setReservations={setReservations} onLogout={() => setAdminLoggedIn(false)} toast={showToast} />
          : <AdminLogin onLogin={() => setAdminLoggedIn(true)} />
      ) : (
        <div>
          <Nav setView={setView} cart={cart} setShowCart={setShowCart} />
          {view === "home" && <Hero setView={setView} />}
          {view === "menu" && <MenuPage menu={menu} cart={cart} setCart={setCart} />}
          {view === "reserve" && <ReservePage onReserve={handleReserve} />}
          {showCart && <Cart cart={cart} setCart={setCart} onClose={() => setShowCart(false)} onPlaceOrder={handlePlaceOrder} />}
        </div>
      )}
    </>
  );
}

import { useState, useEffect } from "react";

// ─── STORAGE ────────────────────────────────────────────────────────────────────
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

// ─── REAL PIZZA IMAGES ──────────────────────────────────────────────────────────
const IMGS = {
  hero: "https://images.forno-bravo.com/wp-content/uploads/2021/04/Neapolitan-Style-Dough-and-Margherita-Pizza-1.jpg",
  oven: "https://c8.alamy.com/comp/2AJXJTK/hot-flames-in-pizza-oven-traditional-firewood-stone-wood-fired-pizza-2AJXJTK.jpg",
  margherita: "https://images.forno-bravo.com/wp-content/uploads/2021/04/Neapolitan-Style-Dough-and-Margherita-Pizza-1.jpg",
  diavola: "https://www.italianrecipebook.com/wp-content/uploads/2022/09/pizza-diavola-1.jpg",
  truffle: "https://urbanbakes.com/wp-content/uploads/2022/02/IMG_9268.jpg",
  restaurant: "https://www.proovepizza.co.uk/wp-content/uploads/2019/09/proove-pizza-restaurant-inside-1.jpg",
};

// ─── SEED MENU ──────────────────────────────────────────────────────────────────
const SEED_MENU = [
  { id:"m1", name:"Margherita Vera", desc:"San Marzano tomato, fior di latte mozzarella, fresh basil, extra virgin olive oil", price:499, tag:"Classic", emoji:"🍕", img: IMGS.margherita, available:true },
  { id:"m2", name:"Diavola", desc:"Spicy Calabrian salami, smoked mozzarella, chilli oil, wild oregano", price:649, tag:"Chef's Pick", emoji:"🌶️", img: IMGS.diavola, available:true },
  { id:"m3", name:"Bianca Foresta", desc:"Truffle cream, wild mushrooms, taleggio, rosemary, walnut crumble", price:749, tag:"Signature", emoji:"🫒", img: IMGS.truffle, available:true },
  { id:"m4", name:"Carbonara", desc:"Guanciale, pecorino romano, slow-cooked egg yolk cream, cracked black pepper", price:699, tag:"Fan Favourite", emoji:"🥓", img: IMGS.margherita, available:true },
  { id:"m5", name:"Verde", desc:"Pistachio pesto, buffalo ricotta, roasted zucchini, lemon zest, pine nuts", price:599, tag:"Veg", emoji:"🥬", img: IMGS.truffle, available:true },
  { id:"m6", name:"Il Fuoco", desc:"Ghost pepper oil, nduja sausage, smoked scamorza, wild honey drizzle", price:849, tag:"House Special", emoji:"🔥", img: IMGS.diavola, available:true },
  { id:"m7", name:"Quattro Formaggi", desc:"Mozzarella, gorgonzola, fontina, pecorino, black truffle honey", price:729, tag:"Cheese Lover", emoji:"🧀", img: IMGS.margherita, available:true },
  { id:"m8", name:"Prosciutto e Fichi", desc:"Prosciutto crudo, fresh figs, gorgonzola cream, rocket, balsamic glaze", price:799, tag:"Seasonal", emoji:"🍖", img: IMGS.diavola, available:true },
  { id:"m9", name:"Marinara Antica", desc:"San Marzano tomato, garlic, oregano, capers, no cheese — pure Naples", price:449, tag:"Vegan", emoji:"🍅", img: IMGS.margherita, available:true },
  { id:"m10", name:"Salmone Affumicato", desc:"Smoked salmon, crème fraîche, capers, dill, red onion, lemon zest", price:879, tag:"Premium", emoji:"🐟", img: IMGS.truffle, available:true },
  { id:"m11", name:"Burrata Bomber", desc:"Cherry tomatoes, whole fresh burrata, basil oil, sea salt, toasted pine nuts", price:769, tag:"Fresh", emoji:"🌿", img: IMGS.margherita, available:true },
  { id:"m12", name:"BBQ Pollo", desc:"Smoked chicken, caramelised onions, house BBQ sauce, mozzarella, jalapeños", price:679, tag:"Popular", emoji:"🍗", img: IMGS.diavola, available:true },
];

const ADMIN_PASS = "fuoco2024";

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────────
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
  input,textarea,select {
    background:rgba(255,255,255,0.04); border:1px solid var(--border);
    color:var(--cream); padding:0.75rem 1rem; font-family:'Cormorant Garamond',serif;
    font-size:1rem; width:100%; outline:none; transition:border-color 0.3s; border-radius:2px;
  }
  input:focus,textarea:focus,select:focus { border-color:var(--ember); }
  select option { background:var(--smoke); }
  button { cursor:pointer; border:none; font-family:'Cormorant Garamond',serif; }
  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:var(--smoke); }
  ::-webkit-scrollbar-thumb { background:var(--ember); }
  @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  @keyframes flicker { 0%{opacity:.7;transform:translateX(-50%) scaleX(1)} 33%{opacity:1;transform:translateX(-48%) scaleX(1.1)} 66%{opacity:.8;transform:translateX(-52%) scaleX(.95)} 100%{opacity:.9;transform:translateX(-50%) scaleX(1.05)} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .fade-up { animation: fadeUp 0.8s cubic-bezier(.22,1,.36,1) both; }
  .delay-1 { animation-delay: 0.15s; }
  .delay-2 { animation-delay: 0.3s; }
  .delay-3 { animation-delay: 0.45s; }
  .delay-4 { animation-delay: 0.6s; }
`;

// ─── TINY COMPONENTS ────────────────────────────────────────────────────────────
const Badge = ({ children, color="ember" }) => (
  <span style={{ fontSize:"0.62rem", letterSpacing:"0.18em", textTransform:"uppercase", border:`1px solid var(--${color})`, color:`var(--${color})`, padding:"0.2rem 0.55rem", borderRadius:"2px", whiteSpace:"nowrap" }}>{children}</span>
);

const Btn = ({ children, onClick, variant="primary", style={}, type="button", disabled=false }) => {
  const s = {
    primary: { background:"var(--ember)", color:"var(--cream)", padding:"0.75rem 2rem", fontSize:"0.82rem", letterSpacing:"0.15em", textTransform:"uppercase", borderRadius:"2px", transition:"background 0.3s,transform 0.2s" },
    ghost:   { background:"transparent", color:"var(--cream)", padding:"0.75rem 2rem", fontSize:"0.82rem", letterSpacing:"0.15em", textTransform:"uppercase", border:"1px solid rgba(245,237,224,0.3)", borderRadius:"2px", transition:"border-color 0.3s,color 0.3s" },
    danger:  { background:"var(--danger)", color:"#fff", padding:"0.45rem 1rem", fontSize:"0.75rem", letterSpacing:"0.1em", textTransform:"uppercase", borderRadius:"2px" },
    success: { background:"var(--success)", color:"#fff", padding:"0.45rem 1rem", fontSize:"0.75rem", letterSpacing:"0.1em", textTransform:"uppercase", borderRadius:"2px" },
    gold:    { background:"var(--gold)", color:"var(--char)", padding:"0.45rem 1rem", fontSize:"0.75rem", letterSpacing:"0.1em", textTransform:"uppercase", borderRadius:"2px", fontWeight:"bold" },
  };
  return <button type={type} onClick={onClick} disabled={disabled} style={{ ...s[variant], opacity:disabled?0.5:1, ...style }}>{children}</button>;
};

const Modal = ({ title, onClose, children }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
    <div style={{ background:"var(--smoke)", border:"1px solid var(--border)", padding:"2rem", width:"100%", maxWidth:"520px", maxHeight:"88vh", overflowY:"auto", borderRadius:"4px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.4rem", color:"var(--cream)" }}>{title}</h3>
        <button onClick={onClose} style={{ background:"none", color:"var(--ash)", fontSize:"1.5rem", cursor:"pointer", lineHeight:1 }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

const Toast = ({ msg, type }) => (
  <div style={{ position:"fixed", bottom:"2rem", right:"2rem", zIndex:9999, background:type==="success"?"var(--success)":"var(--danger)", color:"#fff", padding:"1rem 1.5rem", borderRadius:"4px", fontSize:"0.9rem", fontFamily:"'Cormorant Garamond',serif", boxShadow:"0 4px 20px rgba(0,0,0,0.5)", letterSpacing:"0.05em" }}>{msg}</div>
);

// ─── NAV ────────────────────────────────────────────────────────────────────────
const Nav = ({ setView, cart, setShowCart }) => (
  <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.2rem 3rem", background:"linear-gradient(to bottom,rgba(13,9,5,0.97),transparent)", backdropFilter:"blur(4px)" }}>
    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.9rem", letterSpacing:"0.15em", color:"var(--ember)", cursor:"pointer" }} onClick={() => setView("home")}>
      FU<span style={{ color:"var(--gold)" }}>O</span>CO
    </div>
    <div style={{ display:"flex", gap:"1.5rem", alignItems:"center" }}>
      {[["menu","Menu"],["reserve","Reserve"],["about","Our Story"]].map(([v,l]) => (
        <button key={v} onClick={() => setView(v)} style={{ background:"none", color:"var(--cream)", fontSize:"0.78rem", letterSpacing:"0.2em", textTransform:"uppercase", opacity:0.75, fontFamily:"'Cormorant Garamond',serif", transition:"opacity 0.3s" }}>{l}</button>
      ))}
      <button onClick={() => setShowCart(true)} style={{ background:"var(--ember)", color:"var(--cream)", padding:"0.55rem 1.2rem", fontSize:"0.78rem", letterSpacing:"0.15em", textTransform:"uppercase", fontFamily:"'Cormorant Garamond',serif", borderRadius:"2px" }}>
        🛒 Cart {cart.length>0 && <span style={{ background:"var(--gold)", color:"var(--char)", borderRadius:"50%", padding:"0 5px", marginLeft:"4px", fontSize:"0.68rem", fontWeight:"bold" }}>{cart.reduce((s,i)=>s+i.qty,0)}</span>}
      </button>
    </div>
  </nav>
);

// ─── HERO ────────────────────────────────────────────────────────────────────────
const Hero = ({ setView }) => (
  <section style={{ position:"relative", height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
    {/* BG image */}
    <div style={{ position:"absolute", inset:0, backgroundImage:`url(${IMGS.hero})`, backgroundSize:"cover", backgroundPosition:"center", filter:"brightness(0.22)" }} />
    {/* Flame glow */}
    <div style={{ position:"absolute", bottom:0, left:"50%", width:"400px", height:"500px", transform:"translateX(-50%)", background:"radial-gradient(ellipse at 50% 100%,rgba(201,74,26,0.55) 0%,rgba(212,168,50,0.15) 40%,transparent 70%)", filter:"blur(50px)", animation:"flicker 3s ease-in-out infinite alternate" }} />
    <div style={{ position:"relative", textAlign:"center", zIndex:2, padding:"0 2rem" }}>
      <p className="fade-up" style={{ fontSize:"0.72rem", letterSpacing:"0.45em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"1.5rem" }}>Artisan Wood-Fired Pizza · Est. 2019</p>
      <h1 className="fade-up delay-1" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(4.5rem,13vw,11rem)", fontWeight:900, lineHeight:0.88, color:"var(--cream)" }}>
        Born from<br/><em style={{ fontStyle:"italic", color:"var(--ember)" }}>Fire</em>
      </h1>
      <p className="fade-up delay-2" style={{ fontSize:"1.15rem", fontStyle:"italic", color:"var(--ash)", marginTop:"1.8rem", letterSpacing:"0.04em" }}>
        Neapolitan tradition. Obsessive craft. Every pizza, a performance.
      </p>
      <div className="fade-up delay-3" style={{ marginTop:"2.8rem", display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
        <Btn onClick={() => setView("menu")}>Order Now</Btn>
        <Btn variant="ghost" onClick={() => setView("reserve")}>Reserve Table</Btn>
      </div>
    </div>
    {/* Scroll */}
    <div style={{ position:"absolute", bottom:"2rem", left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:"0.5rem", color:"var(--ash)", fontSize:"0.65rem", letterSpacing:"0.3em", textTransform:"uppercase", opacity:0.6 }}>
      <div style={{ width:"1px", height:"48px", background:"linear-gradient(to bottom,var(--ash),transparent)" }} />
      scroll
    </div>
  </section>
);

// ─── STATS BAR ───────────────────────────────────────────────────────────────────
const StatsBar = () => (
  <div style={{ background:"var(--smoke)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", padding:"2.5rem 3rem", display:"flex", justifyContent:"center", gap:"4rem", flexWrap:"wrap" }}>
    {[["900°F","Oven Temperature"],["48 hrs","Dough Fermentation"],["90 sec","Perfect Cook Time"],["2019","Est. in Pune"]].map(([n,l]) => (
      <div key={l} style={{ textAlign:"center" }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"2.8rem", color:"var(--ember)", lineHeight:1 }}>{n}</div>
        <div style={{ fontSize:"0.7rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"var(--ash)", marginTop:"0.35rem" }}>{l}</div>
      </div>
    ))}
  </div>
);

// ─── FEATURED GALLERY ─────────────────────────────────────────────────────────────
const Gallery = ({ setView }) => (
  <section style={{ padding:"7rem 3rem", maxWidth:"1200px", margin:"0 auto" }}>
    <div style={{ textAlign:"center", marginBottom:"4rem" }}>
      <p style={{ fontSize:"0.72rem", letterSpacing:"0.4em", textTransform:"uppercase", color:"var(--ember)", marginBottom:"0.75rem" }}>Straight from the Stone</p>
      <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:700, color:"var(--cream)" }}>
        Every pie, a <em style={{ color:"var(--gold)" }}>masterpiece</em>
      </h2>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gridTemplateRows:"300px 300px", gap:"4px" }}>
      <div style={{ gridRow:"1 / 3", backgroundImage:`url(${IMGS.hero})`, backgroundSize:"cover", backgroundPosition:"center", borderRadius:"2px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(13,9,5,0.7),transparent)" }} />
        <div style={{ position:"absolute", bottom:"1.5rem", left:"1.5rem" }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", color:"var(--cream)", fontWeight:700 }}>Margherita Vera</div>
          <div style={{ color:"var(--gold)", fontSize:"0.8rem", letterSpacing:"0.15em", textTransform:"uppercase" }}>The Classic</div>
        </div>
      </div>
      <div style={{ backgroundImage:`url(${IMGS.oven})`, backgroundSize:"cover", backgroundPosition:"center", borderRadius:"2px" }} />
      <div style={{ backgroundImage:`url(${IMGS.diavola})`, backgroundSize:"cover", backgroundPosition:"center", borderRadius:"2px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(13,9,5,0.7),transparent)" }} />
        <div style={{ position:"absolute", bottom:"1rem", left:"1rem" }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", color:"var(--cream)" }}>Diavola</div>
        </div>
      </div>
      <div style={{ backgroundImage:`url(${IMGS.truffle})`, backgroundSize:"cover", backgroundPosition:"center", borderRadius:"2px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(13,9,5,0.7),transparent)" }} />
        <div style={{ position:"absolute", bottom:"1rem", left:"1rem" }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", color:"var(--cream)" }}>Bianca Foresta</div>
        </div>
      </div>
      <div style={{ backgroundImage:`url(${IMGS.restaurant})`, backgroundSize:"cover", backgroundPosition:"center", borderRadius:"2px" }} />
    </div>
    <div style={{ textAlign:"center", marginTop:"3rem" }}>
      <Btn onClick={() => setView("menu")}>See Full Menu</Btn>
    </div>
  </section>
);

// ─── MENU PAGE ───────────────────────────────────────────────────────────────────
const MenuPage = ({ menu, cart, setCart }) => {
  const [filter, setFilter] = useState("All");
  const tags = ["All", ...Array.from(new Set(menu.map(m => m.tag)))];
  const visible = menu.filter(m => m.available && (filter === "All" || m.tag === filter));

  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty:c.qty+1 } : c);
      return [...prev, { ...item, qty:1 }];
    });
  };

  return (
    <div style={{ padding:"8rem 3rem 5rem", maxWidth:"1200px", margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:"3rem" }}>
        <p style={{ fontSize:"0.72rem", letterSpacing:"0.4em", textTransform:"uppercase", color:"var(--ember)", marginBottom:"0.75rem" }}>The Craft</p>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:700, color:"var(--cream)", marginBottom:"2rem" }}>
          Fired with <em style={{ color:"var(--gold)" }}>Purpose</em>
        </h2>
        {/* Filter tabs */}
        <div style={{ display:"flex", gap:"0.5rem", justifyContent:"center", flexWrap:"wrap" }}>
          {tags.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding:"0.4rem 1.1rem", fontSize:"0.72rem", letterSpacing:"0.15em", textTransform:"uppercase",
              fontFamily:"'Cormorant Garamond',serif", borderRadius:"2px", transition:"all 0.2s",
              background:filter===t?"var(--ember)":"transparent",
              color:filter===t?"var(--cream)":"var(--ash)",
              border:`1px solid ${filter===t?"var(--ember)":"var(--border)"}`
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:"1px" }}>
        {visible.map(item => (
          <div key={item.id} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"2px", overflow:"hidden", transition:"transform 0.3s,border-color 0.3s" }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.borderColor="rgba(201,74,26,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.borderColor="var(--border)"; }}>
            {/* Pizza image */}
            <div style={{ height:"200px", backgroundImage:`url(${item.img})`, backgroundSize:"cover", backgroundPosition:"center", position:"relative" }}>
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(30,21,16,0.85) 0%,transparent 60%)" }} />
              <div style={{ position:"absolute", top:"1rem", right:"1rem" }}><Badge>{item.tag}</Badge></div>
              <div style={{ position:"absolute", bottom:"1rem", left:"1rem", fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.8rem", color:"var(--gold)", letterSpacing:"0.05em" }}>₹{item.price}</div>
            </div>
            <div style={{ padding:"1.5rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.5rem" }}>
                <span style={{ fontSize:"1.3rem" }}>{item.emoji}</span>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", fontWeight:700, color:"var(--cream)" }}>{item.name}</div>
              </div>
              <p style={{ fontSize:"0.88rem", fontStyle:"italic", color:"var(--ash)", lineHeight:1.65, marginBottom:"1.25rem" }}>{item.desc}</p>
              <Btn onClick={() => addToCart(item)} style={{ width:"100%", textAlign:"center", display:"block" }}>Add to Cart</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── ABOUT PAGE ──────────────────────────────────────────────────────────────────
const AboutPage = () => (
  <div style={{ paddingTop:"6rem" }}>
    {/* Hero image */}
    <div style={{ height:"55vh", backgroundImage:`url(${IMGS.restaurant})`, backgroundSize:"cover", backgroundPosition:"center", position:"relative" }}>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(13,9,5,0.4),rgba(13,9,5,0.85))" }} />
      <div style={{ position:"absolute", bottom:"3rem", left:"3rem" }}>
        <p style={{ fontSize:"0.72rem", letterSpacing:"0.4em", textTransform:"uppercase", color:"var(--ember)", marginBottom:"0.5rem" }}>Our Philosophy</p>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2.5rem,6vw,5rem)", fontWeight:900, color:"var(--cream)", lineHeight:1.1 }}>
          Slow dough.<br/><em style={{ color:"var(--gold)" }}>Raging fire.</em>
        </h2>
      </div>
    </div>

    {/* Story */}
    <div style={{ maxWidth:"800px", margin:"0 auto", padding:"5rem 3rem" }}>
      <p style={{ fontSize:"1.2rem", lineHeight:1.9, color:"var(--ash)", marginBottom:"2rem" }}>
        Every pizza at Fuoco begins 48 hours before you taste it. Our dough cold-ferments for two days, developing the complex flavour that fast food can never replicate. We use <span style={{ color:"var(--cream)" }}>Tipo 00 flour</span> imported from Mulino Caputo in Naples — the same mill that has supplied pizzerias for over a century.
      </p>
      <p style={{ fontSize:"1.2rem", lineHeight:1.9, color:"var(--ash)", marginBottom:"4rem" }}>
        We cook at <span style={{ color:"var(--ember)" }}>900°F</span> in a hand-built stone oven fuelled by sustainably sourced oak wood. Ninety seconds. That's all it takes — when the heat is honest and the ingredients are real. No shortcuts. No gas ovens. No compromises.
      </p>

      {/* Oven image */}
      <div style={{ height:"400px", backgroundImage:`url(${IMGS.oven})`, backgroundSize:"cover", backgroundPosition:"center", borderRadius:"2px", marginBottom:"5rem" }} />

      {/* Features */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"3rem", marginBottom:"6rem" }}>
        {[
          ["🪵","Oak Wood Only","Sustainably sourced oak for clean, even heat that never imparts bitterness."],
          ["🌾","Tipo 00 Flour","Imported from Mulino Caputo, Naples. The same flour used for over a century."],
          ["🇮🇹","True Neapolitan","Our process follows AVPN's original standards. No gas. No shortcuts."],
          ["🥂","Natural Wine List","Biodynamic wines curated to complement the char, not fight it."],
          ["🧂","Imported Ingredients","San Marzano tomatoes, buffalo mozzarella, nduja — flown in fresh."],
          ["♨️","Stone Oven","Hand-built by Neapolitan craftsmen, the heart of everything we do."],
        ].map(([icon,title,desc]) => (
          <div key={title}>
            <div style={{ fontSize:"2rem", marginBottom:"0.75rem" }}>{icon}</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.15rem", color:"var(--cream)", marginBottom:"0.5rem" }}>{title}</div>
            <div style={{ fontSize:"0.92rem", fontStyle:"italic", color:"var(--ash)", lineHeight:1.7 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* ── FOUNDER SECTION ── */}
      <div style={{ borderTop:"1px solid var(--border)", paddingTop:"4rem", textAlign:"center" }}>
        <p style={{ fontSize:"0.72rem", letterSpacing:"0.4em", textTransform:"uppercase", color:"var(--ember)", marginBottom:"1.5rem" }}>The Founder</p>
        {/* Avatar initials */}
        <div style={{ width:"100px", height:"100px", borderRadius:"50%", background:"linear-gradient(135deg,var(--ember),var(--gold))", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.5rem", border:"3px solid var(--gold)" }}>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"2.5rem", color:"var(--char)", letterSpacing:"0.05em" }}>AV</span>
        </div>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"2rem", fontStyle:"italic", color:"var(--cream)", marginBottom:"0.5rem" }}>Avishkar</h3>
        <p style={{ fontSize:"0.75rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"2rem" }}>Founder & Head Pizzaiolo</p>
        <blockquote style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.35rem", fontStyle:"italic", lineHeight:1.6, color:"var(--cream)", maxWidth:"600px", margin:"0 auto", position:"relative" }}>
          <span style={{ position:"absolute", top:"-2rem", left:"-1rem", fontSize:"6rem", color:"var(--ember)", opacity:0.15, fontFamily:"'Playfair Display',serif", lineHeight:1 }}>"</span>
          I didn't open a pizza shop. I built an obsession — and invited Pune to taste it.
        </blockquote>
        <div style={{ marginTop:"2rem", width:"60px", height:"2px", background:"linear-gradient(to right,var(--ember),var(--gold))", margin:"2rem auto 0" }} />
      </div>
    </div>
  </div>
);

// ─── RESERVE PAGE ────────────────────────────────────────────────────────────────
const ReservePage = ({ onReserve }) => {
  const [form, setForm] = useState({ name:"", phone:"", date:"", time:"", guests:"2", notes:"" });
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));
  const handle = (e) => {
    e.preventDefault();
    if (!form.name||!form.phone||!form.date||!form.time) return alert("Please fill all required fields.");
    onReserve({ ...form, status:"Confirmed", createdAt:new Date().toISOString() });
    setForm({ name:"", phone:"", date:"", time:"", guests:"2", notes:"" });
  };
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"8rem 2rem 4rem" }}>
      <div style={{ width:"100%", maxWidth:"560px" }}>
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <p style={{ fontSize:"0.72rem", letterSpacing:"0.4em", textTransform:"uppercase", color:"var(--ember)", marginBottom:"0.75rem" }}>Book a Table</p>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,5vw,3rem)", color:"var(--cream)" }}>
            Your table is <em style={{ color:"var(--gold)" }}>waiting</em>
          </h2>
        </div>
        <form onSubmit={handle} style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          <input placeholder="Your Name *" value={form.name} onChange={e=>set("name",e.target.value)} />
          <input placeholder="Phone Number *" value={form.phone} onChange={e=>set("phone",e.target.value)} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
            <input type="date" value={form.date} onChange={e=>set("date",e.target.value)} min={new Date().toISOString().split("T")[0]} />
            <input type="time" value={form.time} onChange={e=>set("time",e.target.value)} />
          </div>
          <select value={form.guests} onChange={e=>set("guests",e.target.value)}>
            {[1,2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n} Guest{n>1?"s":""}</option>)}
          </select>
          <textarea placeholder="Special requests?" value={form.notes} onChange={e=>set("notes",e.target.value)} rows={3} />
          <Btn type="submit" style={{ width:"100%", textAlign:"center", display:"block", marginTop:"0.5rem", padding:"1rem" }}>Confirm Reservation</Btn>
        </form>
        <p style={{ textAlign:"center", marginTop:"2rem", color:"var(--ash)", fontSize:"0.82rem", fontStyle:"italic" }}>
          📍 FC Road, Pune · Open Daily 12PM–11PM · +91 98765 43210
        </p>
      </div>
    </div>
  );
};

// ─── CART ────────────────────────────────────────────────────────────────────────
const Cart = ({ cart, setCart, onClose, onPlaceOrder }) => {
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const [name,setName]=useState(""); const [phone,setPhone]=useState(""); const [notes,setNotes]=useState("");
  const upd = (id,d) => setCart(p=>p.map(i=>i.id===id?{...i,qty:Math.max(0,i.qty+d)}:i).filter(i=>i.qty>0));
  const handle = () => {
    if (!name.trim()||!phone.trim()) return alert("Name and phone required.");
    onPlaceOrder({ name, phone, notes, items:cart, total, status:"Pending", createdAt:new Date().toISOString() });
  };
  return (
    <Modal title="Your Order" onClose={onClose}>
      {cart.length===0 ? <p style={{ color:"var(--ash)", fontStyle:"italic", textAlign:"center", padding:"2rem" }}>Cart is empty.</p> : (
        <>
          {cart.map(item=>(
            <div key={item.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.8rem 0", borderBottom:"1px solid var(--border)" }}>
              <div>
                <div style={{ color:"var(--cream)", fontSize:"0.95rem" }}>{item.emoji} {item.name}</div>
                <div style={{ color:"var(--ash)", fontSize:"0.78rem" }}>₹{item.price} each</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
                <button onClick={()=>upd(item.id,-1)} style={{ background:"rgba(255,255,255,0.08)", color:"var(--cream)", width:"28px", height:"28px", borderRadius:"2px" }}>−</button>
                <span style={{ color:"var(--gold)", fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.2rem", minWidth:"18px", textAlign:"center" }}>{item.qty}</span>
                <button onClick={()=>upd(item.id,1)} style={{ background:"var(--ember)", color:"var(--cream)", width:"28px", height:"28px", borderRadius:"2px" }}>+</button>
              </div>
            </div>
          ))}
          <div style={{ display:"flex", justifyContent:"space-between", padding:"1rem 0", marginBottom:"1rem" }}>
            <span style={{ color:"var(--ash)", textTransform:"uppercase", letterSpacing:"0.15em", fontSize:"0.78rem" }}>Total</span>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"2rem", color:"var(--gold)" }}>₹{total}</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem", marginBottom:"1.25rem" }}>
            <input placeholder="Your Name *" value={name} onChange={e=>setName(e.target.value)} />
            <input placeholder="Phone *" value={phone} onChange={e=>setPhone(e.target.value)} />
            <textarea placeholder="Special instructions" value={notes} onChange={e=>setNotes(e.target.value)} rows={2} />
          </div>
          <Btn onClick={handle} style={{ width:"100%", display:"block", textAlign:"center", padding:"1rem" }}>🔥 Place Order</Btn>
        </>
      )}
    </Modal>
  );
};

// ─── FOOTER ──────────────────────────────────────────────────────────────────────
const Footer = ({ setView }) => (
  <footer style={{ background:"var(--smoke)", borderTop:"1px solid var(--border)", padding:"4rem 3rem 2rem" }}>
    <div style={{ maxWidth:"1100px", margin:"0 auto", display:"grid", gridTemplateColumns:"1.5fr 1fr 1fr", gap:"3rem", marginBottom:"3rem" }}>
      <div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"2.2rem", color:"var(--ember)", letterSpacing:"0.15em", marginBottom:"0.5rem" }}>FU<span style={{ color:"var(--gold)" }}>O</span>CO</div>
        <p style={{ color:"var(--ash)", fontSize:"0.92rem", fontStyle:"italic", lineHeight:1.7, maxWidth:"280px" }}>Born from fire. Built on obsession. Fuoco is Pune's most committed wood-fired pizza experience.</p>
        <p style={{ color:"var(--ash)", fontSize:"0.78rem", marginTop:"1rem", letterSpacing:"0.1em" }}>Founded by <span style={{ color:"var(--gold)" }}>Avishkar</span></p>
      </div>
      <div>
        <p style={{ fontSize:"0.7rem", letterSpacing:"0.25em", textTransform:"uppercase", color:"var(--ember)", marginBottom:"1.2rem" }}>Navigate</p>
        {[["home","Home"],["menu","Menu"],["about","Our Story"],["reserve","Reserve"]].map(([v,l])=>(
          <div key={v} style={{ marginBottom:"0.6rem" }}>
            <button onClick={()=>setView(v)} style={{ background:"none", color:"var(--ash)", fontSize:"0.88rem", letterSpacing:"0.1em", fontFamily:"'Cormorant Garamond',serif", transition:"color 0.3s" }}
              onMouseEnter={e=>e.target.style.color="var(--gold)"} onMouseLeave={e=>e.target.style.color="var(--ash)"}>{l}</button>
          </div>
        ))}
      </div>
      <div>
        <p style={{ fontSize:"0.7rem", letterSpacing:"0.25em", textTransform:"uppercase", color:"var(--ember)", marginBottom:"1.2rem" }}>Find Us</p>
        {["📍 FC Road, Pune, Maharashtra","📞 +91 98765 43210","✉️ hello@fuoco.in","🕐 Daily · 12PM – 11PM"].map(t=>(
          <p key={t} style={{ color:"var(--ash)", fontSize:"0.88rem", fontStyle:"italic", lineHeight:2 }}>{t}</p>
        ))}
      </div>
    </div>
    <div style={{ borderTop:"1px solid rgba(138,122,106,0.15)", paddingTop:"1.5rem", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"1rem" }}>
      <p style={{ color:"rgba(138,122,106,0.4)", fontSize:"0.72rem", letterSpacing:"0.15em", textTransform:"uppercase" }}>© 2026 Fuoco Artisan Pizza · All rights reserved</p>
      <p style={{ color:"rgba(138,122,106,0.4)", fontSize:"0.72rem", letterSpacing:"0.12em", textTransform:"uppercase" }}>Founded by <span style={{ color:"var(--gold)", opacity:0.7 }}>Avishkar</span> · Crafted with 🔥</p>
    </div>
  </footer>
);

// ─── ADMIN LOGIN ─────────────────────────────────────────────────────────────────
const AdminLogin = ({ onLogin }) => {
  const [pass,setPass]=useState(""); const [err,setErr]=useState(false);
  const handle = () => { if(pass===ADMIN_PASS){onLogin();}else{setErr(true);setTimeout(()=>setErr(false),2000);} };
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--smoke)" }}>
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", padding:"3rem", width:"100%", maxWidth:"360px", borderRadius:"4px", textAlign:"center" }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"2.5rem", color:"var(--ember)", letterSpacing:"0.15em", marginBottom:"0.25rem" }}>FU<span style={{ color:"var(--gold)" }}>O</span>CO</div>
        <p style={{ color:"var(--ash)", fontSize:"0.75rem", letterSpacing:"0.25em", textTransform:"uppercase", marginBottom:"2rem" }}>Admin Panel</p>
        <input type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} style={{ marginBottom:"0.75rem", borderColor:err?"var(--danger)":undefined }} />
        {err && <p style={{ color:"var(--danger)", fontSize:"0.82rem", marginBottom:"0.5rem" }}>Wrong password</p>}
        <Btn onClick={handle} style={{ width:"100%", display:"block", textAlign:"center" }}>Enter</Btn>
        <p style={{ marginTop:"1rem", color:"var(--ash)", fontSize:"0.72rem", fontStyle:"italic" }}>Hint: fuoco2024</p>
      </div>
    </div>
  );
};

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────────
const AdminDash = ({ menu,setMenu,orders,setOrders,reservations,setReservations,onLogout,toast }) => {
  const [tab,setTab]=useState("orders");
  const [editItem,setEditItem]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [newItem,setNewItem]=useState({ name:"",desc:"",price:"",tag:"",emoji:"🍕",img:"",available:true });

  const SC = { Pending:"var(--ember)",Preparing:"var(--gold)",Ready:"var(--success)",Done:"var(--ash)",Confirmed:"var(--success)",Cancelled:"var(--danger)" };

  const updOrder = async (idx,status) => { const u=orders.map((o,i)=>i===idx?{...o,status}:o); setOrders(u); await DB.set("fuoco-orders",u); toast("Updated","success"); };
  const updRes   = async (idx,status) => { const u=reservations.map((r,i)=>i===idx?{...r,status}:r); setReservations(u); await DB.set("fuoco-reservations",u); toast("Updated","success"); };
  const delMenu  = async (id) => { if(!confirm("Delete?")) return; const u=menu.filter(m=>m.id!==id); setMenu(u); await DB.set("fuoco-menu",u); toast("Deleted","success"); };
  const togAvail = async (id) => { const u=menu.map(m=>m.id===id?{...m,available:!m.available}:m); setMenu(u); await DB.set("fuoco-menu",u); };
  const saveEdit = async () => { const u=menu.map(m=>m.id===editItem.id?editItem:m); setMenu(u); await DB.set("fuoco-menu",u); setEditItem(null); toast("Saved","success"); };
  const addItem  = async () => {
    if(!newItem.name||!newItem.price) return alert("Name & price required.");
    const item={ ...newItem, id:"m"+Date.now(), price:Number(newItem.price), img:newItem.img||IMGS.margherita, available:true };
    const u=[...menu,item]; setMenu(u); await DB.set("fuoco-menu",u);
    setNewItem({ name:"",desc:"",price:"",tag:"",emoji:"🍕",img:"",available:true }); setShowAdd(false); toast("Added!","success");
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--smoke)" }}>
      {/* Top bar */}
      <div style={{ background:"var(--char)", borderBottom:"1px solid var(--border)", padding:"1rem 2rem", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.5rem", color:"var(--ember)", letterSpacing:"0.15em" }}>
          FU<span style={{ color:"var(--gold)" }}>O</span>CO <span style={{ color:"var(--ash)", fontSize:"0.85rem", fontFamily:"'Cormorant Garamond',serif", letterSpacing:"0.2em" }}>ADMIN</span>
        </div>
        <Btn variant="ghost" onClick={onLogout} style={{ fontSize:"0.72rem", padding:"0.4rem 1rem" }}>Logout</Btn>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1px", maxWidth:"960px", margin:"2rem auto", padding:"0 2rem" }}>
        {[
          { l:"Orders", v:orders.length, sub:`${orders.filter(o=>o.status==="Pending").length} pending`, c:"var(--ember)" },
          { l:"Reservations", v:reservations.length, sub:`${reservations.filter(r=>r.date===new Date().toISOString().split("T")[0]).length} today`, c:"var(--gold)" },
          { l:"Menu Items", v:menu.filter(m=>m.available).length, sub:`${menu.length} total`, c:"var(--success)" },
          { l:"Revenue", v:`₹${orders.reduce((s,o)=>s+o.total,0).toLocaleString()}`, sub:"all time", c:"var(--cream)" },
        ].map(s=>(
          <div key={s.l} style={{ background:"var(--card)", border:"1px solid var(--border)", padding:"1.5rem", borderRadius:"2px" }}>
            <div style={{ fontSize:"0.65rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--ash)", marginBottom:"0.4rem" }}>{s.l}</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"2.2rem", color:s.c, lineHeight:1 }}>{s.v}</div>
            <div style={{ fontSize:"0.75rem", color:"var(--ash)", marginTop:"0.25rem", fontStyle:"italic" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:"2px", maxWidth:"960px", margin:"0 auto 1rem", padding:"0 2rem" }}>
        {["orders","reservations","menu"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:"0.55rem 1.4rem", fontSize:"0.75rem", letterSpacing:"0.15em", textTransform:"uppercase", fontFamily:"'Cormorant Garamond',serif", background:tab===t?"var(--ember)":"var(--card)", color:"var(--cream)", border:"1px solid var(--border)", borderRadius:"2px", transition:"background 0.2s" }}>{t}</button>
        ))}
      </div>

      <div style={{ maxWidth:"960px", margin:"0 auto", padding:"0 2rem 5rem" }}>

        {/* ORDERS */}
        {tab==="orders" && (orders.length===0 ? <p style={{ color:"var(--ash)", fontStyle:"italic", textAlign:"center", padding:"3rem" }}>No orders yet.</p> :
          [...orders].reverse().map((o,ri)=>{
            const idx=orders.length-1-ri;
            return (
              <div key={idx} style={{ background:"var(--card)", border:"1px solid var(--border)", padding:"1.5rem", marginBottom:"1px", borderRadius:"2px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.5rem" }}>
                  <div>
                    <span style={{ fontFamily:"'Playfair Display',serif", color:"var(--cream)", fontSize:"1.05rem" }}>📦 {o.name}</span>
                    <span style={{ color:"var(--ash)", fontSize:"0.82rem", marginLeft:"0.75rem" }}>{o.phone}</span>
                    <div style={{ color:"var(--ash)", fontSize:"0.75rem", marginTop:"0.2rem" }}>{new Date(o.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.4rem", color:"var(--gold)" }}>₹{o.total}</span>
                    <span style={{ fontSize:"0.65rem", letterSpacing:"0.15em", textTransform:"uppercase", color:SC[o.status]||"var(--ash)", border:`1px solid ${SC[o.status]||"var(--border)"}`, padding:"0.2rem 0.5rem" }}>{o.status}</span>
                  </div>
                </div>
                <div style={{ fontSize:"0.82rem", color:"var(--ash)", fontStyle:"italic", marginBottom:"0.6rem" }}>{o.items.map(i=>`${i.emoji} ${i.name} ×${i.qty}`).join(" · ")}</div>
                {o.notes && <div style={{ fontSize:"0.78rem", color:"var(--ash)", marginBottom:"0.6rem" }}>📝 {o.notes}</div>}
                <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
                  {["Pending","Preparing","Ready","Done"].map(s=>(
                    <button key={s} onClick={()=>updOrder(idx,s)} style={{ padding:"0.28rem 0.7rem", fontSize:"0.68rem", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Cormorant Garamond',serif", background:o.status===s?SC[s]:"transparent", color:o.status===s?"#fff":"var(--ash)", border:`1px solid ${o.status===s?SC[s]:"var(--border)"}`, cursor:"pointer", borderRadius:"2px", transition:"all 0.2s" }}>{s}</button>
                  ))}
                </div>
              </div>
            );
          })
        )}

        {/* RESERVATIONS */}
        {tab==="reservations" && (reservations.length===0 ? <p style={{ color:"var(--ash)", fontStyle:"italic", textAlign:"center", padding:"3rem" }}>No reservations yet.</p> :
          [...reservations].reverse().map((r,ri)=>{
            const idx=reservations.length-1-ri;
            return (
              <div key={idx} style={{ background:"var(--card)", border:"1px solid var(--border)", padding:"1.5rem", marginBottom:"1px", borderRadius:"2px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <span style={{ fontFamily:"'Playfair Display',serif", color:"var(--cream)", fontSize:"1.05rem" }}>🪑 {r.name}</span>
                    <span style={{ color:"var(--ash)", fontSize:"0.82rem", marginLeft:"0.75rem" }}>{r.phone}</span>
                    <div style={{ color:"var(--gold)", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.1em", marginTop:"0.3rem" }}>{r.date} @ {r.time} · {r.guests} guest{r.guests>1?"s":""}</div>
                    {r.notes && <div style={{ color:"var(--ash)", fontSize:"0.78rem", fontStyle:"italic" }}>📝 {r.notes}</div>}
                  </div>
                  <span style={{ fontSize:"0.65rem", letterSpacing:"0.15em", textTransform:"uppercase", color:SC[r.status]||"var(--ash)", border:`1px solid ${SC[r.status]||"var(--border)"}`, padding:"0.2rem 0.5rem" }}>{r.status}</span>
                </div>
                <div style={{ display:"flex", gap:"0.4rem", marginTop:"0.75rem" }}>
                  {["Confirmed","Cancelled"].map(s=>(
                    <button key={s} onClick={()=>updRes(idx,s)} style={{ padding:"0.28rem 0.7rem", fontSize:"0.68rem", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Cormorant Garamond',serif", background:r.status===s?SC[s]:"transparent", color:r.status===s?"#fff":"var(--ash)", border:`1px solid ${r.status===s?SC[s]:"var(--border)"}`, cursor:"pointer", borderRadius:"2px" }}>{s}</button>
                  ))}
                </div>
              </div>
            );
          })
        )}

        {/* MENU MANAGER */}
        {tab==="menu" && (
          <>
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:"1rem" }}>
              <Btn onClick={()=>setShowAdd(true)} style={{ fontSize:"0.78rem" }}>+ Add Item</Btn>
            </div>
            {menu.map(item=>(
              <div key={item.id} style={{ background:"var(--card)", border:"1px solid var(--border)", padding:"1rem 1.25rem", marginBottom:"1px", display:"flex", gap:"1rem", alignItems:"center", borderRadius:"2px", opacity:item.available?1:0.45 }}>
                <div style={{ width:"60px", height:"60px", borderRadius:"2px", backgroundImage:`url(${item.img})`, backgroundSize:"cover", backgroundPosition:"center", flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:"var(--cream)", fontFamily:"'Playfair Display',serif", fontSize:"1rem" }}>{item.emoji} {item.name}</div>
                  <div style={{ color:"var(--ash)", fontSize:"0.78rem", fontStyle:"italic", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.desc}</div>
                </div>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.2rem", color:"var(--gold)", flexShrink:0 }}>₹{item.price}</span>
                <button onClick={()=>togAvail(item.id)} style={{ padding:"0.25rem 0.55rem", fontSize:"0.62rem", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Cormorant Garamond',serif", background:item.available?"rgba(46,204,113,0.12)":"rgba(231,76,60,0.12)", color:item.available?"var(--success)":"var(--danger)", border:`1px solid ${item.available?"var(--success)":"var(--danger)"}`, cursor:"pointer", borderRadius:"2px", flexShrink:0 }}>{item.available?"Live":"Off"}</button>
                <Btn variant="gold" onClick={()=>setEditItem({...item})} style={{ padding:"0.28rem 0.65rem", fontSize:"0.68rem", flexShrink:0 }}>Edit</Btn>
                <Btn variant="danger" onClick={()=>delMenu(item.id)} style={{ padding:"0.28rem 0.65rem", fontSize:"0.68rem", flexShrink:0 }}>Del</Btn>
              </div>
            ))}
          </>
        )}
      </div>

      {editItem && (
        <Modal title="Edit Item" onClose={()=>setEditItem(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
            <input placeholder="Emoji" value={editItem.emoji} onChange={e=>setEditItem(p=>({...p,emoji:e.target.value}))} />
            <input placeholder="Name" value={editItem.name} onChange={e=>setEditItem(p=>({...p,name:e.target.value}))} />
            <textarea placeholder="Description" value={editItem.desc} onChange={e=>setEditItem(p=>({...p,desc:e.target.value}))} rows={2} />
            <input type="number" placeholder="Price (₹)" value={editItem.price} onChange={e=>setEditItem(p=>({...p,price:Number(e.target.value)}))} />
            <input placeholder="Tag" value={editItem.tag} onChange={e=>setEditItem(p=>({...p,tag:e.target.value}))} />
            <input placeholder="Image URL (optional)" value={editItem.img} onChange={e=>setEditItem(p=>({...p,img:e.target.value}))} />
            <div style={{ display:"flex", gap:"1rem", marginTop:"0.5rem" }}><Btn onClick={saveEdit}>Save</Btn><Btn variant="ghost" onClick={()=>setEditItem(null)}>Cancel</Btn></div>
          </div>
        </Modal>
      )}
      {showAdd && (
        <Modal title="Add Menu Item" onClose={()=>setShowAdd(false)}>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
            <input placeholder="Emoji" value={newItem.emoji} onChange={e=>setNewItem(p=>({...p,emoji:e.target.value}))} />
            <input placeholder="Name *" value={newItem.name} onChange={e=>setNewItem(p=>({...p,name:e.target.value}))} />
            <textarea placeholder="Description" value={newItem.desc} onChange={e=>setNewItem(p=>({...p,desc:e.target.value}))} rows={2} />
            <input type="number" placeholder="Price (₹) *" value={newItem.price} onChange={e=>setNewItem(p=>({...p,price:e.target.value}))} />
            <input placeholder="Tag (e.g. Vegan)" value={newItem.tag} onChange={e=>setNewItem(p=>({...p,tag:e.target.value}))} />
            <input placeholder="Image URL (optional)" value={newItem.img} onChange={e=>setNewItem(p=>({...p,img:e.target.value}))} />
            <div style={{ display:"flex", gap:"1rem", marginTop:"0.5rem" }}><Btn onClick={addItem}>Add</Btn><Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn></div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── ROOT ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [mode,setMode]=useState("customer");
  const [adminIn,setAdminIn]=useState(false);
  const [view,setView]=useState("home");
  const [cart,setCart]=useState([]);
  const [showCart,setShowCart]=useState(false);
  const [menu,setMenu]=useState([]);
  const [orders,setOrders]=useState([]);
  const [reservations,setReservations]=useState([]);
  const [loading,setLoading]=useState(true);
  const [toastMsg,setToastMsg]=useState(null);

  useEffect(()=>{
    (async()=>{
      const m=await DB.get("fuoco-menu");
      const o=await DB.get("fuoco-orders");
      const r=await DB.get("fuoco-reservations");
      setMenu(m||SEED_MENU); setOrders(o||[]); setReservations(r||[]);
      if(!m) await DB.set("fuoco-menu",SEED_MENU);
      setLoading(false);
    })();
  },[]);

  const toast = (msg,type="success") => { setToastMsg({msg,type}); setTimeout(()=>setToastMsg(null),3000); };

  const handleOrder = async (order) => {
    const u=[...orders,order]; setOrders(u); await DB.set("fuoco-orders",u);
    setCart([]); setShowCart(false);
    toast("🔥 Order placed! We'll fire it up.","success"); setView("home");
  };
  const handleReserve = async (res) => {
    const u=[...reservations,res]; setReservations(u); await DB.set("fuoco-reservations",u);
    toast("🪑 Table reserved! See you soon.","success"); setView("home");
  };

  if(loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--char)" }}>
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"3rem", color:"var(--ember)", letterSpacing:"0.25em" }}>FUOCO</div>
    </div>
  );

  return (
    <>
      <style>{G}</style>
      {toastMsg && <Toast msg={toastMsg.msg} type={toastMsg.type} />}

      {/* Mode switcher */}
      <div style={{ position:"fixed", bottom:"1.5rem", left:"1.5rem", zIndex:200, display:"flex", gap:"3px" }}>
        {[["customer","Customer"],["admin","Admin"]].map(([m,l])=>(
          <button key={m} onClick={()=>{setMode(m);if(m==="customer")setAdminIn(false);}} style={{ padding:"0.45rem 0.9rem", fontSize:"0.65rem", letterSpacing:"0.15em", textTransform:"uppercase", fontFamily:"'Cormorant Garamond',serif", background:mode===m?"var(--ember)":"rgba(26,17,10,0.92)", color:"var(--cream)", border:"1px solid var(--border)", cursor:"pointer", borderRadius:"2px" }}>{l}</button>
        ))}
      </div>

      {mode==="admin" ? (
        adminIn ? <AdminDash menu={menu} setMenu={setMenu} orders={orders} setOrders={setOrders} reservations={reservations} setReservations={setReservations} onLogout={()=>setAdminIn(false)} toast={toast} />
                : <AdminLogin onLogin={()=>setAdminIn(true)} />
      ) : (
        <>
          <Nav setView={setView} cart={cart} setShowCart={setShowCart} />
          {view==="home" && <><Hero setView={setView} /><StatsBar /><Gallery setView={setView} /></>}
          {view==="menu" && <MenuPage menu={menu} cart={cart} setCart={setCart} />}
          {view==="about" && <AboutPage />}
          {view==="reserve" && <ReservePage onReserve={handleReserve} />}
          {view!=="home" && <Footer setView={setView} />}
          {showCart && <Cart cart={cart} setCart={setCart} onClose={()=>setShowCart(false)} onPlaceOrder={handleOrder} />}
        </>
      )}
    </>
  );
}

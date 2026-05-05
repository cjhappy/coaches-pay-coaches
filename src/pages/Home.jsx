import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Helmet } from 'react-helmet-async'

export default function Home() {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

return (
    <div style={{ background: 'var(--navy)', minHeight: '100vh', overflowX: 'hidden' }}>
      <Helmet>
        <title>Coaches Pay Coaches — The Marketplace for Youth Sports Coaches</title>
        <meta name="description" content="Buy and sell coaching materials — practice plans, drills, playbooks, and more. Built by coaches, for coaches." />
        <meta property="og:title" content="Coaches Pay Coaches — The Marketplace for Youth Sports Coaches" />
        <meta property="og:description" content="Buy and sell coaching materials — practice plans, drills, playbooks, and more. Built by coaches, for coaches." />
        <meta property="og:url" content="https://coachespaycoaches.org/" />
      </Helmet>

      {/* NAV */}
      <nav className="cpc-nav">
        <a className="cpc-logo" onClick={() => navigate('/')}>
          <div className="logo-badge">CPC</div>
          <div className="logo-text">COACHES <em>PAY</em> COACHES</div>
        </a>

        {/* Desktop nav */}
        <ul className="nav-links">
          <li><a onClick={() => navigate('/marketplace')}>Browse</a></li>
          <li><a>Sports</a></li>
          <li><a onClick={() => navigate('/coaches')}>Coaches</a></li>
          {user ? (
            <>
              {profile?.role === 'seller' && <li><a onClick={() => navigate('/seller')}>My Store</a></li>}
              {profile?.role === 'buyer' && <li><a onClick={() => navigate('/purchases')}>My Library</a></li>}
              <li><a onClick={() => navigate('/dashboard')} className="nav-cta">Dashboard →</a></li>
            </>
          ) : (
            <li><a onClick={() => navigate('/auth')} className="nav-cta">Get Started →</a></li>
          )}
        </ul>

        {/* Hamburger button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="hamburger-btn"
          style={{ background: 'none', border: 'none', color: 'var(--white)', fontSize: '1.5rem', cursor: 'pointer', padding: '4px', display: 'none' }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ position: 'fixed', top: '66px', left: 0, right: 0, background: 'rgba(11,22,34,0.98)', borderBottom: '1px solid var(--border)', padding: '1.5rem 5%', zIndex: 499, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <a style={{ color: 'var(--off)', fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }} onClick={() => { navigate('/marketplace'); setMenuOpen(false) }}>Browse</a>
            {user && profile?.role === 'seller' && (
              <a style={{ color: 'var(--off)', fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }} onClick={() => { navigate('/seller'); setMenuOpen(false) }}>My Store</a>
            )}
            {user && profile?.role === 'buyer' && (
              <a style={{ color: 'var(--off)', fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }} onClick={() => { navigate('/purchases'); setMenuOpen(false) }}>My Library</a>
            )}
            {user ? (
              <>
                <a style={{ color: 'var(--off)', fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }} onClick={() => { navigate('/dashboard'); setMenuOpen(false) }}>Dashboard</a>
                <a style={{ color: '#f87171', fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }} onClick={() => { handleSignOut(); setMenuOpen(false) }}>Sign Out</a>
              </>
            ) : (
              <a style={{ color: 'var(--green)', fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }} onClick={() => { navigate('/auth'); setMenuOpen(false) }}>Get Started →</a>
            )}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section style={{ minHeight: 'calc(100vh - 66px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 5% 60px', position: 'relative', overflow: 'hidden', paddingTop: '66px' }}>
        <div style={{ position: 'absolute', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,204,113,0.07) 0%, transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {[360, 580, 800, 1020].map((size, i) => (
            <div key={i} style={{ position: 'absolute', borderRadius: '50%', border: '1px solid rgba(46,204,113,0.06)', width: size, height: size, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', animation: `pulse 7s ease-in-out ${i * 1.2}s infinite` }} />
          ))}
        </div>

        <style>{`
          @keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:.9} }
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
          @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
          .hero-eyebrow { animation: fadeUp .7s ease both; }
          .hero-mark-el { animation: fadeUp .7s ease .05s both; }
          .hero-h1 { animation: fadeUp .7s ease .15s both; }
          .hero-sub-el { animation: fadeUp .7s ease .25s both; }
          .hero-btns-el { animation: fadeUp .7s ease .35s both; }
          .hero-pills-el { animation: fadeUp .7s ease .45s both; }
          .blink { width:6px;height:6px;border-radius:50%;background:var(--green);animation:blink 1.6s ease-in-out infinite;display:inline-block; }
          .sport-pill { display:inline-flex;align-items:center;gap:7px;background:rgba(255,255,255,0.04);border:1px solid var(--border);color:var(--off);font-size:13px;font-weight:600;padding:7px 15px;border-radius:100px;transition:all .25s;cursor:default; }
          .sport-pill:hover { border-color:var(--green);color:var(--green);background:var(--green-dim); }
          .how-card { background:var(--navy-card);padding:38px 30px;position:relative;transition:background .3s; }
          .how-card:hover { background:var(--navy-light); }
          .sport-card { background:var(--navy-card);border:1px solid var(--border);border-radius:12px;padding:26px 16px;text-align:center;cursor:pointer;transition:all .25s;color:var(--white); }
          .sport-card:hover { border-color:var(--green);background:var(--green-dim);transform:translateY(-4px); }
          .who-card { background:var(--navy-card);border:1px solid var(--border);border-radius:14px;padding:30px 24px;transition:all .3s; }
          .who-card:hover { border-color:var(--green-border);transform:translateY(-3px); }
          .view-btn { background:var(--green-dim);border:1px solid var(--green-border);color:var(--green);font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.8px;padding:7px 16px;border-radius:6px;cursor:pointer;transition:all .2s; }
          .view-btn:hover { background:var(--green);color:var(--navy); }
          @media (max-width: 640px) {
            .nav-links { display: none !important; }
            .hamburger-btn { display: block !important; }
          }
        `}</style>

        <div className="hero-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--green-dim)', border: '1px solid var(--green-border)', color: 'var(--green)', fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', padding: '7px 18px', borderRadius: '100px', marginBottom: '28px', position: 'relative', zIndex: 2 }}>
          <span className="blink" /> Now Open to All Coaches
        </div>

        <div className="hero-mark-el" style={{ position: 'relative', zIndex: 2, marginBottom: '32px' }}>
          <div style={{ width: '110px', height: '110px', borderRadius: '22px', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '38px', color: 'var(--navy)', letterSpacing: '1px', margin: '0 auto', boxShadow: '0 0 60px rgba(46,204,113,0.25)', animation: 'float 5s ease-in-out infinite' }}>
            CPC
          </div>
        </div>

        <h1 className="hero-h1" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 'clamp(42px, 9vw, 108px)', lineHeight: .92, letterSpacing: '-1px', textTransform: 'uppercase', position: 'relative', zIndex: 2, marginBottom: '4px' }}>
          COACHES <em style={{ color: 'var(--green)', fontStyle: 'normal' }}>PAY</em> COACHES
        </h1>

        <p className="hero-sub-el" style={{ fontSize: 'clamp(15px,1.8vw,18px)', color: 'var(--muted)', maxWidth: '560px', margin: '22px auto 40px', lineHeight: 1.7, position: 'relative', zIndex: 2 }}>
          The marketplace where coaches buy and sell practice plans, drills, playbooks, and more — built by coaches, for coaches.
        </p>

        <div className="hero-btns-el" style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
          <button className="btn btn-green" onClick={() => navigate('/marketplace')}>Browse Resources →</button>
          <button className="btn btn-ghost" onClick={() => navigate(user ? '/seller' : '/auth')}>Start Selling</button>
        </div>

        <div className="hero-pills-el" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '40px', position: 'relative', zIndex: 2 }}>
          {['🏀 Basketball', '⚽ Soccer', '🏈 Football', '⚾ Baseball', '🏒 Hockey', '🏐 Volleyball'].map(s => (
            <span key={s} className="sport-pill">{s}</span>
          ))}
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--navy-mid)', padding: '13px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', animation: 'marquee 32s linear infinite', whiteSpace: 'nowrap' }}>
          {Array(2).fill(['Practice Plans', 'Drill Libraries', 'Playbooks', 'Season Plans', 'Film Breakdowns', 'Scouting Reports', 'S&C Programs', 'Recruiting Guides']).flat().map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', padding: '0 28px', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '12px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>
              {item} <span style={{ color: 'var(--green)', fontSize: '16px' }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section style={{ padding: '90px 5%' }}>
        <div style={{ marginBottom: '52px' }}>
          <div className="section-label">How It Works</div>
          <h2 className="section-title">Simple. <em>Powerful.</em></h2>
          <p style={{ color: 'var(--muted)', fontSize: '16px', maxWidth: '500px', lineHeight: 1.7 }}>Everything you need to buy or sell coaching materials — in three steps.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2px', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          {[
            { icon: '🔍', num: '01', title: 'Browse the Marketplace', desc: 'Search by sport, category, or keyword. Filter by price and find resources that fit your program.' },
            { icon: '💳', num: '02', title: 'Purchase Instantly', desc: 'Secure checkout powered by Stripe. Pay once and get immediate access to your download.' },
            { icon: '📥', num: '03', title: 'Download & Implement', desc: 'Access your files anytime from your library. Implement immediately with your team.' },
            { icon: '📤', num: '04', title: 'Sell Your Knowledge', desc: 'Create a seller account, upload your materials, and start earning from your coaching expertise.' },
          ].map((step, i) => (
            <div key={i} className="how-card">
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '72px', lineHeight: 1, color: 'rgba(46,204,113,0.08)', position: 'absolute', top: '16px', right: '20px' }}>{step.num}</div>
              <div style={{ width: '50px', height: '50px', borderRadius: '11px', background: 'var(--green-dim)', border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '18px' }}>{step.icon}</div>
              <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '21px', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: '10px' }}>{step.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.65 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SPORTS */}
      <div style={{ background: 'var(--navy-mid)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '90px 5%' }}>
        <div className="section-label">Browse by Sport</div>
        <h2 className="section-title">Every <em>Sport.</em> Every Level.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: '10px', marginTop: '48px' }}>
          {[
            { emoji: '🏀', name: 'Basketball', sub: '120+ resources' },
            { emoji: '⚽', name: 'Soccer', sub: '80+ resources' },
            { emoji: '🏈', name: 'Football', sub: '95+ resources' },
            { emoji: '⚾', name: 'Baseball', sub: '60+ resources' },
            { emoji: '🏒', name: 'Hockey', sub: '45+ resources' },
            { emoji: '🏐', name: 'Volleyball', sub: '38+ resources' },
            { emoji: '🥍', name: 'Lacrosse', sub: '29+ resources' },
            { emoji: '🎾', name: 'Tennis', sub: '22+ resources' },
          ].map(sport => (
            <div key={sport.name} className="sport-card" onClick={() => navigate('/marketplace')}>
              <span style={{ fontSize: '30px', marginBottom: '10px', display: 'block' }}>{sport.emoji}</span>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '.3px' }}>{sport.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>{sport.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* WHO IT'S FOR */}
      <section style={{ padding: '90px 5%' }}>
        <div className="section-label">Who It's For</div>
        <h2 className="section-title">Built for <em>Every</em> Coach.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginTop: '48px' }}>
          {[
            { emoji: '🏫', title: 'Youth & Rec Coaches', desc: 'Find age-appropriate drills, practice plans, and resources to develop young athletes the right way.' },
            { emoji: '🏆', title: 'Travel & Club Coaches', desc: 'Level up your program with competitive systems, tactical frameworks, and tournament-ready content.' },
            { emoji: '🎓', title: 'High School Coaches', desc: 'Access complete season plans, film breakdown tools, and recruiting guidance for your program.' },
            { emoji: '💼', title: 'PE Teachers', desc: 'Multi-sport drill libraries and beginner-friendly resources designed for physical education.' },
          ].map(w => (
            <div key={w.title} className="who-card">
              <span style={{ fontSize: '32px', marginBottom: '14px', display: 'block' }}>{w.emoji}</span>
              <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '21px', textTransform: 'uppercase', marginBottom: '8px' }}>{w.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.65 }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BECOME A SELLER CTA */}
      <div style={{ background: 'var(--navy-mid)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '90px 5%', textAlign: 'center' }}>
        <div style={{ width: '90px', height: '90px', borderRadius: '20px', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '32px', color: 'var(--navy)', margin: '0 auto 28px', animation: 'float 5s ease-in-out infinite' }}>CPC</div>
        <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 'clamp(34px, 5vw, 60px)', textTransform: 'uppercase', marginBottom: '16px' }}>Share Your <em style={{ color: 'var(--green)', fontStyle: 'normal' }}>Knowledge</em></h2>
        <p style={{ color: 'var(--muted)', fontSize: '16px', maxWidth: '500px', margin: '0 auto 36px', lineHeight: 1.7 }}>Every coach has something valuable to offer. Create your profile, upload your resources, and join a community elevating youth sports together.</p>
        <button className="btn btn-green" onClick={() => navigate(user ? '/seller' : '/auth')}>Become a Seller →</button>
      </div>

      {/* FOOTER */}
      <footer style={{ background: 'var(--navy-mid)', borderTop: '1px solid var(--border)', padding: '3rem 5% 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '13px', color: 'var(--navy)' }}>CPC</div>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '15px', letterSpacing: '.8px' }}>COACHES <em style={{ color: 'var(--green)', fontStyle: 'normal' }}>PAY</em> COACHES</div>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '.88rem', lineHeight: 1.6, maxWidth: '280px' }}>The go-to resource hub for youth sports coaches. Share knowledge, earn income, improve the game.</p>
          </div>
          {[
            { title: 'Browse', links: ['All Sports', 'Basketball', 'Soccer', 'Football'] },
            { title: 'Sellers', links: ['Start Selling', 'Upload Guide', 'Earnings'] },
            { title: 'Company', links: ['About Us', 'Contact', 'Terms', 'Privacy'] },
          ].map(col => (
           <div key="Company">
  <h4 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.75rem' }}>Company</h4>
  <ul style={{ listStyle: 'none' }}>
    <li style={{ marginBottom: '.5rem' }}><a style={{ color: 'var(--off)', fontSize: '.9rem', textDecoration: 'none', cursor: 'pointer' }} onClick={() => navigate('/terms')}>Terms of Service</a></li>
    <li style={{ marginBottom: '.5rem' }}><a style={{ color: 'var(--off)', fontSize: '.9rem', textDecoration: 'none', cursor: 'pointer' }} onClick={() => navigate('/privacy')}>Privacy Policy</a></li>
    <li style={{ marginBottom: '.5rem' }}><a style={{ color: 'var(--off)', fontSize: '.9rem', textDecoration: 'none', cursor: 'pointer' }} href="mailto:christopherhappy05@gmail.com">Contact</a></li>
  </ul>
</div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <div style={{ color: 'var(--muted)', fontSize: '.82rem' }}>© 2025 <em style={{ color: 'var(--green)', fontStyle: 'normal' }}>Coaches Pay Coaches</em>. Built for coaches, by coaches.</div>
        </div>
      </footer>

    </div>
  )
}
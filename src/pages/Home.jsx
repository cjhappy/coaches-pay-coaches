import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Helmet } from 'react-helmet-async'

export default function Home() {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

  return (
    <div style={{ background: 'var(--navy)', minHeight: '100vh', overflowX: 'hidden' }}>
      <Helmet>
        <title>Coaches Pay Coaches — The Marketplace for Youth Sports Coaches</title>
        <meta name="description" content="Buy and sell coaching materials — practice plans, drills, playbooks, nutrition plans, and more. Built by coaches, for coaches." />
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
        <ul className="nav-links">
          <li><a onClick={() => navigate('/marketplace')}>Browse</a></li>
          <li><a onClick={() => navigate('/coaches')}>Coaches</a></li>
          {user ? (
            <>
              {(profile?.role === 'seller' || profile?.role === 'both') && <li><a onClick={() => navigate('/seller')}>My Store</a></li>}
              {(profile?.role === 'buyer' || profile?.role === 'both') && <li><a onClick={() => navigate('/purchases')}>My Library</a></li>}
              <li><a onClick={() => navigate('/dashboard')} className="nav-cta">Dashboard →</a></li>
            </>
          ) : (
            <li><a onClick={() => navigate('/auth')} className="nav-cta">Get Started →</a></li>
          )}
        </ul>
      </nav>

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
      `}</style>

      {/* HERO */}
      <section style={{ minHeight: 'calc(100vh - 66px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 5% 60px', position: 'relative', overflow: 'hidden', paddingTop: '66px' }}>
        <div style={{ position: 'absolute', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,204,113,0.07) 0%, transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {[360, 580, 800, 1020].map((size, i) => (
            <div key={i} style={{ position: 'absolute', borderRadius: '50%', border: '1px solid rgba(46,204,113,0.06)', width: size, height: size, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', animation: `pulse 7s ease-in-out ${i * 1.2}s infinite` }} />
          ))}
        </div>

        <div className="hero-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--green-dim)', border: '1px solid var(--green-border)', color: 'var(--green)', fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', padding: '7px 18px', borderRadius: '100px', marginBottom: '28px', position: 'relative', zIndex: 2 }}>
          <span className="blink" /> Now Open to All Coaches & Experts
        </div>

        <div className="hero-mark-el" style={{ position: 'relative', zIndex: 2, marginBottom: '32px' }}>
          <div style={{ width: '110px', height: '110px', borderRadius: '22px', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '38px', color: 'var(--navy)', letterSpacing: '1px', margin: '0 auto', boxShadow: '0 0 60px rgba(46,204,113,0.25)', animation: 'float 5s ease-in-out infinite' }}>
            CPC
          </div>
        </div>

        <h1 className="hero-h1" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 'clamp(42px, 9vw, 108px)', lineHeight: .92, letterSpacing: '-1px', textTransform: 'uppercase', position: 'relative', zIndex: 2, marginBottom: '4px' }}>
          COACHES <em style={{ color: 'var(--green)', fontStyle: 'normal' }}>PAY</em> COACHES
        </h1>

        <p className="hero-sub-el" style={{ fontSize: 'clamp(15px,1.8vw,18px)', color: 'var(--muted)', maxWidth: '580px', margin: '22px auto 40px', lineHeight: 1.7, position: 'relative', zIndex: 2 }}>
          The marketplace where coaches, trainers, nutritionists, and sports professionals buy and sell practice plans, drills, playbooks, nutrition guides, and more — built by coaches, for coaches.
        </p>

        <div className="hero-btns-el" style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
          <button className="btn btn-green" onClick={() => navigate('/marketplace')}>Browse Resources →</button>
          <button className="btn btn-ghost" onClick={() => navigate(user ? '/seller' : '/auth')}>Start Selling</button>
        </div>

        <div className="hero-pills-el" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '40px', position: 'relative', zIndex: 2 }}>
          {['🏀 Basketball', '⚽ Soccer', '🏈 Football', '⚾ Baseball', '🏒 Hockey', '🥗 Nutrition'].map(s => (
            <span key={s} className="sport-pill">{s}</span>
          ))}
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--navy-mid)', padding: '13px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', animation: 'marquee 32s linear infinite', whiteSpace: 'nowrap' }}>
          {Array(2).fill(['Practice Plans', 'Drill Libraries', 'Playbooks', 'Season Plans', 'Nutrition Guides', 'Film Breakdowns', 'Scouting Reports', 'S&C Programs', 'Mental Performance', 'Recruiting Guides']).flat().map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', padding: '0 28px', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '12px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>
              {item} <span style={{ color: 'var(--green)', fontSize: '16px' }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* WHY WE STARTED */}
      <section style={{ padding: '90px 5%', maxWidth: '800px', margin: '0 auto' }}>
        <div className="section-label">Our Story</div>
        <h2 className="section-title">Why We <em>Started</em></h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.8 }}>
          <p>
            Youth sports coaching is one of the most impactful professions in the world — and one of the most undervalued. Coaches spend countless hours building practice plans, designing drills, and developing systems that transform young athletes. Most of that work never leaves their notebook.
          </p>
          <p>
            We built Coaches Pay Coaches because we believed coaches deserved to be compensated for the knowledge they've spent years developing. Not just by their team — but by every coach who could benefit from their expertise.
          </p>
          <p style={{ color: 'var(--off)' }}>
            Whether you're a youth basketball coach with a proven practice system, a sports nutritionist with meal plans that fuel performance, or a sports psychologist with mental performance protocols — <em style={{ color: 'var(--green)', fontStyle: 'normal' }}>your knowledge has value</em>. This is the place to share it.
          </p>
        </div>
        <button className="btn btn-green" style={{ marginTop: '2rem' }} onClick={() => navigate(user ? '/marketplace' : '/auth')}>
          Join the Community →
        </button>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '90px 5%', background: 'var(--navy-mid)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
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
            { icon: '📤', num: '04', title: 'Sell Your Knowledge', desc: 'Create a seller account, upload your materials, and start earning from your expertise.' },
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

      {/* WHO IT'S FOR */}
      <section style={{ padding: '90px 5%' }}>
        <div className="section-label">Who It's For</div>
        <h2 className="section-title">Built for <em>Everyone</em> in the Game.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginTop: '48px' }}>
          {[
            { emoji: '🏀', title: 'Youth & Club Coaches', desc: 'Find age-appropriate drills, practice plans, and competitive systems to develop your athletes.' },
            { emoji: '🏫', title: 'High School Coaches', desc: 'Access complete season plans, film breakdown tools, and recruiting guidance for your program.' },
            { emoji: '🥗', title: 'Sports Nutritionists', desc: 'Share meal plans, supplement guides, and performance nutrition protocols with athletes and coaches.' },
            { emoji: '🧠', title: 'Sports Psychologists', desc: 'Sell mental performance programs, mindset guides, and focus protocols to elevate athlete performance.' },
            { emoji: '💪', title: 'Athletic Trainers', desc: 'Share injury prevention protocols, recovery programs, and strength training resources.' },
            { emoji: '🎓', title: 'PE Teachers', desc: 'Multi-sport drill libraries and beginner-friendly resources designed for physical education.' },
            { emoji: '⚡', title: 'Speed & Agility Coaches', desc: 'Sell your proven speed development programs, agility drills, and movement training systems.' },
            { emoji: '📋', title: 'Strength Coaches', desc: 'Share periodization plans, lifting programs, and performance tracking tools with your community.' },
          ].map(w => (
            <div key={w.title} className="who-card">
              <span style={{ fontSize: '32px', marginBottom: '14px', display: 'block' }}>{w.emoji}</span>
              <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '21px', textTransform: 'uppercase', marginBottom: '8px' }}>{w.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.65 }}>{w.desc}</p>
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
            { emoji: '🏀', name: 'Basketball' },
            { emoji: '⚽', name: 'Soccer' },
            { emoji: '🏈', name: 'Football' },
            { emoji: '⚾', name: 'Baseball' },
            { emoji: '🏒', name: 'Hockey' },
            { emoji: '🏐', name: 'Volleyball' },
            { emoji: '🥍', name: 'Lacrosse' },
            { emoji: '🎾', name: 'Tennis' },
            { emoji: '🤼', name: 'Wrestling' },
            { emoji: '⛳', name: 'Golf' },
            { emoji: '🏃', name: 'Track & Field' },
            { emoji: '🏊', name: 'Swimming' },
          ].map(sport => (
            <div key={sport.name} className="sport-card" onClick={() => navigate('/marketplace')}>
              <span style={{ fontSize: '30px', marginBottom: '10px', display: 'block' }}>{sport.emoji}</span>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '.3px' }}>{sport.name}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/marketplace')}>View All Sports →</button>
        </div>
      </div>

      {/* BECOME A SELLER CTA */}
      <div style={{ background: 'var(--navy)', borderTop: '1px solid var(--border)', padding: '90px 5%', textAlign: 'center' }}>
        <div style={{ width: '90px', height: '90px', borderRadius: '20px', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '32px', color: 'var(--navy)', margin: '0 auto 28px', animation: 'float 5s ease-in-out infinite' }}>CPC</div>
        <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 'clamp(34px, 5vw, 60px)', textTransform: 'uppercase', marginBottom: '16px' }}>Share Your <em style={{ color: 'var(--green)', fontStyle: 'normal' }}>Knowledge</em></h2>
        <p style={{ color: 'var(--muted)', fontSize: '16px', maxWidth: '520px', margin: '0 auto 36px', lineHeight: 1.7 }}>
          Every coach, trainer, and sports professional has something valuable to offer. Create your profile, upload your resources, and join a community elevating youth sports together.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-green" onClick={() => navigate(user ? '/seller' : '/auth')}>Become a Seller →</button>
          <button className="btn btn-ghost" onClick={() => navigate('/marketplace')}>Browse Resources</button>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: 'var(--navy-mid)', borderTop: '1px solid var(--border)', padding: '3rem 5% 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '13px', color: 'var(--navy)' }}>CPC</div>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '15px', letterSpacing: '.8px' }}>COACHES <em style={{ color: 'var(--green)', fontStyle: 'normal' }}>PAY</em> COACHES</div>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '.88rem', lineHeight: 1.6, maxWidth: '280px' }}>The go-to resource hub for coaches, trainers, and sports professionals. Share knowledge, earn income, improve the game.</p>
          </div>

          <div>
            <h4 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.75rem' }}>Browse</h4>
            <ul style={{ listStyle: 'none' }}>
              <li style={{ marginBottom: '.5rem' }}><a style={{ color: 'var(--off)', fontSize: '.9rem', textDecoration: 'none', cursor: 'pointer' }} onClick={() => navigate('/marketplace')}>Marketplace</a></li>
              <li style={{ marginBottom: '.5rem' }}><a style={{ color: 'var(--off)', fontSize: '.9rem', textDecoration: 'none', cursor: 'pointer' }} onClick={() => navigate('/coaches')}>Coaches</a></li>
              <li style={{ marginBottom: '.5rem' }}><a style={{ color: 'var(--off)', fontSize: '.9rem', textDecoration: 'none', cursor: 'pointer' }} onClick={() => navigate('/auth')}>Sign Up</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.75rem' }}>Sellers</h4>
            <ul style={{ listStyle: 'none' }}>
              <li style={{ marginBottom: '.5rem' }}><a style={{ color: 'var(--off)', fontSize: '.9rem', textDecoration: 'none', cursor: 'pointer' }} onClick={() => navigate('/auth')}>Start Selling</a></li>
              <li style={{ marginBottom: '.5rem' }}><a style={{ color: 'var(--off)', fontSize: '.9rem', textDecoration: 'none', cursor: 'pointer' }} onClick={() => navigate('/seller')}>My Store</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.75rem' }}>Company</h4>
            <ul style={{ listStyle: 'none' }}>
              <li style={{ marginBottom: '.5rem' }}><a style={{ color: 'var(--off)', fontSize: '.9rem', textDecoration: 'none', cursor: 'pointer' }} onClick={() => navigate('/terms')}>Terms of Service</a></li>
              <li style={{ marginBottom: '.5rem' }}><a style={{ color: 'var(--off)', fontSize: '.9rem', textDecoration: 'none', cursor: 'pointer' }} onClick={() => navigate('/privacy')}>Privacy Policy</a></li>
              <li style={{ marginBottom: '.5rem' }}><a style={{ color: 'var(--off)', fontSize: '.9rem', textDecoration: 'none' }} href="mailto:christopherhappy05@gmail.com">Contact</a></li>
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ color: 'var(--muted)', fontSize: '.82rem' }}>© 2025 <em style={{ color: 'var(--green)', fontStyle: 'normal' }}>Coaches Pay Coaches</em>. Built for coaches, by coaches.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a style={{ color: 'var(--muted)', fontSize: '.82rem', cursor: 'pointer', textDecoration: 'none' }} onClick={() => navigate('/terms')}>Terms</a>
            <a style={{ color: 'var(--muted)', fontSize: '.82rem', cursor: 'pointer', textDecoration: 'none' }} onClick={() => navigate('/privacy')}>Privacy</a>
            <a style={{ color: 'var(--muted)', fontSize: '.82rem', textDecoration: 'none' }} href="mailto:christopherhappy05@gmail.com">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
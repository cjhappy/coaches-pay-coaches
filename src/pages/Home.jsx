import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Helmet } from 'react-helmet-async'

/* ── Hand-drawn "whiteboard play" doodles ──
   The brand guide's signature motif: chalk-style arrows, circles, and X's,
   like a play sketched mid-practice. Strokes animate on load, as if being
   drawn in real time. This is the one distinctive element of the redesign —
   everything else stays quiet so this can carry the personality. */
function PlayDoodle({ className = '', style = {}, flip = false }) {
  return (
    <svg
      className={`doodle ${className}`}
      style={{ transform: flip ? 'scaleX(-1)' : 'none', ...style }}
      viewBox="0 0 260 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path className="doodle-stroke" d="M14 150 C 30 90, 60 60, 108 40" strokeWidth="4" strokeLinecap="round" />
      <path className="doodle-stroke" d="M100 34 L 112 40 L 100 47" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle className="doodle-stroke" cx="150" cy="26" r="12" strokeWidth="4" />
      <path className="doodle-stroke" d="M150 46 C 150 74, 170 88, 200 92" strokeWidth="4" strokeLinecap="round" />
      <path className="doodle-stroke" d="M193 85 L 202 93 L 191 98" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path className="doodle-stroke" d="M18 20 L 34 36 M 34 20 L 18 36" strokeWidth="4" strokeLinecap="round" />
      <path className="doodle-stroke" d="M232 116 L 248 132 M 248 116 L 232 132" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

function LogoLockup({ height = 44 }) {
  return <img src="/cpc-logo-primary.svg" alt="Coaches Pay Coaches" style={{ height, width: 'auto', display: 'block' }} />
}

export default function Home() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', overflowX: 'hidden' }}>
      <Helmet>
        <title>Coaches Pay Coaches — Learn. Share. Earn.</title>
        <meta name="description" content="Where coaches share practice plans, drills, and coaching content with each other — and get paid for it. Built by coaches, for coaches." />
        <meta property="og:title" content="Coaches Pay Coaches — Learn. Share. Earn." />
        <meta property="og:description" content="Where coaches share practice plans, drills, and coaching content with each other — and get paid for it." />
        <meta property="og:url" content="https://coachespaycoaches.org/" />
      </Helmet>

      {/* NAV */}
      <nav className="cpc-nav">
        <a className="cpc-logo" onClick={() => navigate('/')}>
          <LogoLockup height={44} />
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
        <button className="mobile-nav-cta" onClick={() => navigate(user ? '/dashboard' : '/auth')}>
          {user ? 'Dashboard' : 'Get Started'}
        </button>
      </nav>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes drawIn { to { stroke-dashoffset: 0; } }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        .doodle { position: absolute; overflow: visible; pointer-events: none; }
        .doodle-stroke {
          stroke: var(--yellow);
          fill: none;
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: drawIn 1.4s ease forwards;
        }

        .hero-eyebrow { animation: fadeUp .6s ease both; }
        .hero-h1 { animation: fadeUp .6s ease .1s both; }
        .hero-sub-el { animation: fadeUp .6s ease .2s both; }
        .hero-btns-el { animation: fadeUp .6s ease .3s both; }
        .hero-pills-el { animation: fadeUp .6s ease .4s both; }

        .sport-pill { display:inline-flex; align-items:center; gap:7px; background: rgba(253,251,84,0.08); border: 1.5px solid rgba(253,251,84,0.35); color: var(--cream); font-family: var(--font-sub); font-size: 13px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase; padding: 7px 16px; border-radius: 100px; transition: all .2s; cursor: default; }
        .sport-pill:hover { border-color: var(--yellow); background: rgba(253,251,84,0.14); }

        .sport-card { background: var(--white); border: 2px solid var(--navy); border-radius: 10px; padding: 22px 14px; text-align: center; cursor: pointer; transition: all .2s; color: var(--navy); }
        .sport-card:hover { background: var(--yellow); transform: translateY(-4px); box-shadow: 4px 4px 0 var(--navy); }
        .who-card { background: var(--white); border: 2px solid var(--navy); border-radius: 12px; padding: 28px 22px; transition: all .2s; }
        .who-card:hover { transform: translateY(-3px); box-shadow: 5px 5px 0 var(--navy); }

        .underline-scribble { position: relative; display: inline-block; }
        .underline-scribble::after {
          content: ''; position: absolute; left: -2%; right: -2%; bottom: -6px; height: 10px;
          background: var(--yellow); border-radius: 3px; z-index: -1; transform: rotate(-.6deg);
        }

        @media (max-width: 640px) {
          .doodle-desktop-only { display: none; }
        }
      `}</style>

      {/* HERO — navy, full-color logo treatment per brand guide */}
      <section style={{ background: 'var(--navy)', minHeight: 'calc(100vh - 72px)', marginTop: '72px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '70px 5% 60px', position: 'relative', overflow: 'hidden' }}>

        <PlayDoodle className="doodle-desktop-only" style={{ top: '8%', left: '3%', width: '220px' }} />
        <PlayDoodle className="doodle-desktop-only" flip style={{ bottom: '10%', right: '3%', width: '220px' }} />

        <div className="hero-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(253,251,84,0.1)', border: '1.5px solid var(--yellow)', color: 'var(--yellow)', fontFamily: 'var(--font-sub)', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '7px 18px', borderRadius: '100px', marginBottom: '32px', position: 'relative', zIndex: 2 }}>
          Now open to coaches in every sport
        </div>

        <h1 className="hero-h1" style={{ position: 'relative', zIndex: 2, marginBottom: '10px' }}>
          <img src="/cpc-logo-primary.svg" alt="Coaches Pay Coaches" style={{ width: 'min(720px, 92vw)', height: 'auto' }} />
        </h1>

        <p className="hero-sub-el" style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 'clamp(16px,2.2vw,22px)', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--yellow)', margin: '22px 0 18px', position: 'relative', zIndex: 2 }}>
          Learn. Share. Earn.
        </p>

        <p className="hero-sub-el" style={{ fontSize: 'clamp(15px,1.8vw,18px)', color: 'var(--off)', maxWidth: '580px', margin: '0 auto 36px', lineHeight: 1.7, position: 'relative', zIndex: 2 }}>
          Upload your practice plans, drills, and coaching content — or browse what other coaches have shared. From first-time parent coaches to seasoned pros, every sport, every level.
        </p>

        <div className="hero-btns-el" style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
          <button className="btn btn-green" onClick={() => navigate('/marketplace')}>Browse What Coaches Share →</button>
          <button className="btn btn-ghost" onClick={() => navigate(user ? '/seller' : '/auth')}>Share Your Content</button>
        </div>

        <div className="hero-pills-el" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '40px', position: 'relative', zIndex: 2 }}>
          {['Basketball', 'Soccer', 'Football', 'Baseball', 'Hockey', 'Nutrition'].map(s => (
            <span key={s} className="sport-pill">{s}</span>
          ))}
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ borderTop: '2px solid var(--navy)', borderBottom: '2px solid var(--navy)', background: 'var(--navy)', padding: '13px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', animation: 'marquee 32s linear infinite', whiteSpace: 'nowrap' }}>
          {Array(2).fill(['Practice Plans', 'Drill Libraries', 'Playbooks', 'Season Plans', 'Nutrition Guides', 'Film Breakdowns', 'Scouting Reports', 'S&C Programs', 'Mental Performance', 'Recruiting Guides']).flat().map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', padding: '0 28px', fontFamily: 'var(--font-sub)', fontSize: '12px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--cream)' }}>
              {item} <span style={{ color: 'var(--yellow)', fontSize: '16px' }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* WHY WE STARTED */}
      <section style={{ padding: '90px 5%', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
        <div className="section-label section-label-on-cream">Why We Started</div>
        <h2 className="section-title">Coaches deserve <em className="underline-scribble">credit</em> for the work</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--muted-on-cream)', fontSize: '1.05rem', lineHeight: 1.8 }}>
          <p>
            Coaching is one of the most demanding jobs in sports, and one of the least recognized. Coaches spend countless hours building practice plans, drawing up drills, and developing systems that shape young athletes — most of it never leaves a notebook.
          </p>
          <p>
            We built Coaches Pay Coaches so that knowledge doesn't stay stuck in one program. Share what you've built, learn from what other coaches have figured out, and get paid when someone finds your work useful.
          </p>
          <p style={{ color: 'var(--navy)', fontWeight: 500 }}>
            Whether you're a youth coach with a practice system that works, a nutritionist with meal plans that fuel performance, or a sports psychologist with mental-game protocols — your knowledge has value here.
          </p>
        </div>
        <button className="btn btn-green" style={{ marginTop: '2rem' }} onClick={() => navigate(user ? '/marketplace' : '/auth')}>
          Join the Community →
        </button>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '90px 5%', background: 'var(--navy)', color: 'var(--cream)' }}>
        <div style={{ marginBottom: '52px' }}>
          <div className="section-label">How It Works</div>
          <h2 className="section-title" style={{ color: 'var(--white)' }}>Four steps. <em style={{ color: 'var(--navy)' }} className="underline-scribble">Start today.</em></h2>
          <p style={{ color: 'var(--off)', fontSize: '16px', maxWidth: '500px', lineHeight: 1.7, opacity: .8 }}>Everything you need to learn from other coaches, or share what you know.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2px', border: '2px solid var(--navy-light)', borderRadius: '12px', overflow: 'hidden', background: 'var(--navy-light)' }}>
          {[
            { num: '01', title: 'Browse the Marketplace', desc: 'Search by sport, category, or keyword. Filter by price and find content that fits your program.' },
            { num: '02', title: 'Purchase Instantly', desc: 'Secure checkout, powered by Stripe. Pay once and get immediate access to your download.' },
            { num: '03', title: 'Download & Use It', desc: 'Access your files anytime from your library. Put it to work with your team right away.' },
            { num: '04', title: 'Share Your Knowledge', desc: 'Create a seller profile, upload your content, and earn when other coaches use it.' },
          ].map((step, i) => (
            <div key={i} style={{ background: 'var(--navy)', padding: '36px 28px', position: 'relative' }}>
              <div style={{ fontFamily: 'var(--font-header)', fontWeight: 400, fontSize: '64px', lineHeight: 1, color: 'rgba(253,251,84,0.12)', position: 'absolute', top: '14px', right: '18px' }}>{step.num}</div>
              <h3 style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: '10px', color: 'var(--white)' }}>{step.title}</h3>
              <p style={{ color: 'var(--off)', fontSize: '14px', lineHeight: 1.65, opacity: .85 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SPORTS */}
      <div style={{ background: 'var(--cream)', padding: '90px 5%' }}>
        <div className="section-label section-label-on-cream">Browse by Sport</div>
        <h2 className="section-title">Every sport. <em className="underline-scribble">Every level.</em></h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: '10px', marginTop: '48px' }}>
          {[
            { name: 'Basketball' }, { name: 'Soccer' }, { name: 'Football' }, { name: 'Baseball' },
            { name: 'Hockey' }, { name: 'Volleyball' }, { name: 'Lacrosse' }, { name: 'Tennis' },
            { name: 'Wrestling' }, { name: 'Golf' }, { name: 'Track & Field' }, { name: 'Swimming' },
          ].map(sport => (
            <div key={sport.name} className="sport-card" onClick={() => navigate('/marketplace')}>
              <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '.3px' }}>{sport.name}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="btn btn-ghost-dark" onClick={() => navigate('/marketplace')}>View All Sports →</button>
        </div>
      </div>

      {/* WHO IT'S FOR */}
      <section style={{ padding: '90px 5%', background: 'var(--white)' }}>
        <div className="section-label section-label-on-cream">Who It's For</div>
        <h2 className="section-title">Built for everyone <em className="underline-scribble">in the game</em></h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginTop: '48px' }}>
          {[
            { title: 'Youth & Club Coaches', desc: 'Find age-appropriate drills, practice plans, and competitive systems to develop your athletes.' },
            { title: 'High School Coaches', desc: 'Access full season plans, film breakdown tools, and recruiting guidance for your program.' },
            { title: 'Sports Nutritionists', desc: 'Share meal plans, supplement guides, and performance nutrition protocols with athletes and coaches.' },
            { title: 'Sports Psychologists', desc: 'Sell mental performance programs, mindset guides, and focus protocols that elevate performance.' },
            { title: 'Athletic Trainers', desc: 'Share injury-prevention protocols, recovery programs, and strength training resources.' },
            { title: 'PE Teachers', desc: 'Multi-sport drill libraries and beginner-friendly resources built for physical education.' },
            { title: 'Speed & Agility Coaches', desc: 'Sell your proven speed development programs, agility drills, and movement training systems.' },
            { title: 'Strength Coaches', desc: 'Share periodization plans, lifting programs, and performance tracking tools with your community.' },
          ].map(w => (
            <div key={w.title} className="who-card">
              <h3 style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: '19px', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--navy)' }}>{w.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted-on-cream)', lineHeight: 1.65 }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BECOME A SELLER CTA */}
      <div style={{ background: 'var(--navy)', padding: '90px 5%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <PlayDoodle className="doodle-desktop-only" style={{ top: '10%', left: '6%', width: '180px' }} />
        <PlayDoodle className="doodle-desktop-only" flip style={{ bottom: '8%', right: '6%', width: '180px' }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>Ready When You Are</div>
          <h2 style={{ fontFamily: 'var(--font-header)', fontWeight: 400, fontSize: 'clamp(32px, 5vw, 56px)', textTransform: 'uppercase', color: 'var(--white)', marginBottom: '16px' }}>
            Share your <em style={{ color: 'var(--navy)', fontStyle: 'normal', background: 'var(--yellow)', padding: '0 12px' }}>knowledge</em>
          </h2>
          <p style={{ color: 'var(--off)', fontSize: '16px', maxWidth: '520px', margin: '0 auto 36px', lineHeight: 1.7, opacity: .85 }}>
            Every coach, trainer, and sports professional has something worth passing on. Create your profile, upload what you've built, and help other coaches do their jobs better.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-green" onClick={() => navigate(user ? '/seller' : '/auth')}>Become a Seller →</button>
            <button className="btn btn-ghost" onClick={() => navigate('/marketplace')}>Browse Resources</button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: 'var(--navy)', padding: '3rem 5% 1.5rem' }}>
        <div className="footer-inner" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <img src="/cpc-logo-secondary.svg" alt="Coaches Pay Coaches" style={{ height: '54px', width: 'auto', marginBottom: '14px' }} />
            <p style={{ color: 'var(--off)', fontSize: '.88rem', lineHeight: 1.6, maxWidth: '280px', opacity: .8 }}>The resource hub for coaches, trainers, and sports professionals. Learn, share, and get paid for what you know.</p>
          </div>

          <div className="footer-col">
            <h4>Browse</h4>
            <ul>
              <li><a onClick={() => navigate('/marketplace')}>Marketplace</a></li>
              <li><a onClick={() => navigate('/coaches')}>Coaches</a></li>
              <li><a onClick={() => navigate('/auth')}>Sign Up</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Sellers</h4>
            <ul>
              <li><a onClick={() => navigate('/auth')}>Start Selling</a></li>
              <li><a onClick={() => navigate('/seller')}>My Store</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a onClick={() => navigate('/terms')}>Terms of Service</a></li>
              <li><a onClick={() => navigate('/privacy')}>Privacy Policy</a></li>
              <li><a onClick={() => navigate('/refunds')}>Refund Policy</a></li>
              <li><a href="mailto:christopherhappy05@gmail.com">Contact</a></li>
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ color: 'var(--off)', fontSize: '.82rem', opacity: .7 }}>© 2026 <em style={{ color: 'var(--yellow)', fontStyle: 'normal' }}>Coaches Pay Coaches</em>. Built for coaches, by coaches.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a style={{ color: 'var(--off)', opacity: .7, fontSize: '.82rem', cursor: 'pointer', textDecoration: 'none' }} onClick={() => navigate('/terms')}>Terms</a>
            <a style={{ color: 'var(--off)', opacity: .7, fontSize: '.82rem', cursor: 'pointer', textDecoration: 'none' }} onClick={() => navigate('/privacy')}>Privacy</a>
            <a style={{ color: 'var(--off)', opacity: .7, fontSize: '.82rem', cursor: 'pointer', textDecoration: 'none' }} onClick={() => navigate('/refunds')}>Refunds</a>
            <a style={{ color: 'var(--off)', opacity: .7, fontSize: '.82rem', textDecoration: 'none' }} href="mailto:christopherhappy05@gmail.com">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

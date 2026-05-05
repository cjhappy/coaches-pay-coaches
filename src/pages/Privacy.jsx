import { useNavigate } from 'react-router-dom'

export default function Privacy() {
  const navigate = useNavigate()

  return (
    <div className="page-body">
      <nav className="cpc-nav">
        <a className="cpc-logo" onClick={() => navigate('/')}>
          <div className="logo-badge">CPC</div>
          <div className="logo-text">COACHES <em>PAY</em> COACHES</div>
        </a>
        <ul className="nav-links">
          <li><a onClick={() => navigate('/marketplace')}>Marketplace</a></li>
          <li><a onClick={() => navigate('/auth')} className="nav-cta">Get Started →</a></li>
        </ul>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 5%' }}>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 'clamp(32px, 5vw, 52px)', textTransform: 'uppercase', marginBottom: '8px' }}>
          Privacy <em style={{ color: 'var(--green)', fontStyle: 'normal' }}>Policy</em>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: '3rem' }}>Last updated: May 2025</p>

        {[
          {
            title: '1. Information We Collect',
            body: 'We collect information you provide directly to us when you create an account, including your name, email address, and role (buyer or seller). We also collect information about your activity on the Platform, including listings you create, purchases you make, and reviews you submit. Payment information is processed by Stripe and we do not store your full payment details.'
          },
          {
            title: '2. How We Use Your Information',
            body: 'We use the information we collect to operate and improve the Platform, process transactions, send transactional emails (such as purchase confirmations and sale notifications), respond to your requests and support needs, and comply with legal obligations. We do not sell your personal information to third parties.'
          },
          {
            title: '3. Information Sharing',
            body: 'We share your information with Stripe for payment processing, Supabase for database and authentication services, and Resend for email delivery. When you make a purchase, your name may be visible to the seller. When you sell, your name and bio are publicly visible on your coach profile. We do not share your email address with other users.'
          },
          {
            title: '4. Cookies and Tracking',
            body: 'We use cookies and similar technologies to keep you logged in and remember your preferences. We do not use third-party advertising cookies or tracking pixels. You can control cookies through your browser settings, but disabling them may affect your ability to use the Platform.'
          },
          {
            title: '5. Data Security',
            body: 'We take reasonable measures to protect your information from unauthorized access, loss, or disclosure. Your password is encrypted and never stored in plain text. However, no method of transmission over the internet is 100% secure and we cannot guarantee absolute security.'
          },
          {
            title: '6. Data Retention',
            body: 'We retain your account information for as long as your account is active. If you delete your account, we will delete your personal information within 30 days, except where we are required to retain it for legal or financial compliance purposes.'
          },
          {
            title: '7. Your Rights',
            body: 'You have the right to access, correct, or delete your personal information at any time. You can update your profile information from your dashboard. To request deletion of your account and data, contact us at christopherhappy05@gmail.com. If you are in the EU or California, you may have additional rights under GDPR or CCPA.'
          },
          {
            title: '8. Children\'s Privacy',
            body: 'The Platform is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.'
          },
          {
            title: '9. Changes to This Policy',
            body: 'We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a notice on the Platform. Your continued use of the Platform after changes constitutes acceptance of the updated policy.'
          },
          {
            title: '10. Contact',
            body: 'For questions about this Privacy Policy or to exercise your rights, please contact us at christopherhappy05@gmail.com.'
          }
        ].map(section => (
          <div key={section.title} style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '1.2rem', textTransform: 'uppercase', color: 'var(--white)', marginBottom: '8px' }}>
              {section.title}
            </h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '.95rem' }}>{section.body}</p>
          </div>
        ))}
      </div>

      <footer style={{ background: 'var(--navy-mid)', borderTop: '1px solid var(--border)', padding: '2rem 5%', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>
          © 2025 <em style={{ color: 'var(--green)', fontStyle: 'normal' }}>Coaches Pay Coaches</em> ·
          <a onClick={() => navigate('/terms')} style={{ color: 'var(--muted)', marginLeft: '8px', cursor: 'pointer', textDecoration: 'underline' }}>Terms of Service</a>
        </p>
      </footer>
    </div>
  )
}
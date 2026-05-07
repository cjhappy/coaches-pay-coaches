import { useNavigate } from 'react-router-dom'
import NavMessagesLink from '../components/NavMessagesLink'

export default function RefundPolicy() {
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
          <li><a onClick={() => navigate('/coaches')}>Coaches</a></li>
          <li><a onClick={() => navigate('/dashboard')}>Dashboard</a></li>
        </ul>
      </nav>

      <div className="dash-header">
        <div className="section-label">Legal</div>
        <h1>Refund <em>Policy</em></h1>
        <p style={{ color: 'var(--muted)' }}>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      <div className="dash-body" style={{ maxWidth: '720px' }}>

        <div className="cpc-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', borderColor: 'rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.05)' }}>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1.1rem', textTransform: 'uppercase', color: '#f87171', marginBottom: '8px' }}>All Sales Are Final</div>
          <p style={{ color: 'var(--off)', fontSize: '.92rem', lineHeight: 1.7, margin: 0 }}>
            Due to the digital nature of all products sold on Coaches Pay Coaches, all purchases are final and non-refundable. Once a file has been delivered, we are unable to offer refunds, exchanges, or credits under any circumstances.
          </p>
        </div>

        <div className="cpc-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', marginBottom: '12px' }}>Why We Have This Policy</div>
          <p style={{ color: 'var(--off)', fontSize: '.92rem', lineHeight: 1.7, marginBottom: '12px' }}>
            Coaches Pay Coaches is a marketplace for digital coaching resources — playbooks, film breakdowns, training plans, and other downloadable materials. Unlike physical goods, digital files are delivered instantly and cannot be returned once accessed.
          </p>
          <p style={{ color: 'var(--off)', fontSize: '.92rem', lineHeight: 1.7, margin: 0 }}>
            This policy protects the coaches and creators who invest significant time and expertise producing these resources. By completing a purchase, you acknowledge that you have reviewed the listing description, previews, and any available samples before buying.
          </p>
        </div>

        <div className="cpc-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', marginBottom: '12px' }}>What This Policy Covers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              'Downloadable files including PDFs, videos, audio, spreadsheets, and any other digital formats',
              'Purchases where the buyer claims the file did not meet expectations or was not what they wanted',
              'Purchases where the buyer no longer needs the resource after downloading',
              'Accidental purchases — please review your cart carefully before completing checkout',
              'Purchases made on behalf of another person or organization',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ color: '#f87171', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>×</span>
                <span style={{ color: 'var(--off)', fontSize: '.9rem', lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="cpc-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', marginBottom: '12px' }}>Exceptions</div>
          <p style={{ color: 'var(--off)', fontSize: '.92rem', lineHeight: 1.7, marginBottom: '12px' }}>
            We will review refund requests only in the following limited circumstances:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              'You were charged more than once for the same purchase due to a technical error',
              'The file delivered is corrupted, empty, or fundamentally different from what was described in the listing',
              'You can demonstrate that the listing contained materially false information',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--green)', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>✓</span>
                <span style={{ color: 'var(--off)', fontSize: '.9rem', lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '.85rem', lineHeight: 1.6, marginTop: '1rem', marginBottom: 0 }}>
            To request a review under these exceptions, contact us at <a href="mailto:christopherhappy05@gmail.com" style={{ color: 'var(--green)', textDecoration: 'none' }}>christopherhappy05@gmail.com</a> within 7 days of purchase with your order details and a description of the issue. We do not guarantee a refund will be issued.
          </p>
        </div>

        <div className="cpc-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', marginBottom: '12px' }}>Chargebacks</div>
          <p style={{ color: 'var(--off)', fontSize: '.92rem', lineHeight: 1.7, marginBottom: '12px' }}>
            By completing a purchase on Coaches Pay Coaches, you agree to this refund policy and acknowledge that initiating a chargeback outside of this process is a violation of our Terms of Service.
          </p>
          <p style={{ color: 'var(--off)', fontSize: '.92rem', lineHeight: 1.7, margin: 0 }}>
            In the event of a fraudulent chargeback, we reserve the right to provide Stripe and relevant financial institutions with evidence of purchase, file delivery, and agreement to this policy, and to pursue recovery of disputed funds.
          </p>
        </div>

        <div className="cpc-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', marginBottom: '12px' }}>Contact</div>
          <p style={{ color: 'var(--off)', fontSize: '.92rem', lineHeight: 1.7, margin: 0 }}>
            If you have questions about this policy before making a purchase, reach out at <a href="mailto:christopherhappy05@gmail.com" style={{ color: 'var(--green)', textDecoration: 'none' }}>christopherhappy05@gmail.com</a>. We're happy to help you make an informed decision before you buy.
          </p>
        </div>

        <p style={{ color: 'var(--muted)', fontSize: '.8rem', textAlign: 'center', marginTop: '2rem' }}>
          By purchasing on Coaches Pay Coaches you confirm you have read and agreed to this policy.
        </p>

      </div>
    </div>
  )
}
import { useNavigate } from 'react-router-dom'

export default function Terms() {
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
          Terms of <em style={{ color: 'var(--green)', fontStyle: 'normal' }}>Service</em>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: '3rem' }}>Last updated: May 2025</p>

        {[
          {
            title: '1. Acceptance of Terms',
            body: 'By accessing or using Coaches Pay Coaches ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. These terms apply to all users including buyers, sellers, and visitors.'
          },
          {
            title: '2. Description of Service',
            body: 'Coaches Pay Coaches is an online marketplace that allows youth sports coaches to buy and sell coaching materials including practice plans, drills, playbooks, and other educational resources. We act as a platform connecting buyers and sellers and are not responsible for the content of individual listings.'
          },
          {
            title: '3. User Accounts',
            body: 'You must create an account to buy or sell on the Platform. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must provide accurate and complete information when creating your account. You must be at least 18 years old to create an account.'
          },
          {
            title: '4. Seller Terms',
            body: 'As a seller, you represent that you have the right to sell the materials you list. You retain ownership of your content but grant Coaches Pay Coaches a license to display and distribute it through the Platform. Sellers receive their earnings minus a platform fee of 12% plus $0.99 per transaction. Payouts are processed through Stripe Connect. You are responsible for reporting and paying any applicable taxes on your earnings.'
          },
          {
            title: '5. Buyer Terms',
            body: 'All purchases are final. We do not offer refunds except in cases where the purchased content is materially different from what was described, or if the file is corrupted and cannot be accessed. By purchasing, you receive a personal, non-transferable license to use the materials for your own coaching purposes. You may not resell, redistribute, or share purchased materials.'
          },
          {
            title: '6. Prohibited Content',
            body: 'You may not list or sell content that is illegal, plagiarized, or infringes on third-party intellectual property rights. You may not post false, misleading, or deceptive listings. Coaches Pay Coaches reserves the right to remove any listing and suspend any account that violates these terms.'
          },
          {
            title: '7. Platform Fees',
            body: 'Coaches Pay Coaches charges a platform fee of 12% of the sale price plus $0.99 per transaction. This fee is deducted automatically from the seller payout. Free listings have no transaction fee. Stripe payment processing fees may also apply.'
          },
          {
            title: '8. Intellectual Property',
            body: 'All content on the Platform, including the Coaches Pay Coaches name, logo, and design, is owned by Coaches Pay Coaches and protected by copyright law. Sellers retain ownership of their uploaded materials. By uploading content, sellers grant Coaches Pay Coaches a non-exclusive license to display and distribute the content through the Platform.'
          },
          {
            title: '9. Disclaimer of Warranties',
            body: 'The Platform is provided "as is" without warranties of any kind. We do not guarantee the accuracy, quality, or suitability of any content listed on the Platform. Coaches Pay Coaches is not responsible for disputes between buyers and sellers.'
          },
          {
            title: '10. Limitation of Liability',
            body: 'To the maximum extent permitted by law, Coaches Pay Coaches shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform. Our total liability shall not exceed the amount you paid to us in the three months preceding the claim.'
          },
          {
            title: '11. Termination',
            body: 'We reserve the right to suspend or terminate your account at any time for violations of these terms. You may close your account at any time by contacting us. Upon termination, your right to use the Platform will immediately cease.'
          },
          {
            title: '12. Changes to Terms',
            body: 'We may update these terms from time to time. We will notify users of significant changes by email or by posting a notice on the Platform. Continued use of the Platform after changes constitutes acceptance of the updated terms.'
          },
          {
            title: '13. Contact',
            body: 'For questions about these Terms of Service, please contact us at christopherhappy05@gmail.com.'
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
          <a onClick={() => navigate('/privacy')} style={{ color: 'var(--muted)', marginLeft: '8px', cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</a>
        </p>
      </footer>
    </div>
  )
}
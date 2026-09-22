const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

// This function is only ever called server-to-server, by our own stripe-webhook
// function — never directly from the browser. INTERNAL_FUNCTION_SECRET is a
// shared secret only our own functions know, so a stranger can't call this
// endpoint directly to send arbitrary emails from our domain.
exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' }

  try {
    const internalSecret = event.headers['x-internal-secret']
    if (!internalSecret || internalSecret !== process.env.INTERNAL_FUNCTION_SECRET) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) }
    }

    const { type, data } = JSON.parse(event.body)

    if (type === 'welcome') {
      await resend.emails.send({
        from: 'Coaches Pay Coaches <noreply@coachespaycoaches.org>',
        to: data.sellerEmail,
        subject: 'Welcome to Coaches Pay Coaches — let\'s get you set up 🏆',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#0D3247;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D3247;padding:40px 20px;">
              <tr><td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#123c53;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;">
                  <tr>
                    <td style="background:#0D3247;padding:24px 40px;border-bottom:1px solid rgba(255,255,255,0.07);">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width:40px;height:40px;background:#FDFB54;border-radius:8px;text-align:center;vertical-align:middle;">
                            <span style="font-weight:900;font-size:13px;color:#0D3247;">CPC</span>
                          </td>
                          <td style="padding-left:10px;">
                            <span style="font-weight:800;font-size:15px;color:#ffffff;">COACHES <span style="color:#FDFB54;">PAY</span> COACHES</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px;">
                      <p style="font-weight:900;font-size:28px;text-transform:uppercase;color:#ffffff;margin:0 0 8px;">Welcome, ${data.sellerName}! 🎉</p>
                      <p style="color:#7a95ae;font-size:15px;line-height:1.7;margin:0 0 28px;">You're in. Here's how to start turning your coaching materials into income.</p>

                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D3247;border-radius:10px;padding:20px;margin-bottom:28px;">
                        <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                          <span style="color:#FDFB54;font-weight:900;">1.</span>
                          <span style="color:#ffffff;font-size:13px;"> &nbsp;Connect Stripe to get paid</span>
                        </td></tr>
                        <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                          <span style="color:#FDFB54;font-weight:900;">2.</span>
                          <span style="color:#ffffff;font-size:13px;"> &nbsp;Upload your first listing</span>
                        </td></tr>
                        <tr><td style="padding:8px 0;">
                          <span style="color:#FDFB54;font-weight:900;">3.</span>
                          <span style="color:#ffffff;font-size:13px;"> &nbsp;Share your listing link and start earning</span>
                        </td></tr>
                      </table>

                      <p style="color:#7a95ae;font-size:13px;line-height:1.6;margin:0 0 20px;">We've attached our full onboarding guide — walk through it at your own pace, or jump straight into your store below.</p>

                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:#FDFB54;border-radius:8px;">
                            <a href="https://coachespaycoaches.org/seller" style="display:inline-block;padding:12px 28px;font-weight:800;font-size:14px;text-transform:uppercase;color:#0D3247;text-decoration:none;">
                              Go To Your Store →
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#0D3247;padding:18px 40px;border-top:1px solid rgba(255,255,255,0.07);">
                      <p style="color:#7a95ae;font-size:12px;margin:0;">© 2026 Coaches Pay Coaches · <a href="https://coachespaycoaches.org" style="color:#FDFB54;text-decoration:none;">coachespaycoaches.org</a></p>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
          </html>
        `,
        attachments: [{
          path: 'https://coachespaycoaches.org/onboarding-guide.pdf',
          filename: 'CPC-Onboarding-Guide.pdf'
        }]
      })
    }

    if (type === 'dispute') {
      await resend.emails.send({
        from: 'Coaches Pay Coaches <noreply@coachespaycoaches.org>',
        to: data.to,
        subject: `⚠️ Payment disputed — "${data.listingTitle}"`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#0D3247;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D3247;padding:40px 20px;">
              <tr><td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#123c53;border:1px solid rgba(220,80,80,0.25);border-radius:16px;overflow:hidden;">
                  <tr>
                    <td style="background:#0D3247;padding:24px 40px;border-bottom:1px solid rgba(255,255,255,0.07);">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width:40px;height:40px;background:#e05c5c;border-radius:8px;text-align:center;vertical-align:middle;">
                            <span style="font-weight:900;font-size:13px;color:#0D3247;">CPC</span>
                          </td>
                          <td style="padding-left:10px;">
                            <span style="font-weight:800;font-size:15px;color:#ffffff;">COACHES <span style="color:#FDFB54;">PAY</span> COACHES</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px;">
                      <p style="font-weight:900;font-size:26px;text-transform:uppercase;color:#ffffff;margin:0 0 8px;">⚠️ Payment Disputed</p>
                      <p style="color:#7a95ae;font-size:15px;line-height:1.7;margin:0 0 20px;">
                        ${data.isAdmin
                          ? `A buyer has disputed a charge for <strong style="color:#ffffff;">${data.sellerName}</strong>'s listing.`
                          : `A buyer has disputed their payment for your listing. Stripe may place a temporary hold on the disputed amount while this is reviewed.`}
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D3247;border-radius:10px;padding:20px;margin-bottom:20px;">
                        <tr><td style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                          <span style="color:#7a95ae;font-size:13px;">Listing</span>
                          <span style="color:#ffffff;font-size:13px;float:right;">${data.listingTitle}</span>
                        </td></tr>
                        <tr><td style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                          <span style="color:#7a95ae;font-size:13px;">Disputed Amount</span>
                          <span style="color:#e05c5c;font-size:16px;font-weight:900;float:right;">$${data.amount}</span>
                        </td></tr>
                        <tr><td style="padding:6px 0;">
                          <span style="color:#7a95ae;font-size:13px;">Reason</span>
                          <span style="color:#ffffff;font-size:13px;float:right;text-transform:capitalize;">${(data.reason || 'unspecified').replace(/_/g, ' ')}</span>
                        </td></tr>
                      </table>

                      <p style="color:#7a95ae;font-size:13px;line-height:1.6;margin:0;">
                        Respond to this dispute directly in your Stripe dashboard — evidence is usually due within a set window from Stripe, so don't wait.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#0D3247;padding:18px 40px;border-top:1px solid rgba(255,255,255,0.07);">
                      <p style="color:#7a95ae;font-size:12px;margin:0;">© 2026 Coaches Pay Coaches · <a href="https://coachespaycoaches.org" style="color:#FDFB54;text-decoration:none;">coachespaycoaches.org</a></p>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
          </html>
        `
      })
    }

    if (type === 'comment') {
      await resend.emails.send({
        from: 'Coaches Pay Coaches <noreply@coachespaycoaches.org>',
        to: data.sellerEmail,
        subject: `New comment on "${data.listingTitle}" 💬`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#0D3247;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D3247;padding:40px 20px;">
              <tr><td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#123c53;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;">
                  <tr>
                    <td style="background:#0D3247;padding:24px 40px;border-bottom:1px solid rgba(255,255,255,0.07);">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width:40px;height:40px;background:#FDFB54;border-radius:8px;text-align:center;vertical-align:middle;">
                            <span style="font-weight:900;font-size:13px;color:#0D3247;">CPC</span>
                          </td>
                          <td style="padding-left:10px;">
                            <span style="font-weight:800;font-size:15px;color:#ffffff;">COACHES <span style="color:#FDFB54;">PAY</span> COACHES</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px;">
                      <p style="font-weight:900;font-size:26px;text-transform:uppercase;color:#ffffff;margin:0 0 8px;">New Comment 💬</p>
                      <p style="color:#7a95ae;font-size:15px;line-height:1.7;margin:0 0 20px;">${data.commenterName || 'Someone'} commented on <strong style="color:#ffffff;">${data.listingTitle}</strong>:</p>

                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D3247;border-radius:10px;padding:18px 20px;margin-bottom:28px;">
                        <tr><td>
                          <p style="color:#ffffff;font-size:14px;line-height:1.6;margin:0;">"${data.commentText}"</p>
                        </td></tr>
                      </table>

                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:#FDFB54;border-radius:8px;">
                            <a href="https://coachespaycoaches.org/listing/${data.listingId}" style="display:inline-block;padding:12px 28px;font-weight:800;font-size:14px;text-transform:uppercase;color:#0D3247;text-decoration:none;">
                              View & Reply →
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#0D3247;padding:18px 40px;border-top:1px solid rgba(255,255,255,0.07);">
                      <p style="color:#7a95ae;font-size:12px;margin:0;">© 2026 Coaches Pay Coaches · <a href="https://coachespaycoaches.org" style="color:#FDFB54;text-decoration:none;">coachespaycoaches.org</a></p>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
          </html>
        `
      })
    }

    if (type === 'sale') {
      // Email to seller
      await resend.emails.send({
        from: 'Coaches Pay Coaches <noreply@coachespaycoaches.org>',
        to: data.sellerEmail,
        subject: 'You made a sale! 🏆',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#0D3247;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D3247;padding:40px 20px;">
              <tr><td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#123c53;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;">
                  <tr>
                    <td style="background:#0D3247;padding:24px 40px;border-bottom:1px solid rgba(255,255,255,0.07);">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width:40px;height:40px;background:#FDFB54;border-radius:8px;text-align:center;vertical-align:middle;">
                            <span style="font-weight:900;font-size:13px;color:#0D3247;">CPC</span>
                          </td>
                          <td style="padding-left:10px;">
                            <span style="font-weight:800;font-size:15px;color:#ffffff;">COACHES <span style="color:#FDFB54;">PAY</span> COACHES</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px;">
                      <p style="font-weight:900;font-size:28px;text-transform:uppercase;color:#ffffff;margin:0 0 8px;">You Made a Sale! 🎉</p>
                      <p style="color:#7a95ae;font-size:15px;line-height:1.7;margin:0 0 28px;">Great news, ${data.sellerName} — someone just purchased your resource.</p>

                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D3247;border-radius:10px;padding:20px;margin-bottom:28px;">
                        <tr><td style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                          <span style="color:#7a95ae;font-size:13px;">Resource</span>
                          <span style="color:#ffffff;font-size:13px;float:right;">${data.listingTitle}</span>
                        </td></tr>
                        <tr><td style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                          <span style="color:#7a95ae;font-size:13px;">Sale Price</span>
                          <span style="color:#ffffff;font-size:13px;float:right;">$${data.amountTotal}</span>
                        </td></tr>
                        <tr><td style="padding:6px 0;">
                          <span style="color:#7a95ae;font-size:13px;">Your Earnings</span>
                          <span style="color:#FDFB54;font-size:16px;font-weight:900;float:right;">$${data.amountSeller}</span>
                        </td></tr>
                      </table>

                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:#FDFB54;border-radius:8px;">
                            <a href="https://coachespaycoaches.org/seller" style="display:inline-block;padding:12px 28px;font-weight:800;font-size:14px;text-transform:uppercase;color:#0D3247;text-decoration:none;">
                              View Your Store →
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#0D3247;padding:18px 40px;border-top:1px solid rgba(255,255,255,0.07);">
                      <p style="color:#7a95ae;font-size:12px;margin:0;">© 2025 Coaches Pay Coaches · <a href="https://coachespaycoaches.org" style="color:#FDFB54;text-decoration:none;">coachespaycoaches.org</a></p>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
          </html>
        `
      })

      // Email to buyer
      await resend.emails.send({
        from: 'Coaches Pay Coaches <noreply@coachespaycoaches.org>',
        to: data.buyerEmail,
        subject: 'Your purchase is ready! 📥',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#0D3247;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D3247;padding:40px 20px;">
              <tr><td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#123c53;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;">
                  <tr>
                    <td style="background:#0D3247;padding:24px 40px;border-bottom:1px solid rgba(255,255,255,0.07);">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width:40px;height:40px;background:#FDFB54;border-radius:8px;text-align:center;vertical-align:middle;">
                            <span style="font-weight:900;font-size:13px;color:#0D3247;">CPC</span>
                          </td>
                          <td style="padding-left:10px;">
                            <span style="font-weight:800;font-size:15px;color:#ffffff;">COACHES <span style="color:#FDFB54;">PAY</span> COACHES</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px;">
                      <p style="font-weight:900;font-size:28px;text-transform:uppercase;color:#ffffff;margin:0 0 8px;">Your Purchase is Ready! 📥</p>
                      <p style="color:#7a95ae;font-size:15px;line-height:1.7;margin:0 0 28px;">Thanks for your purchase, ${data.buyerName}! Your resource is ready to download.</p>

                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D3247;border-radius:10px;padding:20px;margin-bottom:28px;">
                        <tr><td style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                          <span style="color:#7a95ae;font-size:13px;">Resource</span>
                          <span style="color:#ffffff;font-size:13px;float:right;">${data.listingTitle}</span>
                        </td></tr>
                        <tr><td style="padding:6px 0;">
                          <span style="color:#7a95ae;font-size:13px;">Amount Paid</span>
                          <span style="color:#FDFB54;font-size:16px;font-weight:900;float:right;">$${data.amountTotal}</span>
                        </td></tr>
                      </table>

                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:#FDFB54;border-radius:8px;">
                            <a href="${data.buyerDownloadUrl || 'https://coachespaycoaches.org/purchases'}" style="display:inline-block;padding:12px 28px;font-weight:800;font-size:14px;text-transform:uppercase;color:#0D3247;text-decoration:none;">
                              ${data.buyerDownloadUrl ? 'Download Now →' : 'Download Your Resource →'}
                            </a>
                          </td>
                        </tr>
                      </table>

                      ${data.isGuest ? `
                      <p style="color:#7a95ae;font-size:12.5px;line-height:1.6;margin:22px 0 0;">
                        This link works for 30 days. Want it saved somewhere permanent? <a href="https://coachespaycoaches.org/auth" style="color:#FDFB54;text-decoration:none;">Create a free account</a> with this same email and future purchases (and this one) will live in your library.
                      </p>
                      ` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#0D3247;padding:18px 40px;border-top:1px solid rgba(255,255,255,0.07);">
                      <p style="color:#7a95ae;font-size:12px;margin:0;">© 2025 Coaches Pay Coaches · <a href="https://coachespaycoaches.org" style="color:#FDFB54;text-decoration:none;">coachespaycoaches.org</a></p>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
          </html>
        `
      })
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) }
  } catch (err) {
    console.error('send-email failed:', err.message)
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) }
  }
}

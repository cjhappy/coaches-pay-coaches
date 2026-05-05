const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }

  try {
    const { type, data } = JSON.parse(event.body)

    if (type === 'sale') {
      // Email to seller
      await resend.emails.send({
        from: 'Coaches Pay Coaches <noreply@coachespaycoaches.org>',
        to: data.sellerEmail,
        subject: 'You made a sale! 🏆',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#0b1622;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1622;padding:40px 20px;">
              <tr><td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#111f30;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;">
                  <tr>
                    <td style="background:#0b1622;padding:24px 40px;border-bottom:1px solid rgba(255,255,255,0.07);">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width:40px;height:40px;background:#2ecc71;border-radius:8px;text-align:center;vertical-align:middle;">
                            <span style="font-weight:900;font-size:13px;color:#0b1622;">CPC</span>
                          </td>
                          <td style="padding-left:10px;">
                            <span style="font-weight:800;font-size:15px;color:#ffffff;">COACHES <span style="color:#2ecc71;">PAY</span> COACHES</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px;">
                      <p style="font-weight:900;font-size:28px;text-transform:uppercase;color:#ffffff;margin:0 0 8px;">You Made a Sale! 🎉</p>
                      <p style="color:#7a95ae;font-size:15px;line-height:1.7;margin:0 0 28px;">Great news, ${data.sellerName} — someone just purchased your resource.</p>

                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1622;border-radius:10px;padding:20px;margin-bottom:28px;">
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
                          <span style="color:#2ecc71;font-size:16px;font-weight:900;float:right;">$${data.amountSeller}</span>
                        </td></tr>
                      </table>

                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:#2ecc71;border-radius:8px;">
                            <a href="https://coachespaycoaches.org/seller" style="display:inline-block;padding:12px 28px;font-weight:800;font-size:14px;text-transform:uppercase;color:#0b1622;text-decoration:none;">
                              View Your Store →
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#0b1622;padding:18px 40px;border-top:1px solid rgba(255,255,255,0.07);">
                      <p style="color:#7a95ae;font-size:12px;margin:0;">© 2025 Coaches Pay Coaches · <a href="https://coachespaycoaches.org" style="color:#2ecc71;text-decoration:none;">coachespaycoaches.org</a></p>
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
          <body style="margin:0;padding:0;background:#0b1622;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1622;padding:40px 20px;">
              <tr><td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#111f30;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;">
                  <tr>
                    <td style="background:#0b1622;padding:24px 40px;border-bottom:1px solid rgba(255,255,255,0.07);">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width:40px;height:40px;background:#2ecc71;border-radius:8px;text-align:center;vertical-align:middle;">
                            <span style="font-weight:900;font-size:13px;color:#0b1622;">CPC</span>
                          </td>
                          <td style="padding-left:10px;">
                            <span style="font-weight:800;font-size:15px;color:#ffffff;">COACHES <span style="color:#2ecc71;">PAY</span> COACHES</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px;">
                      <p style="font-weight:900;font-size:28px;text-transform:uppercase;color:#ffffff;margin:0 0 8px;">Your Purchase is Ready! 📥</p>
                      <p style="color:#7a95ae;font-size:15px;line-height:1.7;margin:0 0 28px;">Thanks for your purchase, ${data.buyerName}! Your resource is ready to download.</p>

                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1622;border-radius:10px;padding:20px;margin-bottom:28px;">
                        <tr><td style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                          <span style="color:#7a95ae;font-size:13px;">Resource</span>
                          <span style="color:#ffffff;font-size:13px;float:right;">${data.listingTitle}</span>
                        </td></tr>
                        <tr><td style="padding:6px 0;">
                          <span style="color:#7a95ae;font-size:13px;">Amount Paid</span>
                          <span style="color:#2ecc71;font-size:16px;font-weight:900;float:right;">$${data.amountTotal}</span>
                        </td></tr>
                      </table>

                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:#2ecc71;border-radius:8px;">
                            <a href="https://coachespaycoaches.org/purchases" style="display:inline-block;padding:12px 28px;font-weight:800;font-size:14px;text-transform:uppercase;color:#0b1622;text-decoration:none;">
                              Download Your Resource →
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#0b1622;padding:18px 40px;border-top:1px solid rgba(255,255,255,0.07);">
                      <p style="color:#7a95ae;font-size:12px;margin:0;">© 2025 Coaches Pay Coaches · <a href="https://coachespaycoaches.org" style="color:#2ecc71;text-decoration:none;">coachespaycoaches.org</a></p>
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
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) }
  }
}
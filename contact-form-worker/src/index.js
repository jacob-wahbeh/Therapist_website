/**
 * Cloudflare Worker for handling contact form submissions
 * Sends emails via Resend API
 */

export default {
	async fetch(request, env, ctx) {
		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}

		// Only allow POST requests
		if (request.method !== 'POST') {
			return new Response(JSON.stringify({ error: 'Method not allowed' }), {
				status: 405,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		try {
			// Parse form data
			const formData = await request.formData();
			const name = formData.get('name') || 'Not provided';
			const email = formData.get('email') || 'Not provided';
			const phone = formData.get('phone') || 'Not provided';
			const message = formData.get('message') || 'Not provided';


			// Send email via Resend
			const emailResponse = await fetch('https://api.resend.com/emails', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${env.RESEND_API_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					from: 'Jacob Sadan Therapy <noreply@jacobsadan.com>',
					to: 'jacobsadantherapy@gmail.com',
					replyTo: email,
					subject: `📬 New Inquiry from ${name}`,
					html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f3f0; font-family: 'Segoe UI', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3f0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #5B7B7A 0%, #7A9E9D 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">New Client Inquiry</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              
              <!-- Contact Info Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf8f5; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 16px; border-bottom: 1px solid #e8dfd5;">
                          <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">From</span>
                          <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 600; color: #333;">${name}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="50%" style="vertical-align: top;">
                                <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</span>
                                <p style="margin: 4px 0 0 0;"><a href="mailto:${email}" style="color: #5B7B7A; text-decoration: none; font-weight: 500;">${email}</a></p>
                              </td>
                              <td width="50%" style="vertical-align: top;">
                                <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Phone</span>
                                <p style="margin: 4px 0 0 0; color: #333;">${phone}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Message -->
              <div style="margin-bottom: 24px;">
                <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Message</span>
                <div style="margin-top: 8px; padding: 20px; background-color: #faf8f5; border-radius: 12px; border-left: 4px solid #5B7B7A;">
                  <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                </div>
              </div>
              
              <!-- Reply Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="mailto:${email}?subject=Re: Your inquiry to Jacob Sadan Therapy" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #5B7B7A 0%, #7A9E9D 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Reply to ${name}</a>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #faf8f5; text-align: center; border-top: 1px solid #e8dfd5;">
              <p style="margin: 0; color: #888; font-size: 12px;">Sent from the contact form on jacobsadan.com</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `,
				}),
			});

			if (!emailResponse.ok) {
				const errorData = await emailResponse.json();
				console.error('Resend API error:', errorData);
				throw new Error('Failed to send email');
			}

			// Return success response
			return new Response(JSON.stringify({ success: true, message: 'Email sent successfully' }), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});

		} catch (error) {
			console.error('Error processing form:', error);
			return new Response(JSON.stringify({ success: false, error: 'Failed to send message' }), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}
	},
};

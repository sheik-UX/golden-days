// Serverless function for Golden Days contact form submissions
// Destination: blakemaguire@drinkgoldendays.com

export default async function handler(req, res) {
  // CORS & Methods
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const { email, message, name } = body || {};

    // Validate email
    if (!email || !email.includes('@') || email.length < 5) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const recipient = 'blakemaguire@drinkgoldendays.com';
    const timestamp = new Date().toISOString();

    console.log(`[Contact Submission] from: ${email}, name: ${name || 'N/A'}, recipient: ${recipient}, time: ${timestamp}`);
    if (message) {
      console.log(`[Contact Message]: ${message}`);
    }

    // Check for Resend API key
    if (process.env.RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL || 'Golden Days Website <onboarding@resend.dev>',
          to: [recipient],
          reply_to: email,
          subject: `Golden Days Contact Form: Note from ${email}`,
          text: `New contact submission from Golden Days website:\n\nEmail: ${email}\nName: ${name || 'Not provided'}\nSubmitted at: ${timestamp}\n\nMessage:\n${message || '(No message content provided)'}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #4C3427;">
              <h2 style="color: #CC8D27;">New Note from Golden Days Website</h2>
              <p><strong>From:</strong> ${email} ${name ? `(${name})` : ''}</p>
              <p><strong>Date:</strong> ${timestamp}</p>
              <div style="background: #FFFDF6; border: 1px solid #E5DBB1; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="white-space: pre-wrap; margin: 0;">${message || '<em>No message content provided</em>'}</p>
              </div>
              <p style="font-size: 13px; color: #888;">Delivered to ${recipient} via Golden Days website contact form.</p>
            </div>
          `
        })
      });

      if (!resendResponse.ok) {
        const errorData = await resendResponse.json().catch(() => ({}));
        console.error('[Resend Error]', errorData);
        // Fall back gracefully with submission recorded response
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Thank you for reaching out! We received your message.',
      email: email
    });
  } catch (error) {
    console.error('[Contact Handler Error]', error);
    return res.status(500).json({
      error: 'An unexpected error occurred. Please email blakemaguire@drinkgoldendays.com directly.'
    });
  }
}

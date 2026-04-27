const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTP = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Expensify <onboarding@resend.dev>',
      to: [email],
      subject: `${otp} is your Expensify verification code`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px;">EXPENSIFY</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Expense Tracker</p>
          </div>
          <div style="background: #1e293b; padding: 40px 30px; border-radius: 0 0 16px 16px; text-align: center;">
            <h2 style="color: #f8fafc; margin: 0 0 10px; font-size: 22px;">Verify Your Email</h2>
            <p style="color: #94a3b8; margin: 0 0 30px; font-size: 15px; line-height: 1.5;">
              Enter this code to complete your sign up. The code expires in 10 minutes.
            </p>
            <div style="background: #0f172a; border: 2px solid #6366f1; border-radius: 12px; padding: 20px; margin: 0 0 30px; display: inline-block;">
              <span style="color: #f8fafc; font-size: 36px; font-weight: 800; letter-spacing: 12px; font-family: monospace;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 13px; margin: 0;">
              If you didn't request this code, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error('Failed to send verification email');
    }

    return data;
  } catch (err) {
    console.error('Email service error:', err);
    throw err;
  }
};

module.exports = { sendOTP };

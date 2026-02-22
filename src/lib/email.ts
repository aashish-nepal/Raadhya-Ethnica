import nodemailer from "nodemailer";

// ─── Transporter (Gmail SMTP) ──────────────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // 16-char App Password (not your Gmail password)
    },
  });
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: options.from || `"Raadhya Ethnica" <${process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log("✅ Email sent:", info.messageId);
    return { success: true, data: info };
  } catch (error: any) {
    console.error("❌ Email sending error:", error.message);
    return { success: false, error: error.message };
  }
}

// ─── Order Confirmation (Customer) ────────────────────────────────────────────
export async function sendOrderConfirmationEmail(
  email: string,
  orderDetails: {
    orderId: string;
    customerName: string;
    items: Array<{ name: string; quantity: number; price: number; color?: string; size?: string }>;
    total: number;
    shippingAddress: string;
    paymentMethod?: string;
  }
) {
  const itemsHtml = orderDetails.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.color ? `<span style="display:inline-block;background:#f3e8ff;color:#7e22ce;padding:2px 8px;border-radius:12px;font-size:12px;">${item.color}</span>` : '<span style="color:#9ca3af;font-size:12px;">—</span>'}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.size ? `<span style="display:inline-block;background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:600;">${item.size}</span>` : '<span style="color:#9ca3af;font-size:12px;">—</span>'}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">$${item.price.toFixed(2)}</td>
        </tr>`
    )
    .join("");


  const html = `<!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:linear-gradient(135deg,#D946EF 0%,#C026D3 100%);padding:30px;text-align:center;border-radius:8px 8px 0 0;">
          <h1 style="color:white;margin:0;font-size:28px;">Raadhya Ethnica</h1>
        </div>
        <div style="background:white;padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;background:#10b981;color:white;width:60px;height:60px;border-radius:50%;line-height:60px;font-size:28px;margin-bottom:12px;">✓</div>
            <h2 style="color:#111827;margin:0 0 8px;">Order Confirmed!</h2>
            <p style="color:#6b7280;margin:0;">Thank you for your purchase, ${orderDetails.customerName}</p>
          </div>
          <div style="background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:20px;">
            <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Order ID</p>
            <p style="margin:0;font-family:monospace;color:#D946EF;font-weight:bold;">${orderDetails.orderId}</p>
          </div>
          <h3 style="color:#111827;margin:0 0 12px;">Order Details</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <thead><tr style="background:#f9fafb;">
              <th style="padding:10px 8px;text-align:left;border-bottom:2px solid #e5e7eb;">Item</th>
              <th style="padding:10px 8px;text-align:center;border-bottom:2px solid #e5e7eb;">Color</th>
              <th style="padding:10px 8px;text-align:center;border-bottom:2px solid #e5e7eb;">Size</th>
              <th style="padding:10px 8px;text-align:center;border-bottom:2px solid #e5e7eb;">Qty</th>
              <th style="padding:10px 8px;text-align:right;border-bottom:2px solid #e5e7eb;">Price</th>
            </tr></thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot><tr>
              <td colspan="2" style="padding:12px 8px;text-align:right;font-weight:bold;">Total:</td>
              <td style="padding:12px 8px;text-align:right;font-weight:bold;color:#D946EF;font-size:18px;">$${orderDetails.total.toFixed(2)}</td>
            </tr></tfoot>
          </table>
          <h3 style="color:#111827;margin:0 0 8px;">Shipping Address</h3>
          <p style="color:#6b7280;margin:0 0 20px;line-height:1.8;">${orderDetails.shippingAddress}</p>
          <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:14px;border-radius:4px;margin-bottom:20px;">
            <p style="margin:0;color:#1e40af;font-size:14px;"><strong>What's next?</strong></p>
            <p style="margin:6px 0 0;color:#1e40af;font-size:14px;">We'll send you tracking information once your order ships. Estimated delivery: 5–7 business days.</p>
          </div>
          <div style="text-align:center;margin-top:24px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders" style="display:inline-block;background:#D946EF;color:white;padding:12px 30px;text-decoration:none;border-radius:6px;font-weight:600;">Track Your Order</a>
          </div>
          <div style="text-align:center;margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;">
            <p style="color:#6b7280;font-size:13px;margin:0;">Need help? <a href="mailto:support@raadhyaethnica.com" style="color:#D946EF;">support@raadhyaethnica.com</a></p>
          </div>
        </div>
        <div style="text-align:center;margin-top:20px;color:#9ca3af;font-size:12px;"><p>© 2024 Raadhya Ethnica. All rights reserved.</p></div>
      </body>
    </html>`;

  return sendEmail({
    to: email,
    subject: `Order Confirmed — ${orderDetails.orderId}`,
    html,
  });
}

// ─── Admin New Order Alert ─────────────────────────────────────────────────────
export async function sendAdminOrderAlert(orderDetails: {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; price: number; color?: string; size?: string }>;
  total: number;
  shippingAddress: string;
  paymentMethod: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return { success: false, error: "No admin email configured" };

  const itemsHtml = orderDetails.items
    .map(item => `<tr>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.color ? `<span style="display:inline-block;background:#f3e8ff;color:#7e22ce;padding:2px 8px;border-radius:12px;font-size:12px;">${item.color}</span>` : '<span style="color:#9ca3af;font-size:12px;">—</span>'}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.size ? `<span style="display:inline-block;background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:600;">${item.size}</span>` : '<span style="color:#9ca3af;font-size:12px;">—</span>'}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">$${item.price.toFixed(2)}</td>
        </tr>`).join("");

  const html = `<!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:linear-gradient(135deg,#1e40af 0%,#1d4ed8 100%);padding:30px;text-align:center;border-radius:8px 8px 0 0;">
          <h1 style="color:white;margin:0;font-size:24px;">🛍️ New Order Received!</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Raadhya Ethnica Admin Alert</p>
        </div>
        <div style="background:white;padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <div style="background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:20px;">
            <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Order Number</p>
            <p style="margin:0;font-family:monospace;color:#1e40af;font-weight:bold;font-size:16px;">${orderDetails.orderNumber}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:140px;">Customer</td><td style="padding:6px 0;font-weight:500;">${orderDetails.customerName}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Email</td><td style="padding:6px 0;">${orderDetails.customerEmail}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Payment</td><td style="padding:6px 0;text-transform:capitalize;">${orderDetails.paymentMethod}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Ship To</td><td style="padding:6px 0;">${orderDetails.shippingAddress}</td></tr>
          </table>
          <h3 style="color:#111827;margin:0 0 12px;">Order Items</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <thead><tr style="background:#f9fafb;">
              <th style="padding:10px 8px;text-align:left;border-bottom:2px solid #e5e7eb;font-size:13px;">Item</th>
              <th style="padding:10px 8px;text-align:center;border-bottom:2px solid #e5e7eb;font-size:13px;">Color</th>
              <th style="padding:10px 8px;text-align:center;border-bottom:2px solid #e5e7eb;font-size:13px;">Size</th>
              <th style="padding:10px 8px;text-align:center;border-bottom:2px solid #e5e7eb;font-size:13px;">Qty</th>
              <th style="padding:10px 8px;text-align:right;border-bottom:2px solid #e5e7eb;font-size:13px;">Price</th>
            </tr></thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot><tr>
              <td colspan="2" style="padding:12px 8px;text-align:right;font-weight:bold;">Total:</td>
              <td style="padding:12px 8px;text-align:right;font-weight:bold;color:#1e40af;font-size:18px;">$${orderDetails.total.toFixed(2)}</td>
            </tr></tfoot>
          </table>
          <div style="text-align:center;margin-top:20px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders" style="display:inline-block;background:#1e40af;color:white;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:600;">View in Admin Panel</a>
          </div>
        </div>
        <div style="text-align:center;margin-top:20px;color:#9ca3af;font-size:12px;"><p>© 2024 Raadhya Ethnica Admin Notifications</p></div>
      </body>
    </html>`;

  return sendEmail({
    to: adminEmail,
    subject: `🛍️ New Order ${orderDetails.orderNumber} — $${orderDetails.total.toFixed(2)}`,
    html,
  });
}

// ─── Welcome Email (after registration) ───────────────────────────────────────
export async function sendWelcomeEmail(email: string, name: string) {
  const html = `<!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:linear-gradient(135deg,#D946EF 0%,#C026D3 100%);padding:40px;text-align:center;border-radius:8px 8px 0 0;">
          <h1 style="color:white;margin:0 0 8px;font-size:30px;">Welcome, ${name}! 🎉</h1>
          <p style="color:rgba(255,255,255,0.9);margin:0;font-size:16px;">Your Raadhya Ethnica account is ready</p>
        </div>
        <div style="background:white;padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <p style="font-size:16px;color:#111827;">Hi ${name},</p>
          <p style="color:#6b7280;">Welcome to Raadhya Ethnica! We're so excited to have you as part of our community. Explore our exclusive collection of handcrafted ethnic wear.</p>
          <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:15px;margin:20px 0;border-radius:4px;">
            <p style="margin:0;color:#92400e;font-size:14px;"><strong>🎁 First Order Gift</strong></p>
            <p style="margin:6px 0 0;color:#92400e;font-size:14px;">Use code <strong>WELCOME10</strong> for 10% off your first order!</p>
          </div>
          <div style="text-align:center;margin:30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" style="display:inline-block;background:#D946EF;color:white;padding:14px 36px;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;">Start Shopping</a>
          </div>
          <div style="text-align:center;padding-top:20px;border-top:1px solid #e5e7eb;">
            <p style="color:#6b7280;font-size:13px;margin:0;">Questions? <a href="mailto:support@raadhyaethnica.com" style="color:#D946EF;">support@raadhyaethnica.com</a></p>
          </div>
        </div>
        <div style="text-align:center;margin-top:20px;color:#9ca3af;font-size:12px;"><p>© 2024 Raadhya Ethnica. All rights reserved.</p></div>
      </body>
    </html>`;

  return sendEmail({ to: email, subject: "Welcome to Raadhya Ethnica! 🎉", html });
}

// ─── Shipping Notification (with tracking) ────────────────────────────────────
export async function sendShippingNotificationEmail(
  email: string,
  details: {
    customerName: string;
    orderNumber: string;
    trackingNumber: string;
    carrier?: string;
    estimatedDelivery?: string;
  }
) {
  const html = `<!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:linear-gradient(135deg,#D946EF 0%,#C026D3 100%);padding:30px;text-align:center;border-radius:8px 8px 0 0;">
          <h1 style="color:white;margin:0;font-size:28px;">Raadhya Ethnica</h1>
        </div>
        <div style="background:white;padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;background:#3b82f6;color:white;width:64px;height:64px;border-radius:50%;line-height:64px;font-size:32px;margin-bottom:12px;">🚚</div>
            <h2 style="color:#111827;margin:0 0 8px;">Your Order is On Its Way!</h2>
            <p style="color:#6b7280;margin:0;">Hi ${details.customerName}, your package has been shipped</p>
          </div>
          <div style="background:#f9fafb;padding:20px;border-radius:8px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:160px;">Order Number</td><td style="padding:6px 0;font-family:monospace;color:#D946EF;font-weight:bold;">${details.orderNumber}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Tracking Number</td><td style="padding:6px 0;font-family:monospace;font-weight:bold;">${details.trackingNumber}</td></tr>
              ${details.carrier ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Carrier</td><td style="padding:6px 0;">${details.carrier}</td></tr>` : ""}
              ${details.estimatedDelivery ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Est. Delivery</td><td style="padding:6px 0;font-weight:500;">${details.estimatedDelivery}</td></tr>` : ""}
            </table>
          </div>
          <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:14px;border-radius:4px;margin-bottom:24px;">
            <p style="margin:0;color:#1e40af;font-size:14px;"><strong>Delivery Tip</strong></p>
            <p style="margin:6px 0 0;color:#1e40af;font-size:14px;">Please ensure someone is available to receive the package. A signature may be required.</p>
          </div>
          <div style="text-align:center;margin-top:24px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders" style="display:inline-block;background:#D946EF;color:white;padding:12px 30px;text-decoration:none;border-radius:6px;font-weight:600;">Track Your Order</a>
          </div>
          <div style="text-align:center;margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;">
            <p style="color:#6b7280;font-size:13px;margin:0;">Questions? <a href="mailto:support@raadhyaethnica.com" style="color:#D946EF;">support@raadhyaethnica.com</a></p>
          </div>
        </div>
        <div style="text-align:center;margin-top:20px;color:#9ca3af;font-size:12px;"><p>© 2024 Raadhya Ethnica. All rights reserved.</p></div>
      </body>
    </html>`;

  return sendEmail({
    to: email,
    subject: `Your Order ${details.orderNumber} Has Shipped! 🚚`,
    html,
  });
}

// ─── Newsletter Welcome ────────────────────────────────────────────────────────
export async function sendNewsletterWelcomeEmail(email: string, name?: string) {
  const html = `<!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:linear-gradient(135deg,#D946EF 0%,#C026D3 100%);padding:40px;text-align:center;border-radius:8px 8px 0 0;">
          <h1 style="color:white;margin:0 0 10px;font-size:32px;">Welcome to Raadhya Ethnica!</h1>
          <p style="color:rgba(255,255,255,0.9);margin:0;font-size:16px;">Thank you for subscribing to our newsletter</p>
        </div>
        <div style="background:white;padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <p style="font-size:16px;color:#111827;">Hi${name ? ` ${name}` : ""},</p>
          <p style="color:#6b7280;">We're thrilled to have you join our community! Get ready to discover:</p>
          <ul style="color:#6b7280;margin:0 0 20px;padding-left:20px;">
            <li style="margin-bottom:8px;">Exclusive early access to new collections</li>
            <li style="margin-bottom:8px;">Special subscriber-only discounts</li>
            <li style="margin-bottom:8px;">Style tips and fashion inspiration</li>
            <li style="margin-bottom:8px;">Behind-the-scenes content</li>
          </ul>
          <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:15px;margin-bottom:24px;border-radius:4px;">
            <p style="margin:0;color:#92400e;font-size:14px;"><strong>🎁 Welcome Gift!</strong></p>
            <p style="margin:6px 0 0;color:#92400e;font-size:14px;">Use code <strong>WELCOME10</strong> for 10% off your first order!</p>
          </div>
          <div style="text-align:center;margin:24px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" style="display:inline-block;background:#D946EF;color:white;padding:12px 30px;text-decoration:none;border-radius:6px;font-weight:600;">Start Shopping</a>
          </div>
        </div>
        <div style="text-align:center;margin-top:20px;color:#9ca3af;font-size:12px;"><p>© 2024 Raadhya Ethnica. All rights reserved.</p></div>
      </body>
    </html>`;

  return sendEmail({ to: email, subject: "Welcome to Raadhya Ethnica - 10% Off Your First Order!", html });
}

// ─── Shipping Update (legacy alias) ───────────────────────────────────────────
export async function sendShippingUpdateEmail(
  email: string,
  shippingDetails: {
    orderId: string;
    customerName: string;
    trackingNumber: string;
    carrier: string;
    estimatedDelivery: string;
  }
) {
  return sendShippingNotificationEmail(email, {
    customerName: shippingDetails.customerName,
    orderNumber: shippingDetails.orderId,
    trackingNumber: shippingDetails.trackingNumber,
    carrier: shippingDetails.carrier,
    estimatedDelivery: shippingDetails.estimatedDelivery,
  });
}

// ─── Password Reset Email ──────────────────────────────────────────────────────
export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const html = `<!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:linear-gradient(135deg,#D946EF 0%,#C026D3 100%);padding:30px;text-align:center;border-radius:8px 8px 0 0;">
          <h1 style="color:white;margin:0;font-size:28px;">Raadhya Ethnica</h1>
        </div>
        <div style="background:white;padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;background:#fef3c7;color:#92400e;width:64px;height:64px;border-radius:50%;line-height:64px;font-size:32px;margin-bottom:12px;">&#128273;</div>
            <h2 style="color:#111827;margin:0 0 8px;">Reset Your Password</h2>
            <p style="color:#6b7280;margin:0;">We received a request to reset the password for your account.</p>
          </div>
          <p style="color:#374151;margin:0 0 24px;">Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${resetLink}" style="display:inline-block;background:#D946EF;color:white;padding:14px 36px;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;">Reset My Password</a>
          </div>
          <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:14px;border-radius:4px;margin-bottom:20px;">
            <p style="margin:0;color:#991b1b;font-size:14px;"><strong>Didn't request this?</strong></p>
            <p style="margin:6px 0 0;color:#991b1b;font-size:14px;">If you didn't request a password reset, you can safely ignore this email. Your password won't change.</p>
          </div>
          <p style="color:#9ca3af;font-size:12px;word-break:break-all;">Or copy this link into your browser:<br/><a href="${resetLink}" style="color:#D946EF;">${resetLink}</a></p>
          <div style="text-align:center;margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;">
            <p style="color:#6b7280;font-size:13px;margin:0;">Questions? <a href="mailto:support@raadhyaethnica.com" style="color:#D946EF;">support@raadhyaethnica.com</a></p>
          </div>
        </div>
        <div style="text-align:center;margin-top:20px;color:#9ca3af;font-size:12px;"><p>&#169; 2024 Raadhya Ethnica. All rights reserved.</p></div>
      </body>
    </html>`;

  return sendEmail({
    to: email,
    subject: "Reset your Raadhya Ethnica password",
    html,
  });
}

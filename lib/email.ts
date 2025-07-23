import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST!;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER!;
const smtpPass = process.env.SMTP_PASS!;
const fromEmail = process.env.SMTP_FROM!;
const adminEmail = process.env.ADMIN_EMAIL;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // true for 465, false for other ports
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

function orderToHtml(order: any) {
  return `
    <h2>Thank you for your order, ${order.customerName}!</h2>
    <p>Your order <b>${order.orderNumber}</b> has been placed successfully.</p>
    <h3>Order Summary</h3>
    <ul>
      ${order.items.map((item: any) => `<li>${item.productName} x ${item.quantity} - R${(item.price * item.quantity).toFixed(2)}</li>`).join('')}
    </ul>
    <p><b>Total:</b> R${order.totalAmount.toFixed(2)}</p>
    <h3>Shipping Address</h3>
    <p>${order.shippingAddress.addressLine1}<br>${order.shippingAddress.city}, ${order.shippingAddress.province}<br>${order.shippingAddress.postalCode}</p>
    <p>If you have any questions, reply to this email or contact us at ${fromEmail}.</p>
  `;
}

function orderToText(order: any) {
  return `Thank you for your order, ${order.customerName}!
Your order ${order.orderNumber} has been placed successfully.

Order Summary:
${order.items.map((item: any) => `- ${item.productName} x ${item.quantity} - R${(item.price * item.quantity).toFixed(2)}`).join('\n')}
Total: R${order.totalAmount.toFixed(2)}

Shipping Address:
${order.shippingAddress.addressLine1}
${order.shippingAddress.city}, ${order.shippingAddress.province}
${order.shippingAddress.postalCode}

If you have any questions, reply to this email or contact us at ${fromEmail}.
`;
}

export async function sendOrderConfirmationEmail({
  to,
  order,
  sendToAdmin = true,
}: {
  to: string;
  order: any;
  sendToAdmin?: boolean;
}) {
  const mailOptions = {
    from: fromEmail,
    to: [to, sendToAdmin && adminEmail].filter(Boolean).join(','),
    subject: `Order Confirmation - ${order.orderNumber}`,
    text: orderToText(order),
    html: orderToHtml(order),
  };
  await transporter.sendMail(mailOptions);
} 
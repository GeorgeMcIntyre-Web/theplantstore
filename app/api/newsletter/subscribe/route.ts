import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/db';
import { emailService } from '@/lib/email/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user) {
      // User exists, update newsletter subscription
      if (user.newsletterSubscribed) {
        return NextResponse.json(
          { error: 'You are already subscribed to our newsletter' },
          { status: 400 }
        );
      }

      user = await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { newsletterSubscribed: true },
      });
    } else {
      // Create new user with newsletter subscription
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          newsletterSubscribed: true,
          role: 'CUSTOMER',
        },
      });
    }

    // Send welcome email
    try {
      await emailService.sendTemplate(
        {
          subject: 'Welcome to The House Plant Store Newsletter! 🌱',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2d3748;">Welcome to The Plant Family! 🌿</h2>
              <p>Thank you for subscribing to our newsletter! We're excited to share our passion for plants with you.</p>
              
              <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #2d3748;">What you'll receive:</h4>
                <ul style="color: #4a5568; margin: 0; padding-left: 20px;">
                  <li>🌱 Plant care tips and seasonal advice</li>
                  <li>🆕 New arrivals and featured plants</li>
                  <li>💰 Exclusive offers and discounts</li>
                  <li>🌿 Expert gardening insights</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/collections" 
                   style="background-color: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Explore Our Plants
                </a>
              </div>

              <p>We'll send you our first newsletter soon. In the meantime, feel free to explore our collection!</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
              <p style="color: #718096; font-size: 14px;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${encodeURIComponent(email)}" 
                   style="color: #718096;">Unsubscribe</a> | 
                Contact us at support@theplantstore.co.za
              </p>
            </div>
          `,
        },
        email
      );
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the subscription if welcome email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 

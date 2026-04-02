import { NextRequest, NextResponse } from 'next/server';

/**
 * WhatsApp Message API via CallMeBot (free, no auth needed).
 * 
 * The member must first authorize the bot by visiting:
 * https://api.callmebot.com/whatsapp.php?phone=PHONE&text=test&apikey=REQUEST
 * and following the instructions. After that, messages can be sent freely.
 * 
 * Alternatively, this uses the wa.me deep link as a fallback to open WhatsApp 
 * with a pre-filled message (works without any API keys).
 */
export async function POST(req: NextRequest) {
  try {
    const { phone, message } = await req.json();

    if (!phone || !message) {
      return NextResponse.json({ error: 'Missing phone or message' }, { status: 400 });
    }

    // Clean the phone number — remove spaces, dashes, and leading +
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');

    // Generate wa.me link (universal fallback — always works)
    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    return NextResponse.json({ 
      success: true, 
      waLink,
      message: 'WhatsApp link generated' 
    });
  } catch (error: any) {
    console.error('WhatsApp API error:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}

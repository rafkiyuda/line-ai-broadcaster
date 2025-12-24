import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Received Webhook Payload:', JSON.stringify(body, null, 2));

        // In a real app, you should validate the signature using LINE_CHANNEL_SECRET
        // const signature = request.headers.get('x-line-signature');

        return NextResponse.json({ status: 'ok' }, { status: 200 });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}

// Add support for GET request to allow verification and browser visiting
export async function GET(request: Request) {
    return NextResponse.json({ status: 'ready', message: 'Webhook is active. Please use POST for LINE events.' }, { status: 200 });
}


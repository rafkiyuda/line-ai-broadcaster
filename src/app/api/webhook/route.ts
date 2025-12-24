import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Received Webhook Payload:', JSON.stringify(body, null, 2));

        const events = body.events || [];
        for (const event of events) {
            if (event.type === 'message' && event.source.type === 'group') {
                const groupId = event.source.groupId;
                const replyToken = event.replyToken;

                // Reply to the group with the Group ID
                await replyToLine(replyToken, `Your Group ID is: ${groupId}`);
            }
        }

        return NextResponse.json({ status: 'ok' }, { status: 200 });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}

async function replyToLine(replyToken: string, text: string) {
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!channelAccessToken) return;

    await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${channelAccessToken}`,
        },
        body: JSON.stringify({
            replyToken: replyToken,
            messages: [{ type: 'text', text: text }],
        }),
    });
}

// Add support for GET request to allow verification and browser visiting
export async function GET(request: Request) {
    return NextResponse.json({ status: 'ready', message: 'Webhook is active. Please use POST for LINE events.' }, { status: 200 });
}


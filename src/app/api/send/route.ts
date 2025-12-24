import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { groupId, message } = await request.json();

        if (!groupId || !message) {
            return NextResponse.json(
                { error: 'Missing groupId or message' },
                { status: 400 }
            );
        }

        const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

        if (!channelAccessToken) {
            console.error('LINE_CHANNEL_ACCESS_TOKEN is not set');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        const response = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${channelAccessToken}`,
            },
            body: JSON.stringify({
                to: groupId,
                messages: [{ type: 'text', text: message }],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('LINE API Error:', errorData);
            return NextResponse.json(
                { error: 'Failed to send message', details: errorData },
                { status: response.status }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

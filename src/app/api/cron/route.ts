import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    // Security Check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date();
        console.log(`[Cron] Server Time: ${now.toISOString()}`);

        // Find active schedules where scheduledAt is in the past
        // For recurring tasks, logic would need to update the next run time
        const pendingSchedules = await prisma.schedule.findMany({
            where: {
                active: true,
                scheduledAt: {
                    lte: now,
                },
            },
        });

        console.log(`Checking cron... Found ${pendingSchedules.length} pending schedules.`);

        const results = [];

        for (const schedule of pendingSchedules) {
            // 1. Send the message
            const { success, error } = await sendMessage(schedule.targetId, schedule.message);

            // 2. Handle result and recurrence
            if (success) {
                if (schedule.recurrence === 'ONCE') {
                    // Mark as inactive if ONCE
                    await prisma.schedule.update({
                        where: { id: schedule.id },
                        data: { active: false, lastRunAt: now },
                    });
                } else {
                    // Calculate next run time
                    const nextRun = calculateNextRun(schedule.scheduledAt, schedule.recurrence);
                    await prisma.schedule.update({
                        where: { id: schedule.id },
                        data: { scheduledAt: nextRun, lastRunAt: now },
                    });
                }
                results.push({ id: schedule.id, status: 'sent' });
            } else {
                results.push({ id: schedule.id, status: 'failed', error });
            }
        }

        return NextResponse.json({
            success: true,
            serverTime: now.toISOString(),
            processed: results.length,
            results
        });
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: 'Cron job failed', details: String(error) }, { status: 500 });
    }
}

// Helper: Send Message with extended error info
async function sendMessage(to: string, text: string): Promise<{ success: boolean; error?: any }> {
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

    if (!channelAccessToken) {
        console.error('LINE_CHANNEL_ACCESS_TOKEN is missing');
        return { success: false, error: 'Missing Access Token' };
    }

    try {
        const response = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${channelAccessToken}`,
            },
            body: JSON.stringify({
                to: to,
                messages: [{ type: 'text', text: text }],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('LINE API Error:', errorData);
            return { success: false, error: errorData };
        }

        return { success: true };
    } catch (e) {
        console.error('Failed to push message', e);
        return { success: false, error: String(e) };
    }
}

function calculateNextRun(current: Date, recurrence: string): Date {
    const next = new Date(current);
    if (recurrence === 'DAILY') {
        next.setDate(next.getDate() + 1);
    } else if (recurrence === 'WEEKLY') {
        next.setDate(next.getDate() + 7);
    } else if (recurrence === 'MONTHLY') {
        next.setMonth(next.getMonth() + 1);
    }
    return next;
}

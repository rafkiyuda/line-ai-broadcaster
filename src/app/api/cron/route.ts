import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    // In production, you should verify a CRON_SECRET header to ensure only Vercel works calls this.
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { ... }

    try {
        const now = new Date();

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
            const success = await sendMessage(schedule.targetId, schedule.message);

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
                results.push({ id: schedule.id, status: 'failed' });
            }
        }

        return NextResponse.json({ success: true, processed: results.length, results });
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
    }
}

async function sendMessage(to: string, text: string) {
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!channelAccessToken) return false;

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
        return response.ok;
    } catch (e) {
        console.error('Failed to push message', e);
        return false;
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

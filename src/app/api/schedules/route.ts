import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { targetId, message, scheduledAt, recurrence } = body;

        // Basic validation
        if (!targetId || !message || !scheduledAt) {
            return NextResponse.json(
                { error: 'Missing required fields: targetId, message, scheduledAt' },
                { status: 400 }
            );
        }

        const schedule = await prisma.schedule.create({
            data: {
                targetId,
                message,
                scheduledAt: new Date(scheduledAt),
                recurrence: recurrence || 'ONCE',
                active: true,
            },
        });

        return NextResponse.json({ success: true, schedule });
    } catch (error) {
        console.error('Error creating schedule:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const schedules = await prisma.schedule.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ schedules });
    } catch (error) {
        console.error('Error fetching schedules:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

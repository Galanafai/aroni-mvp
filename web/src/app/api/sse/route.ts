import { NextRequest, NextResponse } from 'next/server';
import { eventEmitter } from '@/lib/events';

export async function GET(req: NextRequest) {
    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            const sendEvent = (data: any) => {
                const message = `data: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(encoder.encode(message));
            };

            // Send initial connection message
            sendEvent({ type: 'connected' });

            // Listener for new scans
            const onNewScan = (scan: any) => {
                sendEvent({ type: 'new_scan', scan });
            };

            eventEmitter.on('new_scan', onNewScan);

            // Clean up on close
            req.signal.addEventListener('abort', () => {
                eventEmitter.off('new_scan', onNewScan);
                controller.close();
            });
        },
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}

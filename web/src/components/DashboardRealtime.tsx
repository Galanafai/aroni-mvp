'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function DashboardRealtime() {
    const router = useRouter();

    useEffect(() => {
        const eventSource = new EventSource('/api/sse');

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'new_scan') {
                // Refresh the server components
                router.refresh();
            }
        };

        return () => {
            eventSource.close();
        };
    }, [router]);

    return null; // This component renders nothing, just handles side effects
}

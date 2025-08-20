import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

interface PageProps extends Record<string, unknown> {
    flash?: FlashMessages;
}

/**
 * Hook to handle Laravel flash messages and convert them to toast notifications
 */
export function useFlashMessages() {
    const { props } = usePage<PageProps>();
    const flash = props.flash;

    useEffect(() => {
        if (!flash) return;

        // Handle success messages
        if (flash.success) {
            toast.success(flash.success);
        }

        // Handle error messages
        if (flash.error) {
            toast.error(flash.error);
        }

        // Handle warning messages
        if (flash.warning) {
            toast.warning(flash.warning);
        }

        // Handle info messages
        if (flash.info) {
            toast.info(flash.info);
        }
    }, [flash]);
}

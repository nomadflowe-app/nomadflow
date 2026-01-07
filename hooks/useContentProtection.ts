import { useEffect } from 'react';

export const useContentProtection = (isActive: boolean = true) => {
    useEffect(() => {
        if (!isActive) return;

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent Ctrl+P (Print)
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                return false;
            }

            // Prevent Ctrl+S (Save)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                return false;
            }

            // Prevent PrintScreen (some browsers/OS allow blocking this, others don't, but worth a try)
            if (e.key === 'PrintScreen') {
                // We can't actually strict block OS print screen, but we can try to clear clipboard or blur potentially
                // For web, this is limited.
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        // Disable text selection
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);

            // Re-enable text selection
            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
        };
    }, [isActive]);
};

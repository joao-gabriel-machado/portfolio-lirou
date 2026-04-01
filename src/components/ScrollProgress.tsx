import { useEffect, useRef } from 'react';

const ScrollProgress = () => {
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!barRef.current) return;
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = totalHeight > 0 ? window.scrollY / totalHeight : 0;
            barRef.current.style.transform = `scaleX(${progress})`;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-[2px] z-[60]">
            <div
                ref={barRef}
                className="h-full bg-primary origin-left will-change-transform"
                style={{ transform: 'scaleX(0)' }}
            />
        </div>
    );
};

export default ScrollProgress;

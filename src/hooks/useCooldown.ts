import { useState, useEffect, useCallback } from 'react';

interface UseCooldownProps {
    cooldownTime?: number; // in milliseconds
    key?: string; // optional key for persisting cooldown in localStorage
}

export const useCooldown = ({ cooldownTime = 60000, key }: UseCooldownProps = {}) => {
    const [isCoolingDown, setIsCoolingDown] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);

    useEffect(() => {
        if (key) {
            const storedCooldown = localStorage.getItem(`cooldown_${key}`);
            if (storedCooldown) {
                const cooldownEnd = parseInt(storedCooldown, 10);
                const now = Date.now();
                if (cooldownEnd > now) {
                    setIsCoolingDown(true);
                    setRemainingTime(Math.ceil((cooldownEnd - now) / 1000));
                } else {
                    localStorage.removeItem(`cooldown_${key}`);
                }
            }
        }
    }, [key]);

    useEffect(() => {
        let interval: ReturnType<typeof setTimeout>;

        if (isCoolingDown) {
            interval = setInterval(() => {
                setRemainingTime((prev) => {
                    if (prev <= 1) {
                        setIsCoolingDown(false);
                        if (key) localStorage.removeItem(`cooldown_${key}`);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isCoolingDown, key]);

    const startCooldown = useCallback(() => {
        setIsCoolingDown(true);
        setRemainingTime(Math.ceil(cooldownTime / 1000));

        if (key) {
            const cooldownEnd = Date.now() + cooldownTime;
            localStorage.setItem(`cooldown_${key}`, cooldownEnd.toString());
        }
    }, [cooldownTime, key]);

    return { isCoolingDown, remainingTime, startCooldown };
};

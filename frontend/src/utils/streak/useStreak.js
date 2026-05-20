import { useEffect, useState } from "react";
import api from "../api";

export default function useStreak() {
    const [streak, setStreak] = useState({
        current: 0,
        lastActivityDate: null,
        loading: true,
    });

    useEffect(() => {
        const token = localStorage.getItem("access");

        if (!token) {
            setStreak((p) => ({ ...p, loading: false }));
            return;
        }

        let mounted = true;

        const fetchData = async () => {
            try {
                const res = await api.get("/streak/me/");

                if (!mounted) return;

                setStreak({
                    current: res.data.current_streak,
                    lastActivityDate: res.data.last_activity_date,
                    loading: false,
                });
            } catch (e) {
                console.error("Ошибка загрузки серии:", e);
                if (!mounted) return;
                setStreak((p) => ({ ...p, loading: false }));
            }
        };

        fetchData();

        return () => {
            mounted = false;
        };
    }, []);

    return streak;
}
import { useEffect, useState } from "react";
import api from "../api";

export default function useStatisticSubjects() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await api.get("/statistic/subjects/");
                setSubjects(res.data);
            } catch (err) {
                console.error("Failed to load subjects statistics:", err);
                setError("Не удалось загрузить список предметов.");
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, []);

    return { subjects, loading, error };
}
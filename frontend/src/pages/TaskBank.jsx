import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import TaskItem from '../components/TaskItem';


const TaskBank = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        subject: '',
        orderKIM: '',
        type: '',
        difficulty: '',
        author: ''
    });

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await api.get('/taskBank/tasks/');
                setTasks(response.data);
            } catch (err) {
                console.error("РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё Р·Р°РґР°РЅРёР№:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const subjects = [...new Set(tasks.map(t => t.subject).filter(Boolean))];
    const orders = [...new Set(tasks.map(t => t.order_KIM).filter(t => t !== null && t !== undefined))].sort((a, b) => a - b);
    const types = [...new Set(tasks.map(t => t.type).filter(Boolean))];
    const difficulties = [...new Set(tasks.map(t => t.difficulty).filter(t => t !== null && t !== undefined))].sort((a, b) => a - b);
    const authors = [...new Set(tasks.map(t => t.author_name || t.author_email || t.author).filter(Boolean))];

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredTasks = tasks.filter(task => {
        if (filters.subject && task.subject !== filters.subject) return false;
        if (filters.orderKIM && String(task.order_KIM) !== filters.orderKIM) return false;
        if (filters.type && task.type !== filters.type) return false;
        if (filters.difficulty && String(task.difficulty) !== filters.difficulty) return false;
        if (filters.author) {
            const authorValue = task.author_name || task.author_email || String(task.author || '');
            if (authorValue !== filters.author) return false;
        }
        return true;
    });
    const displayedSubjects = subjects.filter(subject => filteredTasks.some(t => t.subject === subject));

    if (loading) return <div>Банк заданий</div>;

    return (
        <div className="task-bank">
            <h1>Банк заданий</h1>
            <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
                <select name="subject" value={filters.subject} onChange={handleFilterChange}>
                    <option value="">Все предметы</option>
                    {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                    ))}
                </select>
                <select name="orderKIM" value={filters.orderKIM} onChange={handleFilterChange}>
                    <option value="">Все номера</option>
                    {orders.map(order => (
                        <option key={order} value={String(order)}>{order}</option>
                    ))}
                </select>
                <select name="type" value={filters.type} onChange={handleFilterChange}>
                    <option value="">Все разделы</option>
                    {types.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange}>
                    <option value="">Любая сложность</option>
                    {difficulties.map(level => (
                        <option key={level} value={String(level)}>{level}</option>
                    ))}
                </select>
                <select name="author" value={filters.author} onChange={handleFilterChange}>
                    <option value="">Любой источник</option>
                    {authors.map(author => (
                        <option key={author} value={author}>{author}</option>
                    ))}
                </select>
            </div>
            {displayedSubjects.map(subject => (
                <section key={subject} style={{ marginBottom: '30px' }}>
                    <h2 style={{ borderBottom: '2px solid #007bff' }}>{subject}</h2>
                    {filteredTasks
                        .filter(t => t.subject === subject)
                        .map(task => <TaskItem key={task.id} task={task} />)
                    }
                </section>
            ))}
        </div>
    );
};

export default TaskBank;


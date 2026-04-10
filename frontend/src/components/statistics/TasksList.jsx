import TaskStatCard from './TaskStatCard';

const TasksList = ({ stats }) => {
    if (!stats.length) {
        return <div className="statisticsPage_empty description_text">Нет данных по заданиям.</div>;
    }

    return (
        <div className="statisticsTasks">
            <h2 className="statisticsBlock_title text">Статистика по заданиям</h2>
            <div className="statisticsTasks_list">
                {stats.map((item) => (
                    <TaskStatCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
};

export default TasksList;

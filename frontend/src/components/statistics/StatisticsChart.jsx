import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const StatisticsChart = ({ data }) => {
    if (!data.length) {
        return <div className="statisticsPage_empty description_text">Нет данных для графика.</div>;
    }

    return (
        <div className="statisticsChart">
            <h2 className="statisticsBlock_title text">График успешных решений</h2>
            <div className="statisticsChart_container">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <XAxis dataKey="order_KIM" />
                        <YAxis domain={[0, 100]} allowDecimals={false} tickFormatter={(value) => `${value}%`} />
                        <Tooltip
                            formatter={(value) => [`${value}%`, 'Процент верных ответов']}
                            labelFormatter={(value) => `Задание №${value}`}
                        />
                        <Line
                            type="monotone"
                            dataKey="accuracy_percent"
                            name="Процент верных ответов"
                            stroke="#4A9776"
                            strokeWidth={3}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StatisticsChart;
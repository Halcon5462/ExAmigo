export const TaskTable = ({
  tasks,
  selected,
  toggleTask,
  handleOrderChange,
}) => {
  return (
    <div className="taskset-creator-table-wrap">
      <table className="taskset-creator-table">
        <thead>
          <tr>
            <th>Выбрать</th>
            <th>№</th>
            <th>Предмет</th>
            <th>Тип</th>
            <th>Сложность</th>
            <th>Порядок</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td>
                <input
                  className="taskset-creator-table__checkbox"
                  type="checkbox"
                  checked={selected[task.id] !== undefined}
                  onChange={() => toggleTask(task.id)}
                />
              </td>

              <td>{task.order_KIM}</td>
              <td>{task.subject_display || task.subject}</td>
              <td>{task.type}</td>
              <td>{task.difficulty}</td>

              <td>
                {selected[task.id] !== undefined ? (
                  <input
                    className="taskset-creator-table__order"
                    type="number"
                    min="1"
                    value={selected[task.id]}
                    onChange={e =>
                      handleOrderChange(task.id, e.target.value)
                    }
                  />
                ) : (
                  <span className="taskset-creator-table__muted">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
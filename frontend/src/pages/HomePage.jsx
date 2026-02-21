import { useState, useEffect } from "react"
import api from '../utils/api';


const HomePage = ({ user }) => {
    const [tasks, setTasks] = useState([])

    useEffect(() =>{
        getData()
    }, [])

    const getData = () => {
        api.get('/taskBank/tasks').then((res) => res.data).then((data) => setTasks(data)).catch((err) => console.log(err))
    }
    return (
        <div className="home-container">
            <h1>Добро пожаловать!</h1>
            {user && (
                <div className="welcome-message">
                    <p>Вы вошли как: <strong>{user.email}</strong></p>
                </div>
            )}
            {tasks.map((task) => 
                <h1>{task.subject}</h1>
            )}
        </div>
    );
};

export default HomePage;
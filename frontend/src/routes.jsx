import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/user/LoginPage';
import AchievementsPage from './pages/user/AchievementsPage';
import ProfilePage from './pages/user/ProfilePage';

import Shop from './pages/Shop';

import TaskBank from './pages/taskBank/TaskBank';
import TaskList from './pages/taskBank/TaskList';

import TaskSetCreator from './pages/taskSet/TaskSetCreator';
import TaskSetList from './pages/taskSet/TaskSetList';
import TaskSetPlayer from './pages/taskSet/TaskSetPlayer';
import TaskSetAutoGenerator from './pages/taskSet/TaskSetAutoGenerator';

import MatchCreatePage from './pages/match/MatchCreatePage';
import MatchPlayerPage from './pages/match/MatchPlayerPage';

import StatisticMainPage from './pages/user/StatisticMainPage';
import SubjectStatisticsPage from './pages/user/SubjectStatisticsPage';

export default function AppRoutes({
    user,
    handleLogin,
    handleLogout,
    handleUserUpdate,
    equipped,
    fetchEquipped
}) {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    !user
                        ? <LoginPage onLogin={handleLogin} />
                        : <Navigate to="/" replace />
                }
            />

            <Route element={<ProtectedRoute user={user} />}>
                <Route path="/" element={<HomePage user={user} />} />

                <Route path="/tasks" element={<TaskBank />} />
                <Route path="/tasks/results" element={<TaskList />} />

                <Route path="/shop" element={<Shop />} />
                <Route path="/achievements" element={<AchievementsPage onLogout={handleLogout} />} />

                <Route path="/tasksets/create" element={<TaskSetCreator />} />
                <Route path="/tasksets" element={<TaskSetList />} />
                <Route path="/tasksets/play/:id" element={<TaskSetPlayer />} />
                <Route path="/tasksets/auto" element={<TaskSetAutoGenerator />} />

                <Route path="/match" element={<MatchCreatePage />} />
                <Route path="/match/play/:matchId" element={<MatchPlayerPage />} />

                <Route path="/statistics" element={<StatisticMainPage />} />
                <Route path="/statistics/:subject" element={<SubjectStatisticsPage />} />

                <Route
                    path="/profile"
                    element={
                        <ProfilePage
                            user={user}
                            onLogout={handleLogout}
                            onUserUpdate={handleUserUpdate}
                            equipped={equipped}
                            refreshEquipped={fetchEquipped}
                        />
                    }
                />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
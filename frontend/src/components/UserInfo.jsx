import React from 'react';
import AvatarPicker from './AvatarPicker.jsx';

const UserInfo = ({ user, onLogout, frameImage, onUserUpdate }) => {
    return (
        <div className="profilePage_card">
            <div className="profilePage_avatarBlock">
                <AvatarPicker
                    user={user}
                    frameImage={frameImage}
                    onUserUpdate={onUserUpdate}
                />
            </div>
            <div className="profilePage_userInfo">
                <h2 className="profilePage_name text">{user.name || user.username}</h2>
                <p className="profilePage_email description_text">{user.email}</p>
                <p className="profilePage_id description_text">ID: {user.id}</p>

                <p className="profilePage_coins text_mini">Мои Умкоины: {user.coins || 0}</p>

                <button className="profilePage_logoutBtn btn_text" onClick={onLogout}>
                    Выйти из аккаунта
                </button>
            </div>
        </div>
    );
};

export default UserInfo;
import { useEffect, useRef, useState } from 'react';
import api from '../../utils/api';

const fallbackAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="100%25" height="100%25" fill="%23FFD54F"/><circle cx="88" cy="108" r="18" fill="%23000"/><circle cx="168" cy="108" r="18" fill="%23000"/><path d="M70 170 Q128 220 186 170" stroke="%23000" stroke-width="12" fill="none" stroke-linecap="round"/></svg>';

const AvatarPicker = ({ user, frameImage, onUserUpdate }) => {
    const [avatars, setAvatars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [changing, setChanging] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const avatarUrl = user?.avatar_url || fallbackAvatar;

    useEffect(() => {
        const fetchAvatars = async () => {
            try {
                const response = await api.get('/account/avatars/');
                setAvatars(response.data);
            } catch (err) {
                console.error('Не удалось загрузить аватарки:', err);
                setError('Не удалось загрузить список аватарок');
            } finally {
                setLoading(false);
            }
        };

        fetchAvatars();
    }, []);

    const updateUser = (nextUser) => {
        if (!nextUser) {
            return;
        }
        onUserUpdate?.(nextUser);
    };

    const handleSelectDefault = async (avatarId) => {
        if (!avatarId || changing) {
            return;
        }

        setChanging(true);
        setError('');

        try {
            const response = await api.post('/account/avatar/change/', {
                avatar_id: avatarId,
            });
            updateUser(response.data.user);
        } catch (err) {
            console.error('Не удалось выбрать аватар:', err);
            setError(err.response?.data?.error || 'Не удалось обновить аватар');
        } finally {
            setChanging(false);
        }
    };

    const handleUploadAvatar = async (event) => {
        const file = event.target.files?.[0];
        if (!file || changing) {
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        setChanging(true);
        setError('');

        try {
            const response = await api.post('/account/avatar/change/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            updateUser(response.data.user);
        } catch (err) {
            console.error('Не удалось загрузить аватар:', err);
            setError(err.response?.data?.error || 'Не удалось загрузить аватар');
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setChanging(false);
        }
    };

    return (
        <div className="avatar-section">
            <div className="avatar-wrapper">
                <img src={avatarUrl} alt="avatar" className="avatar-img" />
                {frameImage && (
                    <img src={frameImage} alt="frame" className="avatar-frame" />
                )}
            </div>

            <div className="avatar-controls">
                <label className="btn_green avatar-upload-btn btn_text">
                    Загрузить свою аватарку
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleUploadAvatar}
                        disabled={changing}
                        className="avatar-file-input"
                    />
                </label>

                {changing && <p className="avatar-status">Сохраняем аватарку...</p>}
                {error && <p className="avatar-error">{error}</p>}
            </div>

            <div className="avatar-defaults">
                <h3>Готовые аватарки</h3>
                {loading ? (
                    <p>Загрузка аватарок...</p>
                ) : (
                    <div className="avatar-grid">
                        {avatars.map((avatar) => (
                            <button
                                key={avatar.id}
                                type="button"
                                className={`avatar-option ${user?.avatar_default === avatar.id ? 'avatar-option_active' : ''}`}
                                onClick={() => handleSelectDefault(avatar.id)}
                                disabled={changing}
                            >
                                <img src={avatar.image} alt={avatar.name} className="avatar-option-image" />
                                <span>{avatar.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvatarPicker;

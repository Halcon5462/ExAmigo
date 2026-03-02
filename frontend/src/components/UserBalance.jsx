import { useState, useEffect } from 'react';

const UserBalance = () => {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/shop/wallets/balance/')
            .then(res => res.json())
            .then(data => {
                setBalance(data.balance);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error:', err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className="user-balance">
            <h3>Мои очки: <span>{balance}</span></h3>
        </div>
    );
};

export default UserBalance;
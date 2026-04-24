import { useState, useEffect } from 'react';
import api from "../../utils/api";

const UserBalance = () => {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const response = await api.get('/shop/wallets/balance/');

                setBalance(response.data.balance);
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
    }, []);

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className="user-balance">
            <h3>Мои Умкоины: <span>{balance}</span></h3>
        </div>
    );
};

export default UserBalance;
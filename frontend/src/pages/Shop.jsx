import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import ProductkItem from '../components/ProductkItem';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasingId, setPurchasingId] = useState(null);
    const [message, setMessage] = useState(null); // { text, error }

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products/products/');
                setProducts(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handlePurchase = async (product) => {
        setPurchasingId(product.id);
        setMessage(null);

        try {
            const response = await api.post(`/products/products/${product.id}/purchase/`);
            const { balance, total_cost } = response.data;

            setMessage({ text: `Куплено! Списано ${total_cost} очков. Баланс: ${balance}`, error: false });

            // обновляем sold_count у купленного товара
            setProducts(prev =>
                prev.map(p =>
                    p.id === product.id
                        ? { ...p, sold_count: response.data.sold_count }
                        : p
                )
            );
        } catch (err) {
            const detail = err.response?.data?.error
                || err.response?.data?.detail
                || 'Ошибка при покупке';
            setMessage({ text: detail, error: true });
        } finally {
            setPurchasingId(null);
        }
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className="shop-page">
            <h1>Магазин</h1>

            {message && (
                <p style={{ color: message.error ? 'red' : 'green' }}>
                    {message.text}
                </p>
            )}

            {products.length === 0 && <p>Товары не найдены.</p>}

            {products.map(product => (
                <ProductkItem
                    key={product.id}
                    product={product}
                    onPurchase={handlePurchase}
                    purchasing={purchasingId === product.id}
                />
            ))}
        </div>
    );
};

export default Shop;
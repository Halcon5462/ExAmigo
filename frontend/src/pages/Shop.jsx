import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import ProductkItem from '../components/ProductkItem';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/digitalShop/products/');
                setProducts(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div>Магазин</div>;

    return (
        <div className="shop-page">
            <h1>Магазин</h1>
            {products.length === 0 && (
                <p>Товары не найдены.</p>
            )}
            {products.map(product => (
                <ProductkItem key={product.id} product={product} />
            ))}
        </div>
    );
};

export default Shop;

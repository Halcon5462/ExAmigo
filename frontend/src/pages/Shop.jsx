import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import ProductItem from '../components/ProductItem.jsx';
import '../static/css/style.css';
import '../static/css/shop.css';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasingId, setPurchasingId] = useState(null);
    const [statusByProductId, setStatusByProductId] = useState({});
    const [filters, setFilters] = useState({
        author: 'all',
        type: 'all',
        maxPrice: 0,
    });
    const [appliedFilters, setAppliedFilters] = useState({
        author: 'all',
        type: 'all',
        maxPrice: 0,
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products/products/');
                const nextProducts = response.data;
                const maxCost = nextProducts.reduce(
                    (acc, product) => Math.max(acc, Number(product?.cost ?? 0)),
                    0
                );
                const initialFilters = {
                    author: 'all',
                    type: 'all',
                    maxPrice: maxCost,
                };

                setProducts(nextProducts);
                setFilters(initialFilters);
                setAppliedFilters(initialFilters);
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
        setStatusByProductId(prev => {
            const next = { ...prev };
            delete next[product.id];
            return next;
        });

        try {
            const response = await api.post(`/products/products/${product.id}/purchase/`);
            const { balance, total_cost } = response.data;

            setProducts(prev =>
                prev.map(item =>
                    item.id === product.id
                        ? { ...item, sold_count: response.data.sold_count, already_purchased: true }
                        : item
                )
            );

            setStatusByProductId(prev => ({
                ...prev,
                [product.id]: {
                    text: `Куплено. Списано ${total_cost} очков. Баланс: ${balance}`,
                    tone: 'success',
                },
            }));
        } catch (err) {
            const detail = err.response?.data?.error
                || err.response?.data?.detail
                || 'Ошибка при покупке';

            setStatusByProductId(prev => ({
                ...prev,
                [product.id]: {
                    text: detail,
                    tone: 'error',
                },
            }));
        } finally {
            setPurchasingId(null);
        }
    };

    const authorOptions = Array.from(
        new Set(
            products
                .map(product => product?.author_name || product?.author_email || product?.author)
                .filter(Boolean)
        )
    ).sort((a, b) => String(a).localeCompare(String(b), 'ru'));

    const typeOptions = Array.from(new Set(products.map(product => product?.type).filter(Boolean)));

    const filteredProducts = products.filter(product => {
        const author = product?.author_name || product?.author_email || product?.author;
        const cost = Number(product?.cost ?? 0);

        const matchesAuthor = appliedFilters.author === 'all' || author === appliedFilters.author;
        const matchesType = appliedFilters.type === 'all' || product?.type === appliedFilters.type;
        const matchesPrice = cost <= appliedFilters.maxPrice;

        return matchesAuthor && matchesType && matchesPrice;
    });

    const maxAvailablePrice = Math.max(
        products.reduce((acc, product) => Math.max(acc, Number(product?.cost ?? 0)), 0),
        0
    );

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        setAppliedFilters(filters);
    };

    if (loading) {
        return <div className="shop-page-status text">Загрузка...</div>;
    }

    return (
        <main className="shop-page">
            <section className="shop-page__hero">
                <div className="shop-page__hero-inner">
                    <p className="shop-page__eyebrow text_mini">Коллекция профиля</p>
                    <h1 className="shop-page__title">Магазин</h1>
                </div>
            </section>

            <section className="shop-page__content">
                <div className="shop-filters">
                    <label className="shop-filters__group" htmlFor="shop-author">
                        <span className="shop-filters__label text_mini">Автор:</span>
                        <select
                            id="shop-author"
                            className="shop-filters__control description_text"
                            value={filters.author}
                            onChange={(e) => handleFilterChange('author', e.target.value)}
                        >
                            <option value="all">Все авторы</option>
                            {authorOptions.map(author => (
                                <option key={author} value={author}>
                                    {author}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="shop-filters__group" htmlFor="shop-type">
                        <span className="shop-filters__label text_mini">Тип:</span>
                        <select
                            id="shop-type"
                            className="shop-filters__control description_text"
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                        >
                            <option value="all">Все типы</option>
                            {typeOptions.map(type => (
                                <option key={type} value={type}>
                                    {type === 'frame' ? 'Рамка' : type === 'background' ? 'Фон' : type}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="shop-filters__group shop-filters__group_price" htmlFor="shop-price">
                        <span className="shop-filters__label text_mini">Диапазон цены:</span>
                        <div className="shop-filters__price">
                            <input
                                id="shop-price"
                                className="shop-filters__range"
                                type="range"
                                min="0"
                                max={Math.max(maxAvailablePrice, 1)}
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                            />
                            <span className="shop-filters__price-value description_text">
                                {filters.maxPrice.toLocaleString('ru-RU')}
                            </span>
                        </div>
                    </label>

                    <button
                        type="button"
                        className="shop-filters__button btn_green"
                        onClick={applyFilters}
                    >
                        Применить
                    </button>
                </div>

                {products.length === 0 ? (
                    <div className="shop-page-status text">Товары не найдены.</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="shop-page-status text">По выбранным фильтрам товаров нет.</div>
                ) : (
                    <div className="shop-grid">
                        {filteredProducts.map(product => (
                            <ProductItem
                                key={product.id}
                                product={product}
                                onPurchase={handlePurchase}
                                purchasing={purchasingId === product.id}
                                statusMessage={statusByProductId[product.id] || null}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
};

export default Shop;

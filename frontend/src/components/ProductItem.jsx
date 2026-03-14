import React from 'react';

const ProductkItem = ({ product, onPurchase, purchasing, onSelect, selecting, selected }) => {
    const image = product?.frame?.icon_frame
        || product?.background?.image_background
        || product?.icon_frame
        || product?.image_background
        || product?.image;

    const author = product?.author_name || product?.author_email || product?.author || '-';
    const isLimited = Boolean(product?.is_limited);
    const stock = product?.stock ?? null;
    const soldCount = product?.sold_count ?? 0;
    const available = product?.is_available ?? (!isLimited || soldCount < (stock || 0));

    return (
        <div className="product-card" style={styles.card}>
            <div style={styles.header}>
                <strong>{product?.name || 'Без названия'}</strong>
                <span style={styles.type}>{product?.type || 'Тип не указан'}</span>
            </div>

            {image && (
                <img
                    src={image}
                    alt="Изображение товара"
                    style={styles.image}
                />
            )}

            {product?.description && (
                <div style={styles.desc}>{product.description}</div>
            )}

            <div style={styles.meta}>
                <span>Цена: {product?.cost ?? product?.price ?? 0}</span>
                <span>Автор: {author}</span>
            </div>

            <div style={styles.meta}>
                <span>Лимит: {isLimited ? 'Да' : 'Нет'}</span>
                {isLimited && (
                    <span>Продано: {soldCount}/{stock || 0}</span>
                )}
            </div>

            <div style={styles.status}>
                {available ? (
                    <span style={styles.available}>В наличии</span>
                ) : (
                    <span style={styles.unavailable}>Нет в наличии</span>
                )}
            </div>

            {onPurchase && (
                <button
                    onClick={() => onPurchase(product)}
                    disabled={!available || purchasing || product?.already_purchased}
                >
                    {purchasing ? 'Покупка...' : `Купить за ${product?.cost ?? 0} очков`}
                </button>
            )}
            {onSelect && (
                <button
                    onClick={() => onSelect(product)}
                    disabled={Boolean(selecting || selected)}
                >
                    {selecting ? 'Выбор...' : (selected ? 'Выбрано' : 'Выбрать')}
                </button>
            )}
            {product?.already_purchased && onPurchase && (
                <p style={{ color: 'orange' }}>⚡ Вы уже приобрели этот товар.</p>
            )}
        </div>
    );
};

const styles = {
    card: { border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px', backgroundColor: '#fff' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
    type: { fontStyle: 'italic', color: '#555' },
    image: { width: '100%', maxHeight: '220px', objectFit: 'contain', marginBottom: '10px' },
    desc: { whiteSpace: 'pre-wrap', margin: '10px 0', lineHeight: '1.5' },
    meta: { display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' },
    status: { marginTop: '8px' },
    available: { color: 'green', fontWeight: 'bold' },
    unavailable: { color: 'red', fontWeight: 'bold' }
};

export default ProductkItem;

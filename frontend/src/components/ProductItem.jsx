import React from 'react';
import api from '../utils/api';
import '../static/css/product-item.css';

const ProductItem = ({ product, onPurchase, purchasing, onSelect, selecting, selected, statusMessage }) => {
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
    const isPurchased = Boolean(product?.already_purchased);
    const typeLabel = product?.type === 'frame'
        ? 'Рамка'
        : product?.type === 'background'
            ? 'Фон'
            : (product?.type || 'Тип не указан');

    const resolvedImage = toAbsoluteMediaUrl(image);
    const status = getStatus({ available, isPurchased, statusMessage });
    const soldDisplay = isLimited ? `${soldCount}/${stock || 0}` : `${soldCount}/∞`;

    return (
        <article className="product-card">
            <div className="product-card__media">
                {resolvedImage ? (
                    <img
                        src={resolvedImage}
                        alt={product?.name || 'Изображение товара'}
                        className="product-card__image"
                    />
                ) : (
                    <div className="product-card__placeholder" aria-hidden="true">
                        <span className="product-card__placeholder-icon">◫</span>
                    </div>
                )}
            </div>

            <div className="product-card__body">
                <div className="product-card__top">
                    <div className="product-card__summary">
                        <h3 className="product-card__title">{product?.name || 'Без названия'}</h3>
                        <p className="product-card__description description_text">
                            {product?.description || 'Описание появится после добавления товара.'}
                        </p>
                    </div>
                    <span className="product-card__type text_mini">{typeLabel}</span>
                </div>

                <div className="product-card__divider" />

                <div className="product-card__price">
                    <span className="product-card__price-value">
                        {(product?.cost ?? product?.price ?? 0).toLocaleString('ru-RU')}
                    </span>
                    <span className="product-card__price-unit">очков</span>
                </div>

                <div className={`product-card__status product-card__status_${status.tone}`}>
                    {status.text}
                </div>

                <dl className="product-card__meta description_text">
                    <div className="product-card__meta-row">
                        <dt>Лимит:</dt>
                        <dd>{isLimited ? 'Да' : 'Нет'}</dd>
                    </div>
                    <div className="product-card__meta-row">
                        <dt>Автор:</dt>
                        <dd>{author}</dd>
                    </div>
                    <div className="product-card__meta-row">
                        <dt>Продано:</dt>
                        <dd>{soldDisplay}</dd>
                    </div>
                </dl>

                {onPurchase && (
                    <button
                        type="button"
                        className="product-card__button btn_green"
                        onClick={() => onPurchase(product)}
                        disabled={!available || purchasing || isPurchased}
                    >
                        {purchasing ? 'Покупка...' : `Купить за ${product?.cost ?? 0} очков`}
                    </button>
                )}

                {onSelect && (
                    <button
                        type="button"
                        className="product-card__button btn_green"
                        onClick={() => onSelect(product)}
                        disabled={Boolean(selecting || selected)}
                    >
                        {selecting ? 'Выбор...' : (selected ? 'Выбрано' : 'Выбрать')}
                    </button>
                )}
            </div>
        </article>
    );
};

const toAbsoluteMediaUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    const origin = new URL(api.defaults.baseURL).origin;
    if (url.startsWith('/')) return `${origin}${url}`;
    return `${origin}/${url}`;
};

const getStatus = ({ available, isPurchased, statusMessage }) => {
    if (statusMessage?.text) {
        return {
            text: statusMessage.text,
            tone: statusMessage.tone || 'neutral',
        };
    }

    if (isPurchased) {
        return {
            text: 'Уже куплено',
            tone: 'warning',
        };
    }

    if (available) {
        return {
            text: 'В наличии',
            tone: 'success',
        };
    }

    return {
        text: 'Нет в наличии',
        tone: 'error',
    };
};

export default ProductItem;

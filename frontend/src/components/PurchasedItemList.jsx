import React from 'react';
import ProductItem from './ProductItem.jsx';

const PurchasedItemList = ({
    products = [],
    selectingId = null,
    selectedFrameId = null,
    selectedBackgroundId = null,
    onSelectFrame,
    onSelectBackground,
}) => {
    const purchased = (products || []).filter(p => Boolean(p?.already_purchased));
    const frames = purchased.filter(p => p?.type === 'frame');
    const backgrounds = purchased.filter(p => p?.type === 'background');

    return (
        <div className="purchased-items-section">

            <div style={{ marginBottom: '20px' }}>
                <h3>Frame (рамка аватара)</h3>
                {frames.length === 0 ? (
                    <p>Купленных рамок пока нет.</p>
                ) : (
                    frames.map(product => (
                        <ProductItem
                            key={product.id}
                            product={product}
                            onSelect={() => onSelectFrame?.(product)}
                            selecting={selectingId === product.id}
                            selected={selectedFrameId === product.id}
                        />
                    ))
                )}
            </div>

            <div>
                <h3>Background (тема сайта)</h3>
                {backgrounds.length === 0 ? (
                    <p>Купленных тем пока нет.</p>
                ) : (
                    backgrounds.map(product => (
                        <ProductItem
                            key={product.id}
                            product={product}
                            onSelect={() => onSelectBackground?.(product)}
                            selecting={selectingId === product.id}
                            selected={selectedBackgroundId === product.id}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default PurchasedItemList;


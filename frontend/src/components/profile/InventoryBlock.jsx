import React from 'react';
import ProductItem from '../ProductItem.jsx';

const InventoryBlock = ({
  products,
  selectingId,
  selectedFrameId,
  selectedBackgroundId,
  onSelectFrame,
  onSelectBackground,
}) => {
  const purchased = (products || []).filter(p => Boolean(p?.already_purchased));
  const frames = purchased.filter((p) => p.type === 'frame');
  const backgrounds = purchased.filter((p) => p.type === 'background');

  return (
    <div className="profilePage_inventoryBlock">
      <h2 className="profilePage_sectionTitle text">Мой инвентарь</h2>

      {frames.length > 0 && (
        <>
          <h3 className="text_mini">Рамки</h3>
          <div className="profilePage_inventory">
            {frames.map((product) => (
              <ProductItem
                  key={product.id}
                  product={product}
                  onSelect={() => onSelectFrame?.(product)}
                  selecting={selectingId === product.id}
                  selected={selectedFrameId === product.id}
              />
            ))}
          </div>
        </>
      )}

      {backgrounds.length > 0 && (
        <>
          <h3 className="text_mini">Фоны</h3>
          <div className="profilePage_inventory">
            {backgrounds.map((product) => (
              <ProductItem
                  key={product.id}
                  product={product}
                  onSelect={() => onSelectBackground?.(product)}
                  selecting={selectingId === product.id}
                  selected={selectedBackgroundId === product.id}
              />
            ))}
          </div>
        </>
      )}

      {frames.length === 0 && backgrounds.length === 0 && (
        <div className="profilePage_empty description_text">Нет предметов в инвентаре</div>
      )}
    </div>
  );
};

export default InventoryBlock;
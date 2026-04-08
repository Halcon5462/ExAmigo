import React from 'react';
import ProductItem from './ProductItem.jsx';

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
              // <div key={item.id} className="profilePage_item">
              //   <img src={item.icon} alt={item.name} />
              //   <button
              //     onClick={() => onSelectFrame(item)}
              //     disabled={selectingId === item.id}
              //     className={`btn_text ${selectedFrameId === item.id ? 'active' : ''}`}
              //   >
              //     {selectedFrameId === item.id ? 'Выбрано' : 'Выбрать'}
              //   </button>
              // </div>
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
              // <div key={item.id} className="profilePage_item">
              //   <img src={item.icon} alt={item.name} />
              //   <button
              //     onClick={() => onSelectBackground(item)}
              //     disabled={selectingId === item.id}
              //     className={`btn_text ${selectedBackgroundId === item.id ? 'active' : ''}`}
              //   >
              //     {selectedBackgroundId === item.id ? 'Выбрано' : 'Выбрать'}
              //   </button>
              // </div>
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
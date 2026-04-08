import React from 'react';

const InventoryBlock = ({
  products,
  selectingId,
  selectedFrameId,
  selectedBackgroundId,
  onSelectFrame,
  onSelectBackground,
}) => {
  const frames = products.filter((p) => p.type === 'frame');
  const backgrounds = products.filter((p) => p.type === 'background');

  return (
    <div className="profilePage_inventoryBlock">
      <h2 className="profilePage_sectionTitle text">Мой инвентарь</h2>

      {frames.length > 0 && (
        <>
          <h3 className="text_mini">Рамки</h3>
          <div className="profilePage_inventory">
            {frames.map((item) => (
              <div key={item.id} className="profilePage_item">
                <img src={item.icon} alt={item.name} />
                <button
                  onClick={() => onSelectFrame(item)}
                  disabled={selectingId === item.id}
                  className={`btn_text ${selectedFrameId === item.id ? 'active' : ''}`}
                >
                  {selectedFrameId === item.id ? 'Выбрано' : 'Выбрать'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {backgrounds.length > 0 && (
        <>
          <h3 className="text_mini">Фоны</h3>
          <div className="profilePage_inventory">
            {backgrounds.map((item) => (
              <div key={item.id} className="profilePage_item">
                <img src={item.icon} alt={item.name} />
                <button
                  onClick={() => onSelectBackground(item)}
                  disabled={selectingId === item.id}
                  className={`btn_text ${selectedBackgroundId === item.id ? 'active' : ''}`}
                >
                  {selectedBackgroundId === item.id ? 'Выбрано' : 'Выбрать'}
                </button>
              </div>
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
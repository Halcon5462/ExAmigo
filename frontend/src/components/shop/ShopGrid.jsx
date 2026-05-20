import ProductItem from "../ProductItem.jsx";

export const ShopGrid = ({
  products,
  filteredProducts,
  handlePurchase,
  purchasingId,
  statusByProductId,
}) => {
  return (
    <>
      {products.length === 0 ? (
        <div className="shop-page-status text">
          Товары не найдены.
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="shop-page-status text">
          По выбранным фильтрам товаров нет.
        </div>
      ) : (
        <div className="shop-grid">
          {filteredProducts.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              onPurchase={handlePurchase}
              purchasing={purchasingId === product.id}
              statusMessage={
                statusByProductId[product.id] || null
              }
            />
          ))}
        </div>
      )}
    </>
  );
};
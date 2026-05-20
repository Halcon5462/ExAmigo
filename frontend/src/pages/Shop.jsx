import React from "react";
import "../static/css/style.css";
import "../static/css/shop.css";

import { ShopHero } from "../components/shop/ShopHero";
import { ShopFilters } from "../components/shop/ShopFilters";
import { ShopGrid } from "../components/shop/ShopGrid";

import { useProducts } from "../utils/shop/useProducts";
import { useShopFilters } from "../utils/shop/useShopFilters";
import { usePurchase } from "../utils/shop/usePurchase";

const Shop = () => {
  const { products, setProducts, loading } = useProducts();

  const {
    filters,
    filteredProducts,
    handleFilterChange,
    applyFilters,
  } = useShopFilters(products);

  const {
    handlePurchase,
    purchasingId,
    statusByProductId,
  } = usePurchase(setProducts);

  if (loading) {
    return (
      <div className="shop-page-status text">Загрузка...</div>
    );
  }

  const authorOptions = Array.from(
    new Set(
      products
        .map(
          (p) =>
            p?.author_name || p?.author_email || p?.author
        )
        .filter(Boolean)
    )
  ).sort((a, b) => String(a).localeCompare(String(b), "ru"));

  const typeOptions = Array.from(
    new Set(products.map((p) => p?.type).filter(Boolean))
  );

  const maxAvailablePrice = Math.max(
    products.reduce(
      (acc, p) => Math.max(acc, Number(p?.cost ?? 0)),
      0
    ),
    0
  );

  return (
    <main className="shop-page">
      <ShopHero />

      <section className="shop-page__content">
        <ShopFilters
          filters={filters}
          authorOptions={authorOptions}
          typeOptions={typeOptions}
          maxAvailablePrice={maxAvailablePrice}
          handleFilterChange={handleFilterChange}
          applyFilters={applyFilters}
        />

        <ShopGrid
          products={products}
          filteredProducts={filteredProducts}
          handlePurchase={handlePurchase}
          purchasingId={purchasingId}
          statusByProductId={statusByProductId}
        />
      </section>
    </main>
  );
};

export default Shop;
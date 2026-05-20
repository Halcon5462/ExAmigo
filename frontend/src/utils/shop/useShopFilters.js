import { useEffect, useMemo, useState } from "react";

export const useShopFilters = (products) => {
  const maxAvailablePrice = useMemo(() => {
    return Math.max(
      products.reduce(
        (acc, p) => Math.max(acc, Number(p?.cost ?? 0)),
        0
      ),
      0
    );
  }, [products]);

  const [filters, setFilters] = useState({
    author: "all",
    type: "all",
    maxPrice: 0,
  });

  const [appliedFilters, setAppliedFilters] = useState({
    author: "all",
    type: "all",
    maxPrice: 0,
  });

  useEffect(() => {
    if (products.length > 0) {
      setFilters((prev) => ({
        ...prev,
        maxPrice: maxAvailablePrice,
      }));

      setAppliedFilters((prev) => ({
        ...prev,
        maxPrice: maxAvailablePrice,
      }));
    }
  }, [maxAvailablePrice]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const author =
        product?.author_name ||
        product?.author_email ||
        product?.author;

      const cost = Number(product?.cost ?? 0);

      const matchesAuthor =
        appliedFilters.author === "all" ||
        author === appliedFilters.author;

      const matchesType =
        appliedFilters.type === "all" ||
        product?.type === appliedFilters.type;

      const matchesPrice =
        appliedFilters.maxPrice === 0
          ? true
          : cost <= appliedFilters.maxPrice;

      return matchesAuthor && matchesType && matchesPrice;
    });
  }, [products, appliedFilters]);

  return {
    filters,
    appliedFilters,
    handleFilterChange,
    applyFilters,
    filteredProducts,
  };
};
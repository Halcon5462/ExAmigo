import { useState } from "react";
import api from "../api";

export const usePurchase = (setProducts) => {
  const [purchasingId, setPurchasingId] = useState(null);
  const [statusByProductId, setStatusByProductId] = useState({});

  const handlePurchase = async (product) => {
    setPurchasingId(product.id);

    setStatusByProductId((prev) => {
      const next = { ...prev };
      delete next[product.id];
      return next;
    });

    try {
      const response = await api.post(
        `/products/products/${product.id}/purchase/`
      );

      const { balance, total_cost, sold_count } = response.data;

      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                sold_count,
                already_purchased: true,
              }
            : item
        )
      );

      setStatusByProductId((prev) => ({
        ...prev,
        [product.id]: {
          text: `Куплено. Списано ${total_cost} очков. Баланс: ${balance}`,
          tone: "success",
        },
      }));
    } catch (err) {
      const detail =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Ошибка при покупке";

      setStatusByProductId((prev) => ({
        ...prev,
        [product.id]: {
          text: detail,
          tone: "error",
        },
      }));
    } finally {
      setPurchasingId(null);
    }
  };

  return {
    handlePurchase,
    purchasingId,
    statusByProductId,
  };
};
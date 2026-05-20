export const ShopFilters = ({
  filters,
  authorOptions,
  typeOptions,
  maxAvailablePrice,
  handleFilterChange,
  applyFilters,
}) => {
  return (
    <div className="shop-filters">
      <label className="shop-filters__group" htmlFor="shop-author">
        <span className="shop-filters__label text_mini">Автор:</span>

        <select
          id="shop-author"
          className="shop-filters__control description_text"
          value={filters.author}
          onChange={(e) =>
            handleFilterChange("author", e.target.value)
          }
        >
          <option value="all">Все авторы</option>

          {authorOptions.map((author) => (
            <option key={author} value={author}>
              {author}
            </option>
          ))}
        </select>
      </label>

      <label className="shop-filters__group" htmlFor="shop-type">
        <span className="shop-filters__label text_mini">Тип:</span>

        <select
          id="shop-type"
          className="shop-filters__control description_text"
          value={filters.type}
          onChange={(e) =>
            handleFilterChange("type", e.target.value)
          }
        >
          <option value="all">Все типы</option>

          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {type === "frame"
                ? "Рамка"
                : type === "background"
                ? "Фон"
                : type}
            </option>
          ))}
        </select>
      </label>

      <label
        className="shop-filters__group shop-filters__group_price"
        htmlFor="shop-price"
      >
        <span className="shop-filters__label text_mini">
          Диапазон цены:
        </span>

        <div className="shop-filters__price">
          <input
            id="shop-price"
            className="shop-filters__range"
            type="range"
            min="0"
            max={Math.max(maxAvailablePrice, 1)}
            value={filters.maxPrice}
            onChange={(e) =>
              handleFilterChange("maxPrice", Number(e.target.value))
            }
          />

          <span className="shop-filters__price-value description_text">
            {filters.maxPrice.toLocaleString("ru-RU")}
          </span>
        </div>
      </label>

      <button
        type="button"
        className="shop-filters__button btn_green"
        onClick={applyFilters}
      >
        Применить
      </button>
    </div>
  );
};
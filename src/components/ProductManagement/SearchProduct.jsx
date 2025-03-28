import React, { useState, useEffect, useRef } from "react";
import "../../styles/SearchProduct.css";

const SearchProduct = ({ onProductSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  // Thực hiện tìm kiếm khi người dùng ngừng gõ
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (searchTerm.length > 1) {
      timeoutRef.current = setTimeout(() => {
        handleSearch();
      }, 500);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:5000/products/search?name=${searchTerm}`);
      
      if (!res.ok) {
        throw new Error("Không thể tìm kiếm sản phẩm");
      }
      
      const data = await res.json();
      setResults(data);
    } catch (error) {
      setError(error.message);
      console.error("Lỗi khi tìm kiếm sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <div className="search-container">
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm sản phẩm theo tên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-button" onClick={handleSearch}>
          <span className="search-icon">🔍</span>
        </button>
      </div>

      <div className="search-results">
        {loading ? (
          <div className="loading-indicator">Đang tìm kiếm...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : results.length > 0 ? (
          <div className="results-grid">
            {results.map((product) => (
              <div 
                className="product-item" 
                key={product._id}
                onClick={() => onProductSelect && onProductSelect(product)}
              >
                <div className="product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <div className="image-placeholder">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-details">
                    <span className="product-price">{formatPrice(product.price)} VND</span>
                    <span className="product-quantity">SL: {product.quantity}</span>
                  </div>
                  {product.supplier && (
                    <p className="product-supplier">Nhà cung cấp: {product.supplier}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : searchTerm ? (
          <div className="no-results">Không tìm thấy sản phẩm nào phù hợp</div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchProduct;
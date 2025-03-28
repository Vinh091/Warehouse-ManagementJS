import React, { useState, useEffect } from "react";
import "../../styles/ProductList.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/products")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Không thể tải dữ liệu sản phẩm");
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="error">Lỗi: {error}</div>;

  return (
    <div className="product-container">
      <h2 className="product-header">Danh sách sản phẩm</h2>
      
      {products.length === 0 ? (
        <p className="no-products">Không có sản phẩm nào</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div className="product-card" key={product._id}>
              {product.image ? (
                <img className="product-image" src={product.image} alt={product.name} />
              ) : (
                <div className="product-image-placeholder">Không có ảnh</div>
              )}
              <div className="product-details">
                <h3 className="product-name">{product.name}</h3>
                <div className="product-info">
                  <p className="product-quantity">Số lượng: {product.quantity} cái</p>
                  <p className="product-price">{new Intl.NumberFormat('vi-VN').format(product.price)} VND</p>
                </div>
                <button className="view-button">Xem chi tiết</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
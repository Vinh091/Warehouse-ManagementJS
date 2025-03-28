import React, { useState, useEffect } from "react";
import "../../styles/DeleteProduct.css";

const DeleteProduct = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/products");
        if (!res.ok) {
          throw new Error("Không thể tải dữ liệu sản phẩm");
        }
        const data = await res.json();
        setProducts(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Không thể xóa sản phẩm");
      }
      alert("Sản phẩm đã được xóa thành công!");
      setProducts(products.filter((product) => product._id !== id)); // Cập nhật danh sách sản phẩm sau khi xóa
    } catch (err) {
      setError("Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại!");
      console.error("Lỗi xóa sản phẩm:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="delete-product-container">
        <div className="delete-product-card">
          <p className="loading-text">Đang tải dữ liệu sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="delete-product-container">
        <div className="delete-product-card">
          <p className="error-message">{error}</p>
          <div className="button-group">
            <button 
              onClick={() => window.location.reload()} 
              className="cancel-button"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="delete-product-container">
      <h2 className="delete-product-title">Danh sách sản phẩm</h2>
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
              <button className="delete-button" onClick={() => handleDelete(product._id)}>Xóa sản phẩm</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeleteProduct;
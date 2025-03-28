import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const InventoryAdjust = () => {
  const [productId, setProductId] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [products, setProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch danh sách sản phẩm khi component được mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/products');
        if (!response.ok) throw new Error('Lỗi khi lấy dữ liệu sản phẩm');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Lỗi:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!productId || newQuantity === '') {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    try {
      // Gửi yêu cầu cập nhật số lượng sản phẩm
      const updateResponse = await fetch(`http://localhost:5000/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: Number(newQuantity) }),
      });

      if (!updateResponse.ok) throw new Error('Lỗi khi cập nhật số lượng');
      const updatedProduct = await updateResponse.json();
      alert(`Điều chỉnh kho thành công. Số lượng mới: ${updatedProduct.quantity}`);

      // Reset form và thông tin sản phẩm đã chọn
      setProductId('');
      setNewQuantity('');
      setSelectedProduct(null);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleSelectProduct = (product) => {
    setProductId(product._id);
    setSelectedProduct(product);
    setShowDropdown(false);
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-warning text-dark">
          <h4 className="mb-0">Điều chỉnh kho (Cập nhật sản phẩm)</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleAdjust}>
            {/* Chọn sản phẩm */}
            <div className="mb-3 position-relative">
              <label className="form-label">Sản phẩm</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="Nhập ID sản phẩm"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  Chọn sản phẩm
                </button>
              </div>
              {showDropdown && (
                <ul
                  className="list-group"
                  style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    position: 'absolute',
                    zIndex: 1000,
                    width: 'calc(100% - 32px)'
                  }}
                >
                  {products.map((product) => (
                    <li
                      key={product._id}
                      className="list-group-item list-group-item-action"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSelectProduct(product)}
                    >
                      <strong>{product.name}</strong> (Mã: {product.code})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Hiển thị thông tin sản phẩm đã chọn */}
            {selectedProduct && (
              <div className="alert alert-info">
                <p className="mb-1">
                  <strong>Sản phẩm:</strong> {selectedProduct.name}
                </p>
                <p className="mb-1">
                  <strong>Mã sản phẩm:</strong> {selectedProduct.code}
                </p>
                <p className="mb-0">
                  <strong>Số lượng hiện tại:</strong> {selectedProduct.quantity}
                </p>
              </div>
            )}

            {/* Nhập số lượng mới */}
            <div className="mb-3">
              <label className="form-label">Số lượng mới</label>
              <input
                type="number"
                className="form-control"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                placeholder="Nhập số lượng mới"
                min="0"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Điều chỉnh kho
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryAdjust;

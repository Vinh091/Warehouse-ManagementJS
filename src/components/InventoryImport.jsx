import React, { useState, useEffect } from 'react';
// Nếu bạn chưa import Bootstrap ở nơi khác (ví dụ index.js), có thể import trực tiếp ở đây:
import 'bootstrap/dist/css/bootstrap.min.css';

const InventoryImport = () => {
  const [productId, setProductId] = useState('');
  const [importQuantity, setImportQuantity] = useState('');
  const [products, setProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // Để lưu thông tin sản phẩm đã chọn

  // Fetch danh sách sản phẩm khi component mount
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

  const handleImport = async (e) => {
    e.preventDefault();
    if (!productId || !importQuantity) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/inventory/nhap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: Number(importQuantity) }),
      });
  
      if (!response.ok) throw new Error('Lỗi khi nhập kho');
      const data = await response.json();
  
      alert(`Nhập kho thành công. Số lượng mới: ${data.product.quantity}`);
  
      // Gọi lại fetchProducts để cập nhật danh sách sản phẩm
      fetchProducts();
  
      setProductId('');
      setImportQuantity('');
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Khi người dùng chọn 1 sản phẩm trong dropdown
  const handleSelectProduct = (product) => {
    setProductId(product._id);
    setSelectedProduct(product);
    setShowDropdown(false);
  };

  return (
    <div className="container mt-4">
      {/* Thẻ Card Bootstrap */}
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Nhập kho (Cập nhật sản phẩm)</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleImport}>
            {/* Nhóm chọn sản phẩm */}
            <div className="mb-3">
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

              {/* Dropdown hiển thị danh sách sản phẩm */}
              {showDropdown && (
                <ul
                  className="list-group"
                  style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    position: 'absolute',
                    zIndex: 1000,
                    width: 'calc(100% - 32px)', // Tùy chỉnh cho khớp độ rộng input-group
                  }}
                >
                  {products.map((product) => (
                    <li
                      key={product._id}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleSelectProduct(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      <strong>{product.name}</strong> (Mã: {product.code})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Hiển thị thông tin sản phẩm đã chọn (nếu có) */}
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

            {/* Nhập số lượng */}
            <div className="mb-3">
              <label className="form-label">Số lượng nhập</label>
              <input
                type="number"
                className="form-control"
                value={importQuantity}
                onChange={(e) => setImportQuantity(e.target.value)}
                placeholder="Nhập số lượng nhập"
                min="1"
              />
            </div>

            {/* Nút submit */}
            <button type="submit" className="btn btn-success">
              Nhập kho
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryImport;

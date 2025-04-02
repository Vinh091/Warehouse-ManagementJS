import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const OrderExport = () => {
  const [productId, setProductId] = useState('');
  const [exportQuantity, setExportQuantity] = useState('');
  const [products, setProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Lấy danh sách sản phẩm từ API khi component được mount
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

  const handleOrderExport = async (e) => {
    e.preventDefault();
    if (!productId || !exportQuantity) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    try {
      // Gọi API tạo đơn xuất hàng (với giao dịch xuất kho)
      const response = await fetch('http://localhost:5000/api/inventory/xuat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: Number(exportQuantity) })
      });
      if (!response.ok) throw new Error('Lỗi khi tạo đơn xuất hàng');
      await response.json();
      alert('Đơn xuất hàng đã được tạo thành công!');
      setProductId('');
      setExportQuantity('');
      setSelectedProduct(null);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleSelectProduct = (product) => {
    setProductId(product.id);
    setSelectedProduct(product);
    setShowDropdown(false);
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-danger text-white">
          <h4 className="mb-0">Tạo đơn xuất hàng</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleOrderExport}>
            {/* Nhóm chọn sản phẩm */}
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
                      key={product.id}
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
                <p className="mb-1"><strong>Sản phẩm:</strong> {selectedProduct.name}</p>
                <p className="mb-1"><strong>Mã sản phẩm:</strong> {selectedProduct.code}</p>
                <p className="mb-0"><strong>Số lượng hiện tại:</strong> {selectedProduct.quantity}</p>
              </div>
            )}

            {/* Nhập số lượng xuất */}
            <div className="mb-3">
              <label className="form-label">Số lượng xuất</label>
              <input
                type="number"
                className="form-control"
                value={exportQuantity}
                onChange={(e) => setExportQuantity(e.target.value)}
                placeholder="Nhập số lượng xuất"
                min="1"
              />
            </div>
            <button type="submit" className="btn btn-primary">Tạo đơn xuất hàng</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderExport;

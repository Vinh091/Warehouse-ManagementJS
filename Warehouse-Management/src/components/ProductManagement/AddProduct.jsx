import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/ProductForm.css";

const AddProduct = ({ addProduct }) => {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    code: "",
    name: "",
    description: "",
    quantity: "",
    price: "",
    supplier: "",
  });

  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null); // Xem trước ảnh

  // Xử lý nhập dữ liệu
  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  // Xử lý chọn ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file)); // Hiển thị ảnh trước
      setProduct((prev) => ({ ...prev, image: file }));
    }
  };
  
  // Gửi dữ liệu lên server
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!product.code || !product.name || !product.quantity || !product.price || !product.supplier) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }
  
    const formData = new FormData();
    formData.append("image", product.image);
    
    try {
      // Upload ảnh trước
      const uploadRes = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) throw new Error("Lỗi upload ảnh");
  
      // Sau khi upload ảnh thành công, thêm sản phẩm với URL ảnh
      const newProduct = { ...product, image: uploadData.imageUrl };
      const res = await fetch("http://localhost:5000/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
  
      if (res.ok) {
        addProduct(await res.json());
        alert("Sản phẩm đã được thêm thành công!");
        setProduct({ code: "", name: "", description: "", quantity: "", price: "", supplier: "", image: null });
        setPreview(null);
        setError("");
        navigate("/products");
      } else {
        setError("Lỗi khi thêm sản phẩm!");
      }
    } catch (error) {
      setError("Lỗi kết nối server!");
      console.error(error);
    }
  };
  

  return (
    <div className="product-form-container">
      <div className="product-form-card">
        <h2 className="product-form-title">Thêm Sản Phẩm Mới</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Mã sản phẩm</label>
            <input type="text" name="code" value={product.code} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Tên sản phẩm</label>
            <input type="text" name="name" value={product.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Mô tả sản phẩm</label>
            <textarea name="description" value={product.description} onChange={handleChange} rows="4" placeholder="Nhập mô tả sản phẩm..." />
          </div>
          <div className="form-group">
            <label>Số lượng</label>
            <input type="number" name="quantity" value={product.quantity} onChange={handleChange} min="0" required />
          </div>
          <div className="form-group">
            <label>Đơn giá (VNĐ)</label>
            <input type="number" name="price" value={product.price} onChange={handleChange} min="0" required />
          </div>
          <div className="form-group">
            <label>Nhà cung cấp</label>
            <input type="text" name="supplier" value={product.supplier} onChange={handleChange} required />
          </div>
          {/* Input file để chọn ảnh */}
          <div className="form-group">
            <label>Ảnh sản phẩm</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          {/* Hiển thị ảnh xem trước nếu có */}
          {preview && (
            <div className="image-preview">
              <p>Ảnh xem trước:</p>
              <img src={preview} alt="Preview" style={{ width: "200px", height: "auto", borderRadius: "5px" }} />
            </div>
          )}
          <div className="button-group">
            <button type="submit">Lưu sản phẩm</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;

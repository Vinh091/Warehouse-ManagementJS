import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/ProductManagement.css";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    code: "",
    name: "",
    description: "",
    quantity: "",
    price: "",
    supplier: "",
    image: null, // Trường ảnh
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/products");
        if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm");
        const data = await res.json();
        console.log("📊 Dữ liệu sản phẩm từ API:", data); // Log dữ liệu sản phẩm
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Không thể xóa sản phẩm");
      alert("Sản phẩm đã được xóa!");
      setProducts(products.filter((product) => product._id !== id));
      setFilteredProducts(filteredProducts.filter((product) => product._id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      alert("Lỗi xóa sản phẩm, vui lòng thử lại!");
    }
  };

  useEffect(() => {
    setFilteredProducts(
      products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, products]);

  // Xử lý chọn ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file)); // Xem trước ảnh
      setNewProduct((prev) => ({ ...prev, image: file }));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
  
    if (!newProduct.code || !newProduct.name || !newProduct.quantity || !newProduct.price || !newProduct.supplier) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
  
    try {
      let imageUrl = "";
  
      // Upload ảnh nếu có
      if (newProduct.image) {
        const formData = new FormData();
        formData.append("image", newProduct.image);
  
        const uploadRes = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData,
        });
  
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error("Lỗi upload ảnh");
        imageUrl = uploadData.imageUrl; // URL của ảnh sau khi upload
      }
  
      // Gửi dữ liệu sản phẩm
      const productData = { ...newProduct, image: imageUrl };
  
      const res = await fetch("http://localhost:5000/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
  
      if (res.ok) {
        const addedProduct = await res.json();
        setProducts((prevProducts) => [...prevProducts, addedProduct]); // Cập nhật danh sách sản phẩm
        setFilteredProducts((prevProducts) => [...prevProducts, addedProduct]); // Cập nhật danh sách hiển thị
        setNewProduct({ code: "", name: "", description: "", quantity: "", price: "", supplier: "", image: null });
        setPreview(null);
        setShowAddForm(false);
        alert("Sản phẩm đã được thêm!");
      } else {
        alert("Lỗi khi thêm sản phẩm!");
      }
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      alert("Lỗi kết nối đến server!");
    }
  };

  return (
    <div className="product-management-container">
      <h2 className="product-management-title">Quản lý sản phẩm</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="product-list">
  {filteredProducts.map((product) => (
    <div key={product._id} className="product-item">
      <h3>{product.name}</h3>
      <p>Mã sản phẩm: {product.code}</p>
      <p>Số lượng: {product.quantity}</p>
      <p>Giá: {product.price ? product.price.toLocaleString() : "Chưa cập nhật"} VND</p>
      {product.image && <img src={product.image} alt={product.name} className="product-image" />}
      <div className="product-actions">
        <button onClick={() => navigate(`/products/edit/${product._id}`)}>✏️ Chỉnh sửa</button>
        <button onClick={() => handleDelete(product._id)}>🗑️ Xóa</button>
      </div>
    </div>
  ))}
</div>

      <button className="add-product-button" onClick={() => setShowAddForm(true)}>
        ➕ Thêm sản phẩm
      </button>

      {showAddForm && (
        <div className="add-product-form">
          <h3>Thêm sản phẩm mới</h3>
          <form onSubmit={handleAddProduct}>
            <input type="text" placeholder="Mã sản phẩm" value={newProduct.code} onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })} required />
            <input type="text" placeholder="Tên sản phẩm" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required />
            <textarea placeholder="Mô tả sản phẩm" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}></textarea>
            <input type="number" placeholder="Số lượng" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })} required />
            <input type="number" placeholder="Giá" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required />
            <input type="text" placeholder="Nhà cung cấp" value={newProduct.supplier} onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })} required />
            
            {/* Input file để chọn ảnh */}
            <input type="file" accept="image/*" onChange={handleImageChange} />
            
            {/* Hiển thị ảnh xem trước */}
            {preview && <img src={preview} alt="Xem trước ảnh" style={{ width: "150px", height: "auto", borderRadius: "5px" }} />}
            
            <div className="form-actions">
              <button type="submit">Lưu</button>
              <button type="button" onClick={() => setShowAddForm(false)}>Hủy</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/ProductForm.css";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    code: "",
    name: "",
    description: "",
    quantity: 0,
    price: 0,
    supplier: "",
    image: "", // Thêm ảnh sản phẩm
  });
  const [preview, setPreview] = useState(null); // Xem trước ảnh mới
  const [newImage, setNewImage] = useState(null); // Ảnh tải lên
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/products/${id}`);
        if (!res.ok) throw new Error("Không thể tải thông tin sản phẩm");
        const data = await res.json();
        setProduct(data);
        setPreview(data.image); // Gán ảnh hiện tại
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
        setError("Không thể tải thông tin sản phẩm!");
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setProduct({ ...product, [e.target.name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file)); // Xem trước ảnh
      setNewImage(file); // Lưu ảnh mới
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product.code || !product.name || !product.quantity || !product.price || !product.supplier) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      let imageUrl = product.image;

      if (newImage) {
        const formData = new FormData();
        formData.append("image", newImage);

        const uploadRes = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error("Lỗi upload ảnh");
        imageUrl = uploadData.imageUrl; // Cập nhật ảnh mới
      }

      const updatedProduct = { ...product, image: imageUrl };

      const res = await fetch(`http://localhost:5000/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });

      if (!res.ok) throw new Error("Không thể cập nhật sản phẩm");

      alert("Sản phẩm đã được cập nhật thành công!");
      navigate("/products");
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      setError("Lỗi khi cập nhật sản phẩm!");
    }
  };

  return (
    <div className="product-form-container">
      <div className="product-form-card">
        <h2 className="product-form-title">Chỉnh Sửa Sản Phẩm</h2>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="product-code">Mã sản phẩm</label>
            <input
              type="text"
              id="product-code"
              name="code"
              value={product.code}
              onChange={handleChange}
              placeholder="Nhập mã sản phẩm"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-name">Tên sản phẩm</label>
            <input
              type="text"
              id="product-name"
              name="name"
              value={product.name}
              onChange={handleChange}
              placeholder="Nhập tên sản phẩm"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-description">Mô tả</label>
            <textarea
              id="product-description"
              name="description"
              value={product.description}
              onChange={handleChange}
              placeholder="Nhập mô tả sản phẩm"
              rows="3"
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="product-quantity">Số lượng</label>
              <input
                type="number"
                id="product-quantity"
                name="quantity"
                value={product.quantity}
                onChange={handleChange}
                placeholder="Nhập số lượng"
                min="0"
                required
              />
            </div>

            <div className="form-group half">
              <label htmlFor="product-price">Đơn giá (VNĐ)</label>
              <input
                type="number"
                id="product-price"
                name="price"
                value={product.price}
                onChange={handleChange}
                placeholder="Nhập đơn giá"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="product-supplier">Nhà cung cấp</label>
            <input
              type="text"
              id="product-supplier"
              name="supplier"
              value={product.supplier}
              onChange={handleChange}
              placeholder="Nhập tên nhà cung cấp"
              required
            />
          </div>

          {/* Thêm mục chỉnh sửa ảnh */}
          <div className="form-group">
            <label>Ảnh sản phẩm</label>
            {preview && <img src={preview} alt="Ảnh sản phẩm" className="preview-image" />}
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          <div className="button-group">
            <button type="button" className="cancel-button" onClick={() => navigate("/products")}>
              Hủy bỏ
            </button>
            <button type="submit" className="submit-button">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;

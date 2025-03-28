import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/LoginRegister.css";

const Login = ({ loginUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State để lưu thông báo lỗi
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Thông tin tài khoản admin
    const adminEmail = "admin@gmail.com";
    const adminPassword = "123456";

    // Kiểm tra thông tin đăng nhập
    if (email === adminEmail && password === adminPassword) {
      loginUser();
      navigate("/dashboard"); // Chuyển hướng đến trang Biểu đồ tồn kho
    } else {
      setError("Email hoặc mật khẩu không đúng!"); // Hiển thị lỗi nếu đăng nhập sai
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Đăng nhập</h2>
        {error && <p className="error">{error}</p>} {/* Hiển thị thông báo lỗi */}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Đăng nhập</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [stockData, setStockData] = useState([]);

  // Hàm lấy dữ liệu tồn kho từ API
  const fetchStockData = async () => {
    const res = await fetch("http://localhost:5000/products");
    const data = await res.json();
    setStockData(data);
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Biểu đồ tồn kho</h2>
      {stockData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={stockData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantity" fill="#8884d8">
              <LabelList dataKey="quantity" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="empty-message">Không có dữ liệu tồn kho</p>
      )}
    </div>
  );
};

export default Dashboard;

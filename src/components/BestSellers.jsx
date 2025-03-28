import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from "recharts";
import "../styles/Dashboard.css";

const BestSellers = ({ salesData }) => {
  const [timeFilter, setTimeFilter] = useState("month");

  const filteredData = salesData.filter(item => {
    const date = new Date(item.date);
    const now = new Date();
    if (timeFilter === "month") {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    } else if (timeFilter === "year") {
      return date.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const topSellers = filteredData.reduce((acc, item) => {
    acc[item.seller] = (acc[item.seller] || 0) + item.amount;
    return acc;
  }, {});

  const topSellersArray = Object.entries(topSellers)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

  return (
    <div className="best-sellers-container">
      <h2>Người bán hàng tốt nhất</h2>
      <select onChange={(e) => setTimeFilter(e.target.value)}>
        <option value="month">Tháng này</option>
        <option value="year">Năm nay</option>
        <option value="all">Tất cả</option>
      </select>
      {topSellersArray.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topSellersArray}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8">
                <LabelList dataKey="sales" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <h2>Tỷ lệ đóng góp</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie data={topSellersArray} dataKey="sales" nameKey="name" cx="50%" cy="50%" outerRadius={150} fill="#8884d8" label>
                {topSellersArray.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </>
      ) : (
        <p className="empty-message">Không có dữ liệu người bán</p>
      )}
    </div>
  );
};

export default BestSellers;
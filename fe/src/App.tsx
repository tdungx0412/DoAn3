import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductDetailPage from './pages/ProductDetailPage';
import './styles/main.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/products" element={<div className="container"><h1>Trang sản phẩm (đang cập nhật...)</h1></div>} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
            </Routes>
          </main>
          <footer className="footer">
            <p>&copy; 2024 Điện Lạnh Store. All rights reserved.</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
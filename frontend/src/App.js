import React, { useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
  Link,
  useLocation
} from 'react-router-dom';
import MainPage from './components/MainPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import GoodsManagement from './components/GoodsManagement';
import AddProductPage from './components/AddProductPage';
import EditProductPage from './components/EditProductPage';
import ShoppingCartDrawer from './components/ShoppingCartDrawer';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

function App() {
  const [user, setUser] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 因为 index.js 已经用 BrowserRouter 包裹了 App，所以此处可以直接使用 useLocation
  const location = useLocation();
  // 如果当前路径是 "/login" 或 "/register"，则不显示搜索栏
  const showSearchBar = location.pathname !== '/login' && location.pathname !== '/register';

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <>
      {/* 顶部导航 */}
      <nav className="bg-black text-white sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-3 shadow">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* 左侧：Logo + 商家入口 */}
          <div className="flex items-center space-x-6">
            <Link to="/">
              <img
                src="/logo.jpg"
                alt="ECSite"
                className="h-16 w-auto"
              />
            </Link>
            {user?.role === 'merchant' && (
              <Link
                to="/goods"
                className="text-sm border border-white px-3 py-1.5 rounded hover:bg-white hover:text-black transition"
              >
                Manage Products
              </Link>
            )}
          </div>

          {/* 中间：搜索栏（隐藏在 /login 和 /register 页面） */}
          {showSearchBar && (
            <div className="w-full sm:w-1/2">
              <input
                type="text"
                placeholder="🔍 Search products by name"
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          )}

          {/* 右侧：认证状态 / 购物车 */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm">Hi, {user.username}</span>
                {user.role === 'customer' && (
                  <button
                    onClick={() => setCartOpen(true)}
                    className="relative p-1 hover:text-indigo-400"
                    title="Shopping Cart"
                  >
                    <ShoppingCartIcon className="h-6 w-6" />
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm border border-white hover:bg-white hover:text-black px-3 py-1 rounded transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login">
                <button className="text-sm border border-white text-white px-4 py-1.5 rounded hover:bg-white hover:text-black transition">
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 页面路由 */}
      <Routes>
        <Route
          path="/"
          element={
            <MainPage
              user={user}
              searchKeyword={searchKeyword}
              setSearchKeyword={setSearchKeyword}
            />
          }
        />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage onRegister={handleLogin} />} />
        <Route
          path="/goods"
          element={
            user?.role === 'merchant' ? (
              <GoodsManagement user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/add-product"
          element={
            user?.role === 'merchant' ? (
              <AddProductPage user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/edit-product/:id" element={<EditProductPage user={user} />} />
      </Routes>

      {/* 购物车抽屉：仅当用户角色为 customer 时显示 */}
      {user?.role === 'customer' && (
        <ShoppingCartDrawer
          username={user.username}
          open={cartOpen}
          setOpen={setCartOpen}
        />
      )}
    </>
  );
}

export default App;


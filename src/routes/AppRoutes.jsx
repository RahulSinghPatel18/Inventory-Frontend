import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Loader from "../components/common/Loader";
import ProtectedRoute from "./ProtectedRoute";

const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const VerifyEmail = lazy(() => import("../pages/VerifyEmail"));
const CreateOrganization = lazy(() => import("../pages/CreateOrganization"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Products = lazy(() => import("../pages/Products"));
const ProductDetails = lazy(() => import("../pages/ProductDetails"));
const Categories = lazy(() => import("../pages/Categories"));
const Stock = lazy(() => import("../pages/Stock"));
const Sales = lazy(() => import("../pages/Sales"));
const SaleDetails = lazy(() => import("../pages/SaleDetails"));
const CustomerDetails = lazy(() => import("../pages/CustomerDetails"));
const Customers = lazy(() => import("../pages/Customers"));
const Udhaar = lazy(() => import("../pages/Udhaar"));
const Profile = lazy(() => import("../pages/Profile"));
const Settings = lazy(() => import("../pages/Settings"));
const Reports = lazy(() => import("../pages/Reports"));
const Members = lazy(() => import("../pages/Member"));
const ChangePassword = lazy(() => import("../pages/ChangePassword"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const NotFound = lazy(() => import("../pages/NotFound"));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader message="Loading..." />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/create-organization" element={<CreateOrganization />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/change-password" element={<ProtectedRoute allowPasswordChange><ChangePassword /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute adminOnly><Members /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute permission={["dashboard.view", "dashboard.statistics"]}><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute permission={["profile.view", "profile.update"]}><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute permission={["profile.view", "profile.change-password", "profile.two-factor"]}><Settings /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute permission={["reports.view", "reports.products", "reports.stock", "reports.sales", "reports.udhaar"]}><Reports /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute permission={["products.view", "products.create", "products.update", "products.delete"]}><Products /></ProtectedRoute>} />
          <Route path="/products/:id" element={<ProtectedRoute permission="products.details"><ProductDetails /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute permission={["categories.view", "categories.create", "categories.update", "categories.delete"]}><Categories /></ProtectedRoute>} />
          <Route path="/stock" element={<ProtectedRoute permission={["stock.view", "stock.in", "stock.out", "stock.history", "stock.low-stock", "stock.out-of-stock", "reports.stock"]}><Stock /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute permission={["sales.view", "sales.create", "sales.statistics"]}><Sales /></ProtectedRoute>} />
          <Route path="/sales/:id" element={<ProtectedRoute permission="sales.details"><SaleDetails /></ProtectedRoute>} />
          <Route path="/customers/:id" element={<ProtectedRoute permission="customers.ledger"><CustomerDetails /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute permission={["customers.view", "customers.create", "customers.statistics"]}><Customers /></ProtectedRoute>} />
          <Route path="/udhaar" element={<ProtectedRoute permission={["udhaar.view", "udhaar.create", "udhaar.statistics"]}><Udhaar /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth.jsx";
import "./index.css";
import { BuildersCatalogue } from "./pages/BuildersCatalogue.jsx";
import { BuilderRunner } from "./pages/BuilderRunner.jsx";
import { MyBuilders } from "./pages/MyBuilders.jsx";
import { MyPlans } from "./pages/MyPlans.jsx";
import { SignIn } from "./pages/SignIn.jsx";
import { SignUp } from "./pages/SignUp.jsx";
import { Layout } from "./components/Layout.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full"></div></div>;
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route element={<Layout />}>
            <Route path="/builders" element={<BuildersCatalogue />} />
            <Route path="/builders/:slug" element={<ProtectedRoute><BuilderRunner /></ProtectedRoute>} />
            <Route path="/account/builders" element={<ProtectedRoute><MyBuilders /></ProtectedRoute>} />
            <Route path="/account/plans" element={<ProtectedRoute><MyPlans /></ProtectedRoute>} />
            <Route path="/account/plans/:id" element={<ProtectedRoute><MyPlans /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/builders" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

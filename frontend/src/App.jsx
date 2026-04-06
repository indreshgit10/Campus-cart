import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { AuthProvider } from "./context/AuthContext";
import { ProductProvider } from "./context/ProductContext";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Upload = lazy(() => import("./pages/Upload"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const MyListings = lazy(() => import("./pages/MyListings"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Inbox = lazy(() => import("./pages/Inbox"));
const Chat = lazy(() => import("./pages/Chat"));

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/user/:id" element={<UserProfile />} />
                <Route path="/my-listings" element={<MyListings />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/notes/:subject/:unit" element={<ProductDetails />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/chat/:productId" element={<Chat />} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;

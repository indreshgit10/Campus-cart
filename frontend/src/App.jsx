import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Upload from "./pages/Upload";
import UserProfile from "./pages/UserProfile";
import MyListings from "./pages/MyListings";
import Layout from "./components/layout/Layout";
import { AuthProvider } from "./context/AuthContext";
import { ProductProvider } from "./context/ProductContext";
import ProductDetails from "./pages/ProductDetails";

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/user/:id" element={<UserProfile />} />
              <Route path="/my-listings" element={<MyListings />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/notes/:subject/:unit" element={<ProductDetails />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import api from "../utils/api";
import { motion } from "framer-motion";
import { ArrowLeft, User, IndianRupee, MapPin, Star, FileText, Loader2, Heart, Share2 } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const ProductDetails = () => {
  const { id, subject, unit } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        let data;
        if (id) {
          const res = await api.get(`/products/${id}`);
          data = res.data;
        } else if (subject && unit) {
          // This would require a backend route for slug lookups
          // For now, let's assume we redirect or have a placeholder for this logic
          // As per the reference, they fetch by subject/unit
          // But our current backend only has /api/products/:id
          // I will stick to id-based fetching for now to ensure it works
          const res = await api.get("/products");
          data = res.data.find(p => p.subject === subject); // Simple fallback search
        }
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, subject, unit]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <Loader2 size={48} className="text-primary animate-spin" />
      <p className="text-white/40 font-black uppercase tracking-widest text-xs">Loading Treasures...</p>
    </div>
  );

  if (!product) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-6">
      <h2 className="text-4xl font-black text-white">Treasure not found</h2>
      <button onClick={() => navigate("/")} className="text-primary font-bold hover:underline">Return Home</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-12">
      <button 
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-white/50 hover:text-primary transition-all font-bold group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24">
        {/* Image Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-[#111827] border border-white/5 shadow-2xl"
        >
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-8 right-8 flex flex-col gap-4">
            <button className="p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl hover:scale-110 active:scale-95 transition-all text-rose-500">
              <Heart size={24} fill="currentColor" />
            </button>
            <button className="p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl hover:scale-110 active:scale-95 transition-all text-white">
              <Share2 size={24} />
            </button>
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center space-y-10"
        >
          <div className="space-y-6">
            <div className="flex gap-3">
              <span className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                {product.category}
              </span>
              {product.isTopper && (
                <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-600 text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <Star size={14} fill="currentColor" />
                  Topper Choice
                </span>
              )}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-white">{product.name}</h1>
            
            <div className="flex items-center text-5xl font-black text-white">
              <IndianRupee size={40} className="text-primary" />
              {product.price}
            </div>

            <p className="text-xl text-white/60 leading-relaxed font-medium">
              {product.description || "No description provided for this treasure."}
            </p>
          </div>

          <div className="p-8 bg-[#111827] rounded-[3rem] border border-white/5 space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-xl">
                {product.user?.name?.[0] || "V"}
              </div>
              <div>
                <p className="text-2xl font-black text-white">{product.user?.name || "Verified Student"}</p>
                <div className="flex items-center text-white/40 font-bold text-sm gap-2">
                  <MapPin size={16} className="text-primary" />
                  College Campus
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
             <button className="flex-1 h-20 bg-primary hover:bg-primary/90 text-white rounded-3xl font-black text-xl uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all active:scale-95">
               Purchase Now
             </button>
             {product.isDigital && (
               <button className="h-20 px-8 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-3xl font-black flex items-center justify-center gap-3 transition-all active:scale-95">
                 <FileText size={24} />
                 Preview
               </button>
             )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails;

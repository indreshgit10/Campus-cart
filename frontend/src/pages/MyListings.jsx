import { useContext, useState } from "react";
import { ProductContext } from "../context/ProductContext";
import { AuthContext } from "../context/AuthContext";
import ProductCard from "../components/product/ProductCard";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, PlusCircle, Package, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MyListings = () => {
  const { products, deleteProduct, setEditingProduct, updateProduct, loading } = useContext(ProductContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Filter products to only show the user's listings
  const myProducts = products.filter(p => {
    const productUserId = p.user?._id || p.user?.id || p.user;
    const currentUserId = user?._id || user?.id;
    return productUserId === currentUserId;
  });

  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (product, e) => {
    e.stopPropagation();
    setEditingProduct(product);
    navigate("/upload");
  };

  const handleDeleteClick = async (product, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this listing?")) {
      setIsDeleting(true);
      await deleteProduct(product._id || product.id);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-12 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter gradient-text">My CampusCart</h2>
          <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px] opacity-60">Manage your active deals</p>
        </div>
        <button 
          onClick={() => navigate("/upload")}
          className="flex items-center justify-center gap-3 px-8 py-4 button-premium-primary rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
        >
          <PlusCircle size={20} />
          Create New Listing
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 space-y-4"
          >
            <Loader2 size={48} className="text-primary animate-spin" strokeWidth={1} />
            <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-xs">Loading Your Shop...</p>
          </motion.div>
        ) : myProducts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center space-y-6 glass-premium rounded-[3rem] border border-white/5 shadow-2x"
          >
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-muted-foreground border border-white/5 shadow-inner">
              <Package size={48} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black tracking-tight">No active listings</h3>
              <p className="text-muted-foreground font-medium max-w-xs">Start selling your items to see them here and reach your peers.</p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {myProducts.map((p) => (
              <motion.div 
                key={p._id || p.id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col gap-5 group"
              >
                <div className="pointer-events-none">
                  <ProductCard product={p} />
                </div>
                <div className="flex flex-col gap-3 px-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateProduct({ ...p, status: p.status === "Sold" ? "Available" : "Sold" });
                    }}
                    className={`w-full flex items-center justify-center gap-2 h-14 rounded-2xl font-black text-sm uppercase tracking-widest border transition-all active:scale-95 shadow-lg ${
                      p.status === "Sold" 
                        ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white" 
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white"
                    }`}
                  >
                    <Package size={18} />
                    {p.status === "Sold" ? "Mark Available" : "Mark Sold"}
                  </button>

                  <div className="flex gap-3">
                    <button 
                      onClick={(e) => handleEdit(p, e)}
                      className="flex-1 flex items-center justify-center gap-2 h-14 bg-white/5 text-white rounded-2xl font-black text-sm uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all active:scale-95 shadow-lg"
                    >
                      <Edit2 size={18} className="text-primary" />
                      Edit
                    </button>

                    <button
                      onClick={(e) => handleDeleteClick(p, e)}
                      disabled={isDeleting}
                      className="w-14 h-14 flex items-center justify-center bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-lg disabled:opacity-50"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyListings;

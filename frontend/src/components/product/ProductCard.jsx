import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Monitor, PenTool, Star, IndianRupee, Image as ImageIcon } from "lucide-react";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Notes": return <PenTool size={14} />;
      case "Books": return <BookOpen size={14} />;
      case "Electronics": return <Monitor size={14} />;
      default: return null;
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -8 }}
      onClick={() => {
        if (product.category === "Notes" && product.subject) {
          const unitSlug = product.unit || "full-notes";
          navigate(`/notes/${product.subject}/${unitSlug}`);
        } else {
          navigate(`/product/${product._id || product.id}`);
        }
      }}
      className="group relative bg-[#111827] rounded-3xl border border-white/5 overflow-hidden cursor-pointer shadow-xl transition-all duration-300 hover:border-primary/20 hover:shadow-primary/5"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-white/5 flex items-center justify-center">
        {imageError || !product.image ? (
          <div className="flex flex-col items-center justify-center text-muted-foreground/30">
            <ImageIcon size={48} strokeWidth={1} />
            <span className="text-[10px] font-bold mt-2 uppercase tracking-widest text-white/40">No Image</span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1.5 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 rounded-xl border border-white/10">
            {getCategoryIcon(product.category)}
            {product.category}
          </span>
          {product.isTopper && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-600 text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 rounded-xl shadow-lg shadow-amber-500/20">
              <Star size={12} fill="currentColor" />
              Topper
            </span>
          )}
        </div>
        
        <div className="absolute bottom-4 left-4">
          <div className="px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-1.5 shadow-2xl">
            <IndianRupee size={16} className="text-primary" />
            <span className="text-lg font-black text-white">{product.price}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h4 className="font-bold text-xl line-clamp-1 group-hover:text-primary transition-all duration-300 text-white">
          {product.name}
        </h4>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center text-white/50 text-xs font-semibold gap-1.5">
             By {product.user?.name || "Verified Student"}
          </div>
          {product.numReviews > 0 && (
            <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/5 px-2 py-1 rounded-lg border border-yellow-500/10">
              <Star size={10} fill="currentColor" />
              <span className="text-[10px] font-black">{product.rating?.toFixed(1) || "5.0"}</span>
            </div>
          )}
        </div>

        {product.category === "Notes" && (product.subject || product.semester) && (
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
            {product.subject && (
              <span className="px-3 py-1.5 bg-white/5 text-white/60 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-white/5">
                {product.subject}
              </span>
            )}
            {product.semester && (
              <span className="px-3 py-1.5 bg-white/5 text-white/60 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-white/5">
                Semester {product.semester}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-x-0 -bottom-24 h-48 bg-primary/10 blur-[60px] rounded-full mx-auto w-1/2" />
      </div>
    </motion.div>
  );
};

export default ProductCard;

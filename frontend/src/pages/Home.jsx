import { useContext, useState } from "react";
import { ProductContext } from "../context/ProductContext";
import ProductCard from "../components/product/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, PackageX, Loader2 } from "lucide-react";

const Home = () => {
  const { products, loading } = useContext(ProductContext);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === "All" || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <div className="space-y-6">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
          Campus <span className="text-primary italic">Cart</span>
        </h1>
        <p className="text-xl text-white/50 max-w-2xl font-medium">
          The ultimate marketplace for college essentials. High-quality notes, textbooks, and electronics from your community.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-all duration-300" size={20} />
          <input
            placeholder="Search products, books, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-16 pl-14 pr-6 bg-[#111827] border border-white/5 rounded-3xl focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all font-bold text-white placeholder:text-white/20 shadow-2xl"
          />
        </div>

        <div className="md:col-span-4 relative">
           <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={20} />
           <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full h-16 pl-14 pr-6 bg-[#111827] border border-white/5 rounded-3xl focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all font-bold text-white appearance-none cursor-pointer shadow-2xl"
          >
            <option value="All">All Categories</option>
            <option value="Notes">Notes</option>
            <option value="Books">Books</option>
            <option value="Electronics">Electronics</option>
          </select>
        </div>
      </div>

      {/* Product Feed */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32 space-y-4"
          >
            <Loader2 size={48} className="text-primary animate-spin" strokeWidth={1} />
            <p className="text-white/40 font-black uppercase tracking-[0.3em] text-xs">Fetching Treasures...</p>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center space-y-6 bg-[#111827] rounded-[3rem] border border-white/5 shadow-2xl"
          >
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-white/30 shadow-inner border border-white/5">
              <PackageX size={48} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black tracking-tight text-white">No treasures found</h3>
              <p className="text-white/40 font-medium max-w-sm">Try adjusting your filters or search query to find what you're looking for.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filtered.map((p) => (
              <motion.div key={p._id || p.id} variants={itemVariants}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;

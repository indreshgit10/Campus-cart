import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased text-foreground selection:bg-primary/30">
      <Navbar />
      <main className="flex-1 container mx-auto w-full px-4 py-8 md:px-6 lg:px-8 max-w-7xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      
      {/* Premium Background Blobs */}
      <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] right-[10%] w-[25%] h-[25%] bg-purple-500/10 rounded-full blur-[80px]" />
      </div>
    </div>
  );
};

export default Layout;

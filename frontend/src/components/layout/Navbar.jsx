import { useNavigate, Link } from "react-router-dom";
import { ShoppingBag, MessageSquare, PlusCircle, User, LayoutDashboard, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="sticky top-0 z-50 w-full glass-premium border-b-0">
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
      <div className="container mx-auto px-4 h-18 flex items-center justify-between max-w-7xl">
        <div 
          className="flex items-center gap-4 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="relative">
            <motion.div  
              initial={{ rotate: -10, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              whileHover={{ rotate: 5, scale: 1.1 }}
              className="w-12 h-12 gradient-primary rounded-[1rem] flex items-center justify-center text-white shadow-2xl shadow-primary/40 relative z-10 overflow-hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
                <motion.path 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  d="M17 17H6L4 3H2" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <motion.path 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  d="M7 17C8.10457 17 9 17.8954 9 19C9 20.1046 8.10457 21 7 21C5.89543 21 5 20.1046 5 19C5 17.8954 5.89543 17 7 17Z" 
                  fill="currentColor"
                />
                <motion.path 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  d="M15 17C16.1046 17 17 17.8954 17 19C17 20.1046 16.1046 21 15 21C13.8954 21 13 20.1046 13 19C13 17.8954 13.8954 17 15 17Z" 
                  fill="currentColor"
                />
                <motion.path 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  d="M5 6H20L18 13H6" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
            <div className="absolute inset-0 bg-primary blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter gradient-text leading-none">
              CampusCart
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50 mt-1">
              College Marketplace
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {user && (
            <>
              <Link to="/my-listings" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-all flex items-center gap-2 group">
                <LayoutDashboard size={18} className="group-hover:rotate-6 transition-transform" />
                My Listings
              </Link>
              <Link to="/inbox" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-all flex items-center gap-2 group">
                <MessageSquare size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                Inbox
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link to={`/user/${user._id || user.id}`} className="hidden sm:flex items-center gap-3 hover:bg-white/5 p-2 rounded-xl transition-all cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black shadow-inner border border-primary/20">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name?.charAt(0)?.toUpperCase() || "U"
                  )}
                </div>
                <div className="flex flex-col items-start bg-transparent">
                  <span className="text-xs font-black text-white">{user.name}</span>
                  <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Profile</span>
                </div>
              </Link>
              <button 
                onClick={logout}
                title="Logout"
                className="p-3 bg-white/5 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 rounded-xl transition-all border border-white/5 group"
              >
                <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate("/login")}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-all hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5"
            >
              <User size={18} />
              Login 
            </button>
          )}
          
          <button 
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 px-6 py-3 button-premium-primary rounded-2xl text-sm font-bold active:scale-95 shadow-xl shadow-primary/20"
          >
            <PlusCircle size={18} />
            Sell Item
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

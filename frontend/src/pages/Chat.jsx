import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useContext, useRef, useEffect } from "react";
import { ProductContext } from "../context/ProductContext";
import { AuthContext } from "../context/AuthContext";
import { Send, ChevronLeft, MoreVertical, Paperclip, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import api from "../utils/api";

const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : "http://localhost:5000";
const socket = io(socketUrl);

const Chat = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { products } = useContext(ProductContext);
  const { user } = useContext(AuthContext);
  const { sellerName, sellerId, productTitle: passedTitle } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiProduct, setApiProduct] = useState(null);
  const scrollRef = useRef(null);

  const product = products.find((p) => String(p._id || p.id) === productId) || apiProduct;
  const urlUserId = productId?.startsWith('dm-') ? productId.replace('dm-', '') : null;
  const receiverId = sellerId || urlUserId || product?.user?._id || product?.user;
  const productTitle = product?.title || product?.name || passedTitle || "Product";

  // Fetch specific product if not in global list
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${productId}`);
        setApiProduct(data);
      } catch (err) {
        console.error("Error fetching product details:", err);
      }
    };

    if (!products.find((p) => String(p._id || p.id) === productId)) {
      fetchProduct();
    }
  }, [productId, products]);

  // Load conversation from API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const url = `/messages/${productId}${receiverId ? `?with=${receiverId}` : ""}`;
        const { data } = await api.get(url);
        setMessages(data);
        
        // Mark as read when entering the chat
        if (receiverId) {
          await api.put(`/messages/read/${productId}${receiverId ? `?with=${receiverId}` : ""}`);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && productId) {
      console.log("Chat Debug: Joining room for", { productId, userId: user._id, receiverId });
      fetchMessages();
      socket.emit("join_chat", { productId, senderId: user._id, receiverId });
    }

    // Listen for incoming messages
    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [productId, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (text.trim() && user) {
      if (!receiverId) return;

      console.log("Chat Debug: Sending message to", receiverId);
      const data = {
        productId,
        senderId: user._id,
        receiverId,
        text: text.trim()
      };
      
      socket.emit("send_message", data);
      setText("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col gap-6">
      {/* CHAT HEADER */}
      <div className="glass-premium rounded-3xl p-5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 hover:bg-white/10 rounded-2xl transition-all shadow-inner border border-white/5"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-lg">
              {product?.image ? (
                <img src={product.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full gradient-primary flex items-center justify-center text-white font-black text-xl">
                  {productTitle?.[0] || "?"}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-black text-xl leading-tight tracking-tight">{productTitle}</h4>
              <p className="text-sm text-primary font-bold italic tracking-wide">₹{product?.price || 'Negotiable'}</p>
            </div>
          </div>
        </div>
        
        <button className="p-3 hover:bg-white/10 rounded-2xl transition-all text-muted-foreground border border-white/5">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* MESSAGES AREA */}
      <div 
        ref={scrollRef}
        className="flex-1 glass-premium rounded-[2.5rem] p-8 overflow-y-auto space-y-6 scroll-smooth shadow-inner"
      >
        <div className="flex justify-center">
          <span className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border border-white/5">
            Conversation Started
          </span>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m._id || m.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex ${m.sender === user?._id || m.sender?._id === user?._id ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[75%] space-y-2">
                <div
                  className={`px-6 py-4 rounded-3xl text-sm font-medium shadow-2xl ${
                    m.sender === user?._id || m.sender?._id === user?._id
                      ? "gradient-primary text-white rounded-tr-none"
                      : "bg-[#1F2937]/80 backdrop-blur-md text-white border border-white/10 rounded-tl-none"
                  }`}
                >
                  {m.text}
                </div>
                <p className={`text-[10px] font-black text-muted-foreground/60 px-2 uppercase tracking-widest ${m.sender === user?._id || m.sender?._id === user?._id ? "text-right" : "text-left"}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* INPUT AREA */}
      <div className="glass-premium rounded-[2rem] p-3 shadow-2xl flex items-center gap-3 group border-white/20">
        <button className="p-3.5 text-muted-foreground hover:text-primary transition-all rounded-2xl hover:bg-white/5">
          <Paperclip size={22} />
        </button>
        
        <input
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 bg-transparent border-none focus:ring-0 text-base py-3 px-2 outline-none font-bold placeholder:text-muted-foreground/30"
        />
        
        <button className="p-3.5 text-muted-foreground hover:text-primary transition-all rounded-2xl hover:bg-white/5">
          <Smile size={22} />
        </button>
        
        <button
          onClick={sendMessage}
          disabled={!text.trim()}
          className="p-4 button-premium-primary rounded-2xl shadow-2xl disabled:opacity-30 disabled:translate-y-0 disabled:shadow-none active:scale-90"
        >
          <Send size={22} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default Chat;

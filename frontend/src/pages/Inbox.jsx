import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, ArrowRight, Inbox as InboxIcon } from "lucide-react";
import { motion } from "framer-motion";
import api from "../utils/api";

const Inbox = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get("/messages/conversations");
        setConversations(data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Fetching your conversations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black tracking-tight gradient-text">My CampusCart</h2>
        <div className="gradient-primary px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20">
          {conversations.length} active chats
        </div>
      </div>

      <div className="glass-premium rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5">
        {conversations.length > 0 ? (
          <div className="divide-y divide-white/5">
            {conversations.map((conv, index) => (
              <motion.div
                onClick={() => navigate(`/chat/${conv.productId}`, {
                  state: {
                    sellerName: conv.otherParticipantName,
                    sellerId: conv.otherParticipantId,
                    productTitle: conv.productTitle
                  }
                })}
                className="p-7 flex items-center gap-6 cursor-pointer hover:bg-white/5 transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-lg flex-shrink-0">
                  {conv.productImage ? (
                    <img src={conv.productImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full gradient-primary flex items-center justify-center text-white font-black text-2xl">
                      {conv.productTitle[0]}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-black text-xl text-white truncate tracking-tight group-hover:gradient-text transition-all">
                      {conv.productTitle}
                    </h4>
                    {conv.hasUnread && (
                      <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-lg shadow-rose-500/50" />
                    )}
                  </div>
                  <p className="text-xs font-black text-primary uppercase tracking-widest opacity-60 mb-2">{conv.otherParticipantName}</p>
                  <p className="text-sm font-medium text-muted-foreground truncate opacity-70">{conv.lastMessage}</p>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                  <ArrowRight size={20} />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-muted-foreground border border-white/5 shadow-inner">
              <InboxIcon size={48} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black tracking-tight">Your inbox is clear</h3>
              <p className="text-muted-foreground font-medium max-w-xs">When you start a conversation about an item, it will show up here.</p>
            </div>
            <button 
              onClick={() => navigate("/")}
              className="px-8 py-4 button-premium-primary rounded-3xl font-black text-sm uppercase tracking-widest"
            >
              Explore CampusCart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
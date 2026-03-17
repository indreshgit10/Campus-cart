import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, PackageX, User as UserIcon, Loader2, MapPin, Star } from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { user, setUser } = useContext(AuthContext);
  const isOwnProfile = user && (user._id === id || user.id === id);

  const [userProfile, setUserProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/users/${id}`);
        setUserProfile(data);
        setEditBio(data.bio || "");
        setProducts(data.products || []);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "campus-cart");
    
    // Fallback cloud name logic
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dijebympq";
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );
    
    if (!response.ok) throw new Error("Failed to upload image");
    const data = await response.json();
    return data.secure_url;
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      let profilePictureUrl = userProfile.profilePicture;
      
      if (editImage) {
        profilePictureUrl = await uploadImageToCloudinary(editImage);
      }

      const { data: updatedUser } = await api.put("/users/profile", {
        bio: editBio,
        profilePicture: profilePictureUrl,
      });

      setUserProfile((prev) => ({ ...prev, bio: updatedUser.bio, profilePicture: updatedUser.profilePicture }));
      
      const updatedUserInfo = { ...user, bio: updatedUser.bio, profilePicture: updatedUser.profilePicture };
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
      setUser(updatedUserInfo);

      setIsEditing(false);
      setEditImage(null);
      setEditImagePreview(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 size={48} className="text-primary animate-spin" strokeWidth={1} />
        <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-xs">Loading Profile...</p>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <h2 className="text-2xl font-bold">User not found</h2>
        <p className="text-muted-foreground max-w-sm">The user you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate("/")} className="text-primary font-bold hover:underline mt-4">Return Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all font-bold group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-premium rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
          
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl shadow-primary/20 flex-shrink-0 bg-neutral-900 flex items-center justify-center relative group">
            {editImagePreview || userProfile.profilePicture ? (
              <img src={editImagePreview || userProfile.profilePicture} alt={userProfile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full gradient-primary flex items-center justify-center text-white font-black text-6xl shadow-inner">
                {userProfile.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}

            {isEditing && (
              <label className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <span className="text-white font-bold text-xs uppercase tracking-widest text-center px-4">Change Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setEditImage(file);
                      setEditImagePreview(URL.createObjectURL(file));
                    }
                  }} 
                />
              </label>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <h1 className="text-5xl md:text-6xl font-black tracking-tight">{userProfile.name}</h1>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground font-bold uppercase tracking-widest text-xs">
                <MapPin size={14} className="text-primary" />
                <span>Verified Student</span>
                <span className="mx-2 opacity-30">•</span>
                <span>Joined {new Date(userProfile.createdAt || Date.now()).getFullYear()}</span>
              </div>
            </div>

            {isEditing ? (
              <div className="w-full max-w-2xl text-left space-y-4">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Edit Bio</p>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell students a bit about yourself, your major, what you sell..."
                  className="w-full min-h-[120px] p-5 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none transition-all font-medium text-white placeholder:text-muted-foreground/30 resize-none"
                  maxLength={500}
                />
              </div>
            ) : (
              <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5 shadow-inner inline-block w-full max-w-2xl text-left">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 mb-2">About</p>
                <p className="text-lg font-medium text-white/90 leading-relaxed whitespace-pre-wrap">
                  {userProfile.bio || (isOwnProfile ? "You haven't added a bio yet. Click 'Edit Profile' to add one." : "This user hasn't added a bio yet.")}
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-col md:flex-row gap-4 justify-center md:justify-start">
              {isOwnProfile ? (
                isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="px-10 h-14 button-premium-primary rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 transition-transform hover:scale-105 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 size={18} className="animate-spin" /> : "Save Changes"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditBio(userProfile.bio || "");
                        setEditImage(null);
                        setEditImagePreview(null);
                      }}
                      className="px-8 h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full md:w-auto px-10 h-16 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl flex items-center justify-center transition-all"
                  >
                    Edit Profile
                  </button>
                )
              ) : (
                userProfile?.isAdmin && (
                  <button
                    onClick={() => alert("Messaging coming in Phase 3.")}
                    className="w-full md:w-auto px-10 h-16 button-premium-primary rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-transform hover:scale-105"
                  >
                    <MessageSquare size={20} />
                    Contact Seller
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Active Listings Grid */}
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight uppercase">Listings by {userProfile.name?.split(' ')[0] || "Seller"}</h2>
          <p className="text-muted-foreground font-bold text-sm tracking-wide">{products.length} Items Available</p>
        </div>

        {products.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center space-y-6 glass-premium rounded-[3rem] border border-white/5 shadow-2xl"
          >
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-muted-foreground shadow-inner border border-white/5">
              <PackageX size={48} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight">No listings yet</h3>
              <p className="text-muted-foreground font-medium max-w-sm">{userProfile.name} hasn't posted any items yet.</p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <motion.div key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

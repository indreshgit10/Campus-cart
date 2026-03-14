import { useState, useContext, useEffect } from "react";
import { ProductContext } from "../context/ProductContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, X, Check, ArrowLeft, Image as ImageIcon, Loader2, FileText, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Upload = () => {
  const {
    addProduct,
    editingProduct,
    updateProduct,
    setEditingProduct,
  } = useContext(ProductContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Notes");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [isTopper, setIsTopper] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isFree, setIsFree] = useState(false);

  // Full PDF (paid/free full document — only shown after purchase or if free)
  const [documentFile, setDocumentFile] = useState(null);
  const [documentName, setDocumentName] = useState("");

  // Demo PDF (always visible to users as a preview)
  const [demoFile, setDemoFile] = useState(null);
  const [demoName, setDemoName] = useState("");

  // For non-Notes categories
  const [isDigital, setIsDigital] = useState(false);

  const isNotes = category === "Notes";

  useEffect(() => {
    if (editingProduct) {
      setTitle(editingProduct.name || editingProduct.title);
      setDescription(editingProduct.description || "");
      setPrice(editingProduct.price);
      setCategory(editingProduct.category);
      setPreview(editingProduct.image);
      setSubject(editingProduct.subject || "");
      setSemester(editingProduct.semester || "");
      setIsTopper(editingProduct.isTopper || false);
      setIsDigital(editingProduct.isDigital || false);
      setIsFree(editingProduct.isFree || false);
      setDocumentName(editingProduct.fileUrl ? "Existing Full PDF Attached" : "");
      setDemoName(editingProduct.demoFileUrl ? "Existing Demo PDF Attached" : "");
    }
  }, [editingProduct]);

  const uploadToCloudinary = async (file, resourceType = "image") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    formData.append("resource_type", resourceType);
    console.log(`📤 [CLOUDINARY] Uploading ${file.name} as ${resourceType}...`);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      { method: "POST", body: formData }
    );
    if (!response.ok) {
      const errData = await response.json();
      console.error("❌ [CLOUDINARY] Error:", errData);
      throw new Error(`Failed to upload ${resourceType} to Cloudinary`);
    }
    const data = await response.json();
    let finalUrl = data.secure_url || data.url;
    
    // Cloudinary sometimes returns just the public_id depending on the account configuration
    if (finalUrl && !finalUrl.startsWith('http')) {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      finalUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${finalUrl}`;
    }
    
    console.log(`✅ [CLOUDINARY] Success! URL:`, finalUrl);
    return finalUrl;
  };

  const handleUpload = async () => {
    if (!user) { alert("Please login to publish a listing."); return; }

    if (!title || (!isFree && !price) || !description || (!image && !preview)) {
      alert("Please fill all essential fields (Title, Price/Free, Description) and add an image.");
      return;
    }

    // Notes: require full PDF at minimum
    if (isNotes && !documentFile && !editingProduct?.fileUrl) {
      alert("Please upload the Full PDF for your Notes listing.");
      return;
    }

    // Non-Notes digital: require document
    if (!isNotes && isDigital && !documentFile && !editingProduct?.fileUrl) {
      alert("Please upload your digital PDF document.");
      return;
    }

    setIsPublishing(true);

    try {
      let imageUrl = preview;
      let fileUrl = editingProduct?.fileUrl || null;
      let demoFileUrl = editingProduct?.demoFileUrl || null;

      if (image) imageUrl = await uploadToCloudinary(image, "image");

      // Notes: upload full + optional demo
      if (isNotes) {
        if (documentFile) fileUrl = await uploadToCloudinary(documentFile, "raw");
        if (demoFile && !isFree) demoFileUrl = await uploadToCloudinary(demoFile, "raw");
      } else if (isDigital && documentFile) {
        fileUrl = await uploadToCloudinary(documentFile, "raw");
      }

      const productData = {
        name: title,
        price: isFree ? 0 : Number(price),
        description,
        category,
        image: imageUrl,
        subject: isNotes ? subject : null,
        semester: isNotes ? semester : null,
        isTopper: isNotes ? isTopper : false,
        isDigital: isNotes ? true : isDigital,  // Notes are always digital
        isFree,
        fileUrl,
        demoFileUrl: isFree ? null : demoFileUrl,
      };

      if (editingProduct) {
        await updateProduct({ ...productData, _id: editingProduct._id });
        setEditingProduct(null);
      } else {
        await addProduct(productData);
      }
      navigate(editingProduct ? "/my-listings" : "/");
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to save product. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <button
        onClick={() => { setEditingProduct(null); navigate(-1); }}
        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all font-bold group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to CampusCart
      </button>

      <div className="space-y-3">
        <h2 className="text-4xl font-black tracking-tight gradient-text">
          {editingProduct ? "Refine your Listing" : "Share something New"}
        </h2>
        <p className="text-muted-foreground font-medium">Fill in the details below to reach thousands of students instantly.</p>
      </div>

      <div className="glass-premium rounded-[2.5rem] p-10 shadow-2xl space-y-10">
        {/* IMAGE UPLOAD */}
        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 opacity-70">Product Visual</label>
          <div className="relative group">
            {preview ? (
              <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-white/10 ring-1 ring-white/5">
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setImage(null); setPreview(null); }}
                  className="absolute top-4 right-4 p-2.5 bg-black/60 text-white rounded-full hover:bg-black transition-all border border-white/10 shadow-2xl backdrop-blur-md"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-video rounded-[2rem] border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group overflow-hidden">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 shadow-inner">
                  <UploadIcon size={36} />
                </div>
                <div className="mt-5 text-center px-4">
                  <p className="font-bold text-xl group-hover:text-primary transition-colors">Click to upload image</p>
                  <p className="text-sm text-muted-foreground font-medium opacity-60">PNG, JPG, or WEBP up to 10MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
                  }}
                />
              </label>
            )}
          </div>
        </div>

        {/* BASIC INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 opacity-70">Title</label>
            <input
              placeholder="e.g. OS Notes by AK"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-16 px-6 bg-black/40 border border-white/10 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all font-bold text-white placeholder:text-muted-foreground/30 shadow-inner"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 opacity-70">Price (₹)</label>
            <input
              type="number"
              placeholder={isFree ? "Free Item" : "500"}
              value={isFree ? 0 : price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isFree}
              className={`w-full h-16 px-6 bg-black/40 border border-white/10 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all font-bold text-white placeholder:text-muted-foreground/30 shadow-inner ${isFree ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 opacity-70">Description</label>
          <textarea
            placeholder="Tell us more about the product..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-[120px] p-6 bg-black/40 border border-white/10 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all font-bold text-white placeholder:text-muted-foreground/30 shadow-inner resize-none"
          />
        </div>

        {/* CATEGORY */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 opacity-70">Category</label>
          <div className="flex flex-wrap gap-4">
            {["Notes", "Books", "Electronics"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-1 h-16 px-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border-2 ${
                  category === cat
                    ? "button-premium-primary border-transparent"
                    : "bg-white/5 border-white/5 text-muted-foreground hover:border-primary/30 hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* NOTES SPECIFIC */}
        <AnimatePresence>
          {isNotes && (
            <motion.div
              key="notes-section"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8 pt-8 border-t border-white/5"
            >
              {/* Subject + Semester */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 opacity-70">Subject</label>
                  <input
                    placeholder="Data Structures"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-16 px-6 bg-black/40 border border-white/10 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all font-bold text-white placeholder:text-muted-foreground/30 shadow-inner"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 opacity-70">Semester</label>
                  <input
                    placeholder="4"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full h-16 px-6 bg-black/40 border border-white/10 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all font-bold text-white placeholder:text-muted-foreground/30 shadow-inner"
                  />
                </div>
              </div>

              {/* Topper + Free */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex items-center gap-5 p-6 bg-yellow-400/5 border-2 border-yellow-400/20 rounded-3xl cursor-pointer hover:bg-yellow-400/10 transition-all group shadow-xl">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isTopper ? "bg-gradient-to-br from-yellow-400 to-amber-600 text-black shadow-lg shadow-yellow-500/20" : "bg-white/5 text-muted-foreground"}`}>
                    <Check size={24} strokeWidth={4} />
                  </div>
                  <div>
                    <p className="font-black text-yellow-500 text-lg">Topper's Choice</p>
                    <p className="text-sm text-yellow-500/60 font-medium">Elevate with the "Topper" badge.</p>
                  </div>
                  <input type="checkbox" className="hidden" checked={isTopper} onChange={(e) => setIsTopper(e.target.checked)} />
                </label>

                <label className="flex items-center gap-5 p-6 bg-green-500/5 border-2 border-green-500/20 rounded-3xl cursor-pointer hover:bg-green-500/10 transition-all group shadow-xl">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isFree ? "bg-gradient-to-br from-green-400 to-emerald-600 text-black shadow-lg shadow-green-500/20" : "bg-white/5 text-muted-foreground"}`}>
                    <Check size={24} strokeWidth={4} />
                  </div>
                  <div>
                    <p className="font-black text-green-500 text-lg">Free Resource</p>
                    <p className="text-sm text-green-500/60 font-medium">Share for free (₹0).</p>
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isFree}
                    onChange={(e) => { setIsFree(e.target.checked); if (e.target.checked) setPrice("0"); }}
                  />
                </label>
              </div>

              {/* PDF Upload: Full PDF */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-1">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground opacity-70">Full PDF</label>
                  <span className="text-[10px] px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold uppercase tracking-wider">Required</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium opacity-60 px-1 -mt-2">The complete document — shown to buyers after purchase (or always, if free).</p>
                <label className="flex items-center justify-between p-6 rounded-[2rem] border-2 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${documentName ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-muted-foreground group-hover:text-blue-400 group-hover:bg-blue-500/10'}`}>
                      <FileText size={28} />
                    </div>
                    <div>
                      <p className="font-bold text-lg group-hover:text-blue-400 transition-colors">
                        {documentName ? "Full PDF Selected" : "Upload Full PDF"}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium opacity-60 max-w-[200px] truncate">
                        {documentName || "PDFs up to 100MB allowed"}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 py-3 rounded-xl bg-white/5 font-bold text-sm group-hover:bg-blue-500 group-hover:text-white transition-all text-muted-foreground">
                    Browse
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) { setDocumentFile(file); setDocumentName(file.name); }
                    }}
                  />
                </label>
              </div>

              {/* PDF Upload: Demo PDF */}
              {!isFree && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-1">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground opacity-70">Demo PDF</label>
                    <span className="text-[10px] px-3 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/10 font-bold uppercase tracking-wider">Optional</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium opacity-60 px-1 -mt-2">A preview/sample — always visible to any user browsing the listing.</p>
                  <label className="flex items-center justify-between p-6 rounded-[2rem] border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 cursor-pointer transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${demoName ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-muted-foreground group-hover:text-purple-400 group-hover:bg-purple-500/10'}`}>
                        <FileText size={28} />
                      </div>
                      <div>
                        <p className="font-bold text-lg group-hover:text-purple-400 transition-colors">
                          {demoName ? "Demo PDF Selected" : "Upload Demo PDF"}
                        </p>
                        <p className="text-sm text-muted-foreground font-medium opacity-60 max-w-[200px] truncate">
                          {demoName || "A sample/preview of your notes"}
                        </p>
                      </div>
                    </div>
                    <div className="px-6 py-3 rounded-xl bg-white/5 font-bold text-sm group-hover:bg-purple-500 group-hover:text-white transition-all text-muted-foreground">
                      Browse
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) { setDemoFile(file); setDemoName(file.name); }
                      }}
                    />
                  </label>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* NON-NOTES: Digital Item toggle */}
        <AnimatePresence>
          {!isNotes && (
            <motion.div
              key="digital-section"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6 pt-8 border-t border-white/5"
            >
              <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 opacity-70">Item Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <label className="flex items-center gap-5 p-6 bg-blue-500/5 border-2 border-blue-500/20 rounded-3xl cursor-pointer hover:bg-blue-500/10 transition-all group shadow-xl">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDigital ? "bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-lg shadow-blue-500/20" : "bg-white/5 text-muted-foreground"}`}>
                    <Download size={20} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="font-black text-blue-400 text-lg">Digital Item (PDF)</p>
                    <p className="text-sm text-blue-400/60 font-medium">Users read it online.</p>
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isDigital}
                    onChange={(e) => { setIsDigital(e.target.checked); if (!e.target.checked) setIsFree(false); }}
                  />
                </label>

                <AnimatePresence>
                  {isDigital && (
                    <motion.label
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-5 p-6 bg-green-500/5 border-2 border-green-500/20 rounded-3xl cursor-pointer hover:bg-green-500/10 transition-all group shadow-xl"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isFree ? "bg-gradient-to-br from-green-400 to-emerald-600 text-black shadow-lg shadow-green-500/20" : "bg-white/5 text-muted-foreground"}`}>
                        <Check size={24} strokeWidth={4} />
                      </div>
                      <div>
                        <p className="font-black text-green-500 text-lg">Free Resource</p>
                        <p className="text-sm text-green-500/60 font-medium">Share for free (₹0).</p>
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={isFree}
                        onChange={(e) => { setIsFree(e.target.checked); if (e.target.checked) setPrice("0"); }}
                      />
                    </motion.label>
                  )}
                </AnimatePresence>
              </div>

              {/* Document upload for non-Notes digital items */}
              <AnimatePresence>
                {isDigital && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <label className="flex items-center justify-between p-6 rounded-[2rem] border-2 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${documentName ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-muted-foreground group-hover:text-blue-400 group-hover:bg-blue-500/10'}`}>
                          <FileText size={28} />
                        </div>
                        <div>
                          <p className="font-bold text-lg group-hover:text-blue-400 transition-colors">
                            {documentName ? "Document Selected" : "Upload PDF Document"}
                          </p>
                          <p className="text-sm text-muted-foreground font-medium opacity-60 max-w-[200px] truncate">
                            {documentName || "PDFs up to 100MB allowed"}
                          </p>
                        </div>
                      </div>
                      <div className="px-6 py-3 rounded-xl bg-white/5 font-bold text-sm group-hover:bg-blue-500 group-hover:text-white transition-all text-muted-foreground">
                        Browse Files
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) { setDocumentFile(file); setDocumentName(file.name); }
                        }}
                      />
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleUpload}
          disabled={isPublishing}
          className={`w-full h-20 rounded-3xl font-black text-xl uppercase tracking-[0.25em] flex items-center justify-center gap-4 group transition-all ${
            isPublishing ? "bg-primary/20 text-primary/50 cursor-not-allowed" : "button-premium-primary"
          }`}
        >
          {isPublishing ? (
            <Loader2 size={28} className="animate-spin" />
          ) : editingProduct ? (
            <UploadIcon size={28} />
          ) : (
            <ImageIcon size={28} className="group-hover:rotate-12 transition-transform" />
          )}
          {isPublishing ? "Publishing..." : editingProduct ? "Apply Changes" : "Publish Listing"}
        </button>
      </div>
    </div>
  );
};

export default Upload;
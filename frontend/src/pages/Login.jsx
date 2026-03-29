import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Mail, Lock, Loader2, ArrowRight, ShieldCheck, KeyRound, CheckCircle2 } from "lucide-react";
import api from "../utils/api";

const Login = () => {
  const [view, setView] = useState("login"); // "login" | "forgot_email" | "forgot_otp"

  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err || "Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");
    setIsResetting(true);

    try {
      const { data } = await api.post("/users/forgot-password", { email: resetEmail });
      setResetMessage(data.message || "OTP sent to your email.");
      setTimeout(() => {
        setView("forgot_otp");
        setResetMessage("");
      }, 2000);
    } catch (err) {
      setResetError(err.response?.data?.message || "Error sending OTP. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");
    setIsResetting(true);

    try {
      const { data } = await api.post("/users/reset-password", {
        email: resetEmail,
        otp,
        newPassword
      });
      setResetMessage(data.message || "Password reset successful!");
      setTimeout(() => {
        setView("login");
        setResetMessage("");
        setResetEmail("");
        setOtp("");
        setNewPassword("");
      }, 2500);
    } catch (err) {
      setResetError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-inner border border-primary/20">
            {view === "login" ? <ShieldCheck size={32} /> : <KeyRound size={32} />}
          </div>
          <h2 className="text-4xl font-black tracking-tight gradient-text">
            {view === "login" ? "Welcome Back" : "Reset Password"}
          </h2>
          <p className="text-muted-foreground font-medium">
            {view === "login" ? "Log in to your CampusCart account" : "Regain access to your account securely"}
          </p>
        </div>

        <div className="glass-premium rounded-[2.5rem] p-10 shadow-2xl border border-white/5 space-y-8 relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {view === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {error && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-bold text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 opacity-70">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={20} />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-16 pl-14 pr-6 bg-black/40 border border-white/10 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all font-bold text-white placeholder:text-muted-foreground/30 shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-70">Password</label>
                      <button 
                        type="button" 
                        onClick={() => setView("forgot_email")}
                        className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={20} />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-16 pl-14 pr-6 bg-black/40 border border-white/10 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all font-bold text-white placeholder:text-muted-foreground/30 shadow-inner"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full h-16 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 ${
                      isSubmitting ? "bg-primary/20 text-primary/40 cursor-not-allowed" : "button-premium-primary"
                    }`}
                  >
                    {isSubmitting ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : (
                      <>
                        <LogIn size={20} />
                        Sign In
                      </>
                    )}
                  </button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-muted-foreground">
                    <span className="bg-[#0c111c] px-4">New here?</span>
                  </div>
                </div>

                <Link 
                  to="/signup" 
                  className="w-full h-16 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest transition-all group"
                >
                  Create an Account
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            )}

            {view === "forgot_email" && (
              <motion.div
                key="forgot_email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {resetError && <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-bold text-center">{resetError}</div>}
                {resetMessage && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-sm font-bold text-center flex items-center justify-center gap-2"><CheckCircle2 size={18}/> {resetMessage}</div>}

                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 opacity-70">Enter your Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={20} />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full h-16 pl-14 pr-6 bg-black/40 border border-white/10 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all font-bold text-white placeholder:text-muted-foreground/30 shadow-inner"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isResetting}
                    className={`w-full h-16 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 ${
                      isResetting ? "bg-primary/20 text-primary/40 cursor-not-allowed" : "button-premium-primary"
                    }`}
                  >
                    {isResetting ? <Loader2 size={24} className="animate-spin" /> : "Send Reset Link"}
                  </button>
                </form>

                <button 
                  onClick={() => { setView("login"); setResetError(""); setResetMessage(""); }}
                  className="w-full text-center text-xs font-bold text-muted-foreground hover:text-white uppercase tracking-widest transition-colors"
                >
                  Back to Login
                </button>
              </motion.div>
            )}

            {view === "forgot_otp" && (
              <motion.div
                key="forgot_otp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {resetError && <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-bold text-center">{resetError}</div>}
                {resetMessage && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-sm font-bold text-center flex items-center justify-center gap-2"><CheckCircle2 size={18}/> {resetMessage}</div>}

                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 opacity-70">Enter OTP</label>
                    <input
                      type="text"
                      required
                      placeholder="6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full h-16 px-6 text-center tracking-[0.5em] text-2xl bg-black/40 border border-white/10 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all font-black text-white placeholder:text-muted-foreground/30 shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 opacity-70">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-16 px-6 bg-black/40 border border-white/10 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all font-bold text-white placeholder:text-muted-foreground/30 shadow-inner"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isResetting}
                    className={`w-full h-16 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 ${
                      isResetting ? "bg-primary/20 text-primary/40 cursor-not-allowed" : "button-premium-primary"
                    }`}
                  >
                    {isResetting ? <Loader2 size={24} className="animate-spin" /> : "Set New Password"}
                  </button>
                </form>
                
                <button 
                  onClick={() => { setView("login"); setResetError(""); setResetMessage(""); }}
                  className="w-full text-center text-xs font-bold text-muted-foreground hover:text-white uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

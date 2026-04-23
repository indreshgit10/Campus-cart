import { Heart, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-8 mt-auto">
      <div className="container mx-auto px-4 md:px-6 flex flex-col items-center justify-center gap-6 text-center">
        
        <div className="flex flex-col items-center space-y-2">
          <p className="text-base text-muted-foreground flex items-center justify-center gap-1.5 font-medium">
            Designed and Developed by Indresh
          </p>
          <p className="text-xs text-muted-foreground/80 font-medium tracking-wide uppercase max-w-lg">
            computer science and engineering, PRANVEER SINGH INSTITUTE OF TECHNOLOGY
          </p>
        </div>

        <div className="flex flex-col items-center space-y-3">
          <p className="text-sm font-medium text-foreground">
            connect with me 
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.linkedin.com/in/indresh-kumar-ba8043330/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a 
              href="https://www.instagram.com/indreshh_._/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 transition-colors duration-200"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;

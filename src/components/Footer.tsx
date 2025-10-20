const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 md:py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 text-center md:text-left">
            <div className="flex items-center space-x-3">
              <img
                src="https://github.com/joao-gabriel-machado.png"
                alt="João Gabriel"
                className="w-8 h-8 rounded-full border border-border"
              />
              <span className="text-sm font-medium text-foreground">LirouDev</span>
            </div>

            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <span>© {currentYear}</span>
              <span className="text-foreground">João Gabriel</span>
              <span>·</span>
              <span>Front-End Developer</span>
            </div>

            <div className="text-xs text-muted-foreground">
              <span>React + Tailwind CSS</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
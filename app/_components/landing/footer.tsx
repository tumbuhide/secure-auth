export function Footer() {
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Secure Auth';
    const currentYear = new Date().getFullYear();
  
    return (
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {currentYear} {appName}. Dibangun dengan 💙 oleh AI.
          </p>
        </div>
      </footer>
    );
  }
  
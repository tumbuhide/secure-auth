import Link from 'next/link';

interface MainContentProps {
  siteConfig: {
    name: string;
    description: string;
    links: {
      docs: string;
    };
  };
}

export function MainContent({ siteConfig }: MainContentProps) {
  return (
    <main className="flex-1">
      <div className="container relative flex flex-col items-center justify-center gap-6 py-20 text-center md:py-32">
        <div className="absolute top-0 left-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-black dark:bg-[radial-gradient(#27272a_1px,transparent_1px)]"></div>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Solusi Otentikasi Terpusat
          <br className="hidden sm:inline" />
          yang Aman & Handal
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          {siteConfig.description}
        </p>
        <div className="flex w-full items-center justify-center space-x-4">
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
            >
              Mulai
            </Link>
            <Link
              href={siteConfig.links.docs}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-11 px-8"
            >
              Dokumentasi
            </Link>
        </div>
      </div>
    </main>
  );
}

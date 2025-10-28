import Link from "next/link";

export default function HomePage() {
  const pages = [
    { name: "calina", path: "/CalinaKaila/Calina" },
    { name: "kaila", path: "/CalinaKaila/Kaila" },
    { name: "search", path: "/Sebastian/searching" },
    { name: "upload", path: "/Sebastian/uploading" },
    { name: "tony", path: "/TonyDanica/tony" },
    { name: "danica", path: "/TonyDanica/danica" },
    { name: "lokahi", path: "/TonyDanica/lokahi" },
    { name: "henery", path: "/JathanHenery/henery" },
    { name: "jathan", path: "/JathanHenery/jathan" },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {pages.map((page) => (
            <Link
              key={page.name}
              href={page.path}
              className="flex items-center justify-center rounded-xl bg-white/10 p-4 text-xl font-bold text-white hover:bg-white/20"
            >
              {page.name}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

//testing if commits make pull requests 

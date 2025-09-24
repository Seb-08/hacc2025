import Link from "next/link";

export default function HomePage() {
	return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white ">
			<h1>Danica's page</h1>
			<button className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl">
				<Link href="../TonyDanica/tony">
					link to tony
				 </Link>
			</button>	
			<button className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl">
				<Link href="/">
					link to main
				 </Link>
			</button>
    </main>
	);
}
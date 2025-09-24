import Link from "next/link";



export default function HomePage() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
			<div className="text-center">
				<h1 className="text-2xl font-bold mb-4">Tony's page</h1>
				<Link href="/" className="btn btn-soft btn-primary">

					Visit The Main Page
				</Link>


			</div>
		</main>
	);
}



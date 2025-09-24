import Link from "next/link";

export default function HomePage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-green-300">
			<h1 className="object-top text-2x1">Buttons</h1>
			<div>
			<Link href="../../">
			<button className ="btn btn-siccess btn-x1 px-8 py-6 text-2x1">
				Home
			</button>
			</Link>
			<Link href="../TonyDanica/danica">
			<button className ="btn btn-siccess btn-x1 px-8 py-6 text-2x1">
				Danica
			</button>
			</Link>
			</div>
		</main>
	);
}
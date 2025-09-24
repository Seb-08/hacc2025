import Link from "next/link";

export default function HomePage() {
	return (
		<main className="min-h-screen flex items-center justify-center p-8">
			<div className="text-center">
                <Link href="/">
					<button className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded">Yardy</button>
				</Link>
            </div>
			 
		</main>
	);
}
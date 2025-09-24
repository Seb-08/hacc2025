import Link from "next/link";

export default function HomePage() {
	return (
		<main>
			<button className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded">
					<Link href="/">
						Home Page Yardy Know
					</Link>
			</button>
		</main>
	);
}
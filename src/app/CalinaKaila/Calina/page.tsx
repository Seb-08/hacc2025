import Link from "next/link";

export default function CalinaPage() {
	return (
		<main>
			<h1>Calina's Page</h1>
			<div>
				<Link href="/">
					<button className="btn btn-outline btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl">Home</button>
				</Link>
			</div>
		</main>
	);
}
import Link from "next/link";

export default function SebastianPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Link href="/">
        <button className="btn btn-success btn-xl px-8 py-6 text-2xl">
          Home
        </button>
      </Link>
    </main>
  );
}

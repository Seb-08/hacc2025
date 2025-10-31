import Link from "next/link";
export default function LoginPage() {
  return (
    <main className="border-2 border-[#4BA19B] p-4 rounded-lg flex min-h-screen min-w-screen flex-col items-center justify-center bg-gradient-to-b from-[#FFFFFF] to-[#F0F0F0] text-white">
      <div className="w-full h-1/2 max-w-4xl mx-auto flex flex-col items-center justify-center gap-6 px-6 py-16">
        <h1 className="text-4xl font-bold mb-8 text-black">Employee Login</h1>
        <form className="flex flex-col gap-4 w-full max-w-sm">
          <input
            type="text"
            placeholder="Username"
            className="p-2 rounded bg-white/10 border border-gray-500 text-black"
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 rounded bg-white/10 border border-gray-500 text-black"
          />
          <button
            type="submit"
            className="p-2 rounded bg-[#006D68] hover:bg-[#4BA19B] text-white font-bold"
          >
            Login
          </button>
        </form>
        <h3 className="text-black">Need help? Contact support@ets.hawaii.gov</h3>          
        <button
            type="submit"
            className="p-2 rounded bg-[#006D68] hover:bg-[#4BA19B] text-white font-bold"
          >
            SIGN IN WITH GOOGLE
          </button>
          <button
            type="submit"
            className="p-2 rounded bg-[#006D68] hover:bg-[#4BA19B] text-white font-bold"
          >
            CREATE A NEW ACCOUNT
          </button>                   
      </div>
    </main>
  );
}
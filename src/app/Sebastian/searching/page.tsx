"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch posts
  const fetchPosts = async (q: string, sortBy: string, order: string) => {
    setLoading(true);
    const params = new URLSearchParams({ q, sortBy, order });
    const res = await fetch(`/api/posts?${params.toString()}`);
    const data = await res.json();
    setPosts(data);
    setLoading(false);
  };

  // Debounce search/filter
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchPosts(query, sortBy, order);
    }, 400);
    return () => clearTimeout(delay);
  }, [query, sortBy, order]);

  useEffect(() => {
    fetchPosts("", sortBy, order);
  }, []);

  // Label for the current sort mode
  const sortLabel = () => {
    if (sortBy === "name")
      return `Name (${order === "asc" ? "A → Z" : "Z → A"})`;
    if (sortBy === "rating")
      return `Rating (${order === "asc" ? "Low → High" : "High → Low"})`;
    if (sortBy === "createdAt")
      return order === "asc" ? "Oldest" : "Newest";
    return "Newest";
  };

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Posts</h1>

      {/* Search + Sort Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search bar */}
        <input
          type="text"
          placeholder="Search by name..."
          className="input input-bordered w-full max-w-xs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Compact Sort Dropdown */}
        <div className="dropdown dropdown-bottom">
          <label tabIndex={0} className="btn btn-outline m-1">
            🔽 Sort: {sortLabel()}
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-52"
          >
            <li>
              <button onClick={() => { setSortBy("name"); setOrder("asc"); }}>
                Name (A → Z)
              </button>
            </li>
            <li>
              <button onClick={() => { setSortBy("name"); setOrder("desc"); }}>
                Name (Z → A)
              </button>
            </li>
            <li>
              <button onClick={() => { setSortBy("rating"); setOrder("asc"); }}>
                Rating (Low → High)
              </button>
            </li>
            <li>
              <button onClick={() => { setSortBy("rating"); setOrder("desc"); }}>
                Rating (High → Low)
              </button>
            </li>
            <li>
              <button onClick={() => { setSortBy("createdAt"); setOrder("desc"); }}>
                Newest
              </button>
            </li>
            <li>
              <button onClick={() => { setSortBy("createdAt"); setOrder("asc"); }}>
                Oldest
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Loading */}
      {loading && <p className="text-gray-500">Loading...</p>}

      {/* Results */}
      {posts.length === 0 && !loading ? (
        <p className="text-gray-500">No posts found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="card bg-base-200 shadow-xl">
              {post.imageUrl && (
                <figure>
                  <img
                    src={post.imageUrl}
                    alt={post.name}
                    className="object-cover h-48 w-full"
                  />
                </figure>
              )}
              <div className="card-body">
                <h2 className="card-title">{post.name}</h2>
                <p>⭐ {post.rating}</p>
                <p className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

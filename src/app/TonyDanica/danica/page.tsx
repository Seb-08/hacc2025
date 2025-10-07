import { db } from "~/server/db";
import { posts } from "~/server/db/schema";


export default async function HomePage() {
  const posts = await db.query.posts.findMany();
  return (
    <main className="">
      <div className="flex flex-wrap gap-4">
        {posts.map((post, index) => (
          /*<div key={post.id}>{post.name}</div>*/
          <div key={index} className="card w-96 bg-violet-100 shadow-sm text-[#7e71bb]">
<div className="card-body">
              <p>id: {post.id},
				rating: {post.rating}
			  </p>
              <div className="justify-end card-actions"></div>
            </div>
          </div>
        ))}
      </div>
  </main>
  );
};

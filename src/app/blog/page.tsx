import Image from "next/image";
import Link from "next/link";
import { getBlogPosts } from "@/lib/queries";

export const metadata = { title: "Blog" };

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Blog Kesehatan</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Tips, panduan, dan informasi seputar hidup sehat.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[16/9] bg-muted">
              {post.cover && (
                <Image
                  src={post.cover}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              )}
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground">
                {post.published_at &&
                  new Date(post.published_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
              </p>
              <h2 className="mt-1 font-bold leading-snug group-hover:text-brand-700">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {post.excerpt}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
      {posts.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Belum ada artikel.
        </p>
      )}
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBlogPostBySlug } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  return { title: post?.title ?? "Artikel" };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post || !post.published_at) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Blog
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">{post.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {new Date(post.published_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
      {post.cover && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl bg-muted">
          <Image src={post.cover} alt={post.title} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" priority />
        </div>
      )}
      <div className="prose mt-6 max-w-none whitespace-pre-line leading-relaxed text-foreground">
        {post.body}
      </div>
    </article>
  );
}

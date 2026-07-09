import Link from "next/link";
import { db } from "@/lib/db";
import { BookOpen, Search, User, Calendar, ArrowRight } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function BlogPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";

  const rawBlogs = await db.blog.findMany({
    where: { published: true }
  });

  const filteredBlogs = rawBlogs.filter((blog: any) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      blog.title.toLowerCase().includes(s) ||
      blog.content.toLowerCase().includes(s)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Career Resources & Blog</h1>
          <p className="text-xs text-muted mt-1">Sector insights, resume building tips, and guidelines for India's social impact professionals.</p>
        </div>
        <form method="GET" className="flex items-center gap-2 max-w-sm w-full glass-panel p-1 rounded-lg">
          <Search className="w-4 h-4 text-muted ml-2" />
          <input 
            type="text" 
            name="q" 
            defaultValue={q}
            placeholder="Search resources..."
            className="flex-1 bg-transparent px-2 py-1.5 text-xs text-foreground focus:outline-none placeholder:text-muted"
          />
          <button type="submit" className="px-3 py-1.5 bg-primary text-white rounded text-xs font-semibold cursor-pointer">
            Search
          </button>
        </form>
      </div>

      {filteredBlogs.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-xl flex-1 flex flex-col justify-center items-center">
          <BookOpen className="w-12 h-12 text-muted mb-4" />
          <h3 className="text-lg font-bold text-foreground">No Resources Found</h3>
          <p className="text-xs text-muted max-w-xs mt-1">Check back later for newly published guides.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredBlogs.map((blog: any) => (
            <article key={blog.id} className="glass-panel p-6 rounded-xl flex flex-col justify-between h-[280px] border border-card-border">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] text-muted">
                  <span className="font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                    {blog.category?.name || "Career Tip"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(blog.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <h3 className="font-extrabold text-xl text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug">
                  {blog.title}
                </h3>
                <p className="text-xs text-muted line-clamp-3 leading-relaxed">
                  {blog.content}
                </p>
              </div>

              <div className="border-t border-card-border pt-4 mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <User className="w-3.5 h-3.5" />
                  <span>By: {blog.author?.name || "Editor"}</span>
                </div>
                <Link
                  href={`/blog/${blog.id}`}
                  className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

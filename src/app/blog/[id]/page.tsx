import Link from "next/link";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Calendar, BookOpen, Clock } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BlogDetailsPage(props: PageProps) {
  const params = await props.params;
  const blog = await db.blog.findUnique({
    where: { id: params.id },
  });

  if (!blog) {
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
      {/* Back button */}
      <Link 
        href="/blog" 
        className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Resources</span>
      </Link>

      <article className="space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <span className="inline-flex text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-0.5 rounded">
            {blog.category?.name || "Career Resource"}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            {blog.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {blog.author?.name || "Editorial Team"}</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(blog.createdAt).toLocaleDateString("en-GB")}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 4 min read</span>
          </div>
        </div>

        {/* Content */}
        <div className="border-t border-card-border pt-8 mt-8 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-6 whitespace-pre-line">
          {blog.content}
          
          <p className="italic text-xs text-muted pt-6">
            Disclaimer: The viewpoints and advice shared in this article are compilation best practices from DevelopmentWala editors and do not constitute formal legal or financial registration advice for NGOs.
          </p>
        </div>
      </article>
    </div>
  );
}

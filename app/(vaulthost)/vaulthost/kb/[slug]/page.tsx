import { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Clock, ChevronRight, FileText, List } from 'lucide-react';
import { kbArticles, getArticleBySlug, getAdjacentArticles, kbCategories } from '@/lib/data/kb-content';

interface Props { params: { slug: string }; }

export function generateStaticParams() {
  return kbArticles.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const article = getArticleBySlug(params.slug);
  if (!article) return createMetadata({ title: 'Article Not Found' });
  return createMetadata({
    title: article.seoMeta.title,
    description: article.seoMeta.description,
    keywords: article.seoMeta.keywords,
    canonical: `https://elsxglobal.com/vaulthost/kb/${params.slug}/`,
    breadcrumb: [
      { name: 'Home', url: 'https://elsxglobal.com/' },
      { name: 'VaultHost', url: 'https://elsxglobal.com/vaulthost/' },
      { name: 'Knowledge Base', url: 'https://elsxglobal.com/vaulthost/kb/' },
      { name: article.title, url: `https://elsxglobal.com/vaulthost/kb/${params.slug}/` },
    ],
  });
}

function renderContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="bg-muted/30 rounded-xl p-4 overflow-x-auto my-4 border border-border">
            <code className="text-sm font-mono text-foreground">{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        if (inList) { elements.push(<ul key={`ul-${i}`} className="ml-6 space-y-1 my-3">{listItems}</ul>); inList = false; listItems = []; }
        inCodeBlock = true;
      }
      return;
    }
    if (inCodeBlock) { codeLines.push(line); return; }

    if (line.startsWith('## ')) {
      if (inList) { elements.push(<ul key={`ul-${i}`} className="ml-6 space-y-1 my-3">{listItems}</ul>); inList = false; listItems = []; }
      elements.push(<h2 key={i} id={line.replace('## ', '').toLowerCase().replace(/[^a-z0-9]+/g, '-')} className="text-xl font-semibold mt-8 mb-3 scroll-mt-24">{line.replace('## ', '')}</h2>);
    } else if (line.startsWith('### ')) {
      if (inList) { elements.push(<ul key={`ul-${i}`} className="ml-6 space-y-1 my-3">{listItems}</ul>); inList = false; listItems = []; }
      elements.push(<h3 key={i} id={line.replace('### ', '').toLowerCase().replace(/[^a-z0-9]+/g, '-')} className="text-base font-semibold mt-6 mb-2 scroll-mt-24">{line.replace('### ', '')}</h3>);
    } else if (line.startsWith('#### ')) {
      if (inList) { elements.push(<ul key={`ul-${i}`} className="ml-6 space-y-1 my-3">{listItems}</ul>); inList = false; listItems = []; }
      elements.push(<h4 key={i} id={line.replace('#### ', '').toLowerCase().replace(/[^a-z0-9]+/g, '-')} className="text-sm font-semibold mt-5 mb-2 scroll-mt-24">{line.replace('#### ', '')}</h4>);
    } else if (line.startsWith('- ')) {
      inList = true;
      listItems.push(<li key={`li-${i}`} className="text-sm text-muted-foreground">{line.replace('- ', '')}</li>);
    } else if (line.startsWith('| ')) {
      if (inList) { elements.push(<ul key={`ul-${i}`} className="ml-6 space-y-1 my-3">{listItems}</ul>); inList = false; listItems = []; }
      const cells = line.split('|').filter((c) => c.trim() && !c.trim().match(/^-+$/));
      if (cells.length > 0) {
        elements.push(
          <div key={`tbl-${i}`} className="grid grid-cols-2 gap-2 my-2 p-3 liquid-glass rounded-lg">
            {cells.map((c, ci) => <span key={ci} className={ci === 0 ? 'text-sm font-medium' : 'text-sm text-muted-foreground'}>{c.trim()}</span>)}
          </div>
        );
      }
    } else if (line.trim() === '') {
      if (inList) { elements.push(<ul key={`ul-${i}`} className="ml-6 space-y-1 my-3">{listItems}</ul>); inList = false; listItems = []; }
      elements.push(<div key={`br-${i}`} className="h-3" />);
    } else {
      if (inList) { elements.push(<ul key={`ul-${i}`} className="ml-6 space-y-1 my-3">{listItems}</ul>); inList = false; listItems = []; }
      elements.push(<p key={i} className="text-sm text-muted-foreground leading-relaxed mb-3">{line}</p>);
    }
  });

  if (inList) elements.push(<ul key="ul-final" className="ml-6 space-y-1 my-3">{listItems}</ul>);
  if (inCodeBlock && codeLines.length > 0) elements.push(<pre key="code-final" className="bg-muted/30 rounded-xl p-4 overflow-x-auto my-4 border border-border"><code className="text-sm font-mono">{codeLines.join('\n')}</code></pre>);

  return elements;
}

function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = [];
  content.split('\n').forEach((line) => {
    if (line.startsWith('## ')) headings.push({ id: line.replace('## ', '').toLowerCase().replace(/[^a-z0-9]+/g, '-'), text: line.replace('## ', ''), level: 2 });
    else if (line.startsWith('### ')) headings.push({ id: line.replace('### ', '').toLowerCase().replace(/[^a-z0-9]+/g, '-'), text: line.replace('### ', ''), level: 3 });
  });
  return headings;
}

export default function KBArticlePage({ params }: Props) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  const { prev, next } = getAdjacentArticles(params.slug);
  const headings = extractHeadings(article.content);
  const relatedArticles = kbArticles.filter((a) => a.category === article.category && a.slug !== article.slug).slice(0, 3);

  return (
    <div className="min-h-screen pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/vaulthost/kb" className="hover:text-foreground">Knowledge Base</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="capitalize">{article.category.replace(/-/g, ' ')}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate">{article.title}</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_220px] gap-8">
          {/* Main Content */}
          <article className="min-w-0">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <BookOpen className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-primary capitalize">{article.category.replace(/-/g, ' ')}</span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight mb-3">{article.title}</h1>
              <p className="text-muted-foreground">{article.excerpt}</p>
              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Updated regularly</span>
                <span className="mx-1">·</span>
                <FileText className="h-3.5 w-3.5" />
                <span>{article.content.split('\n').length} lines</span>
              </div>
            </div>

            <div className="liquid-glass-card rounded-2xl p-8">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {renderContent(article.content)}
              </div>
            </div>

            {/* Prev/Next Navigation */}
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              {prev ? (
                <Link href={`/vaulthost/kb/${prev.slug}`} className="liquid-glass-card rounded-2xl p-5 hover:border-primary/30 transition-colors group">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mb-2"><ArrowLeft className="h-3.5 w-3.5" />Previous</span>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{prev.title}</p>
                </Link>
              ) : <div />}
              {next ? (
                <Link href={`/vaulthost/kb/${next.slug}`} className="liquid-glass-card rounded-2xl p-5 hover:border-primary/30 transition-colors group text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mb-2">Next <ArrowRight className="h-3.5 w-3.5" /></span>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{next.title}</p>
                </Link>
              ) : <div />}
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="mt-12">
                <h3 className="text-base font-semibold mb-4">Related Articles</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {relatedArticles.map((rel) => (
                    <Link key={rel.slug} href={`/vaulthost/kb/${rel.slug}`} className="liquid-glass rounded-xl p-4 hover:border-primary/30 transition-colors group">
                      <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">{rel.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{rel.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* TOC Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="liquid-glass-card rounded-2xl p-5 mb-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <List className="h-3.5 w-3.5" />Table of Contents
                </h3>
                <nav className="space-y-1.5">
                  {headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className={`block text-xs text-muted-foreground hover:text-primary transition-colors ${h.level === 3 ? 'ml-3' : ''}`}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="liquid-glass-card rounded-2xl p-5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Categories</h3>
                <div className="space-y-1.5">
                  {kbCategories.map((cat) => (
                    <Link key={cat} href={`/vaulthost/kb?category=${cat}`} className="block text-xs text-muted-foreground hover:text-primary transition-colors capitalize">
                      {cat.replace(/-/g, ' ')}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8">
          <Link href="/vaulthost/kb" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />Back to Knowledge Base
          </Link>
        </div>
      </div>
    </div>
  );
}

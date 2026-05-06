import Head from "next/head";
import {
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_LANG,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

interface Props {
  title?: string;
  description?: string;
  path?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  image?: string;
}

function buildOgImage(title: string, subtitle: string, tags?: string[]): string {
  const params = new URLSearchParams({ title, subtitle });
  if (tags && tags.length > 0) params.set("tags", tags.join(","));
  return `${SITE_URL}/api/og?${params.toString()}`;
}

export default function SEO({
  title,
  description = SITE_DESCRIPTION,
  path = "",
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
  image,
}: Props) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — 思考、记录、分享`;
  const url = `${SITE_URL}${path}`;
  const ogImage =
    image || buildOgImage(title || SITE_NAME, description, tags);

  // JSON-LD 结构化数据
  const jsonLd =
    type === "article"
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: title || SITE_NAME,
          description,
          datePublished: publishedTime,
          dateModified: modifiedTime || publishedTime,
          author: { "@type": "Person", name: SITE_AUTHOR },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` },
          },
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          image: ogImage,
          keywords: tags?.join(", "),
          inLanguage: SITE_LANG,
        }
      : {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          description: SITE_DESCRIPTION,
          url: SITE_URL,
          inLanguage: SITE_LANG,
        };

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="zh_CN" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {publishedTime ? (
        <meta property="article:published_time" content={publishedTime} />
      ) : null}
      {modifiedTime ? (
        <meta property="article:modified_time" content={modifiedTime} />
      ) : null}
      {tags?.map((t) => (
        <meta key={t} property="article:tag" content={t} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Head>
  );
}

import Head from "next/head";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

interface Props {
  title?: string;
  description?: string;
  path?: string;
  type?: "website" | "article";
  publishedTime?: string;
  tags?: string[];
}

export default function SEO({
  title,
  description = SITE_DESCRIPTION,
  path = "",
  type = "website",
  publishedTime,
  tags,
}: Props) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — 思考、记录、分享`;
  const url = `${SITE_URL}${path}`;

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
      {publishedTime ? (
        <meta property="article:published_time" content={publishedTime} />
      ) : null}
      {tags?.map((t) => (
        <meta key={t} property="article:tag" content={t} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Head>
  );
}

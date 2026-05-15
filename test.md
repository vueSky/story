cd /Users/taro/Documents/GitHub/story && \
HTTPS_PROXY=http://127.0.0.1:7897 \
HTTP_PROXY=http://127.0.0.1:7897 \
NODE_USE_ENV_PROXY=1 \
NO_PROXY="story-blog-publisher.lf-blog-api.workers.dev" \
OPENAI_API_KEY=36f4dfcbf8f04965a992ed13249dc8df.wXc4cYm9PH4qnhsX \
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4 \
OPENAI_MODEL=glm-4-flash \
PUBLISH_ENDPOINT=https://story-blog-publisher.lf-blog-api.workers.dev \
PUBLISH_TOKEN=781650249 \
MAX_ITEMS_PER_SRC=2 \
  node scripts/news-crawler/crawl.mjs
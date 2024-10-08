import invariant from "tiny-invariant";
import { readingTime } from "reading-time-estimator";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getArticle } from "~/services/sanity/index.server";
import { Container } from "~/components/container";
import { Image } from "~/components/image";
import { useLoaderData } from "@remix-run/react";
import { capitalizeFirstLetter, safeParseDate } from "~/utils/helpers";
import { format } from "date-fns";
import { Markdown } from "~/components/markdown";
import { Separator } from "~/components/ui/separator";
import { BackButton } from "~/components/back-button";
import { metaFn } from "~/utils/meta";
import { Author } from "./components/author";
import { Share } from "./components/share";
import { RelatedArticles } from "./components/realted-articles";
import { Iframe } from "./components/iframe";

export const meta = metaFn;

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.slug, "Slug is required.");
  return await getArticle(params.slug);
}

export default function Article() {
  const article = useLoaderData<typeof loader>();
  const stats = readingTime(article.content);

  return (
    <Container className="max-w-5xl">
      <div className="max-w-3xl mx-auto">
        <BackButton to="/articles" buttonText="Articles" />
        <Image
          cdn={false}
          src={article.image}
          alt={article.title}
          className="w-full h-[15rem] sm:h-[25rem] object-cover rounded-md"
        />
        <h1 className="text-4xl font-bold my-6">
          {capitalizeFirstLetter(article.title)}
        </h1>
        <div className="flex flex-col gap-4 sm:flex-row items-center justify-between mx-auto">
          <div className="flex items-center gap-2">
            <Image
              cdn={false}
              src={article.author.image}
              alt={article.author.name}
              className="rounded-full w-10 h-10 object-cover"
            />
            <div>
              <span className="text-sm font-bold block">AUTHOR</span>
              <span className="text-sm font-bold">{article.author.name}</span>
            </div>
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold">READING TIME</span>
              <span className="text-sm font-bold">~ {stats.text}</span>
            </div>{" "}
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold">PUBLISHED</span>
              <span className="text-sm font-bold">
                {format(safeParseDate(article.createdAt), "dd MMM, yyyy")}
              </span>
            </div>
          </div>
        </div>
        <Separator className="my-6" />
        <p>{article.description}</p>
        <Separator className="my-6" />
        <Markdown source={article.content} />
        {article.videoId ? (
          <Iframe src={article.videoId} title={article.title} />
        ) : null}
        <Separator className="mt-12 mb-4" />
        <Share
          title={article.title}
          url={`https://casbytes.com/articles/${article.slug}`}
        />
        <Separator className="mb-8 mt-4" />
        <Author author={article.author} />
      </div>
      <Separator className="mb-12 mt-4" />
      <RelatedArticles articles={article.realtedArticles} />
    </Container>
  );
}

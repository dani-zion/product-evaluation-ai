import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { EvaluationForm } from "@/features/evaluations/components/evaluation-form";
import {
  EvaluationAvatar,
  EvaluationList,
} from "@/features/evaluations/components/evaluation-list";
import { EvaluationsProvider } from "@/features/evaluations/components/evaluations-provider";
import { ProductDetails } from "@/features/evaluations/components/product-details";
import { ScoreSummary } from "@/features/evaluations/components/score-summary";
import { SignInPrompt } from "@/features/evaluations/components/sign-in-prompt";
import { formatDisplayName } from "@/features/evaluations/schemas";
import { getSession } from "@/server/auth/session";
import { getEvaluationService, getProductService } from "@/server/container";
import { ProductNotFoundError } from "@/server/errors";

/** One product lookup per request, shared by the metadata and the page. */
const getProduct = cache((id: string) => getProductService().getById(id));

export async function generateMetadata({
  params,
}: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  return {
    title: product
      ? `${product.name} | Product Evaluation AI`
      : "Product not found | Product Evaluation AI",
    description: product?.description ?? undefined,
  };
}

export default function ProductPage({ params }: PageProps<"/products/[id]">) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 pt-8 pb-20 sm:px-10 sm:pt-12">
        <BackLink />
        {/* The id, product, evaluations and session are all request data. */}
        <Suspense fallback={<ProductPageSkeleton />}>
          {params.then(({ id }) => (
            <ProductView id={id} />
          ))}
        </Suspense>
      </main>
    </>
  );
}

function BackLink() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 self-start rounded-sm text-muted-foreground text-sm outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/60"
    >
      <ArrowLeftIcon aria-hidden className="size-4" />
      All products
    </Link>
  );
}

async function ProductView({ id }: { id: string }) {
  const [product, evaluations, session] = await Promise.all([
    getProduct(id),
    getEvaluationService()
      .list(id)
      .catch((error: unknown) => {
        // The product check below turns this into the not-found page.
        if (error instanceof ProductNotFoundError) return [];
        throw error;
      }),
    getSession(),
  ]);
  if (!product) notFound();

  const viewer = session && {
    id: session.accountId,
    displayName: formatDisplayName(session.firstName, session.lastName),
  };

  return (
    <EvaluationsProvider
      initialScores={evaluations.map((evaluation) => evaluation.score)}
    >
      <div className="flex flex-col gap-16 sm:gap-20">
        <ProductDetails product={product} summary={<ScoreSummary />} />
        <div className="flex max-w-3xl flex-col gap-10">
          <section
            aria-labelledby="evaluations-title"
            className="flex flex-col gap-4"
          >
            <h2
              id="evaluations-title"
              className="font-display border-b pb-4 text-4xl"
            >
              Evaluations
            </h2>
            <EvaluationList
              evaluations={evaluations}
              viewerAvatar={
                viewer && (
                  <EvaluationAvatar
                    seed={viewer.id}
                    name={viewer.displayName}
                  />
                )
              }
            />
          </section>
          {viewer ? (
            <EvaluationForm productId={product.id} viewer={viewer} />
          ) : (
            <SignInPrompt productId={product.id} />
          )}
        </div>
      </div>
    </EvaluationsProvider>
  );
}

function ProductPageSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-16 motion-safe:animate-pulse">
      <div className="grid items-start gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12">
        <div className="aspect-[4/3] rounded-2xl border bg-secondary" />
        <div className="flex flex-col gap-5">
          <div className="h-14 w-3/4 rounded bg-secondary" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-full rounded bg-secondary/70" />
            <div className="h-4 w-5/6 rounded bg-secondary/70" />
          </div>
          <div className="h-10 w-64 rounded bg-secondary" />
        </div>
      </div>
      <div className="flex max-w-3xl flex-col gap-6">
        <div className="h-10 w-48 rounded bg-secondary" />
        <div className="h-20 w-full rounded bg-secondary/70" />
        <div className="h-20 w-full rounded bg-secondary/70" />
      </div>
    </div>
  );
}

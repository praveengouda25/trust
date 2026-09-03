import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { images } from "@/lib/images";
import { ERP_AUTH_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — SVRST" },
      {
        name: "description",
        content: "Login to access SVRST ERP system.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <>
      <PageHero
        eyebrow="Login"
        title="Access SVRST ERP"
        subtitle="Login to access the SVRST ERP system for administration and management."
        image={images.community}
        imageAlt="SVRST campus"
      />
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            align="left"
            eyebrow="Secure Access"
            title="Login to ERP System"
            description="Access the SVRST ERP system for comprehensive management and administration."
          />
          <div className="mt-10">
            <Button asChild variant="donate" size="lg" className="w-full">
              <a href={ERP_AUTH_URL}>Login to SVRST ERP</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

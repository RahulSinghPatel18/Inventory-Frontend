import { useEffect } from "react";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import BrandLogo from "../components/common/BrandLogo";

const legalDocuments = {
  terms: {
    title: "Terms of Service",
    description: "The terms for accessing and using the MYStockHub inventory workspace.",
    icon: FileText,
    sections: [
      {
        title: "Using the service",
        paragraphs: [
          "MYStockHub provides tools for managing products, categories, stock movements, sales, customers, payments, reports, and organization members.",
          "You must provide accurate account information, keep your sign-in credentials secure, and use the service only when you are authorized to do so. You are responsible for activity performed through your account."
        ]
      },
      {
        title: "Organization data and access",
        paragraphs: [
          "You and your organization retain responsibility for the information entered into your workspace, including product, sales, inventory, and customer records. Make sure you have the rights and permissions needed to store that information.",
          "Organization administrators manage member access and permissions. Members may be able to view or change organization data according to the permissions assigned to them."
        ]
      },
      {
        title: "Acceptable use",
        paragraphs: [
          "Do not misuse the service, attempt to access another organization's data, interfere with its operation, or use it in a way that violates applicable law or the rights of others."
        ]
      },
      {
        title: "Backups, changes, and availability",
        paragraphs: [
          "You are responsible for reviewing the accuracy of your records and keeping copies of important information. Organization administrators can use the available full-backup export before deleting an organization.",
          "Features and availability may change as the service is maintained and improved. We will take reasonable steps to protect the service, but uninterrupted or error-free operation cannot be guaranteed."
        ]
      },
      {
        title: "Suspension and organization deletion",
        paragraphs: [
          "Access may be restricted when needed to protect the service, users, or organization data, or to address misuse. An organization administrator can request permanent organization deletion through the settings workflow. Review and export needed records before confirming deletion."
        ]
      },
      {
        title: "Important legal information",
        paragraphs: [
          "The service is provided subject to rights and protections that cannot be excluded under applicable law. Nothing in these terms limits any non-waivable rights you may have."
        ]
      }
    ]
  },
  privacy: {
    title: "Privacy Policy",
    description: "What information MYStockHub handles to provide and protect your inventory workspace.",
    icon: ShieldCheck,
    sections: [
      {
        title: "Information in your account",
        paragraphs: [
          "We handle account details such as your name and email address, organization name, and sign-in and verification information needed to create and secure your account. If you choose Google sign-in, Google provides identity information needed to authenticate you."
        ]
      },
      {
        title: "Information in your workspace",
        paragraphs: [
          "The service stores the information you and your organization enter, such as products, categories, stock levels and movements, sales, customer details, payments, and member records. Organization members may be able to see this information according to their assigned permissions."
        ]
      },
      {
        title: "How information is used",
        paragraphs: [
          "Information is used to operate the workspace and its features, authenticate users, send verification and password-reset emails, provide organization reports and exports, respond to support requests, and protect the service against misuse."
        ]
      },
      {
        title: "Service providers and sharing",
        paragraphs: [
          "Information may be processed by service providers that help operate the application, store its data, deliver email, or provide sign-in features. We do not make organization records public through the application; access within a workspace is controlled by account roles and permissions.",
          "Information may also be disclosed where required by law or where necessary to protect the service, its users, or their rights."
        ]
      },
      {
        title: "Retention, export, and deletion",
        paragraphs: [
          "Information is kept while needed to provide the service and maintain the organization workspace. An organization administrator can download a full backup and request permanent organization deletion using the settings workflow. Some information may remain where retention is required by law or needed to resolve security, legal, or operational issues."
        ]
      },
      {
        title: "Security and your choices",
        paragraphs: [
          "We use account authentication, organization scoping, and access permissions to help protect workspace information. No online service can guarantee absolute security. Keep your credentials private and ask your organization administrator to review member access when it changes."
        ]
      },
      {
        title: "Questions about privacy",
        paragraphs: [
          "For questions about account or organization information, contact your organization administrator or use the support contact provided by the MYStockHub service operator."
        ]
      }
    ]
  }
};

const LegalPage = ({ type }) => {
  const document = legalDocuments[type] || legalDocuments.terms;
  const Icon = document.icon;

  useEffect(() => {
    window.document.title = `${document.title} | MYStockHub`;
  }, [document.title]);

  return (
    <main className="min-h-dvh bg-[#F3F7F4] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link to="/login" aria-label="MYStockHub home">
            <BrandLogo size="md" showMark={false} />
          </Link>
          <Link to="/login" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to sign in
          </Link>
        </header>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
          <div className="border-b border-slate-100 bg-gradient-to-br from-white to-emerald-50/70 px-5 py-7 sm:px-9 sm:py-9">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Icon size={21} aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">MYStockHub legal</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{document.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{document.description}</p>
            <p className="mt-4 text-xs text-slate-500">Last updated: October 18, 2026</p>
          </div>

          <div className="divide-y divide-slate-100 px-5 sm:px-9">
            {document.sections.map((section) => (
              <section key={section.title} className="py-6 sm:py-7">
                <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600 sm:text-[15px]">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            ))}
          </div>

          <nav aria-label="Other legal documents" className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 bg-slate-50/70 px-5 py-5 text-sm sm:px-9">
            <Link to="/terms-of-service" className="font-medium text-emerald-800 hover:underline">Terms of Service</Link>
            <Link to="/privacy-policy" className="font-medium text-emerald-800 hover:underline">Privacy Policy</Link>
          </nav>
        </article>
      </div>
    </main>
  );
};

export default LegalPage;

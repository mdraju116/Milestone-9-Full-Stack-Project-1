"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  Check,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth-client";

type JobDetails = {
  _id: string;
  title: string;
  companyName?: string;
  category?: string;
  jobType?: string;
  isRemote?: boolean;
  location?: string;
  minSalary?: number | string;
  maxSalary?: number | string;
  salaryFrequency?: string;
  description?: string;
  experience?: string;
  deadline?: string;
  createdAt?: string;
  responsibilities?: string;
  qualifications?: string;
  benefits?: string;
  skills?: string;
  applicationUrl?: string;
  company?: {
    name?: string;
    logoUrl?: string;
    verified?: boolean;
    size?: string;
    industry?: string;
    website?: string;
  };
  isSaved?: boolean;
};

const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_BASE_URL?.trim().replace(/\/$/, "") ?? "";

function formatSalary(job: JobDetails) {
  if (job.minSalary == null && job.maxSalary == null) return "Salary not listed";

  const formatAmount = (value: number | string | undefined) => {
    if (value == null || value === "") return "—";
    const amount = Number(value);
    return Number.isFinite(amount) ? new Intl.NumberFormat("en-US").format(amount) : String(value);
  };

  const range = [job.minSalary, job.maxSalary]
    .filter((value) => value != null && value !== "")
    .map((value) => `$${formatAmount(value)}`)
    .join(" – ");
  const frequency = job.salaryFrequency?.replace(/^per\s+/i, "").trim();
  return `${range}${frequency ? ` / ${frequency}` : ""}`;
}

function splitLines(value?: string) {
  return (value ?? "")
    .split(/\n|\r|•/)
    .map((item) => item.trim().replace(/^[-*]\s*/, ""))
    .filter(Boolean);
}

function splitSkills(value?: string) {
  return (value ?? "")
    .split(/,|\n|•/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDate(value?: string) {
  if (!value) return "Not specified";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function JobDetailsPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadJob = async () => {
      if (!SERVER_BASE_URL) {
        setError("The jobs server URL is not configured.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${SERVER_BASE_URL}/jobs/${encodeURIComponent(jobId)}`, {
          signal: controller.signal,
          credentials: "include",
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result?.message || "Could not load this job.");
        setJob(result as JobDetails);
      } catch (caught) {
        if (caught instanceof Error && caught.name === "AbortError") return;
        setError(caught instanceof Error ? caught.message : "Could not load this job.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadJob();
    return () => controller.abort();
  }, [jobId]);

  const toggleSaved = async () => {
    if (!job || saving) return;
    if (sessionPending) return;
    if (!session?.user) {
      router.push(`/sign-in?callbackURL=${encodeURIComponent(`/jobs/${jobId}`)}`);
      return;
    }
    if ((session.user as typeof session.user & { role?: string }).role !== "jobSeeker") {
      toast.error("Only job seekers can save jobs.");
      return;
    }

    const wasSaved = Boolean(job.isSaved);
    setSaving(true);
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/job-seeker/saved-jobs${wasSaved ? `/${encodeURIComponent(jobId)}` : ""}`,
        {
          method: wasSaved ? "DELETE" : "POST",
          credentials: "include",
          headers: wasSaved ? undefined : { "Content-Type": "application/json" },
          body: wasSaved ? undefined : JSON.stringify({ jobId }),
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not update saved jobs.");
      setJob((current) => current ? { ...current, isSaved: !wasSaved } : current);
      toast.success(wasSaved ? "Removed from saved jobs." : "Saved for later.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not update saved jobs.");
    } finally {
      setSaving(false);
    }
  };

  const applyToJob = async () => {
    if (!job || applying || hasApplied) return;
    if (sessionPending) return;
    if (!session?.user) {
      router.push(`/sign-in?callbackURL=${encodeURIComponent(`/jobs/${jobId}`)}`);
      return;
    }
    if ((session.user as typeof session.user & { role?: string }).role !== "jobSeeker") {
      toast.error("Only job seekers can apply for jobs.");
      return;
    }

    setApplying(true);
    try {
      const response = await fetch(`${SERVER_BASE_URL}/job-seeker/applications`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 409 && /already applied/i.test(result.message || "")) setHasApplied(true);
        throw new Error(result.message || "Could not submit your application.");
      }
      setHasApplied(true);
      toast.success("Application submitted successfully.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not submit your application.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <main className="min-h-[70vh] bg-[#080809] px-4 py-16 text-white sm:px-6"><div className="mx-auto max-w-7xl animate-pulse space-y-5"><div className="h-36 rounded-2xl bg-[#141416]" /><div className="h-120 rounded-2xl bg-[#141416]" /></div></main>;
  }

  if (error || !job) {
    return (
      <main className="min-h-[70vh] bg-[#080809] px-4 py-20 text-white sm:px-6">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/8 bg-[#141416] p-8 text-center">
          <BriefcaseBusiness className="mx-auto mb-4 size-9 text-[#777780]" />
          <h1 className="text-xl font-semibold">{error.includes("not found") ? "Job not found" : "Could not load this job"}</h1>
          <p role="alert" className="mt-2 text-sm text-[#9999a2]">{error || "This job may have been removed."}</p>
          <button type="button" onClick={() => router.push("/jobs")} className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#19191c] hover:bg-[#e9e9ed]"><ArrowLeft className="size-4" />Browse jobs</button>
        </div>
      </main>
    );
  }

  const companyName = job.company?.name || job.companyName || "Company not listed";
  const rawResponsibilities = job.responsibilities ?? "";
  const responsibilities = /(?:^|\n)\s*[•*-]/.test(rawResponsibilities) || rawResponsibilities.includes("\n")
    ? splitLines(rawResponsibilities)
    : [];
  const qualifications = splitLines(job.qualifications);
  const benefits = splitLines(job.benefits);
  const skills = splitSkills(job.skills);
  const location = job.isRemote
    ? `Remote${job.location ? ` (${job.location})` : ""}`
    : job.location || "Location not specified";

  const summary = [
    { label: "Salary range", value: formatSalary(job), Icon: CircleDollarSign },
    { label: "Location", value: location, Icon: MapPin },
    { label: "Job type", value: job.jobType || "Not specified", Icon: Clock3 },
    ...(job.experience ? [{ label: "Experience", value: job.experience, Icon: Sparkles }] : []),
  ];

  return (
    <main className="min-h-full bg-[#080809] px-4 pb-16 pt-6 text-[#f4f4f5] sm:px-6 lg:px-8 lg:pt-8">
      <div className="mx-auto max-w-7xl">
        <button type="button" onClick={() => router.back()} className="mb-5 inline-flex items-center gap-2 text-sm text-[#92929b] transition hover:text-white"><ArrowLeft className="size-4" />Back to jobs</button>

        <header className="flex flex-col gap-6 rounded-2xl border border-white/8 bg-[#141416] p-5 sm:flex-row sm:items-center sm:p-8">
          <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/8 bg-[#202024] text-lg font-semibold text-violet-200 sm:size-20">
              {job.company?.logoUrl ? <Image src={job.company.logoUrl} alt={`${companyName} logo`} width={80} height={80} unoptimized className="size-full object-cover" /> : companyName.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{job.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-[#a1a1aa] sm:text-base">
                <span>{companyName}</span>
                <span aria-hidden="true" className="text-[#55555d]">•</span>
                {job.company?.verified ? <span className="inline-flex items-center gap-1.5 text-emerald-400"><ShieldCheck className="size-4" />Verified employer</span> : <span>{location}</span>}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button type="button" onClick={toggleSaved} disabled={saving || sessionPending} aria-label={job.isSaved ? "Remove from saved jobs" : "Save for later"} aria-pressed={Boolean(job.isSaved)} title={job.isSaved ? "Remove from saved jobs" : "Save for later"} className={`flex size-12 items-center justify-center rounded-xl border transition disabled:cursor-wait disabled:opacity-60 ${job.isSaved ? "border-violet-400/50 bg-violet-500/15 text-violet-200" : "border-white/8 bg-[#202024] text-[#c4c4ca] hover:bg-white/10 hover:text-white"}`}>
              <Bookmark className="size-5" fill={job.isSaved ? "currentColor" : "none"} />
            </button>
            <button type="button" onClick={applyToJob} disabled={applying || hasApplied || sessionPending} className="inline-flex h-12 min-w-32 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#19191c] transition hover:bg-[#e9e9ed] disabled:cursor-not-allowed disabled:opacity-60">
              {hasApplied ? <><Check className="size-4" />Applied</> : applying ? "Applying…" : "Apply Now"}
            </button>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="min-w-0">
            <section aria-label="Job summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summary.map(({ label, value, Icon }) => (
                <div key={label} className="min-h-28 rounded-2xl border border-white/8 bg-[#141416] p-5">
                  <Icon aria-hidden="true" className="mb-2 size-5 text-[#c4c4ca]" />
                  <p className="text-xs uppercase tracking-wide text-[#85858e]">{label}</p>
                  <p className="mt-1 wrap-break-word text-sm font-semibold text-[#e8e8eb]">{value}</p>
                </div>
              ))}
            </section>

            <article className="mt-6 rounded-2xl border border-white/8 bg-[#141416] p-5 sm:p-8">
              <section>
                <h2 className="text-xl font-semibold">Job Description</h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#a1a1aa]">{job.description || (!responsibilities.length ? rawResponsibilities : "") || "The employer has not added a separate job description."}</p>
              </section>

              {responsibilities.length > 0 && (
                <section className="mt-7 border-t border-white/8 pt-6">
                  <h2 className="text-xl font-semibold">Responsibilities</h2>
                  <ul className="mt-4 space-y-3">
                    {responsibilities.map((item, index) => <li key={`${index}-${item}`} className="flex gap-3 text-sm leading-6 text-[#a1a1aa]"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-white" />{item}</li>)}
                  </ul>
                </section>
              )}

              {skills.length > 0 && (
                <section className="mt-7 border-t border-white/8 pt-6">
                  <h2 className="text-xl font-semibold">Requirements</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {skills.map((skill) => <span key={skill} className="rounded-lg border border-white/8 bg-[#1b1b1f] px-3 py-2 text-sm text-[#c4c4ca]">{skill}</span>)}
                  </div>
                  {qualifications.length > 0 && <ul className="mt-5 space-y-3">{qualifications.map((item, index) => <li key={`${index}-${item}`} className="flex gap-3 text-sm leading-6 text-[#a1a1aa]"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-white" />{item}</li>)}</ul>}
                </section>
              )}

              {!skills.length && qualifications.length > 0 && (
                <section className="mt-7 border-t border-white/8 pt-6">
                  <h2 className="text-xl font-semibold">Requirements</h2>
                  <ul className="mt-4 space-y-3">{qualifications.map((item, index) => <li key={`${index}-${item}`} className="flex gap-3 text-sm leading-6 text-[#a1a1aa]"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-white" />{item}</li>)}</ul>
                </section>
              )}

              {benefits.length > 0 && (
                <section className="mt-7 border-t border-white/8 pt-6">
                  <h2 className="text-xl font-semibold">Benefits</h2>
                  <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                    {benefits.map((item) => <li key={item} className="flex items-center gap-3 text-sm font-medium text-[#d4d4d8]"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#242428] text-violet-200"><Check className="size-4" /></span>{item}</li>)}
                  </ul>
                </section>
              )}
            </article>
          </div>

          <aside className="rounded-2xl border border-white/8 bg-[#141416] p-5 sm:p-6">
            <h2 className="text-xl font-semibold">Company Overview</h2>
            <div className="mt-5 flex h-44 items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-[#292a32] via-[#17181d] to-[#101012]">
              {job.company?.logoUrl ? <Image src={job.company.logoUrl} alt={`${companyName}`} width={96} height={96} unoptimized className="size-24 rounded-2xl object-cover shadow-xl" /> : <div className="flex size-20 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-violet-200"><Building2 className="size-9" /></div>}
            </div>
            <dl className="mt-5 divide-y divide-white/8">
              <div className="flex items-center justify-between gap-4 py-4"><dt className="text-xs uppercase tracking-wide text-[#85858e]">Size</dt><dd className="text-right text-sm text-[#d4d4d8]">{job.company?.size || "Not listed"}</dd></div>
              <div className="flex items-center justify-between gap-4 py-4"><dt className="text-xs uppercase tracking-wide text-[#85858e]">Industry</dt><dd className="text-right text-sm text-[#d4d4d8]">{job.company?.industry || job.category || "Not listed"}</dd></div>
              {job.deadline && <div className="flex items-center justify-between gap-4 py-4"><dt className="text-xs uppercase tracking-wide text-[#85858e]">Apply by</dt><dd className="text-right text-sm text-[#d4d4d8]">{formatDate(job.deadline)}</dd></div>}
            </dl>
            {job.company?.website ? (
              <a href={job.company.website} target="_blank" rel="noreferrer" className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/8 bg-[#1b1b1f] text-sm font-medium transition hover:bg-white/8">Visit Website<ExternalLink className="size-4" /></a>
            ) : (
              <div className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/8 bg-[#1b1b1f] text-sm text-[#777780]"><Users className="size-4" />Company website not listed</div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

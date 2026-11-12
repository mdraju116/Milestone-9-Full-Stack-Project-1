"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {ArrowLeft,ArrowRight,Banknote,BriefcaseBusiness,ChevronDown,Clock3,Layers2,Search,} from "lucide-react";

type Job = {
  _id: string;
  title: string;
  companyName: string;
  category?: string;
  jobType: string;
  isRemote?: boolean;
  location?: string;
  minSalary?: number | string;
  maxSalary?: number | string;
  salaryFrequency?: string;
};

type JobTypeCount = { _id: string; count: number };
type JobsResponse = {
  items: Job[];
  total: number;
  page: number;
  limit: number;
  typeCounts: JobTypeCount[];
};

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const PAGE_SIZE = 4;
const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_BASE_URL?.trim().replace(/\/$/, "") ?? "";
const EMPTY_RESPONSE: JobsResponse = { items: [], total: 0, page: 1, limit: PAGE_SIZE, typeCounts: [] };

function formatSalary(job: Job) {
  if (job.minSalary == null && job.maxSalary == null) return "Salary not listed";

  const formatAmount = (value: number | string | undefined) => {
    if (value == null || value === "") return "—";
    const amount = Number(value);
    if (!Number.isFinite(amount)) return String(value);
    if (Math.abs(amount) >= 1000) {
      const thousands = amount / 1000;
      return `${Number.isInteger(thousands) ? thousands : Number(thousands.toFixed(1))}k`;
    }
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(amount);
  };

  const range = `${job.minSalary == null ? "" : `$${formatAmount(job.minSalary)}`} – ${job.maxSalary == null ? "" : `$${formatAmount(job.maxSalary)}`}`.trim();
  const frequency = job.salaryFrequency?.replace(/^per\s+/i, "").trim();
  return `${range}${frequency ? `/${frequency}` : ""}`;
}

function companyInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CO";
}

function formatCount(count: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(count);
}

const JobsPage = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("All");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [completedRequest, setCompletedRequest] = useState<{ key: string; data: JobsResponse; error: string } | null>(null);

  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), sort });
  if (search) params.set("search", search);
  if (jobType !== "All") params.set("jobType", jobType);
  const requestKey = params.toString();
  const endpoint = SERVER_BASE_URL ? `${SERVER_BASE_URL}/jobs?${requestKey}` : "";
  const currentRequest = completedRequest?.key === requestKey ? completedRequest : null;
  const data = currentRequest?.data ?? EMPTY_RESPONSE;
  const loading = Boolean(SERVER_BASE_URL) && !currentRequest;
  const error = !SERVER_BASE_URL
    ? "The jobs server URL is not configured."
    : currentRequest?.error ?? "";

  useEffect(() => {
    if (!endpoint) return;

    const controller = new AbortController();

    const loadJobs = async () => {
      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load jobs. Please try again.");
        const result: JobsResponse = await response.json();
        if (!result || !Array.isArray(result.items)) throw new Error("The jobs server returned an unexpected response.");
        setCompletedRequest({
          key: requestKey,
          data: {
            items: result.items,
            total: Number(result.total) || 0,
            page: Number(result.page) || page,
            limit: Number(result.limit) || PAGE_SIZE,
            typeCounts: Array.isArray(result.typeCounts) ? result.typeCounts : [],
          },
          error: "",
        });
      } catch (caught) {
        if (caught instanceof Error && caught.name === "AbortError") return;
        setCompletedRequest({
          key: requestKey,
          data: EMPTY_RESPONSE,
          error: caught instanceof Error ? caught.message : "Something went wrong while loading jobs.",
        });
      }
    };

    void loadJobs();
    return () => controller.abort();
  }, [endpoint, page, requestKey]);

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const typeCountMap = useMemo(() => new Map<string, number>(data.typeCounts.map(({ _id, count }) => [_id, count] as [string, number])), [data.typeCounts]);
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);
    const start = Math.min(Math.max(page - 1, 1), totalPages - 2);
    return Array.from({ length: 3 }, (_, index) => start + index);
  }, [page, totalPages]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div className="min-h-full bg-[#080809] text-[#f4f4f5]">
      <main className="mx-auto w-full max-w-360 px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <form onSubmit={submitSearch} className="mb-7 flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#141416] p-4 sm:flex-row sm:p-6">
          <label className="flex min-h-15 flex-1 items-center gap-3 rounded-xl border border-white/[0.07] bg-[#1b1b1f] px-4 focus-within:border-violet-500/70">
            <Search aria-hidden="true" className="size-5 shrink-0 text-[#85858e]" />
            <span className="sr-only">Search jobs by title or keywords</span>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by job title, keywords..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#777780]"
            />
          </label>
          <button type="submit" className="min-h-15 rounded-xl bg-white px-7 font-semibold text-[#19191c] transition hover:bg-[#e9e9ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400">
            Search Jobs
          </button>
        </form>

        <div className="grid items-start gap-6 lg:grid-cols-[296px_minmax(0,1fr)] lg:gap-8">
          <aside className="rounded-2xl border border-white/8 bg-[#141416] p-5 sm:p-6">
            <h2 className="text-xl font-semibold">Filters</h2>
            <fieldset className="mt-7">
              <legend className="mb-4 text-base font-semibold">Job Type</legend>
              <div className="space-y-1">
                {JOB_TYPES.map((type) => {
                  const selected = jobType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => { setJobType(selected ? "All" : type); setPage(1); }}
                      className="flex min-h-10 w-full items-center gap-3 rounded-lg px-1 text-left text-sm text-[#a1a1aa] transition hover:text-white"
                    >
                      <span className={`flex size-5 items-center justify-center rounded border ${selected ? "border-white bg-white text-[#17171a]" : "border-white/10 bg-[#202024]"}`} aria-hidden="true">
                        {selected && <span className="text-xs font-bold">✓</span>}
                      </span>
                      <span className="flex-1">{type}</span>
                      <span className="text-xs text-[#66666f]">{formatCount(typeCountMap.get(type) ?? 0)}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </aside>

          <section aria-labelledby="jobs-heading" className="min-w-0">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <h1 id="jobs-heading" className="text-xl font-semibold sm:text-2xl">
                {loading && data.total === 0 ? "Finding jobs..." : `Found ${new Intl.NumberFormat("en-US").format(data.total)} Professional ${data.total === 1 ? "Job" : "Jobs"}`}
              </h1>
              <label className="flex items-center gap-3 self-start text-sm text-[#8b8b94] sm:self-auto">
                <span>Sort by:</span>
                <span className="relative">
                  <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="min-w-40 appearance-none rounded-xl border border-white/9 bg-[#141416] py-2.5 pl-3 pr-10 text-sm text-white outline-none focus:border-violet-500">
                    <option value="newest">Most Recent</option>
                    <option value="oldest">Oldest</option>
                    <option value="titleAsc">Title A–Z</option>
                    <option value="titleDesc">Title Z–A</option>
                  </select>
                  <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#85858e]" />
                </span>
              </label>
            </div>

            <div className="space-y-3.5" aria-live="polite" aria-busy={loading}>
              {loading && data.items.length === 0 && (
                <div className="rounded-2xl border border-white/8 bg-[#141416] px-6 py-12 text-center text-sm text-[#9999a2]">Loading jobs…</div>
              )}
              {!loading && error && (
                <div role="alert" className="rounded-2xl border border-red-400/20 bg-red-950/30 px-6 py-8 text-center text-sm text-red-200">{error}</div>
              )}
              {!loading && !error && data.items.length === 0 && (
                <div className="rounded-2xl border border-white/8 bg-[#141416] px-6 py-14 text-center">
                  <BriefcaseBusiness className="mx-auto mb-3 size-8 text-[#777780]" />
                  <h2 className="font-semibold">No jobs found</h2>
                  <p className="mt-1 text-sm text-[#8d8d96]">Try a different title or job type.</p>
                </div>
              )}
              {!error && data.items.map((job) => (
                <article key={job._id} className="rounded-2xl border border-white/8 bg-[#141416] p-5 transition-colors hover:border-white/[0.14] sm:p-6 lg:p-7">
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div aria-hidden="true" className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-[#202024] text-lg font-semibold text-violet-200">
                      {companyInitials(job.companyName || "Company")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-semibold leading-snug sm:text-xl">{job.title}</h2>
                      <p className="mt-1.5 text-sm font-medium text-[#85858e] sm:text-base">
                        {job.companyName || "Company not listed"}
                        <span className="mx-2 text-[#55555d]">•</span>
                        {job.isRemote && <span>Remote{job.location ? " · " : ""}</span>}
                        {job.location || (!job.isRemote ? "Location not specified" : "")}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2.5">
                        {(job.minSalary != null || job.maxSalary != null) && (
                          <span className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-[#1b1b1f] px-3 py-2 text-sm">
                            <Banknote className="size-4 text-[#c4c4ca]" />{formatSalary(job)}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-[#1b1b1f] px-3 py-2 text-sm">
                          <Clock3 className="size-4 text-[#c4c4ca]" />{job.jobType}
                        </span>
                        {job.category && (
                          <span className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-[#1b1b1f] px-3 py-2 text-sm text-[#c4c4ca]">
                            <Layers2 className="size-4" />{job.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <nav aria-label="Job results pages" className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <button type="button" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="flex size-10 items-center justify-center rounded-xl border border-white/8 text-[#b0b0b8] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40">
                  <ArrowLeft className="size-4" />
                </button>
                {pageNumbers[0] > 1 && <><PageButton pageNumber={1} currentPage={page} disabled={loading} onSelect={setPage} /><span className="px-1 text-[#777780]">…</span></>}
                {pageNumbers.map((pageNumber) => <PageButton key={pageNumber} pageNumber={pageNumber} currentPage={page} disabled={loading} onSelect={setPage} />)}
                {pageNumbers[pageNumbers.length - 1] < totalPages && <><span className="px-1 text-[#777780]">…</span><PageButton pageNumber={totalPages} currentPage={page} disabled={loading} onSelect={setPage} /></>}
                <button type="button" aria-label="Next page" disabled={page >= totalPages || loading} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="flex size-10 items-center justify-center rounded-xl border border-white/8 text-[#b0b0b8] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40">
                  <ArrowRight className="size-4" />
                </button>
              </nav>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

function PageButton({ pageNumber, currentPage, disabled, onSelect }: { pageNumber: number; currentPage: number; disabled: boolean; onSelect: (page: number) => void }) {
  const active = pageNumber === currentPage;
  return (
    <button type="button" aria-current={active ? "page" : undefined} disabled={disabled} onClick={() => onSelect(pageNumber)} className={`flex size-10 items-center justify-center rounded-xl border text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${active ? "border-white bg-white font-semibold text-[#17171a]" : "border-white/8 text-[#b0b0b8] hover:bg-white/10"}`}>
      {pageNumber}
    </button>
  );
}

export default JobsPage;


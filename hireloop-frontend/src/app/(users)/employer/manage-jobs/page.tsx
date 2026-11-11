"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, MapPin, MoreVertical, Pencil, Plus, Trash2, Users } from "lucide-react";

type Job = {
    _id?: string;
    title?: string;
    companyName?: string;
    category?: string;
    jobType?: string;
    isRemote?: boolean;
    location?: string;
    deadline?: string;
    createdAt?: string;
    minSalary?: number | string;
    maxSalary?: number | string;
    salaryFrequency?: string;
    applicants?: unknown[] | number;
    status?: string;
};

const columnHeadings = ["Job title & dept", "Company & location", "Type", "Compensation", "Applicants", "Status", "Deadline", "Actions"];

// Convert an available posting timestamp into a short relative label.
const timeAgo = (value?: string) => {
    if (!value) return "Posting date unavailable";
    const timestamp = new Date(value).getTime();
    if (Number.isNaN(timestamp)) return "Posting date unavailable";
    const days = Math.max(0, Math.floor((Date.now() - timestamp) / 86400000));
    if (days === 0) return "Posted today";
    if (days === 1) return "Posted 1d ago";
    if (days < 7) return `Posted ${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `Posted ${weeks}w ago`;
    return `Posted ${Math.floor(days / 30)}mo ago`;
};

// Format the application deadline for display in the table.
const formatDeadline = (value?: string) => {
    if (!value) return "Not specified";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

// Combine the salary range and frequency into one compensation label.
const salary = (job: Job) => {
    if (job.minSalary == null && job.maxSalary == null) return "Not specified";
    const range = [job.minSalary, job.maxSalary].filter((value) => value != null).join(" – ");
    return `€${range}${job.salaryFrequency ? ` / ${job.salaryFrequency.replace(/^per /, "")}` : ""}`;
};

export default function EmpManageJobPage() {
    // Track the fetched listings and request feedback.
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Load listings when the page mounts and cancel the request on unmount.
    useEffect(() => {
        const controller = new AbortController();
        const loadJobs = async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL?.trim();
                if (!baseUrl) throw new Error("The server URL is not configured.");
                const response = await fetch(`${baseUrl}/employer/jobs`, { signal: controller.signal });
                if (!response.ok) throw new Error("Could not load job listings.");
                const data: unknown = await response.json();

                if (!Array.isArray(data)) throw new Error("The server returned an unexpected jobs response.");
                const fetchedAt = Date.now();

                setJobs((data as Job[]).map((job) => ({
                    ...job,
                    status: job.status?.toLowerCase() === "expired" || (!!job.deadline && new Date(job.deadline).getTime() < fetchedAt)
                        ? "Expired"
                        : job.status || "Active",
                })));
            } catch (err) {
                if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not load job listings.");
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        void loadJobs();
        return () => controller.abort();
    }, []);

    return (
        <div className="min-h-full bg-[#111112] text-white">
            {/* Main page container */}
            <div className="mx-auto w-full min-w-0 max-w-none px-1 pb-12 sm:px-3 lg:px-4">

                {/* Page title, description, and new listing navigation */}
                <div className="flex flex-col justify-between gap-5 pb-6 pt-2 sm:flex-row sm:items-center">
                    <div>
                        <p className="mb-2 text-sm text-[#85858f]">Manage Jobs <span className="mx-1">›</span> <span className="text-[#a69cff]">Job Listings &amp; Postings</span></p>
                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Manage Job Posts</h1>
                        <p className="mt-2 text-sm text-[#8f8f98]">Review live listings, monitor applicants, and update job details across your organization.</p>
                    </div>
                    <button onClick={() => router.push("/employer/add-job")} className="inline-flex h-12 items-center justify-center gap-2 self-start rounded-xl bg-[#5c4bff] px-5 font-semibold text-white transition hover:bg-[#6e5fff] sm:self-auto">
                        <Plus className="size-5" /> New Job Post
                    </button>
                </div>

                {/* Fetch error, Loading & Empty state */}
                {error && <div role="alert" className="rounded-xl border border-red-900/60 bg-red-950/30 p-5 text-sm text-red-200">{error} <button onClick={() => window.location.reload()} className="ml-2 underline">Try again</button></div>}
                {!error && loading && <div className="rounded-2xl border border-white/8 bg-[#151517] p-8 text-center text-[#a1a1aa]">Loading job listings…</div>}
                {!error && !loading && jobs.length === 0 && <div className="rounded-2xl border border-white/8 bg-[#151517] px-6 py-14 text-center"><BriefcaseBusiness className="mx-auto mb-3 size-9 text-[#777780]" /><h2 className="text-lg font-medium">No job posts yet</h2><p className="mt-1 text-sm text-[#8f8f98]">Your published listings will appear here.</p></div>}

                {/* Job listings table, horizontally scrollable when needed */}
                {!error && !loading && jobs.length > 0 && <div className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-white/8 bg-[#151517]">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-245 border-collapse text-left text-[13px]">
                            {/* Column widths tuned for the expanded dashboard layout */}
                            <colgroup><col className="w-[18%]" /><col className="w-[17%]" /><col className="w-[8%]" /><col className="w-[12%]" /><col className="w-[10%]" /><col className="w-[8%]" /><col className="w-[14%]" /><col className="w-[13%]" /></colgroup>
                            {/* Column headings */}
                            <thead className="bg-[#0d0d0f] text-[11px] uppercase tracking-wide text-[#92929b]"><tr>{columnHeadings.map((heading) => <th key={heading} className="whitespace-nowrap px-2 py-4 font-medium">{heading}</th>)}</tr></thead>
                            {/* Listing data rows */}
                            <tbody className="divide-y divide-white/6">{jobs.map((job, index) => {
                                const applicantCount = Array.isArray(job.applicants) ? job.applicants.length : typeof job.applicants === "number" ? job.applicants : 0;
                                const expired = job.status?.toLowerCase() === "expired";
                                return <tr key={job._id ?? `${job.title ?? "job"}-${index}`} className="transition hover:bg-white/2">
                                    <td className="px-2 py-4"><p className="font-semibold text-white">{job.title || "Untitled position"}</p><p className="mt-1 text-xs text-[#aaa0ff]">{job.category || "Uncategorized"}</p></td>
                                    <td className="px-2 py-4"><p>{job.companyName || "—"}</p><p className="mt-1 flex items-center gap-1 text-xs text-[#92929b]"><MapPin className="size-3 shrink-0" />{job.isRemote ? `Remote${job.location ? ` · ${job.location}` : ""}` : job.location || "Location not specified"}</p></td>
                                    <td className="whitespace-nowrap px-2 py-4"><span className="inline-block whitespace-nowrap rounded-full bg-white/6 px-2.5 py-1 text-xs">{job.jobType || "—"}</span></td>
                                    <td className="whitespace-nowrap px-2 py-4 text-xs">{salary(job)}</td>
                                    <td className="px-2 py-4"><span className="inline-flex items-center gap-1.5 text-[#c3baff]"><Users className="size-4" />{applicantCount}</span></td>
                                    <td className="px-2 py-4"><span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-medium ${expired ? "bg-white/8 text-[#a1a1aa]" : "bg-emerald-500/10 text-emerald-400"}`}>{!expired && <span className="size-1.5 rounded-full bg-emerald-400" />}{expired ? "Expired" : job.status || "Active"}</span></td>
                                    <td className="px-2 py-4"><p className="whitespace-nowrap">{formatDeadline(job.deadline)}</p><p className="mt-1 text-[11px] text-[#777780]">{timeAgo( job.createdAt )}</p></td>
                                    <td className="whitespace-nowrap px-2 py-4">
                                        <div className="flex items-center gap-1">
                                            <button type="button" aria-label={`Update ${job.title || "job"}`} className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#28233f] px-2 text-xs text-[#c3baff] transition hover:bg-[#342c58]"><Pencil className="size-3.5" /><span>Update</span></button>
                                            <button type="button" aria-label={`Delete ${job.title || "job"}`} className="grid size-8 place-items-center rounded-lg bg-white/6 text-[#a1a1aa] transition hover:bg-red-500/10 hover:text-red-400"><Trash2 className="size-3.5" /></button>
                                            <button type="button" aria-label={`More actions for ${job.title || "job"}`} className="grid size-8 place-items-center rounded-lg text-[#a1a1aa] transition hover:bg-white/6"><MoreVertical className="size-3.5" /></button>
                                        </div>
                                    </td>
                                </tr>;
                            })}</tbody>
                        </table>
                    </div>
                </div>}
            </div>
        </div>
    );
}

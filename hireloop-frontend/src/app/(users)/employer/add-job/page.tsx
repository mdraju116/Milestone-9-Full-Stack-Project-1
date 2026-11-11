
"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { ArrowRight, Building2, CalendarDays, Check, ChevronDown, CircleDollarSign, Globe2, MapPin, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

type JobForm = {
    title: string;
    companyName: string;
    category: string;
    jobType: string;
    isRemote: boolean;
    location: string;
    deadline: string;
    minSalary: string;
    maxSalary: string;
    salaryFrequency: string;
    responsibilities: string;
    qualifications: string;
    benefits: string;
    skills: string;
    applicationUrl: string;
    applicants:number; // not has at form, but need in manage job, so added manually
};

const initialForm: JobForm = {
    title: "Frontend Developer",
    companyName: "HirePulse Network",
    category: "Engineering & Tech",
    jobType: "Full-time",
    isRemote: false,
    location: "New York, USA",
    deadline: "2025-05-30",
    minSalary: "25",
    maxSalary: "40",
    salaryFrequency: "per hour",
    responsibilities:
        "Showcase your commitment to delivering exceptional user interfaces and digital experiences. You will collaborate directly with systems designers and backend engineers to craft responsive, micro-interaction rich products.",
    qualifications:
        "• 3+ years of experience with React, TypeScript, and modern state architectures\n• Solid understanding of DOM performance and component-driven designs\n• Experience partnering closely with product teams and UI/UX designers",
    benefits: "",
    skills: "React, TypeScript, Next.js",
    applicationUrl: "",
    applicants : 0, 
};

const categories = ["Engineering & Tech", "Design & Creative", "Marketing", "Sales", "Finance", "Operations"];
const jobTypes = ["Full-time", "Part-time", "Contract", "Internship"];
const frequencies = ["per hour", "per day", "per month", "per year"];

const inputClass = "h-14 rounded-xl border-0 bg-[#1d1d21] px-5 text-base text-white shadow-none placeholder:text-[#777780] focus-visible:border-[#5b4bff] focus-visible:ring-1 focus-visible:ring-[#5b4bff]";
const labelClass = "mb-2 block text-[15px] font-medium text-[#e8e8eb]";

function FieldLabel({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
    return <span className={labelClass}>{children}{required && <span className="ml-1 text-[#6554ff]">*</span>}</span>;
}

function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
    return (
        <section className="rounded-3xl bg-[#151517] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.12)] sm:p-8">
            <h2 className="mb-7 flex items-center gap-3 text-xl font-semibold text-white">
                <span className="h-2.5 w-2.5 rounded-full bg-[#6252ff]" />
                {number}. {title}
            </h2>
            {children}
        </section>
    );
}


/* 
This page uses a controlled form.

The form uses React state :     const [form, setForm] = useState<JobForm>(initialForm);
And updates input values through value and onChange.

It also uses different input types/components within that form:
1. Text Input : Used for Job Title and Company Name.
2. Select Dropdown : Used for Job Category and Salary Frequency.
3. Switch : Used for Remote Work.
4. Selection Buttons : Used for Job Type (Full-time, Part-time, Contract, Internship).
5. Textarea : Used for Responsibilities, Qualifications and Benefits.
6. Date Input : Used for the Application Deadline.
7. Number Input : Used for Minimum and Maximum Salary.
*/

const AddJobPage = () => {
    const [form, setForm] = useState<JobForm>(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const update = <K extends keyof JobForm>(key: K, value: JobForm[K]) => {
        setForm((previous) => ({ ...previous, [key]: value }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (Number(form.maxSalary) < Number(form.minSalary)) {
            toast.error("Maximum salary must be greater than or equal to minimum salary.");
            return;
        }

        setIsSubmitting(true);

        const payload = {
            ...form,
            minSalary: Number(form.minSalary),
            maxSalary: Number(form.maxSalary),
        };

        try {
            const baseUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL?.trim();
            if (!baseUrl) throw new Error("The server URL is not configured.");

            const response = await fetch(`${baseUrl}/employer/add-job`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Could not publish this job.");

            toast.success("Job published successfully!");
            setForm(initialForm);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-full bg-[#111112] text-white">
            <div className="mx-auto max-w-312.5 px-1 pb-12 sm:px-4 lg:px-7">
                <div className="flex flex-col justify-between gap-6 border-b border-white/6 pb-7 pt-2 sm:flex-row sm:items-end">
                    <div>
                        <p className="mb-2 text-sm text-[#85858f]">Manage Jobs <span className="mx-1 text-[#575760]">›</span> <span className="text-[#6554ff]">Create New Listing</span></p>
                        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Post a New Job</h1>
                        <p className="mt-2 text-base text-[#8f8f98]">Fill in the position specifications to attract qualified talent across our network.</p>
                    </div>
                    <Button type="submit" form="add-job-form" disabled={isSubmitting} className="h-14 rounded-2xl bg-[#5c4bff] px-7 text-base font-semibold text-white shadow-[0_10px_25px_rgba(92,75,255,0.28)] hover:bg-[#6e5fff]">
                        {isSubmitting ? "Publishing..." : "Publish Job"} <ArrowRight className="ml-2" />
                    </Button>
                </div>

                <form id="add-job-form" onSubmit={handleSubmit} className="mt-7 space-y-7">

                    <Section number={1} title="Basic Information">
                        <div className="space-y-5">
                            <label><FieldLabel required>Job Title</FieldLabel><Input required value={form.title} onChange={(e) => update("title", e.target.value)} className={inputClass} /></label>
                            <div className="grid gap-5 md:grid-cols-2">
                                <label><FieldLabel required>Company Name</FieldLabel><div className="relative"><Building2 className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#9b9ba4]" /><Input required value={form.companyName} onChange={(e) => update("companyName", e.target.value)} className={`${inputClass} pl-12`} /></div></label>
                                <label><FieldLabel required>Job Category</FieldLabel><div className="relative"><select required value={form.category} onChange={(e) => update("category", e.target.value)} className={`${inputClass} w-full appearance-none pr-12`} >{categories.map((category) => <option key={category}>{category}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#9b9ba4]" /></div></label>
                            </div>
                            <fieldset><FieldLabel required>Job Type</FieldLabel>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {jobTypes.map((type) => <button key={type} type="button" onClick={() => update("jobType", type)} className={`h-14 rounded-xl border text-sm font-medium transition-colors ${form.jobType === type ? "border-[#5c4bff] bg-[#25232a] text-white" : "border-transparent bg-[#1d1d21] text-[#92929b] hover:text-white"}`}>{form.jobType === type && <Check className="mr-2 inline size-4 text-[#695aff]" />}{type}</button>)}
                                </div>
                            </fieldset>
                        </div>
                    </Section>


                    <Section number={2} title="Location, Compensation & Timeline">
                        <div className="space-y-5">

                            <div className="flex items-center justify-between rounded-2xl bg-[#1d1d21] p-4 sm:p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-[#292639] text-[#aaa0ff]"><Globe2 className="size-5" /> </div>
                                    <div><p className="font-medium text-white">Remote Work Allowed (isRemote)</p><p className="text-sm text-[#81818b]">Enable worldwide or distributed candidate applications</p></div>
                                </div>
                                <Switch checked={form.isRemote} onCheckedChange={(checked) => update("isRemote", checked)} aria-label="Remote work allowed" />
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <label><FieldLabel>Job Location (location)</FieldLabel><div className="relative"><MapPin className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#9b9ba4]" /><Input required={!form.isRemote} value={form.location} onChange={(e) => update("location", e.target.value)} className={`${inputClass} pl-12`} /></div></label>
                                <label><FieldLabel>Application Deadline (deadline)</FieldLabel><div className="relative"><CalendarDays className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#9b9ba4]" /><Input required type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} className={`${inputClass} pl-12 scheme-dark`} /></div></label>
                            </div>

                            <div className="grid gap-5 md:grid-cols-3">
                                <label><FieldLabel>Min Salary / Rate</FieldLabel><div className="relative"><CircleDollarSign className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#9b9ba4]" /><Input type="number" min="0" required value={form.minSalary} onChange={(e) => update("minSalary", e.target.value)} className={`${inputClass} pl-12`} /></div></label>
                                <label><FieldLabel>Max Salary / Rate</FieldLabel><div className="relative"><CircleDollarSign className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#9b9ba4]" /><Input type="number" min="0" required value={form.maxSalary} onChange={(e) => update("maxSalary", e.target.value)} className={`${inputClass} pl-12`} /></div></label>
                                <label><FieldLabel>Frequency</FieldLabel><div className="relative"><select required value={form.salaryFrequency} onChange={(e) => update("salaryFrequency", e.target.value)} className={`${inputClass} w-full appearance-none pr-12`}>{frequencies.map((frequency) => <option key={frequency}>{frequency}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#9b9ba4]" /></div></label>
                            </div>
                        </div>
                    </Section>


                    <Section number={3} title="Responsibilities & Requirements">
                        <div className="space-y-5">
                            <label><FieldLabel required>Key Responsibilities</FieldLabel><Textarea required rows={5} value={form.responsibilities} onChange={(e) => update("responsibilities", e.target.value)} className="min-h-32 rounded-2xl border-0 bg-[#1d1d21] px-5 py-4 text-base text-white placeholder:text-[#777780] focus-visible:border-[#5b4bff] focus-visible:ring-1 focus-visible:ring-[#5b4bff]" /></label>
                            <label><FieldLabel required>Qualifications & Requirements</FieldLabel><Textarea required rows={5} value={form.qualifications} onChange={(e) => update("qualifications", e.target.value)} className="min-h-32 rounded-2xl border-0 bg-[#1d1d21] px-5 py-4 text-base text-white placeholder:text-[#777780] focus-visible:border-[#5b4bff] focus-visible:ring-1 focus-visible:ring-[#5b4bff]" /></label>
                        </div>
                    </Section>


                    <Section number={4} title="Additional Details">
                        <div className="grid gap-5 md:grid-cols-2">
                            <label><FieldLabel>Benefits</FieldLabel><Textarea rows={4} value={form.benefits} onChange={(e) => update("benefits", e.target.value)} placeholder="Health insurance, flexible hours..." className="min-h-28 rounded-2xl border-0 bg-[#1d1d21] px-5 py-4 text-base text-white placeholder:text-[#777780] focus-visible:border-[#5b4bff] focus-visible:ring-1 focus-visible:ring-[#5b4bff]" /></label>
                            <label><FieldLabel>Skills</FieldLabel><Textarea rows={4} value={form.skills} onChange={(e) => update("skills", e.target.value)} placeholder="React, TypeScript, Next.js" className="min-h-28 rounded-2xl border-0 bg-[#1d1d21] px-5 py-4 text-base text-white placeholder:text-[#777780] focus-visible:border-[#5b4bff] focus-visible:ring-1 focus-visible:ring-[#5b4bff]" /></label>
                            <label className="md:col-span-2"><FieldLabel>Application URL</FieldLabel><Input type="url" value={form.applicationUrl} onChange={(e) => update("applicationUrl", e.target.value)} placeholder="https://company.com/careers/frontend-developer" className={inputClass} /></label>
                        </div>
                    </Section>

                    <div className="flex justify-end pb-4 sm:hidden"><Button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-xl bg-[#5c4bff] text-white">{isSubmitting ? "Publishing..." : "Publish Job"}<ArrowRight className="ml-2" /></Button></div>
                </form>
            </div>
        </div>
    );
};

export default AddJobPage;

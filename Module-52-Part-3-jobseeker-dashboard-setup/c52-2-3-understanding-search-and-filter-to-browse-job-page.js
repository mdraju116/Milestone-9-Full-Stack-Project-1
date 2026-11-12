/* 
https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional

✅✅Search Params (or Query Parameters) allow you to pass data through a URL without creating a new route.

They are commonly used for search, filtering, sorting, and pagination in Next.js.

✅✅1. What do Search Params look like?
Suppose your HireLoop job listing page has a search box.

When someone searches for React, the URL could become:
/jobs?search=React


Here:
- /jobs → Route
- ? → Starts the query parameters.
- search → Parameter name (key).
- React → Parameter value.
You can add multiple parameters using &:
/jobs?search=React&category=Engineering&jobType=Full-time


✅✅2. How to read Search Params in Next.js
In a Next.js App Router page, you can receive them through the searchParams prop.

To get filter  like this:
Stack: React
Category: Engineering

We need to use the URL like this:
/jobs?stack=React&category=Engineering

And the Code will be like this : 

type SearchProps = {
  searchParams: Promise<{ [key:string] : string |string[] | undefined }>;
};
const BrowseJobsPage = async ({ searchParams }: SearchProps) => {
  const params = await searchParams;
  // console.log(params);

  const stack = params.stack;
  const category = params.category;

  return (
    <div>
         <p>stack: {stack}</p>
         <p>Category: {category}</p>
      </div>
  );
};
export default BrowseJobsPage;




✅✅3. How to create Search Params
You can use JavaScript's URLSearchParams.
const params = new URLSearchParams();

params.set("search", "React");
params.set("category", "Engineering");

router.push(`/jobs?${params.toString()}`);


The resulting URL:
/jobs?search=React&category=Engineering


Here, router comes from useRouter() in next/navigation.




✅✅✅✅Search vs Filter 
Search and Filter use almost the same technical process, but they have different purposes.

Aspect	Search	Filter
Purpose	Find jobs using keywords	Narrow down jobs using specific criteria
User action	Types a keyword	Selects an option or range
Example	React	Full-time
Query parameter	search=React	jobType=Full-time
MongoDB operation	Often $regex or text search	Often exact matching, $in, $gte, $lte
Result	Jobs matching the keyword	Jobs matching the selected criteria


Search vs Filter: Code comparison
Search	Filter
Uses a text input	Uses a select/dropdown
Matches keywords	Matches specific criteria
.includes()	===
Example: React	Example: Full-time


Similarities
Both Search and Filter:
	1. Collect input from the user.
	2. Use URL query parameters.
	3. Send those parameters to the backend 
	4. API.
	5. Use MongoDB queries to find matching records.
	6. Display the matching results.
	7. Can work together in the same request.





✅✅ Search + Filter together with backend code

✅1. Backend – Express API

// search + filter combined
app.get("/jobs", async (req, res) => {
  const search = req.query.search || "";
  const jobType = req.query.jobType;
  const query = {};
  // Search by job title
  if (search) {
    query.title = {
      $regex: search,
      $options: "i",
    };
  }
  // Filter by job type
  if (jobType) {
    query.jobType = jobType;
  }
  const result = await jobs.find(query).toArray();
  res.send(result);
});




✅2. Frontend – app/jobs/page.tsx


"use client";
import { useState } from "react";
type Job = {
  _id: string;
  title: string;
  companyName: string;
  jobType: string;
};
const JobsPage = () => {
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("All");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const handleSearchAndFilter = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) {
        params.set("search", search.trim());
      }
      if (jobType !== "All") {
        params.set("jobType", jobType);
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/jobs?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mx-auto max-w-xl space-y-5 p-8">
      <h1 className="text-2xl font-bold">Find Jobs</h1>
      {/* Search Input /}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by job title..."
        className="w-full rounded border p-2"
      />
      {/* Job Type Filter /}
      <select
        value={jobType}
        onChange={(e) => setJobType(e.target.value)}
        className="w-full rounded border p-2"
      >
        <option value="All">All Job Types</option>
        <option value="Full-time">Full-time</option>
        <option value="Part-time">Part-time</option>
        <option value="Contract">Contract</option>
        <option value="Internship">Internship</option>
      </select>
      {/* Search Button /}
      <button
        onClick={handleSearchAndFilter}
        className="rounded bg-green-600 px-4 py-2 text-white"
      >
        Search Jobs
      </button>
      {/* Job Results /}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job._id} className="rounded border p-3">
              <h2 className="font-semibold">{job.title}</h2>
              <p>{job.companyName}</p>
              <p className="text-sm text-gray-500">{job.jobType}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default JobsPage;










 
*/
import { SidebarProvider,SidebarInset,SidebarTrigger,} from "@/components/ui/sidebar";
import JobSeekerSidebar from "@/components/dashboard/job-seeker-sidebar";


export default function EmployerLayout({children,}: {children: React.ReactNode;}) {
  
return (
    <SidebarProvider>
      <JobSeekerSidebar />

      <SidebarInset>
        <header className="flex h-14 items-center border-b px-4">
          <SidebarTrigger />
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>

      </SidebarInset>
    </SidebarProvider>
  );
}
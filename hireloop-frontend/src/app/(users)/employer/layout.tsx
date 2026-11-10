import { SidebarProvider,SidebarInset,SidebarTrigger,} from "@/components/ui/sidebar";
import EmployerSidebar from "@/components/dashboard/employer-sidebar";


export default function EmployerLayout({children,}: {children: React.ReactNode;}) {
  
return (
    <SidebarProvider className="dark bg-[#111112] text-white">
      <EmployerSidebar />

      <SidebarInset className="bg-[#111112]">
        <header className="flex h-14 items-center border-b border-white/6 bg-[#111112] px-4">
          <SidebarTrigger />
        </header>

        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>

      </SidebarInset>
    </SidebarProvider>
  );
}

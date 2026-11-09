import { SidebarProvider,SidebarInset,SidebarTrigger,} from "@/components/ui/sidebar";
import EmployerSidebar from "@/components/dashboard/employer-sidebar";


export default function EmployerLayout({children,}: {children: React.ReactNode;}) {
  
return (
    <SidebarProvider>
      <EmployerSidebar />

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
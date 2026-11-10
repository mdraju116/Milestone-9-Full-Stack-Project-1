"use client";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, } from "@/components/ui/sidebar";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, } from "@/components/ui/sidebar";
import { LayoutDashboard, BriefcaseBusiness, PlusCircle, DollarSign, Settings, } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { LogOut, ChevronsUpDown } from "lucide-react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";



const JobSeekerSidebar = () => {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const user = session?.user;

    const handleSignOut = async () => {
        const { error } = await signOut();

        if (error) {
            toast.error("Could not sign out. Please try again.");
            return;
        }

        toast.success("Signed out successfully!");
        router.push("/");
        router.refresh();
    };

    if (isPending) {
        return (
            <div className="flex items-center gap-2">
                <Spinner className="text-[#068a3f]" />
                <span className="text-xs text-muted-foreground">Loading user...</span>
            </div>
        );
    }

    return (
        <Sidebar collapsible="icon">

            {/* 1 */}
            {/* Sidebar Header */}
            <SidebarHeader>
                {/* HireLoop Branding */}
                <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">

                    <Image
                        src="/assets/images/logo.png"
                        alt="HireLoop"
                        width={150}
                        height={40}
                        priority
                    />
                </div>

                {/* Seeker Account Card */}
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" tooltip="Account" className="h-auto py-2">

                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:rounded-full">
                                {user?.image ? (
                                    <Image
                                        src={user.image}
                                        alt={user.name || "User"}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-lg font-semibold group-data-[collapsible=icon]:text-sm">
                                        {user?.name?.charAt(0).toUpperCase() || "S"}
                                    </div>
                                )}
                            </div>

                            {/* User Information */}
                            <div className="grid min-w-0 flex-1 gap-1 text-left leading-tight">
                                <span className="truncate text-sm font-semibold">
                                    {user?.name || "Recruiter"}
                                </span>

                                <span className="truncate text-xs text-muted-foreground">
                                    {user?.email || ""}
                                </span>

                                <Badge
                                    variant="secondary"
                                    className="h-4 w-fit rounded border border-green-200 bg-green-100 px-1.5 text-[10px] font-medium text-green-700 hover:bg-green-100"
                                >
                                    {user?.role === "employer" ? "Recruiter" : user?.role}
                                </Badge>
                            </div>

                            <ChevronsUpDown className="ml-auto size-4 shrink-0" />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>


            {/* 2 */}
            {/* Sidebar Navigation */}
            <SidebarContent>
                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel>Overview</SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip="Dashboard"
                                    onClick={() => router.push("/job-seeker/dashboard")}
                                >
                                    <LayoutDashboard />
                                    <span>Dashboard</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Job Management */}
                <SidebarGroup>
                    <SidebarGroupLabel>Job Management</SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip="Save a Job"
                                    onClick={() => router.push("/job-seeker/saved-jobs")}
                                >
                                    <PlusCircle />
                                    <span>Saved Jobs</span>

                                </SidebarMenuButton>
                            </SidebarMenuItem>



                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Applications"
                                    onClick={() => router.push("/job-seeker/applications")}
                                >
                                    <BriefcaseBusiness />
                                    <span>Applications</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Billing"
                                    onClick={() => router.push("/job-seeker/billing")}
                                >
                                    <DollarSign />
                                    <span>Billing</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Settings"
                                    onClick={() => router.push("/job-seeker/settings")}
                                >
                                    <Settings />
                                    <span>Settings</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>



                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>



            </SidebarContent>


            {/* 3 */}
            {/* Sidebar Footer */}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Sign Out"
                            onClick={handleSignOut}
                        >
                            <LogOut />
                            <span>Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
};

export default JobSeekerSidebar;
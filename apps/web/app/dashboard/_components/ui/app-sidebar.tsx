"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/app/dashboard/_components/ui/nav-main";
import { NavProjects } from "@/app/dashboard/_components/ui/nav-projects";
import { NavUser } from "@/app/dashboard/_components/ui/nav-user";
import { TeamSwitcher } from "@/app/dashboard/_components/ui/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui/components/sidebar";
import { useSession } from "@/lib/auth-client";

const data = {
  teams: [
    {
      name: "Predict Hub",
      logo: Command,
      plan: "Startup",
    },
  ],
  navMain: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
      ],
    },
    {
      title: "Category",
      url: "/dashboard/category",
      icon: Frame,
      items: [
        {
          title: "Category",
          url: "/dashboard/category",
        },
        {
          title: "Sub Category",
          url: "/dashboard/category/sub-category",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: userData, error, isPending } = useSession();
  console.log("userData", userData);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {userData && <NavUser user={userData?.user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

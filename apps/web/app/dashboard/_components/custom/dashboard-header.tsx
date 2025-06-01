"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";
import { SidebarTrigger } from "@repo/ui/components/sidebar";
import { Separator } from "@repo/ui/components/separator";
import { capitalize } from "@/lib/utils";

export default function DashboardHeader() {
  const pathname = usePathname();

  // Convert pathname to an array of segments
  const paths = pathname.split("/").filter(Boolean); // Example: ['dashboard', 'rooms']

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          {paths.slice(1).map((segment, index) => {
            const href = `/${paths.slice(0, index + 2).join("/")}`;
            const isLast = index === paths.length - 2;
            return (
              <React.Fragment key={href}>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>
                      {capitalize(decodeURIComponent(segment))}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href}>
                      {capitalize(decodeURIComponent(segment))}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}

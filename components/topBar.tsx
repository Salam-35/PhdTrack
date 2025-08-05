// app/components/TopBar.tsx
"use client";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TopBar({ userInitial = "N", onLogout }: { userInitial?: string; onLogout: () => void }) {
  return (
    <div className="flex justify-between items-center px-6 py-4 shadow-sm bg-white">
      <div>
        <h1 className="text-2xl font-bold">PhD Tracker Pro</h1>
        <p className="text-sm text-gray-500">Your academic journey organizer</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-6 mt-2">
          <DropdownMenuItem onClick={() => alert("Go to profile")}>Profile</DropdownMenuItem>
          <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

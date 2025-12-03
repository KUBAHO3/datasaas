"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

const INDUSTRIES = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Retail",
    "Real Estate",
    "Consulting",
    "Other",
];

const STATUSES = [
    { value: "all", label: "All Companies" },
    { value: "pending", label: "Pending" },
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
    { value: "rejected", label: "Rejected" },
];

export function CompaniesFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [filters, setFilters] = useState({
        status: searchParams.get("status") || "all",
        industry: searchParams.get("industry") || "all",
        search: searchParams.get("search") || "",
    });

    function handleFilterChange(key: string, value: string) {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }

    function applyFilters() {
        startTransition(() => {
            const params = new URLSearchParams();

            if (filters.status && filters.status !== "all") {
                params.set("status", filters.status);
            }

            if (filters.industry && filters.industry !== "all") {
                params.set("industry", filters.industry);
            }

            if (filters.search) {
                params.set("search", filters.search);
            }

            router.push(`/admin/companies?${params.toString()}`);
        });
    }

    function clearFilters() {
        setFilters({
            status: "all",
            industry: "all",
            search: "",
        });
        startTransition(() => {
            router.push("/admin/companies");
        });
    }

    const hasActiveFilters =
        filters.status !== "all" ||
        filters.industry !== "all" ||
        filters.search !== "";

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={filters.status}
                            onValueChange={(value: string) => handleFilterChange("status", value)}
                        >
                            <SelectTrigger id="status">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUSES.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Select
                            value={filters.industry}
                            onValueChange={(value: string) => handleFilterChange("industry", value)}
                        >
                            <SelectTrigger id="industry">
                                <SelectValue placeholder="All industries" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Industries</SelectItem>
                                {INDUSTRIES.map((industry) => (
                                    <SelectItem key={industry} value={industry}>
                                        {industry}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="search">Search</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="search"
                                placeholder="Search by company name..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange("search", e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        applyFilters();
                                    }
                                }}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <Button
                        onClick={applyFilters}
                        disabled={isPending}
                        className="flex-1 sm:flex-initial"
                    >
                        {isPending ? "Applying..." : "Apply Filters"}
                    </Button>

                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            onClick={clearFilters}
                            disabled={isPending}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
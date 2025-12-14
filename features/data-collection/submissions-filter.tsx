"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Filter, X, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    FilterCondition,
    FilterGroup,
    FilterOperator,
} from "@/lib/types/submission-types";
import { FormField } from "@/lib/types/form-types";

interface SubmissionsFilterProps {
    formFields: FormField[];
    onFilterChange: (filters: FilterGroup[]) => void;
    onClear: () => void;
}

const OPERATORS: { value: FilterOperator; label: string }[] = [
    { value: "equals", label: "Equals" },
    { value: "notEquals", label: "Not Equals" },
    { value: "contains", label: "Contains" },
    { value: "notContains", label: "Does Not Contain" },
    { value: "startsWith", label: "Starts With" },
    { value: "endsWith", label: "Ends With" },
    { value: "greaterThan", label: "Greater Than" },
    { value: "greaterThanOrEqual", label: "Greater Than or Equal" },
    { value: "lessThan", label: "Less Than" },
    { value: "lessThanOrEqual", label: "Less Than or Equal" },
    { value: "isNull", label: "Is Empty" },
    { value: "isNotNull", label: "Is Not Empty" },
];

export function SubmissionsFilter({
    formFields,
    onFilterChange,
    onClear,
}: SubmissionsFilterProps) {
    const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([
        { logic: "AND", conditions: [] },
    ]);

    const [dateRange, setDateRange] = useState<{
        start?: Date;
        end?: Date;
    }>({});

    function addCondition(groupIndex: number) {
        const newGroups = [...filterGroups];
        newGroups[groupIndex].conditions.push({
            fieldId: formFields[0]?.id || "",
            operator: "equals",
            value: "",
        });
        setFilterGroups(newGroups);
        onFilterChange(newGroups);
    }

    function removeCondition(groupIndex: number, conditionIndex: number) {
        const newGroups = [...filterGroups];
        newGroups[groupIndex].conditions.splice(conditionIndex, 1);
        setFilterGroups(newGroups);
        onFilterChange(newGroups);
    }

    function updateCondition(
        groupIndex: number,
        conditionIndex: number,
        updates: Partial<FilterCondition>
    ) {
        const newGroups = [...filterGroups];
        newGroups[groupIndex].conditions[conditionIndex] = {
            ...newGroups[groupIndex].conditions[conditionIndex],
            ...updates,
        };
        setFilterGroups(newGroups);
        onFilterChange(newGroups);
    }

    function handleClear() {
        setFilterGroups([{ logic: "AND", conditions: [] }]);
        setDateRange({});
        onClear();
    }

    const hasActiveFilters =
        filterGroups.some((g) => g.conditions.length > 0) ||
        dateRange.start ||
        dateRange.end;

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* Date Range Filter */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !dateRange.start && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange.start ? (
                                            format(dateRange.start, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={dateRange.start}
                                        onSelect={(date) =>
                                            setDateRange({ ...dateRange, start: date })
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !dateRange.end && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange.end ? (
                                            format(dateRange.end, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={dateRange.end}
                                        onSelect={(date) =>
                                            setDateRange({ ...dateRange, end: date })
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Field Filters */}
                    {filterGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className="space-y-3">
                            {group.conditions.map((condition, conditionIndex) => (
                                <div
                                    key={conditionIndex}
                                    className="grid grid-cols-12 gap-2 items-end"
                                >
                                    {/* Field Selection */}
                                    <div className="col-span-4 space-y-2">
                                        <Label className="text-xs">Field</Label>
                                        <Select
                                            value={condition.fieldId}
                                            onValueChange={(value) =>
                                                updateCondition(groupIndex, conditionIndex, {
                                                    fieldId: value,
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {formFields.map((field) => (
                                                    <SelectItem key={field.id} value={field.id}>
                                                        {field.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Operator Selection */}
                                    <div className="col-span-3 space-y-2">
                                        <Label className="text-xs">Operator</Label>
                                        <Select
                                            value={condition.operator}
                                            onValueChange={(value) =>
                                                updateCondition(groupIndex, conditionIndex, {
                                                    operator: value as FilterOperator,
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {OPERATORS.map((op) => (
                                                    <SelectItem key={op.value} value={op.value}>
                                                        {op.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Value Input */}
                                    <div className="col-span-4 space-y-2">
                                        <Label className="text-xs">Value</Label>
                                        <Input
                                            value={condition.value}
                                            onChange={(e) =>
                                                updateCondition(groupIndex, conditionIndex, {
                                                    value: e.target.value,
                                                })
                                            }
                                            placeholder="Enter value..."
                                            disabled={
                                                condition.operator === "isNull" ||
                                                condition.operator === "isNotNull"
                                            }
                                        />
                                    </div>

                                    {/* Remove Button */}
                                    <div className="col-span-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeCondition(groupIndex, conditionIndex)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addCondition(groupIndex)}
                                className="w-full"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Condition
                            </Button>
                        </div>
                    ))}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t">
                        <Button
                            variant="default"
                            onClick={() => onFilterChange(filterGroups)}
                            className="flex-1"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Apply Filters
                        </Button>
                        {hasActiveFilters && (
                            <Button variant="outline" onClick={handleClear}>
                                Clear All
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
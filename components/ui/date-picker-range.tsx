"use client";

import type * as React from "react";
import type {DateRange} from "react-day-picker";
import {DayPicker} from "react-day-picker";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {CalendarIcon} from "lucide-react";
import {cn} from "@/lib/utils";

interface DateRangePickerProps {
    range: DateRange | undefined;
    setRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}

export function DateRangePicker({ range, setRange }: DateRangePickerProps) {
    const handleSelect = (selectedRange: DateRange | undefined) => {
        setRange(selectedRange);
    };

    return (
        <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-[280px] justify-start text-left font-normal", !range && "text-muted-foreground")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
            {range?.from && range?.to ? (
                `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
            ) : (
                <span>Pick a date range</span>
            )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <DayPicker
            mode="range"
            selected={range}
            onSelect={handleSelect}
            initialFocus
        />
      </PopoverContent>
    </Popover>
    );
}

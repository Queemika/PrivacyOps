import { CalendarIcon } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
  value?: string;                       // YYYY-MM-DD
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
}

export function DateCell({ value, onChange, placeholder = "Pick date", className }: Props) {
  const date = value ? parseISO(value) : undefined;
  const valid = date && isValid(date) ? date : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-7 w-full justify-start text-xs font-normal px-2",
            !valid && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="h-3 w-3 mr-1.5 shrink-0" />
          {valid ? format(valid, "MMM d, yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={valid}
          onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

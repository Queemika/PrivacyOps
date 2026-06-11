import { useEffect, useMemo, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { addDepartment, loadDepartments } from "@/lib/departments/store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  rowId: string;
  drlNo: string;
  category: string;
  value: string; // comma-separated chips
  notifiedFor: string; // comma-separated chips already notified
  onChange: (next: { assignment: string; notifiedFor: string }) => void;
}

function parse(s: string): string[] {
  return (s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function AssignmentCell({ rowId, drlNo, category, value, notifiedFor, onChange }: Props) {
  const chips = useMemo(() => parse(value), [value]);
  const notified = useMemo(() => new Set(parse(notifiedFor)), [notifiedFor]);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDepartments(loadDepartments());
  }, [open]);

  const suggestions = useMemo(() => {
    const q = text.trim().toLowerCase();
    return departments
      .filter((d) => !chips.includes(d))
      .filter((d) => !q || d.toLowerCase().includes(q))
      .slice(0, 8);
  }, [departments, chips, text]);

  const commit = (nextChips: string[]) => {
    const assignment = nextChips.join(", ");
    // figure out newly added chips (not in old chips, not in notified)
    const added = nextChips.filter((c) => !chips.includes(c) && !notified.has(c));
    const nextNotified = Array.from(new Set([...Array.from(notified), ...added])).join(", ");
    onChange({ assignment, notifiedFor: nextNotified });
    if (added.length) fireNotifications(added);
  };

const fireNotifications = async (added: string[]) => {
  try {
    console.log("=== fireNotifications START ===");
    console.log("Added tags:", added);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("Auth result:", {
      user: user?.id,
      email: user?.email,
      error: userError,
    });

    if (user) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          kind: "assignment",
          title: `DRL ${drlNo} assigned to ${added.join(", ")}`,
          body: `New assignment tag(s) added on ${category.toUpperCase()} DRL ${drlNo}.`,
          link: `/drl?tab=${category}&row=${rowId}`,
          meta: {
            rowId,
            drlNo,
            category,
            tags: added,
          },
        });

      console.log("Notification insert result:", {
        success: !notificationError,
        error: notificationError,
      });
    }

    console.log("About to invoke notify-drl-assignment");

    const response = await supabase.functions.invoke(
      "notify-drl-assignment",
      {
        body: {
          rowId,
          drlNo,
          category,
          tags: added,
          link: `/drl?tab=${category}&row=${rowId}`,
        },
      }
    );

    console.log("FULL RESPONSE", response);

    if (response.error) {
      console.error("Function Error:", response.error);

      alert(
        JSON.stringify(
          {
            data: response.data,
            error: response.error,
            response: (response.error as any)?.context ?? null,
          },
          null,
          2
        )
      );

      return;
    }

    console.log("SUCCESS:", response.data);

    toast.success(`Notified: ${added.join(", ")}`);
  } catch (error) {
    console.error("fireNotifications error:", error);

    toast.error(
      error instanceof Error
        ? error.message
        : "Failed to send notification"
    );
  }
};

  const rawResponse = response.error.context as Response;

  if (rawResponse) {
    console.log("STATUS", rawResponse.status);
    console.log("STATUS TEXT", rawResponse.statusText);

    try {
      const bodyText = await rawResponse.text();
      console.log("RAW BODY", bodyText);
      alert(bodyText);
    } catch (e) {
      console.error("Could not read response body", e);
    }
  }
}

  const addChip = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (chips.includes(v)) return;
    if (!departments.includes(v)) {
      addDepartment(v);
      setDepartments(loadDepartments());
    }
    commit([...chips, v]);
    setText("");
    inputRef.current?.focus();
  };
  const removeChip = (c: string) => {
    commit(chips.filter((x) => x !== c));
  };

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {chips.map((c) => (
        <span
          key={c}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[10px] border border-accent/20"
        >
          {c}
          <button type="button" onClick={() => removeChip(c)} className="hover:text-rose-500">
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button size="sm" variant="ghost" className="h-5 px-1.5 text-[10px]">
            <Plus className="h-2.5 w-2.5 mr-0.5" />
            tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <Input
            ref={inputRef}
            placeholder="Department or user…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addChip(text);
              }
            }}
            className="h-7 text-xs mb-2"
          />
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addChip(s)}
                className="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted"
              >
                {s}
              </button>
            ))}
            {suggestions.length === 0 && text.trim() && (
              <button
                type="button"
                onClick={() => addChip(text)}
                className="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted text-accent"
              >
                + Add "{text.trim()}"
              </button>
            )}
            {suggestions.length === 0 && !text.trim() && (
              <div className="px-2 py-1 text-xs text-muted-foreground">All departments tagged.</div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

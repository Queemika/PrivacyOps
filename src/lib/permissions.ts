import type { AppRole } from "@/lib/roles/store";

export type WorkableStatus = "Draft" | "Preparer" | "LeadReview" | "ApproverSignoff" | "Approved" | "Rejected";
export type Action = "edit" | "submit" | "leadApprove" | "finalApprove" | "reject" | "assign";

export function can(action: Action, roles: AppRole[], status: WorkableStatus = "Draft"): boolean {
  const has = (r: AppRole) => roles.includes(r);
  const isStaff = has("Preparer") || has("Lead") || has("Approver") || has("Admin");

  if (status === "Approved" && action !== "edit") return false;
  if (status === "Approved" && action === "edit") return has("Admin");

  switch (action) {
    case "edit":
      if (has("Client") && !isStaff) return status === "Approved" ? false : false;
      if (has("Intern") && !isStaff) return false;
      return isStaff;
    case "submit":
      return isStaff && (status === "Draft" || status === "Preparer" || status === "Rejected");
    case "leadApprove":
      return (has("Lead") || has("Admin")) && status === "LeadReview";
    case "finalApprove":
      return (has("Approver") || has("Admin")) && status === "ApproverSignoff";
    case "reject":
      return (has("Lead") || has("Approver") || has("Admin")) && (status === "LeadReview" || status === "ApproverSignoff");
    case "assign":
      return isStaff;
  }
  return false;
}

export function nextStatus(current: WorkableStatus, action: Action): WorkableStatus | null {
  if (action === "submit") {
    if (current === "Draft" || current === "Preparer" || current === "Rejected") return "LeadReview";
  }
  if (action === "leadApprove" && current === "LeadReview") return "ApproverSignoff";
  if (action === "finalApprove" && current === "ApproverSignoff") return "Approved";
  if (action === "reject") return "Rejected";
  return null;
}

export const STATUS_LABEL: Record<WorkableStatus, string> = {
  Draft: "Draft",
  Preparer: "In Preparation",
  LeadReview: "Lead Review",
  ApproverSignoff: "Approver Sign-off",
  Approved: "Approved",
  Rejected: "Rejected",
};

export const STATUS_TONE: Record<WorkableStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  Preparer: "bg-info/15 text-info",
  LeadReview: "bg-warning/15 text-warning",
  ApproverSignoff: "bg-accent/15 text-accent",
  Approved: "bg-success/15 text-success",
  Rejected: "bg-destructive/15 text-destructive",
};

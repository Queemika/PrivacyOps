import { ModuleStub } from "@/components/ModuleStub";
export default function PhysicalInspection() {
  return (
    <ModuleStub
      title="Physical Inspection"
      description="Captures on-site validation of controls and practices."
      features={[
        "Photo upload",
        "Checklist digitization",
        "OCR for handwritten notes",
        "Editable AI summaries",
      ]}
    />
  );
}

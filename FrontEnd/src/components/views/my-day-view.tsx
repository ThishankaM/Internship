import { Sun } from "lucide-react";
import { ComingSoonView } from "@/components/views/coming-soon-view";

export default function MyDayView() {
  return (
    <ComingSoonView
      icon={Sun}
      title="My Day"
      description="Focus on what matters today. This view arrives in a later phase."
    />
  );
}

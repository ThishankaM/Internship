import { Clock } from "lucide-react";
import { ComingSoonView } from "@/components/views/coming-soon-view";

export default function ScheduleView() {
  return (
    <ComingSoonView
      icon={Clock}
      title="Schedule"
      description="See your tasks across time. This view arrives in a later phase."
    />
  );
}

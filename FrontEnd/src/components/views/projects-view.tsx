import { Briefcase } from "lucide-react";
import { ComingSoonView } from "@/components/views/coming-soon-view";

export default function ProjectsView() {
  return (
    <ComingSoonView
      icon={Briefcase}
      title="Projects"
      description="Group related tasks into projects. This view arrives in a later phase."
    />
  );
}

import RoutinePage from "@/lib/RoutinePage";
import { Sunrise } from "lucide-react";

export default function MorningRoutinePage() {
  return (
    <RoutinePage
      type="morning"
      title="Morning Routine"
      description="Start every day with an ADHD-friendly routine tailored to your energy level."
      placeholder={`Describe your ideal morning. For example:
- I have ADHD and struggle to start tasks
- I need to shower, eat breakfast, and take medication
- I prefer gentle starts — no loud alarms
- I get anxious before lectures
- I need 20 mins to feel human before talking to anyone`}
      accentColor="#111111"
      accentBg="#F2E94E"
      icon={<Sunrise size={24} color="#111111" />}
    />
  );
}

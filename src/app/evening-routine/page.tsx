import RoutinePage from "@/lib/RoutinePage";
import { Moon } from "lucide-react";

export default function EveningRoutinePage() {
  return (
    <RoutinePage
      type="evening"
      title="Evening Routine"
      description="Wind down properly and prepare for tomorrow — three plans for every kind of day."
      placeholder={`Describe your ideal evening routine. For example:
- I find it hard to switch off and stop hyperfocusing
- I need to prepare my bag and clothes for tomorrow
- I struggle with sleep — screen time affects me a lot
- I like a light snack before bed
- I want to review what I did today and plan tomorrow`}
      accentColor="#111111"
      accentBg="#DDB3F5"
      icon={<Moon size={24} color="#111111" />}
    />
  );
}

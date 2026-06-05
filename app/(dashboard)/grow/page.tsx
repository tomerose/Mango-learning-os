import { GrowContent } from "./grow-content";
import { GardenBackground } from "@/components/ui/module-backgrounds";

export const metadata = { title: "成长空间 · MangoLearningOS" };

export default function GrowPage() {
  return (
    <div className="relative">
      <GardenBackground />
      <div className="relative z-10">
        <GrowContent />
      </div>
    </div>
  );
}

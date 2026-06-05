import { redirect } from "next/navigation";

export default function DnaPage() {
  redirect("/agent?tab=identity");
}

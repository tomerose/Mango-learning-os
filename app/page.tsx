import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const jar = await cookies();
  const visited = jar.get("mango_visited")?.value;
  redirect(visited === "1" ? "/hub" : "/login");
}

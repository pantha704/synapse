import { getTeacherPath } from "@/lib/queries/learning-path";
import { TeacherPathView } from "./view";

// DB-backed page: never prerender at build time
export const dynamic = "force-dynamic";

export default async function LearningPathPage() {
  const data = await getTeacherPath();
  return <TeacherPathView {...data} />;
}

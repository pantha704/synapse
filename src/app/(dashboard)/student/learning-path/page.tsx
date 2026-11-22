import { getStudentPath } from "@/lib/queries/learning-path";
import { StudentPathView } from "./view";

// DB-backed page: never prerender at build time
export const dynamic = "force-dynamic";

export default async function StudentLearningPathPage() {
  const data = await getStudentPath();
  return <StudentPathView {...data} />;
}

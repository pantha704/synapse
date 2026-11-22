"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import type { Node, Edge } from "@xyflow/react";

/**
 * Persists node positions and parent links for one subject.
 *
 * Every argument is attacker-controlled (server actions are public endpoints),
 * so the subject, every node id and every parent id are checked against the
 * caller's institution before a single row is written. Failures are reported
 * instead of swallowed: a layout that half-saves is worse than one that errors.
 */
export async function saveMindmapLayout(subjectId: string, nodes: Node[], edges: Edge[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not signed in" };

  const me = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!me) return { success: false, error: "No account record" };
  if (me.role !== "TEACHER" && me.role !== "ADMIN") {
    return { success: false, error: "Only teaching staff can change the curriculum" };
  }

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId: me.institutionId },
    select: { id: true, topicNodes: { select: { id: true } } },
  });
  if (!subject) return { success: false, error: "Subject not found" };

  const owned = new Set(subject.topicNodes.map((n) => n.id));
  const foreign = nodes.map((n) => n.id).filter((id) => !owned.has(id));
  if (foreign.length > 0) {
    return { success: false, error: `Unknown topic(s) for this subject: ${foreign.slice(0, 3).join(", ")}` };
  }

  const parentOf = new Map<string, string | null>();
  for (const node of nodes) {
    const parentEdge = edges.find((e) => e.target === node.id);
    const parentId = parentEdge?.source ?? null;
    parentOf.set(node.id, parentId && owned.has(parentId) ? parentId : null);
  }

  try {
    await prisma.$transaction(
      nodes.map((node) =>
        prisma.topicNode.update({
          where: { id: node.id },
          data: {
            positionX: node.position.x,
            positionY: node.position.y,
            parentId: parentOf.get(node.id) ?? null,
          },
        })
      )
    );
    return { success: true };
  } catch (error) {
    console.error("[mindmap] save failed", error);
    return { success: false, error: "Could not save the layout" };
  }
}

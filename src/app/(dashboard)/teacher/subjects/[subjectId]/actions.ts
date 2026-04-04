'use server';

import { prisma } from '@/lib/prisma';
import { Node, Edge } from '@xyflow/react';

export async function saveMindmapLayout(subjectId: string, nodes: Node[], edges: Edge[]) {
  // In a real app we'd verify the teacher owns this subject/institution
  
  // We will run this in a transaction.
  // Currently TopicNode stores parentId, which is similar to edges where source=parent, target=child
  
  // 1. Update node coordinates
  const updatePromises = nodes.map(node => {
    return prisma.topicNode.update({
      where: { id: node.id },
      data: {
        positionX: node.position.x,
        positionY: node.position.y,
      }
    }).catch(e => {
      // If node doesn't exist, we might need an upsert, 
      // but for now we assume they exist in DB already.
      console.error(`Failed to update node ${node.id}`, e);
    });
  });

  // 2. Update edges (parent relationships)
  // Our schema assumes `parentId`. 
  // For each node, find the edge where it is the target, 
  // and set its parentId to the edge's source.
  const edgePromises = nodes.map(node => {
    const parentEdge = edges.find(e => e.target === node.id);
    return prisma.topicNode.update({
      where: { id: node.id },
      data: {
        parentId: parentEdge ? parentEdge.source : null
      }
    }).catch(e => console.error(`Failed edge update for ${node.id}`, e));
  });

  await Promise.all([...updatePromises, ...edgePromises]);
  return { success: true };
}

/**
 * Orden de contenidos dentro de un bloque (módulo): todos los temas con el mismo `blockId`,
 * ordenados por `topic.order`, y dentro de cada tema los contenidos por `content.order`.
 */
export type TopicForBlockOrder = {
  blockId?: string | null;
  order: number;
  contents: { id: string; order: number }[];
};

export function getOrderedContentIdsInBlock(topics: TopicForBlockOrder[], blockId: string): string[] {
  return topics
    .filter((t) => t.blockId === blockId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .flatMap((t) => [...(t.contents ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((c) => c.id));
}

/** True si `contentId` es el último contenido del bloque (último de todos los temas vinculados). */
export function isLastContentInBlock(
  topics: TopicForBlockOrder[],
  blockId: string | null | undefined,
  contentId: string
): boolean {
  if (!blockId) return false;
  const ids = getOrderedContentIdsInBlock(topics, blockId);
  if (ids.length === 0) return false;
  return ids[ids.length - 1] === contentId;
}

export function getTopLevelComponentSets(): ComponentSetNode[] {
    // Filter the current page's children for ComponentSetNodes
    return figma.currentPage.children.filter(
      (node) => node.type === 'COMPONENT_SET'
    ) as ComponentSetNode[];
  }
  
export async function getComponentSetData(nodeId: string) {
const node = figma.getNodeById(nodeId);

if (!node || node.type !== 'COMPONENT_SET') {
    throw new Error('Selected node is not a valid ComponentSetNode');
}

// Gather relevant properties
const css = await node.getCSSAsync();
const isAsset = node.isAsset;
const stringRepresentation = node.toString();
const id = node.id;
const name = node.name;

return {
    css,
    isAsset,
    stringRepresentation,
    id,
    name
};
}
  
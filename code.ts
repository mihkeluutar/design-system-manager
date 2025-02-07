// TODO: Make resizeable
figma.showUI(__html__, { width: 400, height: 600 });

// -----------------------------------------------------------------------------
// Utility functions previously in utils.ts
// -----------------------------------------------------------------------------
/**
 * Fetch the top-level nodes from the current page, then filter for COMPONENT_SET nodes.
 */
async function getAllComponentSets(): Promise<ComponentSetNode[]> {
  await figma.loadAllPagesAsync(); // Ensures all pages are accessible

  const allComponentSets = figma.root.findAll(node => node.type === 'COMPONENT_SET') as ComponentSetNode[];
  return allComponentSets;
}

/**
 * Given a node ID, fetch the node async, confirm it's a ComponentSetNode,
 * then gather the relevant properties.
 */
async function getComponentSetData(nodeId: string) {
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node || node.type !== 'COMPONENT_SET') {
    throw new Error('Selected node is not a valid ComponentSetNode');
  }

  // Retrieve component set data
  // const css = await node.getCSSAsync(); // Component set does not have css itself
  const isAsset = node.isAsset;
  const stringRepresentation = node.toString();
  const id = node.id;
  const name = node.name;
  const description = node.description;

  // Get component property definitions (these are the same for all children)
  const componentProperties = node.componentPropertyDefinitions;

  // Retrieve all child components (variants)
  const componentVariants = node.children.filter(child => child.type === 'COMPONENT') as ComponentNode[];

  console.log(componentVariants);

  // Fetch CSS asynchronously for all variants
  const variants = await Promise.all(
    componentVariants.map(async (child) => ({
      id: child.id,
      name: child.name,
      string: child.toString(),
      css: await child.getCSSAsync(), // Now properly awaited
      // Currently skipping the reactions part, as it's a bit too complex.
      /*
      reactions: child.reactions.map(reaction => ({
        trigger: reaction.trigger?.type || "UNKNOWN_TRIGGER", // Safe check for trigger
        action: reaction.action ? reaction.action.type : "NO_ACTION", // Safe check for action
        destination: reaction.action && "destinationId" in reaction.action
          ? reaction.action.destinationId
          : "N/A" // Safe check for navigation targets
      })),
      */
      // TODO: Those things might have children as well, so we should go through them recursively
    }))
  );

  return {
    id,
    name,
    description,
    componentProperties,
    isAsset,
    stringRepresentation,
    variants // List of all component variants inside this set
  };
}

/**
 * Initialize: Retrieve top-level component sets and send them to the UI
 */
(async () => {
  const componentSets = await getAllComponentSets();
  figma.ui.postMessage({
    type: 'populate-component-dropdown',
    componentSets: componentSets.map(node => ({
      id: node.id,
      name: node.name
    }))
  });
})();

/**
 * Handle messages from the UI
 */
figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case 'request-component-data': {
      const { nodeId } = msg;
      try {
        const data = await getComponentSetData(nodeId);
        figma.ui.postMessage({ type: 'display-component-data', data });
      } catch (error) {
        figma.ui.postMessage({
          type: 'display-component-data',
          data: { error: (error as Error).message }
        });
      }
      break;
    }

    
    default:
      // no default action
      break;
  }
};
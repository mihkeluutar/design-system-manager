// TODO: Make resizeable
figma.showUI(__html__, { width: 400, height: 600 });

/**
 * Fetch the top-level nodes from the current page, then filter for COMPONENT_SET nodes.
 */
async function getAllComponentSets(): Promise<ComponentSetNode[]> {
  await figma.loadAllPagesAsync(); // Ensures all pages are accessible

  const allComponentSets = figma.root.findAll(node => node.type === 'COMPONENT_SET') as ComponentSetNode[];
  return allComponentSets;
}

/**
 * Feteches the children structure recursively. 
 */
async function getChildrenStructureRecursively(node: SceneNode): Promise<any> {
  // Base structure for the current node
  const nodeData = {
    id: node.id,
    type: node.type,
    name: node.name,
    isRemoved: node.removed,
    isVisible: node.visible,
    // inferredVariables: node.inferredVariables, // Probably useful?
    // TODO: Add more properties as needed.
    css: await ("getCSSAsync" in node ? node.getCSSAsync() : Promise.resolve("N/A")),
    // Currently commented out the prototyping part since it's a bit more complex.
    /*
    reactions: child.reactions.map(reaction => ({
      trigger: reaction.trigger?.type || "UNKNOWN_TRIGGER", // Safe check for trigger
      action: reaction.action ? reaction.action.type : "NO_ACTION", // Safe check for action
      destination: reaction.action && "destinationId" in reaction.action
        ? reaction.action.destinationId
        : "N/A" // Safe check for navigation targets
    })),
    */
    inferredAutoLayout: null as InferredAutoLayoutResult | null,
    children: [] as any[], // To hold children recursively - can be an empty list.
  };

  if (node.type === "FRAME") {
    nodeData.inferredAutoLayout = node.inferredAutoLayout || null;
  }

  // If the node has children, recursively fetch their structure
  if ("children" in node && node.children.length > 0) {
    nodeData.children = await Promise.all(
      node.children.map((child) => getChildrenStructureRecursively(child))
    );
  }

  return nodeData;
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
  const id = node.id;
  const type = node.type;
  const name = node.name;
  const description = node.description;
  const defaultVariant = node.defaultVariant;
  const isAsset = node.isAsset;
  const isRemote = node.remote;
  const isRemoved = node.removed;
  const isVisible = node.visible;
  const publishStatus = await node.getPublishStatusAsync();
  const componentProperties = node.componentPropertyDefinitions;

  // Retrieve all child components (variants)
  const componentVariants = node.children.filter(child => child.type === 'COMPONENT') as ComponentNode[];

  // For logging
  console.log(componentVariants);

  const variants = await Promise.all(
    componentVariants.map(async (component) => getChildrenStructureRecursively(component))
  );

  return {
    id,
    type,
    name,
    description,
    defaultVariant,
    isAsset,
    isRemote,
    isRemoved,
    isVisible,
    publishStatus,
    componentProperties,
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
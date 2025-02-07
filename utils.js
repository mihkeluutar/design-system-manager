var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function getTopLevelComponentSets() {
    // Filter the current page's children for ComponentSetNodes
    return figma.currentPage.children.filter((node) => node.type === 'COMPONENT_SET');
}
export function getComponentSetData(nodeId) {
    return __awaiter(this, void 0, void 0, function* () {
        const node = figma.getNodeById(nodeId);
        if (!node || node.type !== 'COMPONENT_SET') {
            throw new Error('Selected node is not a valid ComponentSetNode');
        }
        // Gather relevant properties
        const css = yield node.getCSSAsync();
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
    });
}

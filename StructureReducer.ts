/*
import * as fs from 'fs';

// Types for the reduced structure
interface ComponentProperty {
    type: string;
    defaultValue: any;
    variantOptions?: any[]; // Include variant options for properties of type VARIANT
}
  
interface VariantChild {
type: string;
name: string;
css: Record<string, any>;
}
  
interface Variant {
name: string;
css: Record<string, any>;
children: VariantChild[];
}

interface ReducedComponent {
name: string;
description: string;
componentProperties: Record<string, ComponentProperty>;
variants: Variant[];
}
  

function reduceComponentStructure(rawData: any): ReducedComponent {
// Process component properties
const componentProperties: Record<string, ComponentProperty> = {};
for (const [key, value] of Object.entries(rawData.componentProperties)) {
    componentProperties[key] = {
    type: value.type,
    defaultValue: value.defaultValue,
    ...(value.variantOptions && { variantOptions: value.variantOptions }) // Include variant options if available
    };
}
  
// Process variants
const variants: Variant[] = rawData.variants.map((variant: any) => {
    // Extract children details
    const children: VariantChild[] = variant.children.map((child: any) => ({
    type: child.type,
    name: child.name,
    css: child.css || {}
    }));

    return {
    name: variant.name,
    css: variant.css || {},
    children
    };
});

// Return reduced structure
return {
    name: rawData.name,
    description: rawData.description || "",
    componentProperties,
    variants
};
}
  
// Read the JSON from a file
const jsonFilePath = './example.json';
const rawJson = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

const reducedStructure = reduceComponentStructure(rawJson);
console.log(JSON.stringify(reducedStructure, null, 2));
  
*/
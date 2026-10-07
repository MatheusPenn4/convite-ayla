import { Fragment, isValidElement, type ReactElement, type ReactNode } from "react";

/**
 * Converte uma árvore de elementos SVG (componentes de ilustração) em texto SVG.
 * Suficiente para os desenhos do convite, que usam apenas tags SVG simples.
 */

// Atributos SVG que mantêm camelCase no arquivo final.
const KEEP_CAMEL = new Set([
  "viewBox",
  "preserveAspectRatio",
  "gradientUnits",
  "gradientTransform",
  "baseFrequency",
  "numOctaves",
  "xChannelSelector",
  "yChannelSelector",
  "stdDeviation",
  "patternUnits",
  "patternContentUnits",
]);

const escapeText = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeAttr = (v: string) => escapeText(v).replace(/"/g, "&quot;");

function attrName(name: string) {
  if (name === "className") return "class";
  if (KEEP_CAMEL.has(name) || name.startsWith("aria-") || name.startsWith("data-")) return name;
  return name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

export function toSvgString(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return escapeText(String(node));
  if (Array.isArray(node)) return node.map(toSvgString).join("");
  if (!isValidElement(node)) return "";

  const el = node as ReactElement<Record<string, unknown> & { children?: ReactNode }>;
  const { children, ...props } = el.props;

  if (el.type === Fragment) return toSvgString(children);
  if (typeof el.type === "function") {
    return toSvgString((el.type as (p: unknown) => ReactNode)(el.props));
  }
  if (typeof el.type !== "string") return "";

  let attrs = "";
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false || key === "style" || key === "key" || key === "ref") continue;
    attrs += ` ${attrName(key)}="${escapeAttr(value === true ? "true" : String(value))}"`;
  }
  const inner = toSvgString(children);
  return inner ? `<${el.type}${attrs}>${inner}</${el.type}>` : `<${el.type}${attrs}/>`;
}

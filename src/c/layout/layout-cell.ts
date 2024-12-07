import { BaseLayoutNode, type LayoutCache, type LayoutNode } from "./layout-node";
import type { LayoutArea } from "./layout-area";
import type { Context } from "../context";

export class LayoutCell extends BaseLayoutNode implements LayoutNode {
    private children: LayoutNode[] = [];

    public addLayout<T extends LayoutNode>(node: T): T {
      this.children.push(node);
      return node;
    }

    public calculate(context: Context, cache: LayoutCache, area: LayoutArea) {
      this.setArea(cache, area);
      for (const child of this.children) {
        child.calculate(context, cache, area);
      }
    }
}

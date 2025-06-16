declare module "lit" {
  export class LitElement extends HTMLElement {
    static styles: any;
    render(): unknown;
    requestUpdate(name?: string, oldValue?: unknown): void;
  }
  export const html: (strings: TemplateStringsArray, ...values: any[]) => unknown;
  export const css: (strings: TemplateStringsArray, ...values: any[]) => unknown;
  export function property(options?: any): (proto: any, name: string) => void;
}

declare module "lit/decorators.js" {
  export function customElement(name: string): (clazz: any) => any;
}

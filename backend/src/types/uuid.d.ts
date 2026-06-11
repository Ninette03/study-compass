declare module 'uuid' {
  export function v1(options?: any, buf?: any, offset?: number): string;
  export function v3(name: string, namespace: string, buf?: any, offset?: number): string;
  export function v4(options?: any, buf?: any, offset?: number): string;
  export function v5(name: string, namespace: string, buf?: any, offset?: number): string;
  export function validate(id: string): boolean;
  export function version(id: string): number;
  export function stringify(buf: Uint8Array, offset?: number): string;
  export function parse(id: string, buf?: any, offset?: number): Uint8Array;
}

/// <reference types="node" />

declare module 'silk-sdk' {
  import { Stream } from 'stream';

  interface DecodeOptions {
    quiet?: boolean;
    lossProb?: number;
    fsHz?: number;
  }

  function decode(options: DecodeOptions): Stream.Transform;

  export { decode };
}

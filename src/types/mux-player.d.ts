/// <reference types="vite/client" />

declare namespace JSX {
  interface IntrinsicElements {
    'mux-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      'playback-id'?: string;
      'metadata-video-title'?: string;
      'stream-type'?: string;
      'accent-color'?: string;
      ref?: React.Ref<HTMLElement>;
      style?: React.CSSProperties;
    };
  }
}

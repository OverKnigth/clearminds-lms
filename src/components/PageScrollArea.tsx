import type { ReactNode } from 'react';

type PageScrollTag = 'div' | 'main' | 'section';

type PageScrollAreaProps = {
  children: ReactNode;
  className?: string;
  as?: PageScrollTag;
};

/**
 * Contenedor con scroll vertical y barra temática; úsalo en el layout principal o en secciones que deban desplazarse con la página.
 */
export default function PageScrollArea({ children, className = '', as: Tag = 'div' }: PageScrollAreaProps) {
  return <Tag className={`overflow-y-auto min-h-0 custom-scrollbar ${className}`.trim()}>{children}</Tag>;
}

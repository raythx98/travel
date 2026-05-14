import type { ToolEvent } from '@/lib/types';
import styles from './ToolStatusBar.module.css';

interface Props {
  tools: ToolEvent[];
}

export default function ToolStatusBar({ tools }: Props) {
  if (tools.length === 0) return null;

  return (
    <div className={styles.bar}>
      {tools.map((tool) => (
        <span key={tool.name} className={styles.pill} data-status={tool.status}>
          <span className={`dot dot-${tool.status}`} />
          {tool.name}
        </span>
      ))}
    </div>
  );
}

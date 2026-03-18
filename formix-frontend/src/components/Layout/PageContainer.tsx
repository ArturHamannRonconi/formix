import styles from './PageContainer.module.css';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={`${styles.container}${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  );
}

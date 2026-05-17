import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  onClick?: () => void;
}

export const Card = ({ children, className = '', glass = false, onClick }: CardProps) => {
  return (
    <div 
      className={`${styles.card} ${glass ? styles.glass : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

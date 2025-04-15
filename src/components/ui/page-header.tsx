
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export const PageHeader = ({ 
  title, 
  description, 
  className 
}: PageHeaderProps) => {
  return (
    <div className={cn("space-y-1 mb-6", className)}>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};

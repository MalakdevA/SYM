import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-red-600 text-white hover:bg-red-700 shadow-lg':
              variant === 'default',
            'border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white':
              variant === 'outline',
            'hover:bg-gray-100': variant === 'ghost',
            'text-red-600 hover:underline': variant === 'link',
          },
          {
            'h-12 px-8 text-base': size === 'default',
            'h-10 px-6 text-sm': size === 'sm',
            'h-14 px-10 text-lg': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };

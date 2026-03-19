import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700 ring-indigo-300',
  secondary:
    'bg-amber-400 text-amber-900 hover:bg-amber-500 active:bg-amber-600 ring-amber-200',
  success:
    'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 ring-green-300',
  danger:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 ring-red-300',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-[48px] px-4 py-2 text-base rounded-xl',
  md: 'min-h-[48px] px-6 py-3 text-lg rounded-2xl',
  lg: 'min-h-[56px] px-8 py-4 text-xl rounded-2xl',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-bold
        transition-all duration-150 ease-in-out
        focus:outline-none focus:ring-4
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer select-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}

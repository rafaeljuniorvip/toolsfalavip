const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/30',
  secondary: 'bg-white text-slate-800 border border-slate-200 hover:bg-gray-50 hover:border-slate-300 shadow-sm',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/25 hover:shadow-lg hover:shadow-red-600/30',
  ghost: 'text-slate-500 hover:bg-gray-100 hover:text-slate-700',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({ children, variant = 'primary', size = 'md', className = '', disabled, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 cursor-pointer
        active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

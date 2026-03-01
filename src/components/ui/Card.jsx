export default function Card({ children, className = '', hover = true, ...props }) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm
        ${hover ? 'hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200' : ''}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

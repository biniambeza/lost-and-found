export default function Button({ children, className = '', variant = 'primary', type = 'button', ...props }) {
	const variantClass = variant === 'secondary' ? 'ghost-button' : 'submit-button'
	return (
		<button type={type} className={`${variantClass} ${className}`.trim()} {...props}>
			{children}
		</button>
	)
}

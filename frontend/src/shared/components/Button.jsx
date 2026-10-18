export default function Button({
	children,
	className = '',
	variant = 'primary',
	type = 'button',
	isLoading = false,
	...props
}) {
	const variantClasses = {
		primary: 'btn-primary',
		secondary: 'btn-secondary',
		danger: 'btn-danger',
		outline: 'btn-outline',
		success: 'btn-success',
	}

	const variantClass = variantClasses[variant] || 'btn-primary'

	return (
		<button
			type={type}
			className={`app-button ${variantClass} ${isLoading ? 'is-loading' : ''} ${className}`.trim()}
			disabled={isLoading || props.disabled}
			{...props}
		>
			{isLoading ? (
				<span className="btn-spinner" aria-hidden="true" />
			) : null}
			{children}
		</button>
	)
}

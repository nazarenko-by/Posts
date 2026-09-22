"use client";

// Епізод 12 (Stripe test mode, мок) — кіт явно каже (COMPONENTS.md, розділ
// про тости): "Тост ніколи не блокує дію. Для критичних помилок оплати —
// модальне вікно, а не тост." Це правило зафіксували ще в епізоді 8
// (ToastContext) як борг на майбутнє — тут нарешті виконано: відхилена
// мок-Stripe картка показує саме модалку, ToastContext/ToastViewport
// лишаються для некритичних сповіщень ("додано в кошик" тощо).

export function PaymentDeclinedModal({ message, onClose }: { message: string; onClose: () => void }) {
	return (
		<div
			role="presentation"
			className="fixed inset-0 z-40 flex items-center justify-center bg-fg/40 px-6"
			onClick={onClose}
		>
			<div
				role="alertdialog"
				aria-modal="true"
				aria-labelledby="payment-declined-title"
				onClick={(e) => e.stopPropagation()}
				className="z-50 w-full max-w-[400px] rounded-card border border-border bg-bg p-6 text-center shadow-lg"
			>
				<div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-danger-subtle text-danger">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
						<circle cx="12" cy="12" r="9" />
						<path d="M12 8v5" />
						<path d="M12 16h.01" />
					</svg>
				</div>
				<h2 id="payment-declined-title" className="text-[16px] font-semibold text-fg">
					Оплату відхилено
				</h2>
				<p className="mt-2 text-[13px] text-fg-muted">{message}</p>
				<p className="mt-3 font-mono text-[10.5px] text-fg-subtle">Stripe test mode · мок, гроші не списано</p>
				<button
					type="button"
					onClick={onClose}
					className="mt-5 h-10 w-full rounded-control bg-fg font-mono text-[13px] font-medium text-bg"
				>
					Спробувати ще раз
				</button>
			</div>
		</div>
	);
}

		'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import useMeasure from 'react-use-measure';
import * as VaulDrawer from 'vaul';

// Types
export interface MenuItem {
	id: string;
	label: string;
	description?: string;
	icon?: React.ComponentType<{ className?: string }>;
	submenu?: MenuItem[];
	onClick?: () => void;
}

export interface MenuProps {
	isOpen: boolean;
	onClose: () => void;
	menuData: MenuItem[];
}

type Direction = 1 | -1;

// Animation variants
const slideVariants = {
	initial: (direction: Direction) => ({
		x: `${110 * direction}%`,
		opacity: 0,
	}),
	active: {
		x: '0%',
		opacity: 1,
	},
	exit: (direction: Direction) => ({
		x: `${-110 * direction}%`,
		opacity: 0,
	}),
};

const ANIMATION_DURATION = 0.3;
const ANIMATION_EASING = [0.4, 0.0, 0.2, 1] as const;

export function Menu({ isOpen, onClose, menuData }: MenuProps) {
	const [menuHistory, setMenuHistory] = useState<MenuItem[][]>([menuData]);
	const [direction, setDirection] = useState<Direction>(1);
	const [elementRef, bounds] = useMeasure();
	const menuRef = useRef<HTMLDivElement>(null);

	const currentMenu = menuHistory[menuHistory.length - 1];
	const isRootLevel = menuHistory.length === 1;

	// Reset menu to root when opened
	useEffect(() => {
		if (isOpen) {
			setMenuHistory([menuData]);
			setDirection(1);
		}
	}, [isOpen, menuData]);

	// Navigation handlers
	const navigateToSubmenu = useCallback((submenu: MenuItem[]) => {
		setDirection(1);
		setMenuHistory((prev) => [...prev, submenu]);
	}, []);

	const navigateBack = useCallback(() => {
		if (menuHistory.length > 1) {
			setDirection(-1);
			setMenuHistory((prev) => prev.slice(0, -1));
		}
	}, [menuHistory.length]);

	const handleMenuItemClick = useCallback(
		(item: MenuItem) => {
			if (item.submenu?.length) {
				navigateToSubmenu(item.submenu);
				return;
			}

			if (item.onClick) {
				item.onClick();
				onClose();
			}
		},
		[navigateToSubmenu, onClose]
	);

	const handleClose = useCallback(() => {
		if (!isRootLevel) {
			navigateBack();
		} else {
			onClose();
		}
	}, [isRootLevel, navigateBack, onClose]);

	// Keyboard navigation
	const handleDialogKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				handleClose();
			}
		},
		[handleClose]
	);

	const handleItemKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLButtonElement>, item: MenuItem, index: number) => {
			const menuItems = menuRef.current?.querySelectorAll('[role="menuitem"]');
			if (!menuItems) return;

			const focusItem = (targetIndex: number) => {
				(menuItems[targetIndex] as HTMLElement)?.focus();
			};

			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					focusItem(Math.min(index + 1, menuItems.length - 1));
					break;
				case 'ArrowUp':
					e.preventDefault();
					focusItem(Math.max(index - 1, 0));
					break;
				case 'Home':
					e.preventDefault();
					focusItem(0);
					break;
				case 'End':
					e.preventDefault();
					focusItem(menuItems.length - 1);
					break;
				case 'Enter':
				case ' ':
					e.preventDefault();
					handleMenuItemClick(item);
					break;
			}
		},
		[handleMenuItemClick]
	);

	return (
		<VaulDrawer.Root open={isOpen} onOpenChange={onClose}>
			<VaulDrawer.Portal>
				<VaulDrawer.Overlay
					className='fixed inset-0 z-10 bg-black/30'
					onClick={onClose}
				/>
				<VaulDrawer.Content
					asChild
					className='fixed inset-x-4 bottom-4 z-10 mx-auto max-w-[400px] overflow-hidden rounded-[24px] bg-white outline-none shadow-2xl md:mx-auto md:w-full'
					aria-label='Navigation menu'
				>
					<motion.div
						animate={{ height: bounds.height }}
						transition={{ duration: 0.25, ease: ANIMATION_EASING }}
						role='dialog'
						aria-modal='true'
						tabIndex={-1}
						onKeyDown={handleDialogKeyDown}
					>
						<div ref={elementRef} className='relative'>
							<AnimatePresence initial={false} mode='popLayout' custom={direction}>
								<motion.div
									key={menuHistory.length}
									custom={direction}
									initial='initial'
									animate='active'
									exit='exit'
									variants={slideVariants}
									transition={{ duration: ANIMATION_DURATION, ease: ANIMATION_EASING }}
									className='overflow-hidden'
								>
									<div
										ref={menuRef}
										role='menu'
										aria-label={isRootLevel ? 'Menu' : currentMenu[0]?.label || 'Submenu'}
										className='p-5'
									>
										{/* Header */}
										{!isRootLevel && (
											<div className='mb-4 flex items-center gap-3'>
												<button
													type='button'
													onClick={navigateBack}
													className='flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md p-1 -ml-1'
													aria-label='Go back to previous menu'
												>
													<ChevronLeft className='w-5 h-5' />
													<span>Back</span>
												</button>
											</div>
										)}

										{/* Menu Items */}
										<div className='space-y-1'>
											{currentMenu.map((item, index) => {
												const hasSubmenu = Boolean(item.submenu?.length);
												const Icon = item.icon;

												return (
													<button
														type='button'
														key={item.id}
														role='menuitem'
														aria-haspopup={hasSubmenu ? 'menu' : undefined}
														aria-expanded={hasSubmenu ? false : undefined}
														onClick={() => handleMenuItemClick(item)}
														onKeyDown={(e) => handleItemKeyDown(e, item, index)}
														className='w-full flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 outline-none focus-visible:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset group'
													>
														{/* Icon */}
														{Icon && (
															<div className='flex-shrink-0 mt-0.5'>
																<Icon className='w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors' />
															</div>
														)}

														{/* Content */}
														<div className='flex-1 text-left min-w-0'>
															<div className='font-medium text-gray-900 text-sm leading-tight'>
																{item.label}
															</div>
															{item.description && (
																<div className='text-xs text-gray-500 mt-0.5 leading-relaxed'>
																	{item.description}
																</div>
															)}
														</div>

														{/* Arrow */}
														{hasSubmenu && (
															<div className='flex-shrink-0 mt-0.5'>
																<ChevronRight className='w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors' />
															</div>
														)}
													</button>
												);
											})}
										</div>
									</div>
								</motion.div>
							</AnimatePresence>
						</div>
					</motion.div>
				</VaulDrawer.Content>
			</VaulDrawer.Portal>
		</VaulDrawer.Root>
	);
}

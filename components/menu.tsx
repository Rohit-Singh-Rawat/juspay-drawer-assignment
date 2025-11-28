'use client';

import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import useMeasure from 'react-use-measure';
import * as VaulDrawer from 'vaul';

// TypeScript Types
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

type Direction = 'forward' | 'back';

export function Menu({ isOpen, onClose, menuData }: MenuProps) {
	const [menuHistory, setMenuHistory] = useState<MenuItem[][]>([menuData]);
	const [direction, setDirection] = useState<Direction>('forward');
	const [elementRef, bounds] = useMeasure();
	const menuRef = useRef<HTMLDivElement>(null);
	const firstItemRef = useRef<HTMLButtonElement>(null);

	const currentMenu = menuHistory[menuHistory.length - 1];
	const isRootLevel = menuHistory.length === 1;

	// Reset menu to root when opened
	useEffect(() => {
		if (isOpen) {
			setMenuHistory([menuData]);
			setDirection('forward');
		}
	}, [isOpen, menuData]);

	const handleMenuItemClick = useCallback(
		(item: MenuItem) => {
			const nextMenu = item.submenu;
			if (nextMenu && nextMenu.length > 0) {
				setDirection('forward');
				setMenuHistory((prev) => [...prev, nextMenu]);
				return;
			}

			if (item.onClick) {
				item.onClick();
				onClose();
			}
		},
		[onClose]
	);

	const handleBack = useCallback(() => {
		if (menuHistory.length > 1) {
			setDirection('back');
			setMenuHistory((prev) => prev.slice(0, -1));
		}
	}, [menuHistory.length]);

	const handleClose = useCallback(() => {
		if (!isRootLevel) {
			handleBack();
		} else {
			onClose();
		}
	}, [isRootLevel, handleBack, onClose]);

	// Keyboard navigation
	const handleKeyDown = useCallback(
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

			switch (e.key) {
				case 'ArrowDown': {
					e.preventDefault();
					const nextIndex = Math.min(index + 1, menuItems.length - 1);
					(menuItems[nextIndex] as HTMLElement)?.focus();
					break;
				}
				case 'ArrowUp': {
					e.preventDefault();
					const prevIndex = Math.max(index - 1, 0);
					(menuItems[prevIndex] as HTMLElement)?.focus();
					break;
				}
				case 'Home':
					e.preventDefault();
					(menuItems[0] as HTMLElement)?.focus();
					break;
				case 'End':
					e.preventDefault();
					(menuItems[menuItems.length - 1] as HTMLElement)?.focus();
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

	// Animation variants
	const slideVariants = {
		enterForward: {
			x: 0,
			opacity: 1,
			transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] as const },
		},
		exitForward: {
			x: '-100%',
			opacity: 0,
			transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] as const },
		},
		enterBack: {
			x: 0,
			opacity: 1,
			transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] as const },
		},
		exitBack: {
			x: '100%',
			opacity: 0,
			transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] as const },
		},
		initial: (direction: Direction) => ({
			x: direction === 'forward' ? '100%' : '-100%',
			opacity: 0,
		}),
	};

	return (
		<VaulDrawer.Root
			open={isOpen}
			onOpenChange={onClose}
		>
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
						transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
						role='dialog'
						aria-modal='true'
						tabIndex={-1}
						onKeyDown={handleKeyDown}
					>
						<div
							ref={elementRef}
							className='relative'
						>
							<AnimatePresence
								initial={false}
								mode='popLayout'
								custom={direction}
							>
								<motion.div
									key={menuHistory.length}
									custom={direction}
									initial='initial'
									animate={direction === 'forward' ? 'enterForward' : 'enterBack'}
									exit={direction === 'forward' ? 'exitForward' : 'exitBack'}
									variants={slideVariants}
									className='overflow-hidden'
								>
									<div
										ref={menuRef}
										role='menu'
										aria-label={isRootLevel ? 'Menu' : currentMenu[0]?.label || 'Submenu'}
										className='p-5'
									>
										{/* Header */}
										<div className='mb-4 flex items-center gap-3'>
											{!isRootLevel && (
												<button
													type='button'
													onClick={handleBack}
													className='flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1 -ml-1'
													aria-label='Go back to previous menu'
												>
													<ChevronLeft className='w-5 h-5' />
													<span>Back</span>
												</button>
											)}
										</div>

										{/* Menu Items */}
										<div className='space-y-1'>
											{currentMenu.map((item, index) => {
												const hasSubmenu = item.submenu && item.submenu.length > 0;
												const Icon = item.icon;

												return (
													<button
														type='button'
														key={item.id}
														ref={index === 0 ? firstItemRef : null}
														role='menuitem'
														aria-haspopup={hasSubmenu ? 'menu' : undefined}
														aria-expanded={hasSubmenu ? false : undefined}
														onClick={() => handleMenuItemClick(item)}
														onKeyDown={(e) => handleItemKeyDown(e, item, index)}
														className='w-full flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-inset group'
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

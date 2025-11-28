'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

// Animation constants
const ANIMATION_DURATION = 0.3;
const ANIMATION_EASING = [0.4, 0.0, 0.2, 1] as const;

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

// Helper function to find menu by path
const findMenuByPath = (rootMenu: MenuItem[], path: string[]): MenuItem[] => {
	if (path.length === 0) return rootMenu;

	let current: MenuItem[] = rootMenu;
	for (const id of path) {
		const found = current.find((item) => item.id === id);
		if (!found?.submenu) return rootMenu;
		current = found.submenu;
	}
	return current;
};

export function Menu({ isOpen, onClose, menuData }: MenuProps) {
	const [menuPath, setMenuPath] = useState<string[]>([]);
	const [direction, setDirection] = useState<Direction>(1);
	const [elementRef, bounds] = useMeasure();
	const menuRef = useRef<HTMLDivElement>(null);

	const currentMenu = useMemo(() => findMenuByPath(menuData, menuPath), [menuData, menuPath]);
	const isRootLevel = menuPath.length === 0;

	// Reset menu to root when opened
	useEffect(() => {
		if (isOpen) {
			setMenuPath([]);
			setDirection(1);
		}
	}, [isOpen]);

	// Navigation handlers
	const navigateToSubmenu = useCallback((itemId: string) => {
		setDirection(1);
		setMenuPath((prev) => [...prev, itemId]);
	}, []);

	const navigateBack = useCallback(() => {
		if (menuPath.length > 0) {
			setDirection(-1);
			setMenuPath((prev) => prev.slice(0, -1));
		}
	}, [menuPath.length]);

	const handleMenuItemClick = useCallback(
		(item: MenuItem) => {
			if (item.submenu?.length) {
				navigateToSubmenu(item.id);
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
					className='fixed inset-x-4 bottom-4 z-10 mx-auto max-w-[400px] overflow-hidden rounded-[20px] bg-white shadow-2xl outline-none sm:rounded-[24px] md:w-full'
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
									key={menuPath.length}
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
										className='p-3 sm:p-4 md:p-5'
									>
										{/* Header */}
										{!isRootLevel && (
											<div className='mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3'>
												<button
													type='button'
													onClick={navigateBack}
													className='-ml-1 flex items-center gap-1.5 rounded-md p-1 text-xs font-medium text-gray-700 outline-none transition-colors hover:text-gray-900 focus-visible:ring-0 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:gap-2 sm:text-sm'
													aria-label='Go back to previous menu'
												>
													<ChevronLeft className='h-4 w-4 sm:h-5 sm:w-5' />
													<span>Back</span>
												</button>
											</div>
										)}

										{/* Menu Items */}
										<div className='space-y-0.5 sm:space-y-1'>
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
														className='group flex w-full items-start gap-2 rounded-lg px-2 py-1.5 outline-none transition-colors duration-150 hover:bg-gray-50 focus-visible:bg-gray-100 focus-visible:ring-0 focus-visible:ring-inset focus-visible:ring-blue-500 sm:gap-3 sm:px-3 sm:py-3'
													>
														{Icon && (
															<div className='mt-0.5 shrink-0'>
																<Icon className='h-4 w-4 text-gray-600 transition-colors group-hover:text-gray-900 sm:h-5 sm:w-5' />
															</div>
														)}

														<div className='min-w-0 flex-1 text-left'>
															<div className='text-sm font-normal leading-tight text-black'>
																{item.label}
															</div>
															{item.description && (
																<div className='mt-0.5 text-xs leading-relaxed text-gray-500'>
																	{item.description}
																</div>
															)}
														</div>

														{hasSubmenu && (
															<div className='mt-0.5 flex-shrink-0'>
																<ChevronRight className='h-4 w-4 text-gray-400 transition-colors group-hover:text-gray-600 sm:h-5 sm:w-5' />
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

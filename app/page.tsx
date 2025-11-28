'use client';

import { useState } from 'react';
import { Menu } from '@/components/menu';
import { navigationMenu } from '@/navigation';


export default function Page() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<main className='flex min-h-screen flex-col items-center justify-center bg-white'>
			<button
				type='button'
				className=' rounded-3xl border-2 border-blue-500 bg-blue-500 p-2 px-5 font-normal text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-blue-500/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 active:scale-95'
				onClick={() => setIsMenuOpen(true)}
			>
				Open Menu
			</button>

			<Menu
				isOpen={isMenuOpen}
				onClose={() => setIsMenuOpen(false)}
				menuData={navigationMenu}
			/>
		</main>
	);
}

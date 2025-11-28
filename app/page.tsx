'use client';

import {
	BookOpen,
	Briefcase,
	Building2,
	Code2,
	Cloud,
	Database,
	Factory,
	FlaskConical,
	GitBranch,
	GraduationCap,
	Grid3x3,
	HeadphonesIcon,
	Home,
	Leaf,
	Lightbulb,
	Mail,
	Shield,
	Target,
	TrendingUp,
	UserCog,
	Users,
} from 'lucide-react';
import { useState } from 'react';
import type { MenuItem } from '@/components/menu';
import { Menu } from '@/components/menu';

const navigationMenu: MenuItem[] = [
	{
		id: 'home',
		label: 'Home',
		description: 'Welcome to our comprehensive platform',
		icon: Home,
	},
	{
		id: 'products-services',
		label: 'Products & Services',
		description: 'Explore our comprehensive offerings',
		icon: Grid3x3,
		submenu: [
			{
				id: 'software-solutions',
				label: 'Software Solutions',
				description: 'Custom software development and deployment',
				icon: Code2,
			},
			{
				id: 'cloud-infrastructure',
				label: 'Cloud & Infrastructure',
				description: 'Scalable cloud solutions and infrastructure',
				icon: Cloud,
			},
			{
				id: 'consulting-services',
				label: 'Consulting Services',
				description: 'Expert guidance and strategic support',
				icon: Users,
				submenu: [
					{
						id: 'technical-consulting',
						label: 'Technical Consulting',
						description: 'Architecture and implementation guidance',
						icon: Code2,
						submenu: [
							{
								id: 'system-architecture',
								label: 'System Architecture',
								description: 'Scalable system design and planning',
								icon: Grid3x3,
							},
							{
								id: 'performance-optimization',
								label: 'Performance Optimization',
								description: 'Application and system optimization',
								icon: Cloud,
							},
							{
								id: 'security-audits',
								label: 'Security Audits',
								description: 'Comprehensive security assessments',
								icon: Shield,
							},
						],
					},
					{
						id: 'business-strategy',
						label: 'Business Strategy',
						description: 'Digital transformation and business planning',
						icon: Briefcase,
					},
					{
						id: 'training-workshops',
						label: 'Training & Workshops',
						description: 'Team skill development and knowledge transfer',
						icon: GraduationCap,
						submenu: [
							{
								id: 'technical-training',
								label: 'Technical Training',
								description: 'Programming and technology skills',
								icon: Code2,
							},
							{
								id: 'agile-methodologies',
								label: 'Agile Methodologies',
								description: 'Scrum, Kanban, and agile practices',
								icon: Target,
							},
							{
								id: 'leadership-management',
								label: 'Leadership & Management',
								description: 'Technical leadership and team management',
								icon: UserCog,
							},
						],
					},
				],
			},
			{
				id: 'digital-transformation',
				label: 'Digital Transformation',
				description: 'Comprehensive digital transformation strategies',
				icon: Lightbulb,
			},
			{
				id: 'cybersecurity-consulting',
				label: 'Cybersecurity Consulting',
				description: 'Comprehensive cybersecurity services and solutions',
				icon: Shield,
			},
			{
				id: 'data-analytics',
				label: 'Data & Analytics Consulting',
				description: 'Data strategy, analytics, and business intelligence',
				icon: Database,
			},
			{
				id: 'devops-platform',
				label: 'DevOps & Platform Engineering',
				description: 'DevOps transformation and platform engineering',
				icon: GitBranch,
			},
			{
				id: 'support-maintenance',
				label: 'Support & Maintenance',
				description: 'Ongoing maintenance and support services',
				icon: HeadphonesIcon,
			},
		],
	},
	{
		id: 'industry-solutions',
		label: 'Industry Solutions',
		description: 'Specialized solutions for different industries',
		icon: Factory,
	},
	{
		id: 'company',
		label: 'Company',
		description: 'Learn about our organization and culture',
		icon: Building2,
	},
	{
		id: 'resources',
		label: 'Resources',
		description: 'Knowledge base, tools, and learning materials',
		icon: BookOpen,
	},
	{
		id: 'support',
		label: 'Support',
		description: 'Get help and support when you need it',
		icon: HeadphonesIcon,
	},
	{
		id: 'research-innovation',
		label: 'Research & Innovation',
		description: 'Cutting-edge research and innovation initiatives',
		icon: FlaskConical,
	},
	{
		id: 'sustainability',
		label: 'Sustainability',
		description: 'Environmental responsibility and sustainable technology',
		icon: Leaf,
	},
	{
		id: 'investor-relations',
		label: 'Investor Relations',
		description: 'Financial information and investor resources',
		icon: TrendingUp,
	},
	{
		id: 'contact',
		label: 'Contact',
		description: 'Get in touch with our team',
		icon: Mail,
	},
];

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

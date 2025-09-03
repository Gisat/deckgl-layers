import React from "react";
import classnames from "classnames";
import Link from "next/link";
import { Card, Text } from '@mantine/core';
import "./Navigation.css";

/**
 * Props for the NavigationLink component.
 *
 * @property {boolean} [condensed] - Optional flag to render the link in a condensed format.
 * @property {() => void} [onClick] - Optional callback function triggered when the link is clicked.
 * @property {string} href - The URL the link points to.
 * @property {string} title - The title text displayed for the link.
 * @property {React.ReactNode} children - Additional content displayed below the title in non-condensed mode.
 */
interface NavigationLinkProps {
	condensed?: boolean;
	onClick?: () => void;
	href: string;
	title: string;
	children: React.ReactNode;
}

/**
 * NavigationLink component that renders a navigation link.
 *
 * This component supports two modes:
 * - Condensed: Renders a simple list item with a title.
 * - Default: Renders a styled card with a title and additional content.
 *
 * @param {NavigationLinkProps} props - The props for the component.
 * @param {boolean} [props.condensed] - If true, renders the link in a condensed format.
 * @param {() => void} [props.onClick] - Callback function triggered when the link is clicked.
 * @param {string} props.href - The URL the link points to.
 * @param {string} props.title - The title text displayed for the link.
 * @param {React.ReactNode} props.children - Additional content displayed below the title in non-condensed mode.
 *
 * @returns {JSX.Element} The rendered navigation link.
 */
const NavigationLink = ({ condensed, onClick, href, title, children }: NavigationLinkProps) => {
	if (condensed) {
		// Render a simple list item with a title in condensed mode
		return <li><Link onClick={onClick} href={href}>{title}</Link></li>;
	} else {
		// Render a styled card with a title and additional content in default mode
		return (
			<li>
				<Link onClick={onClick} href={href}>
					<Card className="dgl-NavigationLink-card" shadow="sm" padding="lg" radius="md" withBorder>
						<Text fw={500}>{title}</Text>
						<Text size="sm" c="dimmed">
							{children}
						</Text>
					</Card>
				</Link>
			</li>
		);
	}
}



/**
 * Props for the Navigation component.
 *
 * @property {boolean} [hideHomeLink] - Optional flag to hide the "Home" link.
 * @property {() => void} [onLinkClick] - Optional callback function triggered when a link is clicked.
 */
interface NavigationProps {
	condensed?: boolean;
	hideHomeLink?: boolean;
	onLinkClick?: () => void;
}

/**
 * Navigation component that renders a navigation menu with optional links.
 *
 * @param {NavigationProps} props - The props for the component.
 * @param {boolean} [props.hideHomeLink] - If true, the "Home" link will be hidden.
 * @param {() => void} [props.onLinkClick] - Callback function triggered when a demo link is clicked.
 *
 * @returns {JSX.Element} The rendered navigation menu.
 */
export const Navigation = ({condensed, hideHomeLink, onLinkClick}: NavigationProps) => {
	const classes = classnames("dgl-Navigation", {
		"is-condensed": condensed,
	});
	
	return (
		<nav className={classes}>
			{/* Main navigation list */}
			<ul>
				{/* Conditionally render the "Home" link based on the hideHomeLink prop */}
				{!hideHomeLink && <li><Link href="/">Home</Link></li>}
			</ul>
			<h2>Demos</h2>
			{/* Demo links section */}
			<ul>
				<NavigationLink condensed={condensed} onClick={onLinkClick} href="/demos/georgia" title="COG in debug mode (Georgia)">Rendering a single-band COG in a debug mode</NavigationLink>
				<NavigationLink condensed={condensed} onClick={onLinkClick} href="/demos/africa" title="Large multiband COG (Africa)">Rendering a single band from a large multiband COG</NavigationLink>
				<NavigationLink condensed={condensed} onClick={onLinkClick} href="/demos/kazakhstan" title="Large singleband COG (Kazakhstan)">Rendering a single band from a large singleband COG</NavigationLink>
			</ul>
		</nav>
	);
}
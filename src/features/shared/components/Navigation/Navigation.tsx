import Link from "next/link";
import "./Navigation.css";

/**
 * Props for the Navigation component.
 *
 * @property {boolean} [hideHomeLink] - Optional flag to hide the "Home" link.
 * @property {() => void} [onLinkClick] - Optional callback function triggered when a link is clicked.
 */
interface NavigationProps {
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
export const Navigation = ({hideHomeLink, onLinkClick}: NavigationProps) => {
	return (
		<nav className="dgl-Navigation">
			{/* Main navigation list */}
			<ul>
				{/* Conditionally render the "Home" link based on the hideHomeLink prop */}
				{!hideHomeLink && <li><Link href="/">Home</Link></li>}
			</ul>
			<h2>Demos</h2>
			{/* Demo links section */}
			<ul>
				<li><Link onClick={onLinkClick} href="/demos/georgia">Georgia Demo</Link></li>
				<li><Link onClick={onLinkClick} href="/demos/africa">Africa Demo</Link></li>
			</ul>
		</nav>
	);
}
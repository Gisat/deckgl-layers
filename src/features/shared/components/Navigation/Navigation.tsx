import Link from "next/link";
import "./Navigation.css";

export const Navigation = ({hideHomeLink}: {hideHomeLink: boolean}) => {
	return (
		<nav className="dgl-Navigation">
			<ul>
				{!hideHomeLink && <li><Link href="/">Home</Link></li>}
			</ul>
			<h2>Demos</h2>
			<ul>
				<li><Link href="/demos/georgia">Georgia Demo</Link></li>
				<li><Link href="/demos/africa">Africa Demo</Link></li>
			</ul>
		</nav>
	);
}
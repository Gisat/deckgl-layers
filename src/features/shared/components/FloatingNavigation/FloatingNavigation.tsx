"use client";
import {useState} from "react";

import {ActionIcon, Drawer} from "@mantine/core";
import {Navigation} from "@features/shared/components/Navigation/Navigation";
import "./FloatingNavigation.css";

/**
 * FloatingNavigation component that provides a floating navigation menu.
 *
 * This component includes a toggleable drawer that displays the `Navigation` component.
 * It uses the `ActionIcon` as a control to open and close the drawer.
 *
 * @returns {JSX.Element} The rendered FloatingNavigation component.
 */
export const FloatingNavigation = () => {
	/** Tracks whether the drawer is open. */
	const [opened, setOpen] = useState(false);

	return (
		<>
			<Drawer
				opened={opened}
				onClose={() => setOpen(false)}
				position="right"
				overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
			>
				<Navigation condensed onLinkClick={() => setOpen(false)}/>
			</Drawer>

			<ActionIcon
				className="dgl-FloatingNavigation-control"
				variant="filled"
				radius="xl"
				onClick={() => setOpen(!opened)}
				size="lg"
			>
				☰
			</ActionIcon>
		</>
	);
}
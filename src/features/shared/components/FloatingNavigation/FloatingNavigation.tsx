"use client";
import {useState} from "react";

import {ActionIcon, Drawer} from "@mantine/core";
import {Navigation} from "@features/shared/components/Navigation/Navigation";
import "./FloatingNavigation.css";

export const FloatingNavigation = () => {
	const [opened, setOpen] = useState(false);
	
	return (
		<>
			<Drawer
				opened={opened}
				onClose={() => setOpen(false)}
				position="right"
				overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
			>
				<Navigation/>
			</Drawer>
			
			<ActionIcon className="dgl-FloatingNavigation-control" variant="filled" radius="xl" onClick={()=>setOpen(!opened)} size="lg">
				☰
			</ActionIcon>
		</>
	);
}
import {
	FloatingNavigation
} from "@features/shared/components/FloatingNavigation/FloatingNavigation";

export default function DemosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
	  <main>
		{children}
		  <FloatingNavigation />
	  </main>
  );
}
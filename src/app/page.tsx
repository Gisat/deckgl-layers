import {Navigation} from "@features/shared/components/Navigation/Navigation";

export default function Home() {
  return (
      <main className="dgl-Home">
		  <h1>COG library documentation</h1>
        <Navigation hideHomeLink/>
      </main>
  );
}

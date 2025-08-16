import VintageCamera from "../components/VintageCamera.jsx";

export default function Home(){
  return (
    <main className="pageContent" aria-labelledby="homeTitle">
      <h1 id="homeTitle" className="sr-only">Vintage Snap Camera</h1>
      <VintageCamera />
    </main>
  );
}

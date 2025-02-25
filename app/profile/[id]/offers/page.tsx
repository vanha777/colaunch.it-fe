import Main from "./components/main";
export const revalidate = 0
export default async function IdeaPage({ params }: { params: { id: string } }) {
  console.log('user ID:', params.id);
  return (
    <Main />
  );
}

import IdeaCard from "./components/ideaCard";
import SimpleNavBar from "./components/simpleNavBar";

export default function IdeaPage({ params }: { params: { id: string } }) {
  console.log('Path ID:', params.id);
  // fetch idea from supabase
  // fetch that idea deals from supabase
  const ideas = {
    title: "Revolutionary Smart Home Device",
    description: "A new IoT device that integrates with existing home automation systems while providing enhanced security features and energy optimization",
    date: "2024-03-20",
    location: "San Francisco, CA",
    industry: "Technology",
    images: [
      "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/archery",
      "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/basketball"
    ],
    upvotes: 156,
    downvotes: 12,
    dealInfo: {
      createdDate: "2024-01-15",
      active: true,
      comission: 25,
      type:"increase-sales",
      description:"You get comission for every sale",
      totalDeals: 24
    }
  }
  return (
    <>
      <SimpleNavBar />
      <div className="container mx-auto p-4">
        <IdeaCard
          idea={ideas}
        />
      </div>
    </>

  );
}

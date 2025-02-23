import { redirect } from "next/navigation";
import IdeaCard, { IdeaProps, OfferProps } from "./components/ideaCard";
import SimpleNavBar from "./components/simpleNavBar";
import { Db, Server } from "@/app/utils/db";
export default async function IdeaPage({ params }: { params: { id: string } }) {
  console.log('Path ID:', params.id);
  // fetch idea from supabase with related data
  const { data: ideaData, error: ideaError } = await Db
    .from('ideas')
    .select(`
      *,
      address_detail!inner (*)
    `)
    .eq('id', params.id)
    .limit(1).single();

  if (!ideaData || ideaData.length === 0) {
    console.log("ideaData not found");
    redirect('/not-found');
  }
  const { data: offersData, error: offerError } = await Db
    .from('offers')
    .select(`
    *
  `)
    .eq('idea_id', params.id)
    .limit(1).single();
  let parsedIdea = JSON.parse(JSON.stringify(ideaData)) as IdeaProps;
  if (offersData) {
    parsedIdea.offer = JSON.parse(JSON.stringify(offersData)) as OfferProps;
  }
  console.log("parsedIdea", parsedIdea);
  // fetch that idea deals from supabase
  // const ideas = {
  //   id: 1,
  //   title: "Revolutionary Smart Home Device",
  //   description: `🏠 Revolutionizing Smart Living: Introducing the next generation of home automation that seamlessly connects your entire ecosystem. 
  //   Our cutting-edge IoT solution not only integrates flawlessly with your existing smart home setup but takes it to the next level with military-grade security and AI-powered energy optimization. 
  //   Save up to 40% on energy bills while enjoying peace of mind with real-time threat detection. 
  //   The future of smart homes is here - are you ready to transform your living space? 🚀✨`,
  //   date: "2024-03-20",
  //   address_detail: {
  //     country: "United States",
  //     state: "California",
  //     suburb: "San Francisco",
  //   },
  //   industry: "Technology",
  //   media: [
  //     "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/archery",
  //     "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/basketball",
  //     "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/basketball",
  //     "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/basketball",
  //     "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/basketball",
  //     "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/basketball",
  //   ],
  //   upvotes: 156,
  //   downvotes: 12,
  //   offer: {
  //     id: 1,
  //     created_at: "2024-01-15",
  //     active: true,
  //     comission: 25,
  //     type: "increase-sales",
  //     description: "Join our winning sales team! Earn lucrative commissions on every successful deal. Be part of our growth story and unlock unlimited earning potential while helping innovative products reach the market.",
  //     totalDeals: 24
  //   }
  // }
  return (
    <>
      <SimpleNavBar />
      <div className="container mx-auto p-4">
        <IdeaCard
          idea={parsedIdea as IdeaProps}
        />
      </div>
    </>

  );
}

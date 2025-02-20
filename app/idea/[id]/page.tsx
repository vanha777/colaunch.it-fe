interface IdeaProps {
  title: string;
  description: string;
  date?: string; // Optional prop with '?'
}

const IdeaCard = ({ title, description, date }: IdeaProps) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold">{title}</h2>
      {date && <p className="text-sm text-gray-500">{date}</p>}
      <p className="mt-2">{description}</p>
    </div>
  );
};

export default function IdeaPage() {
  return (
    <div className="container mx-auto p-4">
      <IdeaCard
        title="My First Idea"
        description="This is a sample idea component with props"
        date="2024-03-20"
      />
    </div>
  );
}

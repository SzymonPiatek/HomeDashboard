import { Tile } from "@/components/ui/Tile";
import { ELEMENT_REGISTRY } from "@/features/dashboard/lib/element-registry";

export default function DashboardPage() {
  const elements = Object.values(ELEMENT_REGISTRY);

  return (
    <>
      <h1 className="sr-only">Pulpit domowy</h1>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
        {elements.map((element) => (
          <Tile key={element.path} href={element.path} label={element.label} icon={element.icon} />
        ))}
      </div>
    </>
  );
}

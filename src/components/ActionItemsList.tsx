import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionItem, ActionItemCard } from "./ActionItemCard";

interface ActionItemsListProps {
  items: ActionItem[];
  onReset: () => void;
}

export const ActionItemsList = ({ items, onReset }: ActionItemsListProps) => {
  const handleExport = () => {
    const csv = [
      ["Action", "Owner", "Deadline", "Priority"],
      ...items.map((item) => [item.action, item.owner, item.deadline, item.priority]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `action-items-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Extracted Action Items</h2>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? "task" : "tasks"} identified
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
          <Button onClick={handleExport} className="bg-gradient-to-r from-primary to-accent">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <ActionItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

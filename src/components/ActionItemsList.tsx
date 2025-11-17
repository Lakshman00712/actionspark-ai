import { Download, RefreshCw, Search, Link as LinkIcon, Filter, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionItem, ActionItemCard } from "./ActionItemCard";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActionItemsListProps {
  items: ActionItem[];
  analysisId: string;
  onReset: () => void;
  onUpdate: (items: ActionItem[]) => void;
}

export const ActionItemsList = ({ items, analysisId, onReset, onUpdate }: ActionItemsListProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("priority");
  const [showCompleted, setShowCompleted] = useState(true);

  const handleExport = () => {
    const csv = [
      ["Action", "Owner", "Deadline", "Priority", "Remarks", "Status"],
      ...items.map((item) => [
        item.action,
        item.owner,
        item.deadline,
        item.priority,
        item.remarks || "",
        item.completed ? "Completed" : "Pending"
      ]),
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

  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}/share/${analysisId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateItem = async (updatedItem: ActionItem) => {
    try {
      const { error } = await supabase
        .from("action_items")
        .update({
          remarks: updatedItem.remarks,
          completed: updatedItem.completed,
        })
        .eq("id", updatedItem.id);

      if (error) throw error;

      const newItems = items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      );
      onUpdate(newItems);
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "Failed to update action item.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("action_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      const newItems = items.filter((item) => item.id !== id);
      onUpdate(newItems);

      toast({
        title: "Deleted",
        description: "Action item has been removed.",
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete action item.",
        variant: "destructive",
      });
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const matchesSearch = 
        item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deadline.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPriority = filterPriority === "all" || item.priority === filterPriority;
      const matchesCompleted = showCompleted || !item.completed;

      return matchesSearch && matchesPriority && matchesCompleted;
    });

    filtered.sort((a, b) => {
      if (sortBy === "priority") {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === "owner") {
        return a.owner.localeCompare(b.owner);
      } else if (sortBy === "deadline") {
        return a.deadline.localeCompare(b.deadline);
      }
      return 0;
    });

    return filtered;
  }, [items, searchQuery, filterPriority, sortBy, showCompleted]);

  const completedCount = items.filter(item => item.completed).length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Extracted Action Items</h2>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? "task" : "tasks"} identified
            {completedCount > 0 && ` • ${completedCount} completed`}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={onReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
          <Button variant="outline" onClick={handleShareLink}>
            <LinkIcon className="w-4 h-4 mr-2" />
            Share Link
          </Button>
          <Button onClick={handleExport} className="bg-gradient-to-r from-primary to-accent">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search action items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[140px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px]">
            <SortAsc className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="deadline">Deadline</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={showCompleted ? "default" : "outline"}
          onClick={() => setShowCompleted(!showCompleted)}
        >
          {showCompleted ? "Hide" : "Show"} Completed
        </Button>
      </div>

      <div className="space-y-3">
        {filteredAndSortedItems.length > 0 ? (
          filteredAndSortedItems.map((item) => (
            <ActionItemCard
              key={item.id}
              item={item}
              onUpdate={handleUpdateItem}
              onDelete={handleDeleteItem}
              editable
            />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No action items match your filters
          </div>
        )}
      </div>
    </div>
  );
};

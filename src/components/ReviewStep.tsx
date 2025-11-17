import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ActionItem, ActionItemCard } from "./ActionItemCard";
import { CheckCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ReviewStepProps {
  items: ActionItem[];
  highlights: string[];
  onConfirm: (items: ActionItem[]) => void;
  onCancel: () => void;
}

export const ReviewStep = ({ items, highlights, onConfirm, onCancel }: ReviewStepProps) => {
  const [editedItems, setEditedItems] = useState<ActionItem[]>(items);

  const handleUpdateItem = (updatedItem: ActionItem) => {
    setEditedItems(prev =>
      prev.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
  };

  const handleDeleteItem = (id: string) => {
    setEditedItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Review Extracted Items</h2>
        <p className="text-muted-foreground">
          Review, edit, and add remarks before saving
        </p>
      </div>

      {highlights.length > 0 && (
        <Card className="p-6 bg-accent/20 border-accent">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-3">Meeting Highlights</h3>
              <ul className="space-y-2">
                {highlights.map((highlight, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {editedItems.map((item) => (
          <ActionItemCard
            key={item.id}
            item={item}
            onUpdate={handleUpdateItem}
            onDelete={handleDeleteItem}
            editable
          />
        ))}
      </div>

      {editedItems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          All items have been removed. Add at least one item to continue.
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={() => onConfirm(editedItems)}
          disabled={editedItems.length === 0}
          className="bg-gradient-to-r from-primary to-accent"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Confirm & Save
        </Button>
      </div>
    </div>
  );
};

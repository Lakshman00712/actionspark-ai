import { Calendar, User, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

export interface ActionItem {
  id: string;
  action: string;
  owner: string;
  deadline: string;
  priority: "high" | "medium" | "low";
  remarks?: string;
  completed?: boolean;
}

interface ActionItemCardProps {
  item: ActionItem;
  onUpdate?: (item: ActionItem) => void;
  onDelete?: (id: string) => void;
  editable?: boolean;
}

const priorityConfig = {
  high: {
    variant: "destructive" as const,
    label: "High Priority",
  },
  medium: {
    variant: "default" as const,
    label: "Medium Priority",
  },
  low: {
    variant: "secondary" as const,
    label: "Low Priority",
  },
};

export const ActionItemCard = ({ item, onUpdate, onDelete, editable = false }: ActionItemCardProps) => {
  const config = priorityConfig[item.priority];
  const [remarks, setRemarks] = useState(item.remarks || "");
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);

  const handleRemarksBlur = () => {
    setIsEditingRemarks(false);
    if (remarks !== item.remarks && onUpdate) {
      onUpdate({ ...item, remarks });
    }
  };

  const handleComplete = () => {
    if (onUpdate) {
      onUpdate({ ...item, completed: !item.completed });
    }
  };

  return (
    <div className={`bg-card border rounded-lg p-5 hover:shadow-lg transition-all duration-200 space-y-3 ${item.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-2">
            {editable && (
              <Checkbox 
                checked={item.completed} 
                onCheckedChange={handleComplete}
                className="mt-1"
              />
            )}
            <p className={`font-medium leading-relaxed flex-1 ${item.completed ? 'line-through' : ''}`}>
              {item.action}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{item.owner}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{item.deadline}</span>
            </div>
          </div>

          {(editable || item.remarks) && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Remarks</label>
              {editable ? (
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  onFocus={() => setIsEditingRemarks(true)}
                  onBlur={handleRemarksBlur}
                  placeholder="Add remarks or notes..."
                  className="min-h-[60px] resize-none"
                />
              ) : (
                item.remarks && (
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                    {item.remarks}
                  </p>
                )
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 items-end">
          <Badge variant={config.variant} className="flex items-center gap-1 whitespace-nowrap">
            <AlertCircle className="w-3 h-3" />
            {config.label}
          </Badge>

          {editable && onDelete && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete(item.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

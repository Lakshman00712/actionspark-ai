import { Calendar, User, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ActionItem {
  id: string;
  action: string;
  owner: string;
  deadline: string;
  priority: "high" | "medium" | "low";
}

interface ActionItemCardProps {
  item: ActionItem;
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

export const ActionItemCard = ({ item }: ActionItemCardProps) => {
  const config = priorityConfig[item.priority];

  return (
    <div className="bg-card border rounded-lg p-5 hover:shadow-lg transition-all duration-200 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <p className="font-medium leading-relaxed">{item.action}</p>
          
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
        </div>

        <Badge variant={config.variant} className="flex items-center gap-1 whitespace-nowrap">
          <AlertCircle className="w-3 h-3" />
          {config.label}
        </Badge>
      </div>
    </div>
  );
};

import { History, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Analysis {
  id: string;
  title: string | null;
  created_at: string;
  transcript: string;
}

interface HistoryDrawerProps {
  onSelectAnalysis: (id: string) => void;
}

export const HistoryDrawer = ({ onSelectAnalysis }: HistoryDrawerProps) => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("analyses")
        .select("id, title, created_at, transcript")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error("Error loading history:", error);
      toast({
        title: "Error",
        description: "Failed to load analysis history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" onClick={loadHistory}>
          <History className="w-4 h-4 mr-2" />
          History
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Analysis History</SheetTitle>
          <SheetDescription>
            View and load previous meeting analyses
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading history...
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No previous analyses found
            </div>
          ) : (
            <div className="space-y-3">
              {analyses.map((analysis) => (
                <button
                  key={analysis.id}
                  onClick={() => onSelectAnalysis(analysis.id)}
                  className="w-full text-left p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {analysis.title || "Untitled Analysis"}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(analysis.created_at).toLocaleDateString()} at{" "}
                          {new Date(analysis.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {analysis.transcript.substring(0, 150)}...
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

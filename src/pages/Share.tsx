import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const Share = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const downloadCSV = async () => {
      if (!id) {
        setError("Invalid share link");
        setLoading(false);
        return;
      }

      try {
        // Fetch the analysis and action items
        const { data: itemsData, error: itemsError } = await supabase
          .from("action_items")
          .select("*")
          .eq("analysis_id", id);

        if (itemsError) throw itemsError;

        if (!itemsData || itemsData.length === 0) {
          setError("No action items found for this analysis");
          setLoading(false);
          return;
        }

        // Generate CSV
        const csv = [
          ["Action", "Owner", "Deadline", "Priority", "Remarks", "Status"],
          ...itemsData.map((item) => [
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

        // Trigger download
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `action-items-${id.substring(0, 8)}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        setLoading(false);
      } catch (err) {
        console.error("Error downloading CSV:", err);
        setError("Failed to download action items");
        setLoading(false);
      }
    };

    downloadCSV();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <FileText className="w-16 h-16 text-primary mx-auto animate-pulse" />
          <h2 className="text-2xl font-bold">Preparing your download...</h2>
          <p className="text-muted-foreground">
            Your action items CSV will download shortly
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <FileText className="w-16 h-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold">Download Failed</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.href = "/"}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Download className="w-16 h-16 text-success mx-auto" />
        <h2 className="text-2xl font-bold">Download Complete!</h2>
        <p className="text-muted-foreground">
          Your action items have been downloaded successfully
        </p>
        <Button onClick={() => window.location.href = "/"}>
          Go to Home
        </Button>
      </div>
    </div>
  );
};

export default Share;

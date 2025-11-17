import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ActionItemsList } from "@/components/ActionItemsList";
import { ReviewStep } from "@/components/ReviewStep";
import { HistoryDrawer } from "@/components/HistoryDrawer";
import { ActionItem } from "@/components/ActionItemCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string>("");
  const { toast } = useToast();

  const handleTranscriptSubmit = async (transcript: string) => {
    setIsProcessing(true);
    setCurrentTranscript(transcript);
    
    try {
      console.log("Calling extract-action-items function");
      
      const { data, error } = await supabase.functions.invoke("extract-action-items", {
        body: { transcript },
      });

      if (error) throw error;

      console.log("Received action items:", data.items.length);
      
      // Generate highlights
      const generatedHighlights = [
        "Key decisions and commitments identified",
        `${data.items.length} actionable tasks extracted`,
        "Owners and deadlines assigned to all items",
      ];
      
      setActionItems(data.items);
      setHighlights(generatedHighlights);
      setIsReviewing(true);
      
      toast({
        title: "Success!",
        description: `Extracted ${data.items.length} action items. Please review before saving.`,
      });
    } catch (error) {
      console.error("Error extracting action items:", error);
      toast({
        title: "Error",
        description: "Failed to extract action items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReview = async (confirmedItems: ActionItem[]) => {
    try {
      // Save analysis to database
      const { data: analysisData, error: analysisError } = await supabase
        .from("analyses")
        .insert({
          transcript: currentTranscript,
          title: `Meeting Analysis - ${new Date().toLocaleDateString()}`,
        })
        .select()
        .single();

      if (analysisError) throw analysisError;

      // Save action items
      const itemsToInsert = confirmedItems.map(item => ({
        analysis_id: analysisData.id,
        action: item.action,
        owner: item.owner,
        deadline: item.deadline,
        priority: item.priority,
        remarks: item.remarks || null,
        completed: false,
      }));

      const { data: itemsData, error: itemsError } = await supabase
        .from("action_items")
        .insert(itemsToInsert)
        .select();

      if (itemsError) throw itemsError;

      // Update action items with database IDs
      const savedItems = confirmedItems.map((item, index) => ({
        ...item,
        id: itemsData[index].id,
      }));

      setActionItems(savedItems);
      setCurrentAnalysisId(analysisData.id);
      setIsReviewing(false);

      toast({
        title: "Saved!",
        description: "Action items have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving items:", error);
      toast({
        title: "Error",
        description: "Failed to save action items.",
        variant: "destructive",
      });
    }
  };

  const handleCancelReview = () => {
    setIsReviewing(false);
    setActionItems([]);
  };

  const handleReset = () => {
    setActionItems([]);
    setCurrentAnalysisId(null);
    setIsReviewing(false);
  };

  const handleSelectAnalysis = async (analysisId: string) => {
    try {
      const { data: itemsData, error } = await supabase
        .from("action_items")
        .select("*")
        .eq("analysis_id", analysisId);

      if (error) throw error;

      const typedItems: ActionItem[] = (itemsData || []).map(item => ({
        id: item.id,
        action: item.action,
        owner: item.owner,
        deadline: item.deadline,
        priority: item.priority as "high" | "medium" | "low",
        remarks: item.remarks || undefined,
        completed: item.completed,
      }));

      setActionItems(typedItems);
      setCurrentAnalysisId(analysisId);

      toast({
        title: "Loaded",
        description: "Previous analysis has been loaded.",
      });
    } catch (error) {
      console.error("Error loading analysis:", error);
      toast({
        title: "Error",
        description: "Failed to load analysis.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto">
        <div className="flex justify-end mb-6">
          <HistoryDrawer onSelectAnalysis={handleSelectAnalysis} />
        </div>

        {actionItems.length === 0 && !isReviewing ? (
          <FileUpload
            onTranscriptSubmit={handleTranscriptSubmit}
            isProcessing={isProcessing}
          />
        ) : isReviewing ? (
          <ReviewStep
            items={actionItems}
            highlights={highlights}
            onConfirm={handleConfirmReview}
            onCancel={handleCancelReview}
          />
        ) : (
          <ActionItemsList
            items={actionItems}
            analysisId={currentAnalysisId || ""}
            onReset={handleReset}
            onUpdate={setActionItems}
          />
        )}
      </div>
    </div>
  );
};

export default Index;

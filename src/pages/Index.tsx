import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ActionItemsList } from "@/components/ActionItemsList";
import { ActionItem } from "@/components/ActionItemCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleTranscriptSubmit = async (transcript: string) => {
    setIsProcessing(true);
    
    try {
      console.log("Calling extract-action-items function");
      
      const { data, error } = await supabase.functions.invoke("extract-action-items", {
        body: { transcript },
      });

      if (error) throw error;

      console.log("Received action items:", data.items.length);
      
      setActionItems(data.items);
      
      toast({
        title: "Success!",
        description: `Extracted ${data.items.length} action items from your meeting.`,
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

  const handleReset = () => {
    setActionItems([]);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto">
        {actionItems.length === 0 ? (
          <FileUpload
            onTranscriptSubmit={handleTranscriptSubmit}
            isProcessing={isProcessing}
          />
        ) : (
          <ActionItemsList items={actionItems} onReset={handleReset} />
        )}
      </div>
    </div>
  );
};

export default Index;

import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface FileUploadProps {
  onTranscriptSubmit: (transcript: string) => void;
  isProcessing: boolean;
}

export const FileUpload = ({ onTranscriptSubmit, isProcessing }: FileUploadProps) => {
  const [transcript, setTranscript] = useState("");

  const handleSubmit = () => {
    if (transcript.trim()) {
      onTranscriptSubmit(transcript);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4">
          <Upload className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          AI Meeting Intelligence
        </h1>
        <p className="text-muted-foreground text-lg">
          Extract action items automatically from meeting transcripts
        </p>
      </div>

      <div className="bg-card rounded-xl border shadow-md p-6 space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Meeting Transcript
          </label>
          <Textarea
            placeholder="Paste your meeting transcript here... 

Example:
'John mentioned we need to finish the presentation by Friday. Sarah will coordinate with the design team this week. Mike said he'll send the updated budget report by tomorrow.'"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="min-h-[200px] resize-none"
            disabled={isProcessing}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!transcript.trim() || isProcessing}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Extract Action Items
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

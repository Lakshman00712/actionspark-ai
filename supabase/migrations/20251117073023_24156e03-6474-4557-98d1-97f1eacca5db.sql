-- Create analyses table to store meeting analysis history
CREATE TABLE public.analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  transcript TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create action_items table to store extracted items
CREATE TABLE public.action_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  owner TEXT NOT NULL,
  deadline TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  remarks TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no auth yet)
CREATE POLICY "Anyone can view analyses" 
ON public.analyses 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create analyses" 
ON public.analyses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view action items" 
ON public.action_items 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create action items" 
ON public.action_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update action items" 
ON public.action_items 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete action items" 
ON public.action_items 
FOR DELETE 
USING (true);

-- Create index for better query performance
CREATE INDEX idx_action_items_analysis_id ON public.action_items(analysis_id);
CREATE INDEX idx_analyses_created_at ON public.analyses(created_at DESC);
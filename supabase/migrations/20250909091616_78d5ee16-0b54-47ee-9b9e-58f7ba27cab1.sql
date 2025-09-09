-- Create storage bucket for document uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', false);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create processing jobs table
CREATE TABLE public.processing_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  job_type TEXT NOT NULL DEFAULT 'document_processing',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  result JSONB,
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create extracted entities table
CREATE TABLE public.extracted_entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  entity_type TEXT NOT NULL,
  entity_value TEXT NOT NULL,
  confidence FLOAT,
  bounding_box JSONB,
  page_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_entities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents
CREATE POLICY "Users can view their own documents" 
ON public.documents FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" 
ON public.documents FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
ON public.documents FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for processing_jobs
CREATE POLICY "Users can view jobs for their documents" 
ON public.processing_jobs FOR SELECT 
USING (document_id IN (SELECT id FROM public.documents WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert jobs for their documents" 
ON public.processing_jobs FOR INSERT 
WITH CHECK (document_id IN (SELECT id FROM public.documents WHERE user_id = auth.uid()));

CREATE POLICY "Users can update jobs for their documents" 
ON public.processing_jobs FOR UPDATE 
USING (document_id IN (SELECT id FROM public.documents WHERE user_id = auth.uid()));

-- RLS Policies for extracted_entities
CREATE POLICY "Users can view entities for their documents" 
ON public.extracted_entities FOR SELECT 
USING (document_id IN (SELECT id FROM public.documents WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert entities for their documents" 
ON public.extracted_entities FOR INSERT 
WITH CHECK (document_id IN (SELECT id FROM public.documents WHERE user_id = auth.uid()));

-- Storage policies for uploads bucket
CREATE POLICY "Users can view their own uploads" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own uploads" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own uploads" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_processing_jobs_document_id ON public.processing_jobs(document_id);
CREATE INDEX idx_processing_jobs_status ON public.processing_jobs(status);
CREATE INDEX idx_extracted_entities_document_id ON public.extracted_entities(document_id);
CREATE INDEX idx_extracted_entities_type ON public.extracted_entities(entity_type);
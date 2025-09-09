import { supabase } from "@/integrations/supabase/client";

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  services: {
    database: string;
    openai: string;
    qdrant: string;
  };
}

export interface ProcessDocumentRequest {
  document_content?: string;
  file_path?: string;
  user_id?: string;
  job_id?: string;
}

export interface ProcessDocumentResponse {
  success: boolean;
  processing_time_ms: number;
  extracted_data: {
    supplier: string;
    buyer: string;
    invoice_number: string;
    invoice_date: string;
    total_amount: string;
    findings: Array<{
      category: string;
      description: string;
      severity: string;
    }>;
    entities: Array<{
      type: string;
      value: string;
      confidence: number;
    }>;
  };
  ocr_result: {
    text_length: number;
    confidence: number;
    bounding_boxes_count: number;
  };
  layout_result: {
    tables_count: number;
    text_blocks_count: number;
    key_value_pairs_count: number;
  };
  vector_storage: {
    chunks_stored: number;
    embeddings_dimension: number;
  };
  job_id: string;
}

export class DocumentProcessingAPI {
  static async healthCheck(): Promise<HealthResponse> {
    const { data, error } = await supabase.functions.invoke('health');
    
    if (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
    
    return data;
  }

  static async processDocument(request: ProcessDocumentRequest): Promise<ProcessDocumentResponse> {
    const { data, error } = await supabase.functions.invoke('process-documents', {
      body: request
    });
    
    if (error) {
      throw new Error(`Document processing failed: ${error.message}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Document processing failed');
    }
    
    return data;
  }

  static async createDocument(filename: string, filePath: string, fileSize: number, mimeType: string) {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.user.id,
        filename,
        file_path: filePath,
        file_size: fileSize,
        mime_type: mimeType,
        status: 'uploaded'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create document record: ${error.message}`);
    }

    return data;
  }

  static async createProcessingJob(documentId: string, jobType: string = 'document_processing') {
    const { data, error } = await supabase
      .from('processing_jobs')
      .insert({
        document_id: documentId,
        job_type: jobType,
        status: 'pending',
        progress: 0
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create processing job: ${error.message}`);
    }

    return data;
  }

  static async getProcessingJobStatus(jobId: string) {
    const { data, error } = await supabase
      .from('processing_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      throw new Error(`Failed to get job status: ${error.message}`);
    }

    return data;
  }

  static async getUserDocuments() {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        processing_jobs(*)
      `)
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    return data;
  }

  static async getExtractedEntities(documentId: string) {
    const { data, error } = await supabase
      .from('extracted_entities')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch extracted entities: ${error.message}`);
    }

    return data;
  }
}
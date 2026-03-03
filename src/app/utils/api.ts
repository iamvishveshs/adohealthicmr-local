// API Helper Functions
// Centralized API calls with proper error handling

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();
  
  if (!response.ok) {
    return {
      success: false,
      error: data.error || `HTTP ${response.status}: ${response.statusText}`,
    };
  }
  
  return {
    success: true,
    data: data as T,
    message: data.message,
  };
}

// ==================== MODULES API ====================

export interface ModuleData {
  id: number;
  title: string;
  description: string;
  color: string;
}

export async function getModules(): Promise<ApiResponse<{ modules: ModuleData[] }>> {
  try {
    const response = await fetch('/api/modules');
    return handleResponse<{ modules: ModuleData[] }>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch modules',
    };
  }
}

export async function getModule(id: number): Promise<ApiResponse<{ module: ModuleData }>> {
  try {
    const response = await fetch(`/api/modules/${id}`);
    return handleResponse<{ module: ModuleData }>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch module',
    };
  }
}

export async function createModule(module: ModuleData): Promise<ApiResponse<{ module: ModuleData }>> {
  try {
    const response = await fetch('/api/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(module),
    });
    return handleResponse<{ module: ModuleData }>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create module',
    };
  }
}

export async function updateModule(id: number, updates: Partial<Omit<ModuleData, 'id'>>): Promise<ApiResponse<{ module: ModuleData }>> {
  try {
    const response = await fetch(`/api/modules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<{ module: ModuleData }>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update module',
    };
  }
}

export async function deleteModule(id: number): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`/api/modules/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete module',
    };
  }
}

// ==================== QUESTIONS API ====================

export interface QuestionData {
  id: number;
  moduleId: number;
  question: string;
  options: string[];
  correctAnswer?: number;
}

export async function getQuestions(moduleId?: number): Promise<ApiResponse<{ questions: QuestionData[] }>> {
  try {
    const url = moduleId ? `/api/questions?moduleId=${moduleId}` : '/api/questions';
    const response = await fetch(url);
    return handleResponse<{ questions: QuestionData[] }>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch questions',
    };
  }
}

export async function getQuestion(id: number, moduleId: number): Promise<ApiResponse<{ question: QuestionData }>> {
  try {
    const response = await fetch(`/api/questions/${id}?moduleId=${moduleId}`);
    return handleResponse<{ question: QuestionData }>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch question',
    };
  }
}

export async function createQuestion(question: QuestionData): Promise<ApiResponse<{ question: QuestionData }>> {
  try {
    const response = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question),
    });
    return handleResponse<{ question: QuestionData }>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create question',
    };
  }
}

export async function updateQuestion(
  id: number,
  moduleId: number,
  updates: Partial<Omit<QuestionData, 'id' | 'moduleId'>>
): Promise<ApiResponse<{ question: QuestionData }>> {
  try {
    const response = await fetch(`/api/questions/${id}?moduleId=${moduleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<{ question: QuestionData }>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update question',
    };
  }
}

export async function deleteQuestion(id: number, moduleId: number): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`/api/questions/${id}?moduleId=${moduleId}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete question',
    };
  }
}

// ==================== ANSWERS API ====================

export interface AnswerData {
  moduleId: number;
  questionId: number;
  answer: string;
}

export async function getAnswers(moduleId?: number, userId?: string): Promise<ApiResponse<{ answers: any[] }>> {
  try {
    const params = new URLSearchParams();
    if (moduleId) params.append('moduleId', moduleId.toString());
    if (userId) params.append('userId', userId);
    const url = `/api/answers${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    // Handle 401 errors gracefully (user not authenticated)
    if (response.status === 401) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }
    
    return handleResponse<{ answers: any[] }>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch answers',
    };
  }
}

export async function submitAnswer(answer: AnswerData): Promise<ApiResponse<{ answer: any }>> {
  try {
    const response = await fetch('/api/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answer),
    });
    return handleResponse<{ answer: any }>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit answer',
    };
  }
}

// ==================== VIDEOS API ====================

export interface VideoData {
  moduleId: number;
  videoType: 'english' | 'punjabi' | 'hindi' | 'activity';
  videoId: number;
  preview: string;
  fileName: string;
  fileSize: number;
  fileUrl?: string;
}

export async function getVideos(moduleId?: number, videoType?: string): Promise<ApiResponse<{ videos: VideoData[] }>> {
  try {
    const params = new URLSearchParams();
    if (moduleId) params.append('moduleId', moduleId.toString());
    if (videoType) params.append('videoType', videoType);
    const url = `/api/videos${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    // Handle 401 errors gracefully (user not authenticated)
    if (response.status === 401) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }
    
    return handleResponse<{ videos: VideoData[] }>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch videos',
    };
  }
}

export async function getVideo(id: number, moduleId: number, videoType: string): Promise<ApiResponse<{ video: VideoData }>> {
  try {
    const response = await fetch(`/api/videos/${id}?moduleId=${moduleId}&videoType=${videoType}`);
    return handleResponse<{ video: VideoData }>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch video',
    };
  }
}

export async function createVideo(video: VideoData): Promise<ApiResponse<{ video: VideoData }>> {
  try {
    const response = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(video),
    });
    return handleResponse<{ video: VideoData }>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create video',
    };
  }
}

export async function updateVideo(
  id: number,
  moduleId: number,
  videoType: string,
  updates: Partial<Omit<VideoData, 'id' | 'moduleId' | 'videoType' | 'videoId'>>
): Promise<ApiResponse<{ video: VideoData }>> {
  try {
    const response = await fetch(`/api/videos/${id}?moduleId=${moduleId}&videoType=${videoType}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<{ video: VideoData }>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update video',
    };
  }
}

export async function deleteVideo(id: number, moduleId: number, videoType: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`/api/videos/${id}?moduleId=${moduleId}&videoType=${videoType}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete video',
    };
  }
}

// ==================== BULK OPERATIONS API ====================

export interface BulkOperation {
  operation: 'create' | 'update' | 'delete';
  resource: 'modules' | 'questions' | 'videos';
  data: any[];
}

export async function bulkOperation(operation: BulkOperation): Promise<ApiResponse<{ result: any }>> {
  try {
    const response = await fetch('/api/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(operation),
    });
    return handleResponse<{ result: any }>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform bulk operation',
    };
  }
}

// Helper function to bulk delete modules
export async function bulkDeleteModules(moduleIds: number[]): Promise<ApiResponse<{ result: { deleted: number } }>> {
  return bulkOperation({
    operation: 'delete',
    resource: 'modules',
    data: moduleIds,
  });
}

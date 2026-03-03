// Data Storage Utility
// Stores all form data, module edits, question edits, and answers

export interface StoredModule {
  id: number;
  title: string;
  description: string;
  color: string;
}

export interface StoredQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer?: number;
}

export interface StoredAnswer {
  questionId: number;
  answer: string;
}

export interface AppData {
  modules: StoredModule[];
  questions: { [moduleId: number]: StoredQuestion[] };
  answers: { [moduleId: number]: { [questionId: number]: string } };
  lastUpdated: string;
}

const STORAGE_KEY = 'adohealth_app_data';

/**
 * Save all application data to localStorage AND server file
 */
export async function saveAppData(data: Partial<AppData>): Promise<void> {
  try {
    // Load existing data
    const existingData = loadAppData();
    
    // Merge with new data
    const updatedData: AppData = {
      modules: data.modules || existingData.modules || [],
      questions: data.questions || existingData.questions || {},
      answers: data.answers || existingData.answers || {},
      lastUpdated: new Date().toISOString(),
    };

    // Save to localStorage (immediate, for fast access)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      console.log('Data saved to localStorage:', updatedData);
    }

    // Also save to server file (persistent storage)
    try {
      const response = await fetch('/api/data/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Data saved to server file:', result);
      } else {
        console.warn('Failed to save to server file, but localStorage saved successfully');
      }
    } catch (serverError) {
      console.warn('Error saving to server file (localStorage saved):', serverError);
      // Don't throw - localStorage save was successful
    }
  } catch (error) {
    console.error('Error saving app data:', error);
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      alert('Storage limit reached. Some data may not be saved. Please clear some data or use a smaller dataset.');
    }
    throw error;
  }
}

/**
 * Load all application data from localStorage (synchronous)
 */
export function loadAppData(): AppData {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (error) {
    console.error('Error loading app data from localStorage:', error);
  }
  
  return {
    modules: [],
    questions: {},
    answers: {},
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Load all application data from server file (async)
 */
export async function loadAppDataFromServer(): Promise<AppData> {
  try {
    const response = await fetch('/api/data/load');
    if (response.ok) {
      const data = await response.json();
      // Also sync to localStorage for faster access
      if (typeof window !== 'undefined' && data.modules) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
      return data;
    }
  } catch (error) {
    console.error('Error loading app data from server:', error);
  }
  
  // Fallback to localStorage
  return loadAppData();
}

/**
 * Save modules data
 */
export async function saveModules(modules: StoredModule[]): Promise<void> {
  const existingData = loadAppData();
  await saveAppData({
    ...existingData,
    modules,
  });
}

/**
 * Save questions for a specific module
 */
export async function saveModuleQuestions(moduleId: number, questions: StoredQuestion[]): Promise<void> {
  const existingData = loadAppData();
  await saveAppData({
    ...existingData,
    questions: {
      ...existingData.questions,
      [moduleId]: questions,
    },
  });
}

/**
 * Save answers for a specific module
 */
export async function saveModuleAnswers(moduleId: number, answers: { [questionId: number]: string }): Promise<void> {
  const existingData = loadAppData();
  await saveAppData({
    ...existingData,
    answers: {
      ...existingData.answers,
      [moduleId]: answers,
    },
  });
}

/**
 * Export all data as JSON string (for backup/download)
 */
export function exportAppData(): string {
  const data = loadAppData();
  return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON string (for restore/upload)
 */
export function importAppData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as AppData;
    saveAppData(data);
    return true;
  } catch (error) {
    console.error('Error importing app data:', error);
    return false;
  }
}

/**
 * Clear all stored data
 */
export function clearAppData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    // Also clear legacy keys for backward compatibility
    localStorage.removeItem('adminEditedModules');
    localStorage.removeItem('adminEditedQuestions');
    localStorage.removeItem('savedAnswers');
  }
}

/**
 * Get data statistics
 */
export function getDataStats(): {
  moduleCount: number;
  totalQuestions: number;
  totalAnswers: number;
  lastUpdated: string | null;
} {
  const data = loadAppData();
  let totalQuestions = 0;
  let totalAnswers = 0;

  Object.values(data.questions).forEach(questions => {
    totalQuestions += questions.length;
  });

  Object.values(data.answers).forEach(moduleAnswers => {
    totalAnswers += Object.keys(moduleAnswers).length;
  });

  return {
    moduleCount: data.modules.length,
    totalQuestions,
    totalAnswers,
    lastUpdated: data.lastUpdated || null,
  };
}

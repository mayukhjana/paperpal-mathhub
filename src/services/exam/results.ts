
import { supabase } from "@/integrations/supabase/client";

export const submitExamResult = async (
  userId: string,
  examId: string, 
  score: number, 
  totalQuestions: number,
  timeTaken: number,
  totalMarks: number = 0,
  obtainedMarks: number = 0
) => {
  try {
    const { data, error } = await supabase
      .from('user_results')
      .insert({
        user_id: userId,
        exam_id: examId,
        score,
        total_questions: totalQuestions,
        time_taken: timeTaken,
        total_marks: totalMarks,
        obtained_marks: obtainedMarks
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error submitting exam result:", error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error("Exception when submitting exam result:", err);
    return null;
  }
};

export const fetchExamResults = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_results')
      .select(`
        *,
        exams(*)
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching exam results:", error);
      return [];
    }
    
    // Transform the data to match the ExamResult interface
    // Use type assertion to provide the compiler with the expected shape
    const formattedData = (data || []).map(result => ({
      ...result,
      // Use optional chaining and nullish coalescing to safely access properties
      total_marks: (result as any).total_marks ?? 0,
      obtained_marks: (result as any).obtained_marks ?? 0
    }));
    
    return formattedData;
  } catch (err) {
    console.error("Exception when fetching exam results:", err);
    return [];
  }
};

export const checkExamAttempted = async (userId: string, examId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { count, error } = await supabase
      .from('user_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('exam_id', examId);
      
    if (error) {
      console.error("Error checking if exam was attempted:", error);
      return false;
    }
    
    return count !== null && count > 0;
  } catch (err) {
    console.error("Exception when checking if exam was attempted:", err);
    return false;
  }
};

export const examHasMCQs = async (examId: string): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('exam_id', examId);
      
    if (error) {
      console.error("Error checking if exam has MCQs:", error);
      return false;
    }
    
    return count !== null && count > 0;
  } catch (err) {
    console.error("Exception when checking if exam has MCQs:", err);
    return false;
  }
};

// New function to fetch chapter-wise performance
export const fetchChapterPerformance = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_results')
      .select(`
        id, 
        score, 
        total_questions,
        exams!inner(
          title, 
          board, 
          chapter
        )
      `)
      .eq('user_id', userId)
      .not('exams.chapter', 'is', null)
      .order('completed_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching chapter performance:", error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error("Exception when fetching chapter performance:", err);
    return [];
  }
};

// New function to fetch topic-wise performance metrics
export const fetchTopicPerformance = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_results')
      .select(`
        id,
        score,
        total_questions,
        time_taken,
        total_marks,
        obtained_marks,
        exams(
          title,
          board,
          chapter,
          year
        )
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching topic performance:", error);
      return [];
    }
    
    // Group the data by topic/chapter
    const topicData = (data || []).reduce((acc, result) => {
      const topic = result.exams?.chapter || 'General';
      
      if (!acc[topic]) {
        acc[topic] = {
          topic,
          totalQuestions: 0,
          correctAnswers: 0,
          timeTaken: 0,
          exams: 0,
          totalScore: 0
        };
      }
      
      const item = acc[topic];
      item.exams++;
      item.totalQuestions += result.total_questions;
      item.totalScore += result.score;
      item.timeTaken += result.time_taken || 0;
      // Estimate correct answers based on score
      item.correctAnswers += Math.round((result.score / 100) * result.total_questions);
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(topicData);
  } catch (err) {
    console.error("Exception when fetching topic performance:", err);
    return [];
  }
};

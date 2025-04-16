
import { supabase } from "@/integrations/supabase/client";
import type { Exam, Question } from "./types";

export const createExam = async (examData: Omit<Exam, 'id' | 'created_at'>) => {
  const examToInsert: any = {
    title: examData.title,
    board: examData.board,
    chapter: examData.chapter,
    year: examData.year,
    class: examData.class,
    duration: examData.duration,
    is_premium: examData.is_premium
  };

  const { data, error } = await supabase
    .from('exams')
    .insert(examToInsert)
    .select()
    .single();
    
  if (error) {
    console.error("Error creating exam:", error);
    throw error;
  }
  
  return data as Exam;
};

export const createQuestions = async (questions: Omit<Question, 'id'>[]) => {
  const questionsToInsert = questions.map(q => {
    // Format the correct_answer based on whether it's a multi-correct answer
    let formattedAnswer: string;
    
    if (q.is_multi_correct && Array.isArray(q.correct_answer)) {
      // If it's a multi-correct question and the answer is already an array, join it
      formattedAnswer = q.correct_answer.join(',');
    } else if (q.is_multi_correct && typeof q.correct_answer === 'string' && q.correct_answer.includes(',')) {
      // If it's already a comma-separated string, use it as is
      formattedAnswer = q.correct_answer;
    } else {
      // For single answers or when the format is unknown, convert to string
      formattedAnswer = String(q.correct_answer);
    }
    
    return {
      exam_id: q.exam_id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: formattedAnswer,
      order_number: q.order_number,
      marks: q.marks,
      negative_marks: q.negative_marks,
      is_multi_correct: q.is_multi_correct || false
    };
  });

  console.log("Inserting questions:", JSON.stringify(questionsToInsert, null, 2));

  const { data, error } = await supabase
    .from('questions')
    .insert(questionsToInsert)
    .select();
    
  if (error) {
    console.error("Error creating questions:", error);
    throw error;
  }
  
  return data as Question[];
};

export const deleteWBJEEExams = async () => {
  try {
    const { data: wbjeeExams } = await supabase
      .from('exams')
      .select('id')
      .eq('board', 'WBJEE');
    
    if (wbjeeExams && wbjeeExams.length > 0) {
      const examIds = wbjeeExams.map(exam => exam.id);
      
      await supabase
        .from('questions')
        .delete()
        .in('exam_id', examIds);
      
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('board', 'WBJEE');
      
      if (error) throw error;
      
      return { success: true, message: `Deleted ${wbjeeExams.length} WBJEE exams` };
    }
    
    return { success: true, message: "No WBJEE exams to delete" };
  } catch (error) {
    console.error("Error deleting WBJEE exams:", error);
    throw error;
  }
};

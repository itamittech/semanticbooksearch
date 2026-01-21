export interface Course {
    id: string;
    name: string;
    description: string;
}

export interface StudyMaterial {
    id: string;
    courseId: string;
    filename: string;
    type: 'PDF' | 'PPT' | 'DOC' | 'IMAGE';
    uploadDate: string;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    answer: string;
}

export interface Flashcard {
    front: string;
    back: string;
}

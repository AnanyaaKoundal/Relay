import * as courseApi from "@/services/course.service";
import * as lessonApi from "@/services/lesson.service";
import { QuizContent } from "@/types/lesson.types";
import {
    type Chapter,
    mapBackendChapter,
} from "@/components/studio/course-builder";

function quizToBackendPayload(quiz: QuizContent) {
    return quiz.questions.map((q) => ({
        question: q.question,
        options: q.options.map((o) => o.text),
        correctAnswer: q.options.findIndex((o) => o.id === q.correctOptionId),
        explanation: q.explanation,
    }));
}

export { quizToBackendPayload };
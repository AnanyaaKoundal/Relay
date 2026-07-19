export type CourseStatus = "DRAFT" | "PENDING_APPROVAL" | "PUBLISHED" | "REJECTED";

export type CourseListItem = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  status: CourseStatus;
  difficulty: string | null;
  category: string | null;
  price: number;
  createdAt: string;
  updatedAt: string;
  _count: { chapters: number; enrollments: number };
};

export type CourseDetail = CourseListItem & {
  thumbnailUrl: string | null;
  publishedAt: string | null;
  instructorId: string;
};

export type CreateCourseInput = {
  title: string;
  description: string;
  category?: string;
  difficulty?: string;
  price?: number;
};

export type UpdateCourseInput = Partial<CreateCourseInput> & {
  status?: CourseStatus;
  thumbnailUrl?: string | null;
};

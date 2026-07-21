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

export type PublicCourse = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  category: string | null;
  price: number;
  difficulty: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  instructor: { id: string; name: string } | null;
  _count: { chapters: number; enrollments: number };
};

export type PublicCourseDetail = PublicCourse & {
  chapters: {
    id: string;
    title: string;
    orderIndex: number;
    lessons: {
      id: string;
      title: string;
      contentType: string;
      durationSeconds: number | null;
      isPreview: boolean;
    }[];
  }[];
};

export type BrowseResult = {
  courses: PublicCourse[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

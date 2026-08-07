export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isAdmin: boolean;
  isInstructor: boolean;
  status: "ACTIVE" | "BANNED";
  createdAt: string;
  enrollmentCount: number;
  courseCount: number;
  paymentCount: number;
};

export type UserListResponse = {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AdminCourse = {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  price: number;
  bannerUrl: string | null;
  createdAt: string;
  publishedAt: string | null;
  instructor: { id: string; name: string; email: string };
  category: { id: string; name: string } | null;
  enrollmentCount: number;
  chapterCount: number;
};

export type CourseListResponse = {
  courses: AdminCourse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AdminCourseDetail = {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "PUBLISHED";
  price: number;
  bannerUrl: string | null;
  difficulty: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  instructor: { id: string; name: string; email: string };
  category: { id: string; name: string } | null;
  enrollmentCount: number;
  revenue: number;
  chapters: {
    id: string;
    title: string;
    orderIndex: number;
    lessonCount: number;
  }[];
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  courseCount: number;
};

export type UserDetail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isAdmin: boolean;
  isInstructor: boolean;
  status: "ACTIVE" | "BANNED";
  createdAt: string;
  updatedAt: string;
  totalSpent: number;
  totalEarned: number;
  courseCount: number;
  enrollmentCount: number;
  paymentCount: number;
  courses: {
    id: string;
    title: string;
    status: string;
    price: number;
    bannerUrl: string | null;
    createdAt: string;
    enrollmentCount: number;
    earnings: number;
  }[];
  enrollments: {
    id: string;
    status: string;
    progressPercent: number;
    enrolledAt: string;
    completedAt: string | null;
    course: { id: string; title: string; bannerUrl: string | null };
  }[];
  payments: {
    id: string;
    totalAmount: number;
    currency: string;
    status: string;
    createdAt: string;
  }[];
};

export type AdminPayment = {
  id: string;
  totalAmount: number;
  currency: string;
  status: "PENDING" | "SUCCEEDED" | "REFUNDED" | "FAILED";
  gateway: string;
  gatewayTransactionId: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  course: { id: string; title: string; instructor: { id: string; name: string } } | null;
  instructor: { id: string; name: string } | null;
};

export type PaymentListResponse = {
  payments: AdminPayment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AdminPaymentDetail = {
  id: string;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  subtotal: number;
  currency: string;
  status: string;
  gateway: string;
  gatewayTransactionId: string;
  invoiceUrl: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; phone: string | null };
  enrollment: {
    id: string;
    course: { id: string; title: string; price: number; instructor: { id: string; name: string; email: string } };
  } | null;
};

export type AdminPayout = {
  id: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  notes: string | null;
  createdAt: string;
  processedAt: string | null;
  instructor: { id: string; name: string; email: string };
};

export type PayoutListResponse = {
  payouts: AdminPayout[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

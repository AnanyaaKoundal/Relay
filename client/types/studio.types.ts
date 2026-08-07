export type StudioRange = "7d" | "30d" | "60d" | "90d" | "1y" | "custom";

export type InstructorProfileData = {
  headline: string;
  bio: string | null;
  expertise: string | null;
  experience: string | null;
  twitter: string | null;
  linkedin: string | null;
  github: string | null;
  website: string | null;
};

export type InstructorProfile = {
  name: string | null;
  email: string | null;
  profile: InstructorProfileData | null;
};


export type StudioKpi = {
  value: number;
  delta: number | null;
};

export type StudioOverviewKpis = {
  revenue: StudioKpi;
  students: StudioKpi;
  orders: StudioKpi;
  completionRate: number;
};

export type StudioSeriesPoint = {
  label: string;
  revenue: number;
  enrollments: number;
};

export type StudioTopCourse = {
  id: string;
  title: string;
  students: number;
  revenue: number;
  completionRate: number;
};

export type StudioAttention = {
  drafts: number;
  pendingApproval: number;
  rejected: number;
  unpublishedLessons: number;
  courses: {
    id: string;
    title: string;
    category: "draft" | "unpublished";
    updatedAt: string;
    draftLessonCount: number;
  }[];
};

export type StudioActivityItem = {
  id: string;
  type: "enrollment" | "sale";
  studentName: string;
  courseId: string | null;
  courseTitle: string;
  amount: number | null;
  createdAt: string;
};

export type StudioOverview = {
  kpis: StudioOverviewKpis;
  series: StudioSeriesPoint[];
  topCourses: StudioTopCourse[];
  attention: StudioAttention;
  activity: StudioActivityItem[];
};

export type StudioCourseKpis = {
  students: StudioKpi;
  revenue: StudioKpi;
  activeLearners: number;
  completionRate: number;
};

export type StudioEnrollmentPoint = {
  label: string;
  count: number;
};

export type StudioLessonFunnelItem = {
  id: string;
  title: string;
  chapterTitle: string;
  orderIndex: number;
  completed: number;
  completionRate: number;
};

export type StudioCouponUsageItem = {
  code: string;
  uses: number;
};

export type StudioCountrySplitItem = {
  country: string;
  count: number;
};

export type StudioRecentEnrollment = {
  id: string;
  studentName: string;
  enrolledAt: string;
  status: string;
  progressPercent: number;
};

export type StudioCourseAnalytics = {
  course: { id: string; title: string; status: string };
  kpis: StudioCourseKpis;
  enrollmentSeries: StudioEnrollmentPoint[];
  lessonFunnel: StudioLessonFunnelItem[];
  couponUsage: StudioCouponUsageItem[];
  countrySplit: StudioCountrySplitItem[];
  recentEnrollments: StudioRecentEnrollment[];
};

export type StudioProgressBucket = {
  bucket: string;
  count: number;
};

export type StudioContentTypeStat = {
  type: string;
  lessons: number;
  completions: number;
  rate: number;
};

export type StudioRevenueComposition = {
  subtotal: number;
  discount: number;
  tax: number;
  couponOrders: number;
  totalOrders: number;
};

export type StudioCourseRow = {
  id: string;
  title: string;
  status: string;
  students: number;
  revenue: number;
  completionRate: number;
  activeLearners: number;
  updatedAt: string;
};

export type StudioCoursesAnalytics = {
  kpis: {
    students: StudioKpi;
    revenue: StudioKpi;
    activeLearners: number;
    completionRate: number;
  };
  progressDistribution: StudioProgressBucket[];
  contentTypeCompletion: StudioContentTypeStat[];
  revenueComposition: StudioRevenueComposition;
  courses: StudioCourseRow[];
};

export type StudioEarningsKpis = {
  gross: StudioKpi;
  net: StudioKpi;
  orders: StudioKpi;
  discounts: StudioKpi;
};

export type StudioEarningsMoneyFlow = {
  listPrice: number;
  discounts: number;
  tax: number;
  gross: number;
  fee: number;
  net: number;
};

export type StudioTrendCourse = {
  id: string;
  title: string;
};

export type StudioTrendPoint = {
  label: string;
  total: number;
  byCourse: Record<string, number>;
};

export type StudioEarningsCourse = {
  id: string;
  title: string;
  net: number;
  gross: number;
  orders: number;
  growth: number | null;
};

export type StudioCouponPerformance = {
  code: string;
  orders: number;
  revenue: number;
  usedCount: number;
  maxUses: number;
  status: "active" | "expired" | "inactive";
};

export type StudioTransaction = {
  id: string;
  studentName: string;
  courseTitle: string;
  couponCode: string | null;
  amount: number;
  status: string;
  createdAt: string;
  invoiceUrl: string | null;
};

export type StudioEarnings = {
  kpis: StudioEarningsKpis;
  moneyFlow: StudioEarningsMoneyFlow;
  trend: {
    courses: StudioTrendCourse[];
    series: StudioTrendPoint[];
  };
  courses: StudioEarningsCourse[];
  coupons: StudioCouponPerformance[];
  transactions: StudioTransaction[];
};

export type InstructorBalance = {
  pendingBalance: number;
  totalEarned: number;
  lastPayoutAt: string | null;
};

export type InstructorPayout = {
  id: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  notes: string | null;
  createdAt: string;
  processedAt: string | null;
};

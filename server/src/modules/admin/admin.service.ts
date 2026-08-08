import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";
import type { Prisma } from "@prisma/client";
import type { ListUsersInput, ListCoursesInput, CreateCategoryInput, UpdateCategoryInput, ListPaymentsInput, ListPayoutsInput, UpdateSettingsInput } from "./admin.schema.js";

export async function listUsers(input: ListUsersInput) {
  const { search, role, status, page, limit } = input;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role === "admin") where.isAdmin = true;
  else if (role === "instructor") where.isInstructor = true;
  else if (role === "learner") {
    where.isAdmin = false;
    where.isInstructor = false;
  }

  if (status) where.status = status;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isAdmin: true,
        isInstructor: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            courses: true,
            payments: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      isAdmin: u.isAdmin,
      isInstructor: u.isInstructor,
      status: u.status,
      createdAt: u.createdAt,
      enrollmentCount: u._count.enrollments,
      courseCount: u._count.courses,
      paymentCount: u._count.payments,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isAdmin: true,
      isInstructor: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const [courses, enrollments, payments] = await Promise.all([
    prisma.course.findMany({
      where: { instructorId: userId },
      select: {
        id: true,
        title: true,
        status: true,
        price: true,
        bannerUrl: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.enrollment.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        progressPercent: true,
        enrolledAt: true,
        completedAt: true,
        course: { select: { id: true, title: true, bannerUrl: true } },
      },
      orderBy: { enrolledAt: "desc" },
    }),
    prisma.payment.findMany({
      where: { userId },
      select: {
        id: true,
        totalAmount: true,
        currency: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const totalSpent = payments
    .filter((p) => p.status === "SUCCEEDED")
    .reduce((sum, p) => sum + Number(p.totalAmount), 0);

  // Calculate instructor earnings
  let totalEarned = 0;
  const earningsByCourse = new Map<string, number>();

  if (user.isInstructor && courses.length > 0) {
    const courseIds = courses.map((c) => c.id);
    const enrollmentsForCourses = await prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      select: {
        courseId: true,
        payment: { select: { totalAmount: true, status: true } },
      },
    });

    for (const e of enrollmentsForCourses) {
      if (e.payment?.status === "SUCCEEDED") {
        const current = earningsByCourse.get(e.courseId) ?? 0;
        earningsByCourse.set(e.courseId, current + Number(e.payment.totalAmount));
      }
    }

    for (const earnings of earningsByCourse.values()) {
      totalEarned += earnings;
    }
  }

  return {
    ...user,
    totalSpent,
    totalEarned,
    courseCount: courses.length,
    enrollmentCount: enrollments.length,
    paymentCount: payments.length,
    courses: courses.map((course) => ({
      ...course,
      price: Number(course.price),
      enrollmentCount: course._count.enrollments,
      earnings: earningsByCourse.get(course.id) ?? 0,
    })),
    enrollments,
    payments,
  };
}

export async function updateUserStatus(userId: string, status: "ACTIVE" | "BANNED") {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, isAdmin: true } });
  if (!user) throw new AppError("User not found", 404);

  // Prevent banning yourself
  if (user.isAdmin && status === "BANNED") {
    throw new AppError("Cannot ban an admin user", 400);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, name: true, email: true, status: true },
  });
}

export async function updateUserRole(userId: string, role: { isAdmin?: boolean; isInstructor?: boolean }) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, isAdmin: true } });
  if (!user) throw new AppError("User not found", 404);

  // Prevent removing your own admin role
  if (user.isAdmin && role.isAdmin === false) {
    throw new AppError("Cannot remove your own admin role", 400);
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(role.isAdmin !== undefined && { isAdmin: role.isAdmin }),
      ...(role.isInstructor !== undefined && { isInstructor: role.isInstructor }),
    },
    select: { id: true, name: true, email: true, isAdmin: true, isInstructor: true },
  });
}

// ─── Courses ──────────────────────────────────────────────────

export async function listCourses(input: ListCoursesInput) {
  const { search, status, instructorId, categoryId, page, limit } = input;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status) where.status = status;
  if (instructorId) where.instructorId = instructorId;
  if (categoryId) where.categoryId = categoryId;

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        price: true,
        bannerUrl: true,
        createdAt: true,
        publishedAt: true,
        instructor: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
        _count: { select: { enrollments: true, chapters: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  return {
    courses: courses.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      price: Number(c.price),
      bannerUrl: c.bannerUrl,
      createdAt: c.createdAt,
      publishedAt: c.publishedAt,
      instructor: c.instructor,
      category: c.category,
      enrollmentCount: c._count.enrollments,
      chapterCount: c._count.chapters,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getCourseDetail(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      price: true,
      bannerUrl: true,
      difficulty: true,
      createdAt: true,
      updatedAt: true,
      publishedAt: true,
      instructor: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true } },
      chapters: {
        select: {
          id: true,
          title: true,
          orderIndex: true,
          _count: { select: { lessons: true } },
        },
        orderBy: { orderIndex: "asc" },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // Calculate revenue
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    select: { payment: { select: { totalAmount: true, status: true } } },
  });

  const revenue = enrollments
    .filter((e) => e.payment?.status === "SUCCEEDED")
    .reduce((sum, e) => sum + Number(e.payment?.totalAmount ?? 0), 0);

  return {
    ...course,
    price: Number(course.price),
    enrollmentCount: course._count.enrollments,
    revenue,
    chapters: course.chapters.map((ch) => ({
      id: ch.id,
      title: ch.title,
      orderIndex: ch.orderIndex,
      lessonCount: ch._count.lessons,
    })),
  };
}

export async function deleteCourse(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, _count: { select: { enrollments: true } } },
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course._count.enrollments > 0) {
    throw new AppError("Cannot delete a course with enrollments. Set status to DRAFT instead.", 400);
  }

  await prisma.course.delete({ where: { id: courseId } });
  return { success: true };
}

// ─── Categories ───────────────────────────────────────────────

export async function listCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { courses: true } } },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    createdAt: c.createdAt,
    courseCount: c._count.courses,
  }));
}

export async function createCategory(input: CreateCategoryInput) {
  const slug = input.slug ?? input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const existing = await prisma.category.findFirst({
    where: { OR: [{ name: input.name }, { slug }] },
  });

  if (existing) {
    throw new AppError("Category with this name or slug already exists", 409);
  }

  return prisma.category.create({
    data: { name: input.name, slug },
    select: { id: true, name: true, slug: true, createdAt: true },
  });
}

export async function updateCategory(categoryId: string, input: UpdateCategoryInput) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new AppError("Category not found", 404);

  if (input.name || input.slug) {
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          ...(input.name ? [{ name: input.name }] : []),
          ...(input.slug ? [{ slug: input.slug }] : []),
        ],
        NOT: { id: categoryId },
      },
    });

    if (existing) {
      throw new AppError("Category with this name or slug already exists", 409);
    }
  }

  return prisma.category.update({
    where: { id: categoryId },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.slug && { slug: input.slug }),
    },
    select: { id: true, name: true, slug: true, createdAt: true },
  });
}

export async function deleteCategory(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, _count: { select: { courses: true } } },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (category._count.courses > 0) {
    throw new AppError("Cannot delete a category with courses. Reassign courses first.", 400);
  }

  await prisma.category.delete({ where: { id: categoryId } });
  return { success: true };
}

// ─── Payments ────────────────────────────────────────────────

export async function listPayments(input: ListPaymentsInput) {
  const { search, status, instructorId, page, limit } = input;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (status) where.status = status;

  if (instructorId) {
    where.enrollments = { some: { course: { instructorId } } };
  }

  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { gatewayTransactionId: { contains: search, mode: "insensitive" } },
    ];
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        totalAmount: true,
        currency: true,
        status: true,
        gateway: true,
        gatewayTransactionId: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
        enrollments: {
          select: {
            course: { select: { id: true, title: true, instructor: { select: { id: true, name: true } } } },
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments: payments.map((p) => ({
      id: p.id,
      totalAmount: Number(p.totalAmount),
      currency: p.currency,
      status: p.status,
      gateway: p.gateway,
      gatewayTransactionId: p.gatewayTransactionId,
      createdAt: p.createdAt,
      user: p.user,
      course: p.enrollments[0]?.course ?? null,
      instructor: p.enrollments[0]?.course?.instructor ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getPaymentDetail(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      totalAmount: true,
      discountAmount: true,
      taxAmount: true,
      subtotal: true,
      currency: true,
      status: true,
      gateway: true,
      gatewayTransactionId: true,
      invoiceUrl: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      enrollments: {
        select: {
          id: true,
          course: { select: { id: true, title: true, price: true, instructor: { select: { id: true, name: true, email: true } } } },
        },
      },
    },
  });

  if (!payment) throw new AppError("Payment not found", 404);

  return {
    id: payment.id,
    totalAmount: Number(payment.totalAmount),
    discountAmount: Number(payment.discountAmount),
    taxAmount: Number(payment.taxAmount),
    subtotal: Number(payment.subtotal),
    currency: payment.currency,
    status: payment.status,
    gateway: payment.gateway,
    gatewayTransactionId: payment.gatewayTransactionId,
    invoiceUrl: payment.invoiceUrl,
    createdAt: payment.createdAt,
    user: payment.user,
    enrollment: payment.enrollments[0] ?? null,
  };
}

export async function refundPayment(paymentId: string, reason?: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: { id: true, status: true, totalAmount: true, userId: true },
  });

  if (!payment) throw new AppError("Payment not found", 404);
  if (payment.status !== "SUCCEEDED") throw new AppError("Only succeeded payments can be refunded", 400);

  // In a real app, call payment gateway refund API here
  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "REFUNDED" },
    select: { id: true, status: true, totalAmount: true },
  });

  return { ...updated, totalAmount: Number(updated.totalAmount), reason };
}

// ─── Payouts ─────────────────────────────────────────────────

export async function listPayouts(input: ListPayoutsInput) {
  const { status, instructorId, page, limit } = input;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (instructorId) where.instructorId = instructorId;

  const [payouts, total] = await Promise.all([
    prisma.payout.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        status: true,
        notes: true,
        createdAt: true,
        processedAt: true,
        instructor: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.payout.count({ where }),
  ]);

  return {
    payouts: payouts.map((p) => ({
      ...p,
      amount: Number(p.amount),
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function approvePayout(payoutId: string, notes?: string) {
  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
    select: { id: true, status: true },
  });

  if (!payout) throw new AppError("Payout not found", 404);
  if (payout.status !== "PENDING") throw new AppError("Only pending payouts can be approved", 400);

  const updated = await prisma.payout.update({
    where: { id: payoutId },
    data: { status: "COMPLETED", processedAt: new Date(), notes },
    select: { id: true, status: true, amount: true, processedAt: true },
  });

  return { ...updated, amount: Number(updated.amount) };
}

export async function rejectPayout(payoutId: string, notes?: string) {
  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
    select: { id: true, status: true },
  });

  if (!payout) throw new AppError("Payout not found", 404);
  if (payout.status !== "PENDING") throw new AppError("Only pending payouts can be rejected", 400);

  const updated = await prisma.payout.update({
    where: { id: payoutId },
    data: { status: "FAILED", processedAt: new Date(), notes },
    select: { id: true, status: true, amount: true, processedAt: true },
  });

  return { ...updated, amount: Number(updated.amount) };
}

export async function getInstructorBalance(instructorId: string) {
  const PLATFORM_FEE_PERCENT = 10;

  const enrollments = await prisma.enrollment.findMany({
    where: { course: { instructorId } },
    select: { payment: { select: { totalAmount: true, status: true } } },
  });

  const totalEarned = enrollments
    .filter((e) => e.payment?.status === "SUCCEEDED")
    .reduce((sum, e) => sum + Number(e.payment?.totalAmount ?? 0), 0) * (1 - PLATFORM_FEE_PERCENT / 100);

  const completedPayouts = await prisma.payout.aggregate({
    where: { instructorId, status: "COMPLETED" },
    _sum: { amount: true },
  });

  const totalPaidOut = Number(completedPayouts._sum.amount ?? 0);
  const pendingBalance = Math.max(0, Math.round((totalEarned - totalPaidOut) * 100) / 100);

  return {
    pendingBalance,
    totalEarned: Math.round(totalEarned * 100) / 100,
  };
}

// Settings
const DEFAULT_SETTINGS = {
  platformName: "Relay",
  commissionRate: 10,
  currency: "INR",
  taxRates: {
    IN: 18,
    GB: 20,
    US: 0,
    CA: 13,
    AU: 10,
    SG: 9,
    DE: 19,
    FR: 20,
    AE: 5,
  },
};

export async function getSettings() {
  const settings = await prisma.platformSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    // Create default settings if none exist
    const created = await prisma.platformSettings.create({
      data: { id: "default", data: DEFAULT_SETTINGS },
    });
    return created.data;
  }

  return settings.data;
}

export async function updateSettings(input: UpdateSettingsInput) {
  const current = await getSettings() as Record<string, unknown>;

  const updated = {
    ...current,
    ...Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined)),
  } as unknown as Prisma.InputJsonValue;

  const saved = await prisma.platformSettings.upsert({
    where: { id: "default" },
    update: { data: updated },
    create: { id: "default", data: updated },
  });

  return saved.data;
}

// ─── Dashboard ────────────────────────────────────────────────

export async function getDashboardStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    revenueResult,
    recentEnrollments,
    usersByRole,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.payment.aggregate({
      where: { status: "SUCCEEDED" },
      _sum: { totalAmount: true },
    }),
    prisma.enrollment.findMany({
      take: 10,
      orderBy: { enrolledAt: "desc" },
      select: {
        id: true,
        enrolledAt: true,
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, price: true } },
        payment: { select: { totalAmount: true, status: true } },
      },
    }),
    prisma.user.groupBy({
      by: ["isAdmin", "isInstructor"],
      _count: true,
    }),
  ]);

  const roleBreakdown = { learners: 0, instructors: 0, admins: 0 };
  for (const row of usersByRole) {
    if (row.isAdmin) roleBreakdown.admins += row._count;
    else if (row.isInstructor) roleBreakdown.instructors += row._count;
    else roleBreakdown.learners += row._count;
  }

  return {
    kpis: {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue: Number(revenueResult._sum.totalAmount ?? 0),
    },
    roleBreakdown,
    recentEnrollments: recentEnrollments.map((e) => ({
      id: e.id,
      student: e.user.name,
      course: e.course.title,
      amount: e.payment ? Number(e.payment.totalAmount) : 0,
      date: e.enrolledAt,
    })),
  };
}

// ─── Analytics ────────────────────────────────────────────────

type RevenueByDayRow = { bucket: Date; revenue: string | null };
type GeoRow = { country: string; count: number; revenue: string | null };
type InstructorRow = { id: string; name: string; courseCount: number; totalStudents: number; totalRevenue: string | null };
type CourseRow = { id: string; title: string; instructor: string; enrollments: number; revenue: string | null; status: string };

export async function getAnalytics(range?: string) {
  const now = new Date();
  const days = range === "7d" ? 7 : range === "90d" ? 90 : range === "1y" ? 365 : 30;
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  const [revenueByDay, geoData, topInstructors, topCourses] = await Promise.all([
    // Revenue by day
    prisma.$queryRaw<RevenueByDayRow[]>`
      SELECT date_trunc('day', e."enrolled_at") AS bucket,
             SUM(p."total_amount") AS revenue
      FROM enrollments e
      JOIN payments p ON p.id = e."payment_id"
      WHERE p.status = 'SUCCEEDED'
        AND e."enrolled_at" >= ${startDate}
      GROUP BY bucket
      ORDER BY bucket
    `,
    // Geographic distribution
    prisma.$queryRaw<GeoRow[]>`
      SELECT p."billing_country" AS country,
             COUNT(*) AS count,
             SUM(p."total_amount") AS revenue
      FROM payments p
      WHERE p.status = 'SUCCEEDED'
        AND p."billing_country" IS NOT NULL
      GROUP BY country
      ORDER BY count DESC
      LIMIT 10
    `,
    // Top instructors
    prisma.$queryRaw<InstructorRow[]>`
      SELECT u.id, u.name,
             COUNT(DISTINCT c.id) AS "courseCount",
             COUNT(DISTINCT e.id) AS "totalStudents",
             COALESCE(SUM(p."total_amount"), 0) AS "totalRevenue"
      FROM users u
      JOIN courses c ON c."instructor_id" = u.id
      LEFT JOIN enrollments e ON e."course_id" = c.id
      LEFT JOIN payments p ON p.id = e."payment_id" AND p.status = 'SUCCEEDED'
      WHERE u.is_instructor = true
      GROUP BY u.id, u.name
      ORDER BY "totalRevenue" DESC
      LIMIT 10
    `,
    // Top courses
    prisma.$queryRaw<CourseRow[]>`
      SELECT c.id, c.title,
             u.name AS instructor,
             COUNT(DISTINCT e.id) AS enrollments,
             COALESCE(SUM(p."total_amount"), 0) AS revenue,
             c.status
      FROM courses c
      JOIN users u ON u.id = c."instructor_id"
      LEFT JOIN enrollments e ON e."course_id" = c.id
      LEFT JOIN payments p ON p.id = e."payment_id" AND p.status = 'SUCCEEDED'
      GROUP BY c.id, c.title, u.name, c.status
      ORDER BY revenue DESC
      LIMIT 10
    `,
  ]);

  return {
    revenueByDay: revenueByDay.map((r) => ({
      date: r.bucket.toISOString().slice(0, 10),
      revenue: Number(r.revenue ?? 0),
    })),
    geoDistribution: geoData.map((g) => ({
      country: g.country,
      enrollments: Number(g.count),
      revenue: Number(g.revenue ?? 0),
    })),
    topInstructors: topInstructors.map((i) => ({
      id: i.id,
      name: i.name,
      courseCount: Number(i.courseCount),
      students: Number(i.totalStudents),
      revenue: Number(i.totalRevenue ?? 0),
    })),
    topCourses: topCourses.map((c) => ({
      id: c.id,
      title: c.title,
      instructor: c.instructor,
      enrollments: Number(c.enrollments),
      revenue: Number(c.revenue ?? 0),
      status: c.status,
    })),
  };
}

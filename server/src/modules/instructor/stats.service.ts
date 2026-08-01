import { AppError } from "../../lib/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { Prisma } from "@prisma/client";

type SeriesRow = { bucket: Date; revenue: string | null };
type EnrollSeriesRow = { bucket: Date; enrollments: number };
type TopCourseRow = { id: string; title: string; students: number; revenue: string | null; completed: number };

const PRESET_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "60d": 60, "90d": 90, "1y": 365 };

function getRange(range?: string, from?: string, to?: string) {
    const now = new Date();
    let start = new Date(now);
    start.setDate(start.getDate() - (PRESET_DAYS[range ?? "30d"] ?? 30));
    let end = new Date(now);
    if (range === "custom" && from && to) {
        start = new Date(from);
        end = new Date(to);
        end.setDate(end.getDate() + 1);
    }
    const spanDays = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    const bucket = spanDays <= 45 ? "day" : spanDays <= 180 ? "week" : "month";
    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - spanDays);
    return { start, end, prevStart, bucket };
}

function bucketStart(d: Date, bucket: string): Date {
    const nd = new Date(d);
    nd.setUTCHours(0, 0, 0, 0);
    if (bucket === "week") {
        nd.setUTCDate(nd.getUTCDate() - ((nd.getUTCDay() + 6) % 7));
    } else if (bucket === "month") {
        nd.setUTCDate(1);
    }
    return nd;
}

function generateLabels(start: Date, end: Date, bucket: string): string[] {
    const labels: string[] = [];
    const d = bucketStart(start, bucket);
    while (d < end) {
        labels.push(d.toISOString().slice(0, 10));
        if (bucket === "day") d.setUTCDate(d.getUTCDate() + 1);
        else if (bucket === "week") d.setUTCDate(d.getUTCDate() + 7);
        else d.setUTCMonth(d.getUTCMonth() + 1);
    }
    return labels;
}

function delta(cur: number, prev: number): number | null {
    if (prev > 0) return Math.round(((cur - prev) / prev) * 1000) / 10;
    return null;
}

export async function getOverviewStats(userId: string, range?: string, from?: string, to?: string) {
    const { start, end, prevStart, bucket } = getRange(range, from, to);

    const paidWhere = (gte: Date, lt: Date): Prisma.PaymentWhereInput => ({
        status: "SUCCEEDED",
        createdAt: { gte, lt },
        enrollments: { some: { course: { instructorId: userId } } },
    });

    const [revenueSeries, enrollSeries, revenueCur, revenuePrev, studentsCur, studentsPrev,
        ordersCur, ordersPrev, completed, totalStudents, topCourses, attentionRows, unpublishedLessonsCount, draftCourses, unpublishedChangeCourses, recentEnrollments, recentPayments] = await Promise.all([
            prisma.$queryRaw<SeriesRow[]>`
            SELECT date_trunc(${bucket}, p.created_at)::date AS bucket, SUM(p.total_amount) AS revenue
            FROM payments p
            JOIN enrollments e ON e.payment_id = p.id
            JOIN courses c ON c.id = e.course_id
            WHERE c.instructor_id = ${userId} AND p.status = 'SUCCEEDED'
              AND p.created_at >= ${start} AND p.created_at < ${end}
            GROUP BY 1`,

            prisma.$queryRaw<EnrollSeriesRow[]>`
            SELECT date_trunc(${bucket}, e.enrolled_at)::date AS bucket, COUNT(*)::int AS enrollments
            FROM enrollments e
            JOIN courses c ON c.id = e.course_id
            WHERE c.instructor_id = ${userId}
              AND e.enrolled_at >= ${start} AND e.enrolled_at < ${end}
            GROUP BY 1`,

            prisma.payment.aggregate({ where: paidWhere(start, end), _sum: { totalAmount: true } }),
            prisma.payment.aggregate({ where: paidWhere(prevStart, start), _sum: { totalAmount: true } }),

            prisma.enrollment.count({ where: { course: { instructorId: userId }, enrolledAt: { gte: start, lt: end } } }),
            prisma.enrollment.count({ where: { course: { instructorId: userId }, enrolledAt: { gte: prevStart, lt: start } } }),

            prisma.payment.count({ where: paidWhere(start, end) }),
            prisma.payment.count({ where: paidWhere(prevStart, start) }),

            prisma.enrollment.count({ where: { course: { instructorId: userId }, status: "COMPLETED" } }),
            prisma.enrollment.count({ where: { course: { instructorId: userId } } }),

            prisma.$queryRaw<TopCourseRow[]>`
            SELECT c.id, c.title, COUNT(DISTINCT e.id)::int AS students,
                COALESCE(SUM(p.total_amount) FILTER (WHERE p.status='SUCCEEDED'), 0) AS revenue,
                COUNT(*) FILTER (WHERE e.status='COMPLETED')::int AS completed
            FROM courses c
            LEFT JOIN enrollments e ON e.course_id = c.id
            LEFT JOIN payments p ON p.id = e.payment_id
            WHERE c.instructor_id = ${userId}
            GROUP BY c.id, c.title
            ORDER BY revenue DESC
            LIMIT 5`,

            prisma.course.groupBy({
                by: ["status"],
                where: { instructorId: userId },
                _count: { _all: true },
            }),

            prisma.course.count({
                where: {
                    instructorId: userId,
                    status: "PUBLISHED",
                    chapters: { some: { lessons: { some: { status: "DRAFT" } } } },
                },
            }),

            prisma.course.findMany({
                where: { instructorId: userId, status: "DRAFT" },
                select: { id: true, title: true, updatedAt: true },
                orderBy: { updatedAt: "desc" },
                take: 4,
            }),

            prisma.$queryRaw<{ id: string; title: string; updatedAt: Date; draftLessons: number }[]>`
            SELECT c.id, c.title, c.updated_at AS "updatedAt",
                COUNT(l.id)::int AS "draftLessons"
            FROM courses c
            JOIN chapters ch ON ch.course_id = c.id
            JOIN lessons l ON l.chapter_id = ch.id AND l.status = 'DRAFT'
            WHERE c.instructor_id = ${userId} AND c.status = 'PUBLISHED'
            GROUP BY c.id, c.title, c.updated_at
            ORDER BY c.updated_at DESC
            LIMIT 4`,

            prisma.enrollment.findMany({
                where: { course: { instructorId: userId } },
                select: {
                    id: true,
                    enrolledAt: true,
                    course: { select: { id: true, title: true } },
                    user: { select: { name: true } },
                },
                orderBy: { enrolledAt: "desc" },
                take: 8,
            }),

            prisma.payment.findMany({
                where: { status: "SUCCEEDED", enrollments: { some: { course: { instructorId: userId } } } },
                select: {
                    id: true,
                    totalAmount: true,
                    createdAt: true,
                    user: { select: { name: true } },
                    enrollments: { select: { course: { select: { id: true, title: true } } } },
                },
                orderBy: { createdAt: "desc" },
                take: 8,
            }),
        ]);

    const revenueMap = new Map(revenueSeries.map((r) => [r.bucket.toISOString().slice(0, 10), Number(r.revenue ?? 0)]));
    const enrollMap = new Map(enrollSeries.map((r) => [r.bucket.toISOString().slice(0, 10), r.enrollments]));

    const series = generateLabels(start, end, bucket).map((label) => ({
        label,
        revenue: revenueMap.get(label) ?? 0,
        enrollments: enrollMap.get(label) ?? 0,
    }));

    const revenueValue = Number(revenueCur._sum?.totalAmount ?? 0);
    const revenuePrevValue = Number(revenuePrev._sum?.totalAmount ?? 0);

    const statusCounts = new Map(attentionRows.map((r) => [r.status, r._count._all]));
    const attentionCourses = [
        ...draftCourses.map((c) => ({
            id: c.id,
            title: c.title,
            category: "draft" as const,
            updatedAt: c.updatedAt,
            draftLessonCount: 0,
        })),
        ...unpublishedChangeCourses.map((c) => ({
            id: c.id,
            title: c.title,
            category: "unpublished" as const,
            updatedAt: c.updatedAt,
            draftLessonCount: c.draftLessons,
        })),
    ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const attention = {
        drafts: statusCounts.get("DRAFT") ?? 0,
        pendingApproval: statusCounts.get("PENDING_APPROVAL") ?? 0,
        rejected: statusCounts.get("REJECTED") ?? 0,
        unpublishedLessons: unpublishedLessonsCount,
        courses: attentionCourses,
    };

    const activity = [
        ...recentEnrollments.map((e) => ({
            id: e.id,
            type: "enrollment" as const,
            studentName: e.user.name ?? "Anonymous",
            courseId: e.course.id,
            courseTitle: e.course.title,
            amount: null as number | null,
            createdAt: e.enrolledAt,
        })),
        ...recentPayments.map((p) => ({
            id: p.id,
            type: "sale" as const,
            studentName: p.user?.name ?? "Anonymous",
            courseId: p.enrollments[0]?.course.id ?? null,
            courseTitle: p.enrollments[0]?.course.title ?? "Unknown course",
            amount: Number(p.totalAmount),
            createdAt: p.createdAt,
        })),
    ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8);

    return {
        kpis: {
            revenue: { value: revenueValue, delta: delta(revenueValue, revenuePrevValue) },
            students: { value: studentsCur, delta: delta(studentsCur, studentsPrev) },
            orders: { value: ordersCur, delta: delta(ordersCur, ordersPrev) },
            completionRate: totalStudents > 0 ? Math.round((completed / totalStudents) * 100) : 0,
        },
        series,
        topCourses: topCourses.map((c) => ({
            id: c.id,
            title: c.title,
            students: c.students,
            revenue: Number(c.revenue ?? 0),
            completionRate: c.students > 0 ? Math.round((c.completed / c.students) * 100) : 0,
        })),
        attention,
        activity,
    };
}

export async function getCourseStats(userId: string, courseId: string, range?: string, from?: string, to?: string) {
    const course = await prisma.course.findFirst({
        where: { id: courseId, instructorId: userId },
        select: { id: true, title: true, status: true },
    });
    if (!course) throw new AppError("Course not found", 404);

    const { start, end, prevStart, bucket } = getRange(range, from, to);
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

    const paidWhere = (gte: Date, lt: Date): Prisma.PaymentWhereInput => ({
        status: "SUCCEEDED",
        createdAt: { gte, lt },
        enrollments: { some: { courseId } },
    });

    const [studentsCur, studentsPrev, revenueCur, revenuePrev, activeLearners, completedCount, totalStudents, enrollmentSeries, lessons, couponUsage, countrySplit, recentEnrollments] =
        await Promise.all([
            prisma.enrollment.count({ where: { courseId, enrolledAt: { gte: start, lt: end } } }),
            prisma.enrollment.count({ where: { courseId, enrolledAt: { gte: prevStart, lt: start } } }),
            prisma.payment.aggregate({ where: paidWhere(start, end), _sum: { totalAmount: true } }),
            prisma.payment.aggregate({ where: paidWhere(prevStart, start), _sum: { totalAmount: true } }),
            prisma.lessonProgress.groupBy({
                by: ["userId"],
                where: { lesson: { chapter: { courseId } }, completedAt: { gte: sevenDaysAgo } },
            }),
            prisma.enrollment.count({ where: { courseId, status: "COMPLETED" } }),
            prisma.enrollment.count({ where: { courseId } }),
            prisma.$queryRaw<{ bucket: Date; count: number }[]>`
                SELECT date_trunc(${bucket}, e.enrolled_at)::date AS bucket, COUNT(*)::int AS count
                FROM enrollments e
                WHERE e.course_id = ${courseId}
                  AND e.enrolled_at >= ${start} AND e.enrolled_at < ${end}
                GROUP BY 1`,
            prisma.lesson.findMany({
                where: { chapter: { courseId }, status: "PUBLISHED" },
                select: {
                    id: true,
                    title: true,
                    orderIndex: true,
                    chapter: { select: { title: true, orderIndex: true } },
                    _count: { select: { progress: true } },
                },
                orderBy: [{ chapter: { orderIndex: "asc" } }, { orderIndex: "asc" }],
            }),
            prisma.payment.groupBy({
                by: ["couponId"],
                where: { status: "SUCCEEDED", couponId: { not: null }, enrollments: { some: { courseId } } },
                _count: { _all: true },
            }),
            prisma.payment.groupBy({
                by: ["billingCountry"],
                where: { status: "SUCCEEDED", enrollments: { some: { courseId } } },
                _count: { _all: true },
            }),
            prisma.enrollment.findMany({
                where: { courseId },
                select: { id: true, enrolledAt: true, status: true, progressPercent: true, user: { select: { name: true } } },
                orderBy: { enrolledAt: "desc" },
                take: 5,
            }),
        ]);

    const couponCodes = await prisma.coupon.findMany({
        where: { id: { in: couponUsage.map((c) => c.couponId).filter((id): id is string => id !== null) } },
        select: { id: true, code: true },
    });
    const codeById = new Map(couponCodes.map((c) => [c.id, c.code]));

    const enrollMap = new Map(enrollmentSeries.map((r) => [r.bucket.toISOString().slice(0, 10), r.count]));
    const series = generateLabels(start, end, bucket).map((label) => ({
        label,
        count: enrollMap.get(label) ?? 0,
    }));

    const revenueValue = Number(revenueCur._sum?.totalAmount ?? 0);
    const revenuePrevValue = Number(revenuePrev._sum?.totalAmount ?? 0);

    return {
        course: { id: course.id, title: course.title, status: course.status },
        kpis: {
            students: { value: studentsCur, delta: delta(studentsCur, studentsPrev) },
            revenue: { value: revenueValue, delta: delta(revenueValue, revenuePrevValue) },
            activeLearners: activeLearners.length,
            completionRate: totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0,
        },
        enrollmentSeries: series,
        lessonFunnel: lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            chapterTitle: lesson.chapter.title,
            orderIndex: lesson.orderIndex,
            completed: lesson._count.progress,
            completionRate: totalStudents > 0 ? Math.round((lesson._count.progress / totalStudents) * 100) : 0,
        })),
        couponUsage: couponUsage
            .map((c) => ({ code: c.couponId ? codeById.get(c.couponId) ?? "Unknown" : "Unknown", uses: c._count._all }))
            .filter((c) => c.code !== "Unknown")
            .sort((a, b) => b.uses - a.uses)
            .slice(0, 5),
        countrySplit: countrySplit
            .map((c) => ({ country: c.billingCountry, count: c._count._all }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6),
        recentEnrollments: recentEnrollments.map((e) => ({
            id: e.id,
            studentName: e.user.name,
            enrolledAt: e.enrolledAt,
            status: e.status,
            progressPercent: e.progressPercent,
        })),
    };
}

export async function getCoursesAnalytics(userId: string, range?: string, from?: string, to?: string) {
    const { start, end, prevStart } = getRange(range, from, to);
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

    const paidWhere = (gte: Date, lt: Date): Prisma.PaymentWhereInput => ({
        status: "SUCCEEDED",
        createdAt: { gte, lt },
        enrollments: { some: { course: { instructorId: userId } } },
    });

    const [
        studentsCur,
        studentsPrev,
        revenueCur,
        revenuePrev,
        activeLearners,
        completedCount,
        totalEnrollments,
        progressBuckets,
        contentTypeRows,
        compAgg,
        couponOrders,
        courseRows,
        courseStatusGroups,
        recentProgress,
        paymentsForCourses,
    ] = await Promise.all([
        prisma.enrollment.count({ where: { course: { instructorId: userId }, enrolledAt: { gte: start, lt: end } } }),
        prisma.enrollment.count({ where: { course: { instructorId: userId }, enrolledAt: { gte: prevStart, lt: start } } }),
        prisma.payment.aggregate({ where: paidWhere(start, end), _sum: { totalAmount: true } }),
        prisma.payment.aggregate({ where: paidWhere(prevStart, start), _sum: { totalAmount: true } }),
        prisma.lessonProgress.groupBy({
            by: ["userId"],
            where: { lesson: { chapter: { course: { instructorId: userId } } }, completedAt: { gte: sevenDaysAgo } },
        }),
        prisma.enrollment.count({ where: { course: { instructorId: userId }, status: "COMPLETED" } }),
        prisma.enrollment.count({ where: { course: { instructorId: userId } } }),
        prisma.$queryRaw<{ bucket: string; count: number }[]>`
            SELECT CASE
                WHEN e.progress_percent < 25 THEN '0-25'
                WHEN e.progress_percent < 50 THEN '25-50'
                WHEN e.progress_percent < 75 THEN '50-75'
                ELSE '75-100' END AS bucket,
                COUNT(*)::int AS count
            FROM enrollments e
            JOIN courses c ON c.id = e.course_id
            WHERE c.instructor_id = ${userId}
            GROUP BY 1`,
        prisma.$queryRaw<{ type: string; lessons: number; completions: number }[]>`
            SELECT l.content_type::text AS type,
                COUNT(DISTINCT l.id)::int AS lessons,
                COUNT(lp.id)::int AS completions
            FROM lessons l
            JOIN chapters ch ON ch.id = l.chapter_id
            JOIN courses c ON c.id = ch.course_id
            LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id
            WHERE c.instructor_id = ${userId} AND l.status = 'PUBLISHED'
            GROUP BY l.content_type`,
        prisma.payment.aggregate({
            where: { ...paidWhere(start, end) },
            _sum: { subtotal: true, discountAmount: true, taxAmount: true },
            _count: { _all: true },
        }),
        prisma.payment.count({ where: { ...paidWhere(start, end), couponId: { not: null } } }),
        prisma.course.findMany({
            where: { instructorId: userId },
            select: { id: true, title: true, status: true, updatedAt: true },
        }),
        prisma.enrollment.groupBy({
            by: ["courseId", "status"],
            where: { course: { instructorId: userId } },
            _count: { _all: true },
        }),
        prisma.lessonProgress.findMany({
            where: { lesson: { chapter: { course: { instructorId: userId } } }, completedAt: { gte: sevenDaysAgo } },
            select: { enrollment: { select: { courseId: true, userId: true } } },
        }),
        prisma.payment.findMany({
            where: { status: "SUCCEEDED", enrollments: { some: { course: { instructorId: userId } } } },
            select: { totalAmount: true, enrollments: { select: { courseId: true } } },
        }),
    ]);

    const bucketCounts = new Map(progressBuckets.map((r) => [r.bucket, r.count]));
    const progressDistribution = ["0-25", "25-50", "50-75", "75-100"].map((bucket) => ({
        bucket,
        count: bucketCounts.get(bucket) ?? 0,
    }));

    const contentTypeCompletion = contentTypeRows.map((r) => ({
        type: r.type.toUpperCase(),
        lessons: r.lessons,
        completions: r.completions,
        rate:
            r.lessons > 0 && totalEnrollments > 0
                ? Math.round((r.completions / (r.lessons * totalEnrollments)) * 100)
                : 0,
    }));

    const revenueValue = Number(revenueCur._sum?.totalAmount ?? 0);
    const revenuePrevValue = Number(revenuePrev._sum?.totalAmount ?? 0);

    const revenueComposition = {
        subtotal: Number(compAgg._sum?.subtotal ?? 0),
        discount: Number(compAgg._sum?.discountAmount ?? 0),
        tax: Number(compAgg._sum?.taxAmount ?? 0),
        couponOrders,
        totalOrders: compAgg._count._all,
    };

    const totalsByCourse = new Map<string, number>();
    for (const group of courseStatusGroups) {
        totalsByCourse.set(group.courseId, (totalsByCourse.get(group.courseId) ?? 0) + group._count._all);
    }
    const completedByCourse = new Map(
        courseStatusGroups
            .filter((g) => g.status === "COMPLETED")
            .map((g) => [g.courseId, g._count._all] as [string, number]),
    );

    const revenueByCourse = new Map<string, number>();
    for (const payment of paymentsForCourses) {
        const amount = Number(payment.totalAmount);
        for (const enrollment of payment.enrollments) {
            revenueByCourse.set(enrollment.courseId, (revenueByCourse.get(enrollment.courseId) ?? 0) + amount);
        }
    }

    const activeByCourse = new Map<string, Set<string>>();
    for (const progress of recentProgress) {
        const { courseId, userId: learnerId } = progress.enrollment;
        if (!activeByCourse.has(courseId)) activeByCourse.set(courseId, new Set());
        activeByCourse.get(courseId)!.add(learnerId);
    }

    const courses = courseRows.map((course) => {
        const total = totalsByCourse.get(course.id) ?? 0;
        const completed = completedByCourse.get(course.id) ?? 0;
        return {
            id: course.id,
            title: course.title,
            status: course.status,
            students: total,
            revenue: revenueByCourse.get(course.id) ?? 0,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            activeLearners: activeByCourse.get(course.id)?.size ?? 0,
            updatedAt: course.updatedAt,
        };
    });

    return {
        kpis: {
            students: { value: studentsCur, delta: delta(studentsCur, studentsPrev) },
            revenue: { value: revenueValue, delta: delta(revenueValue, revenuePrevValue) },
            activeLearners: activeLearners.length,
            completionRate: totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100) : 0,
        },
        progressDistribution,
        contentTypeCompletion,
        revenueComposition,
        courses,
    };
}

export const PLATFORM_FEE_RATE = 0.1;

type TrendRow = { bucket: Date; courseId: string; revenue: string };

export async function getEarningsStats(userId: string, range?: string, from?: string, to?: string) {
    const { start, end, prevStart, bucket } = getRange(range, from, to);

    const paidWhere = (gte: Date, lt: Date): Prisma.PaymentWhereInput => ({
        status: "SUCCEEDED",
        createdAt: { gte, lt },
        enrollments: { some: { course: { instructorId: userId } } },
    });

    const [moneyCur, moneyPrev, byCoursePayments, prevCoursePayments, trendRows, couponGroups, transactions] =
        await Promise.all([
            prisma.payment.aggregate({
                where: paidWhere(start, end),
                _sum: { subtotal: true, discountAmount: true, taxAmount: true, totalAmount: true },
                _count: { _all: true },
            }),
            prisma.payment.aggregate({
                where: paidWhere(prevStart, start),
                _sum: { subtotal: true, discountAmount: true, taxAmount: true, totalAmount: true },
                _count: { _all: true },
            }),
            prisma.payment.findMany({
                where: paidWhere(start, end),
                select: {
                    totalAmount: true,
                    enrollments: { select: { course: { select: { id: true, title: true } } } },
                },
            }),
            prisma.payment.findMany({
                where: paidWhere(prevStart, start),
                select: {
                    totalAmount: true,
                    enrollments: { select: { course: { select: { id: true, title: true } } } },
                },
            }),
            prisma.$queryRaw<TrendRow[]>`
                SELECT date_trunc(${bucket}, p.created_at)::date AS bucket, e.course_id AS "courseId", SUM(p.total_amount)::float AS revenue
                FROM payments p
                JOIN enrollments e ON e.payment_id = p.id
                JOIN courses c ON c.id = e.course_id
                WHERE c.instructor_id = ${userId} AND p.status = 'SUCCEEDED'
                  AND p.created_at >= ${start} AND p.created_at < ${end}
                GROUP BY 1, 2`,
            prisma.payment.groupBy({
                by: ["couponId"],
                where: { ...paidWhere(start, end), couponId: { not: null } },
                _count: { _all: true },
                _sum: { totalAmount: true },
            }),
            prisma.payment.findMany({
                where: { enrollments: { some: { course: { instructorId: userId } } } },
                select: {
                    id: true,
                    createdAt: true,
                    status: true,
                    totalAmount: true,
                    invoiceUrl: true,
                    couponId: true,
                    user: { select: { name: true } },
                    enrollments: { select: { course: { select: { title: true } } } },
                },
                orderBy: { createdAt: "desc" },
                take: 8,
            }),
        ]);

    const usedCouponIds = [
        ...new Set(
            couponGroups
                .map((g) => g.couponId)
                .concat(transactions.map((t) => t.couponId))
                .filter((id): id is string => Boolean(id)),
        ),
    ];

    const couponRows =
        usedCouponIds.length > 0
            ? await prisma.coupon.findMany({
                  where: { id: { in: usedCouponIds } },
                  select: { id: true, code: true, usedCount: true, maxUses: true, isActive: true, expiresAt: true },
              })
            : [];

    const couponById = new Map(couponRows.map((c) => [c.id, c]));

    const courseStats = new Map<string, { title: string; gross: number; orders: number; prevGross: number }>();
    const accumulate = (payments: typeof byCoursePayments, current: boolean) => {
        for (const payment of payments) {
            const amount = Number(payment.totalAmount);
            for (const enrollment of payment.enrollments) {
                const row = courseStats.get(enrollment.course.id) ?? {
                    title: enrollment.course.title,
                    gross: 0,
                    orders: 0,
                    prevGross: 0,
                };
                if (current) {
                    row.gross += amount;
                    row.orders += 1;
                } else {
                    row.prevGross += amount;
                }
                courseStats.set(enrollment.course.id, row);
            }
        }
    };
    accumulate(byCoursePayments, true);
    accumulate(prevCoursePayments, false);

    const courses = [...courseStats.entries()]
        .map(([id, row]) => ({
            id,
            title: row.title,
            net: Math.round(row.gross * (1 - PLATFORM_FEE_RATE) * 100) / 100,
            gross: Math.round(row.gross * 100) / 100,
            orders: row.orders,
            growth:
                row.prevGross > 0
                    ? delta(row.gross * (1 - PLATFORM_FEE_RATE), row.prevGross * (1 - PLATFORM_FEE_RATE))
                    : null,
        }))
        .sort((a, b) => b.net - a.net);

    const trendByDate = new Map<string, { total: number; byCourse: Map<string, number> }>();
    const courseTotals = new Map<string, number>();
    for (const row of trendRows) {
        const value = Number(row.revenue ?? 0);
        courseTotals.set(row.courseId, (courseTotals.get(row.courseId) ?? 0) + value);
        const label = row.bucket.toISOString().slice(0, 10);
        const entry = trendByDate.get(label) ?? { total: 0, byCourse: new Map<string, number>() };
        entry.total += value;
        entry.byCourse.set(row.courseId, (entry.byCourse.get(row.courseId) ?? 0) + value);
        trendByDate.set(label, entry);
    }

    const titleById = new Map(courseStats.entries());
    const trendCourses = [...courseTotals.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => ({ id, title: titleById.get(id)?.title ?? "Course" }));

    const series = generateLabels(start, end, bucket).map((label) => {
        const entry = trendByDate.get(label);
        const byCourse: Record<string, number> = {};
        if (entry) {
            for (const [courseId, value] of entry.byCourse) {
                byCourse[courseId] = Math.round(value * 100) / 100;
            }
        }
        return {
            label,
            total: Math.round((entry?.total ?? 0) * 100) / 100,
            byCourse,
        };
    });

    const coupons = couponGroups
        .map((group) => {
            const coupon = group.couponId ? couponById.get(group.couponId) : undefined;
            const expired = coupon?.expiresAt ? coupon.expiresAt.getTime() < Date.now() : false;
            const status = coupon?.isActive && !expired ? "active" : expired ? "expired" : "inactive";
            return {
                code: coupon?.code ?? "Deleted coupon",
                orders: group._count._all,
                revenue: Number(group._sum?.totalAmount ?? 0),
                usedCount: coupon?.usedCount ?? 0,
                maxUses: coupon?.maxUses ?? 0,
                status,
            };
        })
        .sort((a, b) => b.revenue - a.revenue);

    const transactionsList = transactions.map((t) => ({
        id: t.id,
        studentName: t.user?.name ?? "Anonymous",
        courseTitle: t.enrollments[0]?.course.title ?? "Unknown course",
        couponCode: t.couponId ? (couponById.get(t.couponId)?.code ?? null) : null,
        amount: Number(t.totalAmount),
        status: t.status,
        createdAt: t.createdAt,
        invoiceUrl: t.invoiceUrl,
    }));

    const grossValue = Number(moneyCur._sum?.totalAmount ?? 0);
    const grossPrevValue = Number(moneyPrev._sum?.totalAmount ?? 0);
    const ordersValue = moneyCur._count._all;
    const ordersPrevValue = moneyPrev._count._all;
    const discountsValue = Number(moneyCur._sum?.discountAmount ?? 0);
    const discountsPrevValue = Number(moneyPrev._sum?.discountAmount ?? 0);
    const netValue = grossValue * (1 - PLATFORM_FEE_RATE);
    const netPrevValue = grossPrevValue * (1 - PLATFORM_FEE_RATE);

    return {
        kpis: {
            gross: { value: Math.round(grossValue * 100) / 100, delta: delta(grossValue, grossPrevValue) },
            net: { value: Math.round(netValue * 100) / 100, delta: delta(netValue, netPrevValue) },
            orders: { value: ordersValue, delta: delta(ordersValue, ordersPrevValue) },
            discounts: { value: Math.round(discountsValue * 100) / 100, delta: delta(discountsValue, discountsPrevValue) },
        },
        moneyFlow: {
            listPrice: Number(moneyCur._sum?.subtotal ?? 0),
            discounts: discountsValue,
            tax: Number(moneyCur._sum?.taxAmount ?? 0),
            gross: Math.round(grossValue * 100) / 100,
            fee: Math.round(grossValue * PLATFORM_FEE_RATE * 100) / 100,
            net: Math.round(netValue * 100) / 100,
        },
        trend: { courses: trendCourses, series },
        courses,
        coupons,
        transactions: transactionsList,
    };
}
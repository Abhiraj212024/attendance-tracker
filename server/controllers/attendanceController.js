const { getDay, addDays } = require("date-fns");
const AttendanceDay = require("../models/AttendanceDay");
const Course = require("../models/Course");
const { normalizedDateOnly } = require("../utils/normalizedDate");
const { rebuildSingleDay } = require("../services/attendanceRebuilder");


const getWeekday = (day_idx) => {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[day_idx];
};

/* =========================
   GET SINGLE ATTENDANCE DAY
   ========================= */
const getAttendanceDate = async (req, res) => {
  const date = req.params.date;

  // CHANGE 1: Validate as date-only string (no Date parsing)
  const normalizedDate = normalizedDateOnly(date);
  if (!normalizedDate) {
    return res.status(400).json({ message: "Invalid date format (YYYY-MM-DD)" });
  }

  try {
    const foundDay = await AttendanceDay.findOne({
      user: req.user,
      date: normalizedDate,
    }).populate("records.course", "code name");

    if (foundDay) {
      return res.json(foundDay);
    }

    // CHANGE 2: Only now create Date object (locked to midnight)
    const jsDate = new Date(normalizedDate + "T00:00:00");

    // CHANGE 3: Apply override safely
    const overrideDay = req.query.override;
    const appliedDay = overrideDay || getWeekday(getDay(jsDate));

    const courses = await Course.find({ user: req.user });

    // CHANGE 4: Records store ObjectId only (schema-consistent)
    const records = courses
      .filter((course) => course.schedule[appliedDay] > 0)
      .map((course) => ({
        course: course._id,
        status: "attended",
        count: course.schedule[appliedDay],
      }));

    // CHANGE 5: Build mongoose doc and populate (no fake embedded objects)
    const tempDay = new AttendanceDay({
      user: req.user,
      date: normalizedDate,
      isHoliday: false,
      overrideDay: overrideDay || null,
      records,
    });

    await tempDay.populate("records.course", "code name");

    res.json(tempDay);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

/* ======================
   CREATE ATTENDANCE DAY
   ====================== */
const postAttendance = async (req, res) => {
  const { date, isHoliday, overrideDay, records } = req.body;

  // CHANGE 6: Validate date string directly
  const normalizedDate = normalizedDateOnly(date);
  if (!normalizedDate || !Array.isArray(records)) {
    return res
      .status(400)
      .json({ message: "Date (YYYY-MM-DD) and records array are required" });
  }

  try {
    const existing = await AttendanceDay.findOne({
      user: req.user,
      date: normalizedDate,
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "Attendance already exists for this date" });
    }

    const userCourses = await Course.find({ user: req.user });
    const validCourseIds = new Set(
      userCourses.map((course) => course._id.toString())
    );

    // strip bad records
    const cleanedRecords = records.filter(r => r && r.course)

    // CHANGE 7: Correct, safe validation
    for (const record of cleanedRecords) {
      const courseId = record.course?._id || record.course;
      const { status, count } = record;

      if (!validCourseIds.has(courseId?.toString())) {
        return res.status(400).json({ message: "Invalid course in records" });
      }

      if (!["attended", "missed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      if (!Number.isInteger(count) || count < 1) {
        return res
          .status(400)
          .json({ message: "Count must be a positive integer" });
      }
    }

    await AttendanceDay.create({
      user: req.user,
      date: normalizedDate,
      isHoliday: !!isHoliday,
      overrideDay: overrideDay || null,
      records,
    });

    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

/* ======================
   UPDATE ATTENDANCE DAY
   ====================== */
const putAttendanceDate = async (req, res) => {
  const date = req.params.date;
  const { isHoliday, overrideDay, records } = req.body;

  // CHANGE 8: Validate date string directly
  const normalizedDate = normalizedDateOnly(date);
  if (!normalizedDate || !Array.isArray(records)) {
    return res
      .status(400)
      .json({ message: "Valid date and records array are required" });
  }

  try {
    let foundDay = await AttendanceDay.findOne({
      user: req.user,
      date: normalizedDate,
    });

    if (!foundDay) {
      foundDay = new AttendanceDay({
        user: req.user,
        date: normalizedDate,
      });
    }

    const userCourses = await Course.find({ user: req.user });
    const validCourseIds = new Set(
      userCourses.map((course) => course._id.toString())
    );

    // strip bad records
    const cleanedRecords = records.filter(r => r && r.course)

    // CHANGE 9: Unified validation
    for (const record of cleanedRecords) {
      const courseId = record.course?._id || record.course;
      const { status, count } = record;

      if (!validCourseIds.has(courseId?.toString())) {
        return res.status(400).json({ message: "Invalid course in records" });
      }

      if (!["attended", "missed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      if (!Number.isInteger(count) || count < 1) {
        return res
          .status(400)
          .json({ message: "Count must be a positive integer" });
      }
    }

    foundDay.isHoliday = !!isHoliday;
    foundDay.overrideDay = overrideDay || null;
    foundDay.records = records;

    await foundDay.save();

    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

/* ==========================
   GET RANGE (MONTH VIEW)
   ========================== */
const getAttendanceRange = async (req, res) => {
  const { start, end } = req.query;

  // CHANGE 10: No Date parsing for ranges
  const startNormalized = normalizedDateOnly(start);
  const endNormalized = normalizedDateOnly(end);

  if (!startNormalized || !endNormalized) {
    return res
      .status(400)
      .json({ message: "Invalid start or end date (YYYY-MM-DD)" });
  }

  try {
    const days = await AttendanceDay.find({
      user: req.user,
      date: { $gte: startNormalized, $lte: endNormalized },
    })
      .sort({ date: 1 })
      .select("date isHoliday overrideDay")
      .lean();

    res.json(days);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const rebuildAttendanceDay = async (req, res) => {
  const date = req.params.date;
  const { overrideDay } = req.body;

  const normalizedDate = normalizedDateOnly(date);
  if (!normalizedDate) {
    return res.status(400).json({ message: "Invalid date" });
  }

  try {
    // apply override before rebuild
    let day = await AttendanceDay.findOne({ user: req.user, date: normalizedDate });

    if (day) {
      day.overrideDay = overrideDay || null;
      day.isHoliday = false;
      await day.save();
    }

    await rebuildSingleDay(req.user, normalizedDate);

    const rebuilt = await AttendanceDay.findOne({
      user: req.user,
      date: normalizedDate
    }).populate("records.course", "code name");

    res.json(rebuilt);

  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
};

const getDashboardMetrics = async (req, res) => {
  const { start, end } = req.query;

  const startNormalized = normalizedDateOnly(start);
  const endNormalized = normalizedDateOnly(end);

  if (!startNormalized || !endNormalized) {
    return res.status(400).json({ message: "Invalid start or end date" });
  }

  try {
    const courses = await Course.find({ user: req.user }).lean();
    const attendanceDays = await AttendanceDay.find({
      user: req.user,
      date: { $gte: startNormalized, $lte: endNormalized }
    }).populate("records.course", "code name").lean();

    const attendanceMap = new Map();
    attendanceDays.forEach(d => attendanceMap.set(d.date, d));

    const metrics = {};
    courses.forEach(course => {
      metrics[course._id.toString()] = {
        courseId: course._id,
        code: course.code,
        name: course.name,
        attended: 0,
        total: 0,
        missed: 0,
        cancelled: 0,
        maxAttended: 0,
        maxTotal: 0
      };
    });

    // Get today as YYYY-MM-DD string (server's local time)
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    console.log('\n=== DASHBOARD DEBUG ===');
    console.log('Today:', todayStr);
    console.log('Semester:', startNormalized, 'to', endNormalized);
    console.log('Stored days:', attendanceDays.length);
    console.log('Stored dates:', attendanceDays.map(d => d.date).sort());
    console.log('======================\n');

    // FIX: Parse the normalized date strings directly to ensure correct start
    let cur = new Date(startNormalized + "T12:00:00"); // Use noon to avoid timezone issues
    const endDate = new Date(endNormalized + "T12:00:00");

    let debugDayCount = 0;
    const debugDays = [];

    while (cur <= endDate) {
      const iso = cur.toISOString().split("T")[0];
      const stored = attendanceMap.get(iso);

      let appliedDay = getWeekday(getDay(cur));
      let isHoliday = false;

      if (stored) {
        isHoliday = stored.isHoliday;
        appliedDay = stored.overrideDay || appliedDay;
      }

      // ✅ FIX: Compare date strings - future is AFTER today
      const isFuture = iso > todayStr;

      // Debug first course for first 20 days
      if (debugDayCount < 20 && courses.length > 0) {
        const firstCourse = courses[0];
        const scheduled = firstCourse.schedule[appliedDay] || 0;
        debugDays.push({
          date: iso,
          day: appliedDay,
          stored: !!stored,
          isFuture,
          scheduled,
          isHoliday
        });
        debugDayCount++;
      }

      if (!isHoliday) {
        for (const course of courses) {
          const cid = course._id.toString();
          const scheduled = course.schedule[appliedDay] || 0;

          if (scheduled <= 0) continue;

          // Always add to max (includes future potential)
          metrics[cid].maxTotal += scheduled;
          metrics[cid].maxAttended += scheduled;

          if (stored && stored.records) {
            // Day exists in DB - use actual data
            const rec = stored.records.find(r => {
              if (!r.course || !r.course._id) return false;
              return r.course._id.toString() === cid;
            });

            if (rec) {
              // Found a record for this course
              if (rec.status === "cancelled") {
                // Cancelled - remove from totals
                metrics[cid].maxTotal -= rec.count;
                metrics[cid].maxAttended -= rec.count;
                metrics[cid].cancelled += rec.count;
              } else {
                // Attended or Missed - count toward current
                metrics[cid].total += rec.count;
                if (rec.status === "attended") {
                  metrics[cid].attended += rec.count;
                } else if (rec.status === "missed") {
                  metrics[cid].missed += rec.count;
                }
              }
            } else {
              // Course not in records (overridden out) - remove from max
              metrics[cid].maxTotal -= scheduled;
              metrics[cid].maxAttended -= scheduled;
            }
          } else if (!isFuture) {
            // ✅ CRITICAL: Past/today, not in DB → assume fully attended
            metrics[cid].total += scheduled;
            metrics[cid].attended += scheduled;
          }
          // ✅ Future days: already counted in max, don't count in current
        }
      }

      cur = addDays(cur, 1);
    }

    const output = Object.values(metrics).map(c => {
      const currentPct = c.total === 0 ? 0 : (c.attended / c.total) * 100;
      const maxPct = c.maxTotal === 0 ? 0 : ((c.maxAttended - c.missed) / c.maxTotal) * 100;

      return {
        courseId: c.courseId,
        code: c.code,
        name: c.name,
        attended: c.attended,
        total: c.total,
        missed: c.missed,
        cancelled: c.cancelled,
        maxAttended: c.maxAttended,
        maxTotal: c.maxTotal,
        currentPercentage: Number(currentPct.toFixed(2)),
        maxPossiblePercentage: Number(maxPct.toFixed(2))
      };
    });

    console.log('Sample output:', output[0]);
    console.log('\n=== DAY-BY-DAY DEBUG (CS2030) ===');
    console.table(debugDays);
    console.log('==================================\n');

    res.json({ courses: output });

  } catch (e) {
    console.error('Dashboard error:', e);
    res.sendStatus(500);
  }
};
module.exports = {
  getAttendanceDate,
  postAttendance,
  putAttendanceDate,
  getAttendanceRange,
  rebuildAttendanceDay,
  getDashboardMetrics
};

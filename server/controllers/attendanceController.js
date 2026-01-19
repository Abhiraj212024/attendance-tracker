const { getDay } = require("date-fns");
const AttendanceDay = require("../models/AttendanceDay");
const Course = require("../models/Course");
const { normalizedDateOnly } = require("../utils/normalizedDate");

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

    // CHANGE 7: Correct, safe validation
    for (const record of records) {
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

    // CHANGE 9: Unified validation
    for (const record of records) {
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

  const jsDate = new Date(normalizedDate + "T00:00:00");
  const appliedDay = overrideDay || getWeekday(getDay(jsDate));

  try {
    let day = await AttendanceDay.findOne({
      user: req.user,
      date: normalizedDate
    });

    const courses = await Course.find({ user: req.user });

    const records = courses
      .filter(course => course.schedule[appliedDay] > 0)
      .map(course => ({
        course: course._id,
        status: "attended",
        count: course.schedule[appliedDay]
      }));

    if (!day) {
      day = new AttendanceDay({
        user: req.user,
        date: normalizedDate,
        isHoliday: false,
        overrideDay: overrideDay || null,
        records
      });
    } else {
      day.overrideDay = overrideDay || null;
      day.isHoliday = false;
      day.records = records;
    }

    await day.save();
    await day.populate("records.course", "code name");

    res.json(day);

  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
};


module.exports = {
  getAttendanceDate,
  postAttendance,
  putAttendanceDate,
  getAttendanceRange,
  rebuildAttendanceDay
};

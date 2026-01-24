const { getDay, addDays } = require("date-fns");
const AttendanceDay = require("../models/AttendanceDay");
const Course = require("../models/Course");

const getWeekday = (day_idx) => {
  const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  return days[day_idx];
};

/* =========================
   REBUILD ONE DAY
========================= */
async function rebuildSingleDay(userId, normalizedDate) {
  const jsDate = new Date(normalizedDate + "T00:00:00");

  let day = await AttendanceDay.findOne({ user: userId, date: normalizedDate });

  const appliedDay = day?.overrideDay || getWeekday(getDay(jsDate));
  const courses = await Course.find({ user: userId });

  const fresh = courses
    .filter(course => course.schedule[appliedDay] > 0)
    .map(course => ({
      courseId: course._id.toString(),
      count: course.schedule[appliedDay]
    }));

  if (!day) {
    day = new AttendanceDay({
      user: userId,
      date: normalizedDate,
      isHoliday: false,
      overrideDay: null,
      records: fresh.map(f => ({
        course: f.courseId,
        status: "attended",
        count: f.count
      }))
    });
  } else if (!day.isHoliday) {
    const oldMap = new Map(
      day.records.map(r => [r.course.toString(), r])
    );

    const merged = [];

    for (const f of fresh) {
      const old = oldMap.get(f.courseId);

      if (old) {
        // ✅ preserve status, update count
        merged.push({
          course: old.course,
          status: old.status,
          count: f.count
        });
      } else {
        // ✅ new class added
        merged.push({
          course: f.courseId,
          status: "attended",
          count: f.count
        });
      }
    }

    day.records = merged;
  }

  await day.save();
  return day;
}

/* =========================
   REBUILD ALL DAYS
========================= */
async function rebuildAllDays(userId) {
  const first = await AttendanceDay.findOne({ user: userId }).sort({ date: 1 });
  const last  = await AttendanceDay.findOne({ user: userId }).sort({ date: -1 });

  if (!first || !last) return;

  let cur = new Date(first.date + "T00:00:00");
  const end = new Date(last.date + "T00:00:00");

  while (cur <= end) {
    const iso = cur.toISOString().split("T")[0];
    await rebuildSingleDay(userId, iso);
    cur = addDays(cur, 1);
  }
}

module.exports = {
  rebuildSingleDay,
  rebuildAllDays
};

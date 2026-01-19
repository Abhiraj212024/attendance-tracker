const normalizedDateOnly = (dateStr) => {
    if(typeof dateStr !== "string") return null;
    if(! /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
    return dateStr;
}

module.exports = { normalizedDateOnly }
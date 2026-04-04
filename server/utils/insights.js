function generateInsights(sessions) {
  if (!sessions.length) return [];

  const totalSeconds = sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
  const avgSeconds = totalSeconds / sessions.length;
  const avgMinutes = Math.round(avgSeconds / 60);

  const byHour = new Map();
  sessions.forEach((session) => {
    const date = new Date(session.startedAt);
    const hour = date.getHours();
    byHour.set(hour, (byHour.get(hour) ?? 0) + session.durationSeconds);
  });
  const topHourEntry = Array.from(byHour.entries()).sort((a, b) => b[1] - a[1])[0];
  const topHour = topHourEntry ? topHourEntry[0] : null;

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todaySessions = sessions.filter((s) => new Date(s.startedAt) >= startOfToday);
  const yesterday = new Date(startOfToday);
  yesterday.setDate(startOfToday.getDate() - 1);
  const yesterdaySessions = sessions.filter(
    (s) => new Date(s.startedAt) >= yesterday && new Date(s.startedAt) < startOfToday
  );

  const todayDistractions = todaySessions.reduce((sum, s) => sum + (s.distractions || 0), 0);
  const yesterdayDistractions = yesterdaySessions.reduce((sum, s) => sum + (s.distractions || 0), 0);

  const insights = [];
  if (topHour !== null) {
    const label = topHour >= 17 ? "evening" : topHour >= 12 ? "afternoon" : "morning";
    insights.push(`You are most focused in the ${label}.`);
  }

  insights.push(`Your average focus time is ${avgMinutes} minutes.`);

  if (todaySessions.length > 0 || yesterdaySessions.length > 0) {
    if (todayDistractions > yesterdayDistractions) {
      insights.push("Your distractions increased today.");
    } else if (todayDistractions < yesterdayDistractions) {
      insights.push("Your distractions decreased today.");
    }
  }

  return insights;
}

module.exports = { generateInsights };

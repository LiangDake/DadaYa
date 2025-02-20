export const filterActivitiesByDate = (activities: any[], filter: string) => {
  const now = new Date();
  const startOfToday = new Date(now.setHours(0, 0, 0, 0));
  const startOfTomorrow = new Date(now.setHours(24, 0, 0, 0));
  const startOfWeekend = new Date(now.setDate(now.getDate() + (6 - now.getDay()))); // 周末是本周的星期六

  return activities.filter((activity) => {
    const activityDate = new Date(activity.date);

    switch (filter) {
      case 'passed':
        return activityDate < now; // 确保是从现在之前的活动
      case 'upcoming':
        return activityDate >= now; // 确保是从现在开始以后的活动
      case 'today':
        return activityDate >= startOfToday && activityDate < startOfTomorrow;
      case 'tomorrow':
        return (
          activityDate >= startOfTomorrow &&
          activityDate < new Date(startOfTomorrow.getTime() + 24 * 60 * 60 * 1000)
        ); // 明天
      case 'weekend':
        return (
          activityDate >= startOfWeekend &&
          activityDate < new Date(startOfWeekend.getTime() + 48 * 60 * 60 * 1000)
        ); // 周末
      default:
        return activityDate >= now;
    }
  });
};

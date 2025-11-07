import { Pickup, Recycling, Volunteer } from "./dashboard.model.js";

function getMonthRanges() {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(currentMonthStart.getTime() - 1);
  return { currentMonthStart, previousMonthStart, previousMonthEnd };
}

function calcChange(current, previous) {
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
}

async function getDashboardData() {
  const { currentMonthStart, previousMonthStart, previousMonthEnd } = getMonthRanges();

  // Total pickups current and previous month
  const totalPickupsCurrent = await Pickup.countDocuments({
    pickupDate: { $gte: currentMonthStart },
  });
  const totalPickupsPrevious = await Pickup.countDocuments({
    pickupDate: { $gte: previousMonthStart, $lte: previousMonthEnd },
  });

  // Total recycled items current and previous month
  const recycledCurrentResult = await Recycling.aggregate([
    { $match: { date: { $gte: currentMonthStart } } },
    { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } },
  ]);
  const recycledPreviousResult = await Recycling.aggregate([
    { $match: { date: { $gte: previousMonthStart, $lte: previousMonthEnd } } },
    { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } },
  ]);

  // Total CO2 saved current and previous month
  const co2CurrentResult = await Recycling.aggregate([
    { $match: { date: { $gte: currentMonthStart } } },
    { $group: { _id: null, totalCo2: { $sum: "$co2SavedKg" } } },
  ]);
  const co2PreviousResult = await Recycling.aggregate([
    { $match: { date: { $gte: previousMonthStart, $lte: previousMonthEnd } } },
    { $group: { _id: null, totalCo2: { $sum: "$co2SavedKg" } } },
  ]);

  // Total volunteer hours current and previous month
  const volunteerCurrentResult = await Volunteer.aggregate([
    { $match: { date: { $gte: currentMonthStart } } },
    { $group: { _id: null, totalHours: { $sum: "$hours" } } },
  ]);
  const volunteerPreviousResult = await Volunteer.aggregate([
    { $match: { date: { $gte: previousMonthStart, $lte: previousMonthEnd } } },
    { $group: { _id: null, totalHours: { $sum: "$hours" } } },
  ]);

  // Upcoming pickups (next 7 days)
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingPickups = await Pickup.find({
    pickupDate: { $gte: now, $lte: nextWeek },
    status: "Scheduled",
  })
    .sort({ pickupDate: 1 })
    .limit(10)
    .select("address pickupDate time -_id")
    .lean();

  // Recycling breakdown by material type this month
  const recyclingBreakdownData = await Recycling.aggregate([
    { $match: { date: { $gte: currentMonthStart } } },
    { $group: { _id: "$materialType", totalQuantity: { $sum: "$quantity" } } },
  ]);

  const recyclingBreakdown = {};
  recyclingBreakdownData.forEach((item) => {
    recyclingBreakdown[item._id] = item.totalQuantity;
  });

  return {
    totalPickups: totalPickupsCurrent,
    pickupsChangePercent: calcChange(totalPickupsCurrent, totalPickupsPrevious),

    totalRecycledItems: recycledCurrentResult[0]?.totalQuantity || 0,
    recycledItemsChangePercent: calcChange(
      recycledCurrentResult[0]?.totalQuantity || 0,
      recycledPreviousResult[0]?.totalQuantity || 0
    ),

    totalCO2SavedKg: co2CurrentResult[0]?.totalCo2 || 0,
    co2SavedChangePercent: calcChange(
      co2CurrentResult[0]?.totalCo2 || 0,
      co2PreviousResult[0]?.totalCo2 || 0
    ),

    totalVolunteerHours: volunteerCurrentResult[0]?.totalHours || 0,
    volunteerHoursChangePercent: calcChange(
      volunteerCurrentResult[0]?.totalHours || 0,
      volunteerPreviousResult[0]?.totalHours || 0
    ),

    upcomingPickups,

    recyclingBreakdown,
  };
}

export { getDashboardData };

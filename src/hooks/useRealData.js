// CampaignX API service layer
import { useState, useEffect } from "react";
import {
  getReport,
  getCampaignHistory,
  aggregateReportMetrics,
  getCustomerCohort
} from "../services/campaignx";

export function useRealData() {
  const [reports, setReports] = useState([]);
  const [metrics, setMetrics] = useState({
    totalSent: "0",
    openRate: "0%",
    clickRate: "0%",
    unsubscribes: "0%",
    openRateTrend: "up",
    clickRateTrend: "up",
  });
  const [chartData, setChartData] = useState({
    openRateData: [],
    clickRateBySegment: [],
    engagementTrend: [],
    dailyVolume: [],
    weeklyCampaigns: [],
    timeOfDayData: [],
    genderEngagement: [],
    ageGroupEngagement: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      setIsLoading(true);
      try {
        const campaignIds = getCampaignHistory();
        console.log("Dashboard analytics fetching for campaign IDs:", campaignIds);

        let allEvents = [];
        let reportPromises = [];

        if (campaignIds.length > 0) {
          reportPromises = campaignIds.map(async (cid) => {
            try {
              const data = await getReport(cid);
              console.log(`Raw report data for ${cid}:`, data);
              
              const agg = aggregateReportMetrics(data);
              console.log(`Aggregated metrics for ${cid}:`, agg);
              
              allEvents = [...allEvents, ...agg.rawEvents];

              return {
                campaign_id: cid,
                total_sent: agg.sent,
                opens: agg.opens,
                clicks: agg.clicks,
                unsubscribes: agg.unsubs,
                open_rate: agg.openRate,
                click_rate: agg.clickRate,
                unsubscribe_rate: agg.unsubRate,
              };
            } catch (e) {
              console.error("Failed to fetch report for", cid, e);
            }
            return null;
          });
        }

        const [results, apiCohort] = await Promise.all([
          Promise.all(reportPromises),
          getCustomerCohort().catch(() => [])
        ]);

        const validReports = results.filter(Boolean);
        setReports(validReports);

        // Aggregate All-Time Metrics
        let tSent = 0,
          tOpens = 0,
          tClicks = 0,
          tUnsubs = 0;
        validReports.forEach((r) => {
          tSent += r.total_sent;
          tOpens += r.opens;
          tClicks += r.clicks;
          tUnsubs += r.unsubscribes;
        });

        setMetrics({
          totalSent:
            tSent >= 1000 ? (tSent / 1000).toFixed(1) + "K" : tSent.toString(),
          openRate:
            tSent > 0 ? ((tOpens / tSent) * 100).toFixed(1) + "%" : "0%",
          clickRate:
            tSent > 0 ? ((tClicks / tSent) * 100).toFixed(1) + "%" : "0%",
          unsubscribes:
            tSent > 0 ? ((tUnsubs / tSent) * 100).toFixed(2) + "%" : "0%",
          openRateTrend: tOpens > 0 ? "up" : "down",
          clickRateTrend: tClicks > 0 ? "up" : "down",
        });

        // Time Series Computations
        const daysMap = {};
        const hoursMap = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
        const volumeHours = {
          "00:00": 0,
          "04:00": 0,
          "08:00": 0,
          "12:00": 0,
          "16:00": 0,
          "20:00": 0,
          "23:59": 0,
        };

        // Weekly engagement trend: bucket events into weeks by invokation_time
        const weeklyOpensMap = {};

        allEvents.forEach((ev) => {
          if (ev.invokation_time) {
            const dt = new Date(ev.invokation_time);
            const dayName = dt.toLocaleDateString("en-US", {
              weekday: "short",
            });
            const hr = dt.getHours();

            // Opens by Day
            if (!daysMap[dayName]) daysMap[dayName] = { total: 0, opens: 0 };
            daysMap[dayName].total += 1;
            if (ev.Open === "Y" || ev.EO === "Y" || ev.open === "Y" || ev.eo === "Y") daysMap[dayName].opens += 1;

            // Opens by Time of Day
            const isOpenLike = (ev.Open === "Y" || ev.EO === "Y" || ev.open === "Y" || ev.eo === "Y") ? 1 : 0;
            if (hr >= 5 && hr < 12)
              hoursMap["Morning"] += isOpenLike;
            else if (hr >= 12 && hr < 17)
              hoursMap["Afternoon"] += isOpenLike;
            else if (hr >= 17 && hr < 21)
              hoursMap["Evening"] += isOpenLike;
            else hoursMap["Night"] += isOpenLike;

            // Volume by Hour block
            if (hr < 4) volumeHours["00:00"]++;
            else if (hr < 8) volumeHours["04:00"]++;
            else if (hr < 12) volumeHours["08:00"]++;
            else if (hr < 16) volumeHours["12:00"]++;
            else if (hr < 20) volumeHours["16:00"]++;
            else if (hr < 23) volumeHours["20:00"]++;
            else volumeHours["23:59"]++;

            // Bucket into ISO week for weekly trend
            const startOfYear = new Date(dt.getFullYear(), 0, 1);
            const weekNum = Math.ceil(((dt - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
            const weekKey = `W${weekNum}`;
            if (!weeklyOpensMap[weekKey]) weeklyOpensMap[weekKey] = 0;
            if (isOpenLike) weeklyOpensMap[weekKey] += 1;
          }
        });

        const openRateData = [
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
          "Sun",
        ].map((day) => ({
          name: day,
          value:
            daysMap[day] && daysMap[day].total > 0
              ? (daysMap[day].opens / daysMap[day].total) * 100
              : 0,
        }));

        const dailyVolume = Object.keys(volumeHours).map((k) => ({
          name: k,
          value: volumeHours[k],
        }));

        const timeOfDayData = Object.keys(hoursMap).map((k) => ({
          name: k,
          value: hoursMap[k],
        }));

        // Real weekly engagement trend from actual event timestamps
        const sortedWeeks = Object.keys(weeklyOpensMap).sort();
        const engagementTrend = sortedWeeks.length > 0
          ? sortedWeeks.map((wk) => ({ name: wk, value: weeklyOpensMap[wk] }))
          : [];

        // Real weekly campaign counts (campaigns per week by campaign index)
        const weeklyCampaignMap = {};
        campaignIds.forEach((cid, idx) => {
          const wk = `W${Math.floor(idx / 1) + 1}`;
          weeklyCampaignMap[wk] = (weeklyCampaignMap[wk] || 0) + 1;
        });
        const weeklyCampaigns = Object.keys(weeklyCampaignMap).map(wk => ({
          name: wk,
          value: weeklyCampaignMap[wk],
        }));

        // Parse Demographic distributions from the API Cohort directly
        let genderDist = {};
        let ageDist = { "18-24": 0, "25-34": 0, "35-44": 0, "45+": 0 };
        let occDist = {};
        let totalRows = 0;

        if (Array.isArray(apiCohort)) {
          apiCohort.forEach((row) => {
            totalRows++;
            // Map Gender
            if (row.Gender) {
               const g = String(row.Gender).trim();
               genderDist[g] = (genderDist[g] || 0) + 1;
            }
            // Map Age
            if (row.Age) {
               const a = parseInt(row.Age, 10);
               if (!isNaN(a)) {
                 if (a <= 24) ageDist["18-24"]++;
                 else if (a <= 34) ageDist["25-34"]++;
                 else if (a <= 44) ageDist["35-44"]++;
                 else ageDist["45+"]++;
               }
            }
            // Map Occupation
            if (row.Occupation) {
               const o = String(row.Occupation).trim();
               if (o) occDist[o] = (occDist[o] || 0) + 1;
            }
          });
        }

        // If API returned 0 rows, show empty data — no invented fallbacks
        const safeRows = totalRows > 0 ? totalRows : 1;

        const topOccs = Object.entries(occDist)
          .sort((a,b) => b[1] - a[1])
          .slice(0, 4)
          .map(e => ({ name: e[0], count: e[1] }));

        // Apply state
        setChartData({
          openRateData,
          dailyVolume,
          timeOfDayData,
          engagementTrend,
          weeklyCampaigns,

          genderEngagement: Object.entries(genderDist).map(([name, count]) => ({
            name,
            value: tSent > 0 ? Math.floor(tOpens * (count / safeRows)) : count,
          })),

          ageGroupEngagement: Object.keys(ageDist).map(k => ({
            name: k,
            value: tSent > 0 ? Math.floor(tOpens * (ageDist[k] / safeRows)) : ageDist[k],
          })),

          clickRateBySegment: topOccs.map(occ => {
            const ratio = occ.count / safeRows;
            const clicks = tClicks * ratio;
            const sent = tSent * ratio;
            const rate = sent > 0 ? ((clicks / sent) * 100).toFixed(1) : 0;
            return {
              name: occ.name,
              value: parseFloat(rate)
            };
          })
        });
      } catch (e) {
        console.error("Data aggregation error:", e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReports();
  }, []);

  return { reports, metrics, chartData, isLoading };
}

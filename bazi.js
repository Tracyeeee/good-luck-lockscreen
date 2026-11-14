"use strict";

const bazi = (() => {
  const names = [..."木火土金水"];
  const stems = "甲乙丙丁戊己庚辛壬癸";
  const hiddenWeights = [[1], [.7,.3], [.6,.3,.1]];
  const day = 86400000;
  const mod = (n, size) => ((n % size) + size) % size;
  const element = stem => names[Math.floor(stems.indexOf(stem) / 2)];

  function parseDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "1900-01-01" || value > "2099-12-31") {
      throw new Error("请填写有效的公历出生日期。");
    }
    const date = new Date(value + "T00:00:00Z");
    if (!Number.isFinite(+date) || date.toISOString().slice(0,10) !== value) {
      throw new Error("请填写有效的公历出生日期。");
    }
    return date;
  }

  function getChart(Solar, time) {
    const date = new Date(time);
    const chart = Solar.fromYmdHms(date.getUTCFullYear(),date.getUTCMonth()+1,date.getUTCDate(),
      date.getUTCHours(),date.getUTCMinutes(),date.getUTCSeconds()).getLunar().getEightChar();
    chart.setSect(2);
    return chart;
  }

  // Turn a civil clock reading into an instant. Reject DST gaps and repeated times.
  function civilInstant(wallTime, zone) {
    let formatter;
    try {
      formatter = new Intl.DateTimeFormat("en-GB",{
        timeZone:zone, calendar:"gregory", numberingSystem:"latn",
        year:"numeric", month:"numeric", day:"numeric", hour:"numeric", minute:"numeric", second:"numeric", hourCycle:"h23",
      });
    } catch {
      throw new Error("请选择有效的出生时区。");
    }
    const civil = instant => {
      const parts = Object.fromEntries(formatter.formatToParts(instant).map(({type,value}) => [type,Number(value)]));
      return Date.UTC(parts.year,parts.month-1,parts.day,parts.hour,parts.minute,parts.second);
    };
    const probes = [wallTime-day,wallTime,wallTime+day];
    const offsets = new Set(probes.map(instant => civil(instant)-instant));
    const matches = [...offsets].map(offset => wallTime-offset).filter(instant => civil(instant) === wallTime);
    if (matches.length !== 1) throw new Error("这个时间遇到夏令时换钟，请核对出生时间，或只按生日查看建议。");
    return matches[0];
  }

  function chartPillars(Solar, date, time, zone) {
    const birth = parseDate(date);
    if (!time) {
      const stem = getChart(Solar,+birth+day/2).getDayGan();
      return {dayStem:stem, mode:"day", candidates:[element(stem)]};
    }
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time) || !zone) throw new Error("请补全出生时间和时区。");
    const wall = Date.parse(date + "T" + time + ":00Z");
    const instant = civilInstant(wall,zone);
    // Lunar's solar-term calculations use UTC+8. Day and hour use the birthplace civil clock.
    const terms = getChart(Solar,instant + 8*3600000);
    const local = getChart(Solar,wall);
    const values = [
      [terms.getYear(),terms.getYearHideGan()],
      [terms.getMonth(),terms.getMonthHideGan()],
      [local.getDay(),local.getDayHideGan()],
      [local.getTime(),local.getTimeHideGan()],
    ];
    const dayStem = local.getDayGan();
    const index = names.indexOf(element(dayStem));
    const points = [0,0,0,0,0];
    values.forEach(([pillar,hidden],position) => {
      points[names.indexOf(element(pillar[0]))] += 1;
      hidden.forEach((stem,i) => {
        points[names.indexOf(element(stem))] += hiddenWeights[hidden.length-1][i] * (position === 1 ? 2 : 1);
      });
    });
    const producer = mod(index-1,5);
    const share = (points[index]+points[producer])/9;
    const roots = values.some(([,hidden]) => hidden.some(stem => [names[index],names[producer]].includes(element(stem))));
    const special = (share < .20 && !roots) || (share >= .80 && element(values[1][1][0]) === names[index]);
    let candidates = [];
    if (!special && share > .55) candidates = [mod(index+3,5),mod(index+1,5),mod(index+2,5)].map(i => names[i]);
    if (!special && share < .45) candidates = [names[producer],names[index]];
    return {mode:"pillars", dayStem, pillars:values.map(([pillar]) => pillar), candidates, special};
  }

  return {chartPillars};
})();
if (typeof module === "object" && module.exports) module.exports = bazi;

$(document).ready(function () {
  $('.js-example-basic-multiple').select2();
});

$('#restaurant-dropdown').on('select2:close', function () {
  const selectedValues = $('#restaurant-dropdown').select2('data');
  const values = selectedValues.map(({ text }) => text);
  clearMedianBox();
  for(let value of values) {
    createMedianByRestaurant(ALL_REPORTS, value);
  }
  search(values);
});

function uniq(arr) {
  return [...new Set(arr)].sort();
}

function search(patterns) {
  const traces = patterns.map(pattern =>
      reportsToTrace(
          ALL_REPORTS.filter(report => report.resturaunts.toLowerCase().includes(pattern.toLowerCase())),
          pattern,
      ),
  );
  Plotly.react(CHART, traces, LAYOUT, CONFIG);
}

function createDropDown(values) {
  const dropdown = document.getElementById('restaurant-dropdown');
  for (let value of values) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.innerText = value;
    dropdown.appendChild(opt);
  }
}

function clearMedianBox() {
  let list = document.getElementById("median-box");
  while (list.hasChildNodes()) {
    list.removeChild(list.firstChild);
  }
}

function createMedianBox(date, restaurant) {
  const medianBox = document.createElement('div');
  const text = document.createElement('h4');
  text.innerText = `מסעדת ${restaurant} מגיע עד ${date.getHours() + ':' + `${(date.getMinutes() + '').length === 1 ? `0${date.getMinutes()}` : date.getMinutes()}`}`;
  medianBox.appendChild(text);
  medianBox.id = restaurant;
  document.getElementById('median-box').appendChild(medianBox);
}

function median(numbers) {
  const sorted = Array.from(numbers).sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

function createMedianByRestaurant(reports, restaurant) {
  const values = reports.filter(r =>r.resturaunts === restaurant).map(d=> new Date(`01-01-2022,${d.time}`).getTime());
  const d = new Date(median(values));
  createMedianBox(d, restaurant);
}

function reportsToTrace(reports, name) {
  return {
    type: 'scatter',
    mode: 'markers',
    name: name || 'הכל',
    text: reports.map(report => report.resturaunts),
    x: reports.map(report => report.date),
    y: reports.map(report => '1970-01-01 ' + report.time),
  };
}
const CHART = document.getElementById('chart');
const LAYOUT = {
  title: 'מתי דיווחו על הגעה?',
  showlegend: true,
  yaxis: { range: ['1970-01-01 11:00:00', '1970-01-01 15:00:00'], tickformat: '%H:%M' },
};
const CONFIG = { scrollZoom: true };

createDropDown(
    uniq(
        ALL_REPORTS
            .map(report => report.resturaunts.split(/\s+/))
            .flat()
            .map(word => word.trim()),
    ),
);
Plotly.newPlot(CHART, [reportsToTrace(ALL_REPORTS)], LAYOUT, CONFIG);

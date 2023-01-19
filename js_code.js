// Create the list of states
var states = ee.List(['Iowa', 'Nebraska',
'Minnesota', 'Illinois', 'Kansas', 'Indiana',
'Wisconsin', 'Missouri', 'South Dakota', 'Ohio', 'Arkansas',
'North Dakota', 'Mississippi'])

// Import State Boundaries
var tiger = ee.FeatureCollection("TIGER/2018/States").filter(ee.Filter.inList('NAME', states))

// Import Crop Mask
var crops = ee.ImageCollection("USDA/NASS/CDL")

// Select the crop mask for year 2015
var crop_mask = crops
.filter(ee.Filter.calendarRange(2015, 2015, 'year'))
.first()
.select('cropland')

// Define the function that samples points form crop mask within each state
var sampler = function(feature){
  var samples = crop_mask.sample({
    'region': feature.geometry(), // Select the region for sampling
    'geometries': true, // Return geometries
    'scale': 1000, // Scale of sampling
    'numPixels': 500 // Number of pixels
  }).geometry()
  
  var state_name = feature.get('NAME')
  
  return ee.Feature(samples, {'state_name': state_name})
}

// Sample for all the states (map the function over a FeatureCollection)
var samples = tiger.map(sampler)

// Choose the state from the list
var state_name = ee.String(states.get(0))

// Print the state name
print(state_name)

// Select only samples for one particular state
var sample = samples.filter(ee.Filter.eq('state_name', state_name))


// Load MODIS vegetation indices data
var collection = ee.ImageCollection('MODIS/061/MOD13Q1')
                     .filter(ee.Filter.or(
                         ee.Filter.date('2000-01-01', '2001-01-01'),
                         ee.Filter.date('2001-01-01', '2002-01-01'),
                         ee.Filter.date('2002-01-01', '2003-01-01'),
                         ee.Filter.date('2003-01-01', '2004-01-01'),
                         ee.Filter.date('2004-01-01', '2005-01-01'),
                         ee.Filter.date('2005-01-01', '2006-01-01'),
                         ee.Filter.date('2006-01-01', '2007-01-01'),
                         ee.Filter.date('2007-01-01', '2008-01-01'),
                         ee.Filter.date('2008-01-01', '2009-01-01'),
                         ee.Filter.date('2009-01-01', '2010-01-01'),
                         ee.Filter.date('2010-01-01', '2011-01-01'),
                         ee.Filter.date('2011-01-01', '2012-01-01'),
                         ee.Filter.date('2012-01-01', '2013-01-01'),
                         ee.Filter.date('2013-01-01', '2014-01-01'),
                         ee.Filter.date('2014-01-01', '2015-01-01'),
                         ee.Filter.date('2015-01-01', '2016-01-01'),
                         ee.Filter.date('2016-01-01', '2017-01-01'),
                         ee.Filter.date('2017-01-01', '2018-01-01'),
                         ee.Filter.date('2018-01-01', '2019-01-01'),
                         ee.Filter.date('2019-01-01', '2020-01-01'),
                         ee.Filter.date('2020-01-01', '2021-01-01'),
                         ee.Filter.date('2021-01-01', '2022-01-01')))
                     .select(['NDVI', 'EVI']);

// Define the chart and print it to the console
var chart = ui.Chart.image
                .doySeriesByYear({
                  imageCollection: collection,
                  bandName: 'NDVI',
                  region: sample,
                  regionReducer: ee.Reducer.mean(),
                  scale: 500,
                  sameDayReducer: ee.Reducer.mean(),
                  startDay: 1,
                  endDay: 365
                })
                .setOptions({
                  title: 'Average NDVI Value by Day of Year for Cropland',
                  hAxis: {
                    title: 'Day of year',
                    titleTextStyle: {italic: false, bold: true}
                  },
                  vAxis: {
                    title: 'Average NDVI',
                    titleTextStyle: {italic: false, bold: true}
                  },
                  lineWidth: 3,
                  colors: ['39a8a7', '9c4f97', 'a83940', '3946a8',
                  '39a878', 'a88939', 'a84f39', 'a86539', 'a8a239',
                  '64a839', '3944a8', '7139a8', 'a839a4', 'a83939', '39a8a8',
                  '3946a8', '7239a8', '9939a8', '39a894', '39a83b',
                  '39a86d', '96a839'],
                });
print(chart);
#!/usr/bin/env node
/**
 * ERT Module API Test
 * Tests Team Tracking and Deployment Locations via map visualization
 */

const BASE_URL = 'http://localhost:3000/api/v1';

const tests = [
  {
    name: 'Create Alpha Unit in Oromia Region',
    method: 'POST',
    url: '/ert',
    body: {
      name: 'Alpha Unit',
      region: 'Oromia Region',
      latitude: 9.0320,
      longitude: 38.7469,
    },
  },
  {
    name: 'Create Bravo Unit at Base Camp',
    method: 'POST',
    url: '/ert',
    body: {
      name: 'Bravo Unit',
      region: 'Addis Ababa',
      latitude: 9.0320,
      longitude: 38.7469,
    },
  },
  {
    name: 'Create Charlie Unit (Amhara)',
    method: 'POST',
    url: '/ert',
    body: {
      name: 'Charlie Unit',
      region: 'Amhara Region',
      latitude: 11.5564,
      longitude: 39.5858,
    },
  },
  {
    name: 'List all ERT units',
    method: 'GET',
    url: '/ert',
  },
  {
    name: 'Filter ERT units by Oromia Region',
    method: 'GET',
    url: '/ert?region=Oromia%20Region',
  },
  {
    name: 'Get ERT map (all units)',
    method: 'GET',
    url: '/ert-map',
  },
  {
    name: 'Get nearby units around Addis (50km)',
    method: 'GET',
    url: '/ert-map/nearby?lat=9.0320&lon=38.7469&radiusKm=50',
  },
];

async function runTests() {
  console.log('🚀 ERT Module API Tests\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  for (const test of tests) {
    console.log(`\n📍 ${test.name}`);
    console.log(`${test.method} ${test.url}`);

    try {
      const options = {
        method: test.method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (test.body) {
        options.body = JSON.stringify(test.body);
        console.log(`Body: ${JSON.stringify(test.body, null, 2)}`);
      }

      const response = await fetch(`${BASE_URL}${test.url}`, options);
      const data = await response.json();

      console.log(`Status: ${response.status}`);
      console.log(`Response: ${JSON.stringify(data, null, 2)}`);

      if (!response.ok) {
        console.error(`❌ Test failed: ${response.statusText}`);
      } else {
        console.log('✅ Test passed');
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n✨ ERT API tests complete!\n');
}

runTests().catch(console.error);

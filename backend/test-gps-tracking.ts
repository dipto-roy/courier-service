import axios from 'axios';
import io, { Socket } from 'socket.io-client';

const API_BASE_URL = 'http://localhost:3001/api';
const WS_URL = 'http://localhost:3001';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
  shipmentAwb?: string;
  isOnline?: boolean;
}

/**
 * 🧪 GPS Latitude/Longitude Tracking Test
 * Tests the complete location tracking system
 */
async function testGPSTracking() {
  console.log('🌍 GPS Latitude/Longitude Tracking Test Suite');
  console.log('=============================================\n');

  let testsPassed = 0;
  let testsFailed = 0;
  let riderToken = '';
  let riderId = '';

  try {
    // 1️⃣ Create a rider account
    console.log('📝 Step 1: Creating rider account...');
    const signupRes = await axios.post(`${API_BASE_URL}/auth/signup`, {
      name: 'GPS Test Rider',
      email: `rider-gps-${Date.now()}@test.com`,
      phone: `017${Math.floor(Math.random() * 100000000)
        .toString()
        .padStart(8, '0')}`,
      password: 'SecurePass123!',
      role: 'rider',
      city: 'Dhaka',
      area: 'Gulshan',
      address: 'GPS Test Location',
    });

    if (signupRes.data.success) {
      riderToken = signupRes.data.accessToken;
      riderId = signupRes.data.user.id;
      console.log('✅ Rider created: ' + signupRes.data.user.email);
      testsPassed++;
    } else {
      console.log('❌ Failed to create rider');
      testsFailed++;
      return;
    }

    // 2️⃣ Test single location update
    console.log('\n📍 Step 2: Testing single location update (Dhaka coordinates)...');
    const locationUpdate: LocationData = {
      latitude: 23.8103,
      longitude: 90.4161712,
      accuracy: 10.5,
      speed: 25.5,
      heading: 180,
      batteryLevel: 85,
      isOnline: true,
    };

    const updateRes = await axios.post(
      `${API_BASE_URL}/rider/update-location`,
      locationUpdate,
      {
        headers: { Authorization: `Bearer ${riderToken}` },
      },
    );

    if (updateRes.data.success) {
      console.log(`✅ Location updated: ${locationUpdate.latitude}, ${locationUpdate.longitude}`);
      console.log(
        `   Response: ${JSON.stringify(updateRes.data.location, null, 2)}`,
      );
      testsPassed++;
    } else {
      console.log('❌ Failed to update location');
      testsFailed++;
    }

    // 3️⃣ Test location history
    console.log('\n📊 Step 3: Retrieving location history...');
    const historyRes = await axios.get(`${API_BASE_URL}/rider/location-history?limit=10`, {
      headers: { Authorization: `Bearer ${riderToken}` },
    });

    if (historyRes.data.success && historyRes.data.locations.length > 0) {
      const latestLocation = historyRes.data.locations[0];
      console.log(
        `✅ Location history retrieved (${historyRes.data.total} records)`,
      );
      console.log(`   Latest: ${latestLocation.latitude}, ${latestLocation.longitude}`);
      console.log(`   Accuracy: ${latestLocation.accuracy}m`);
      console.log(`   Speed: ${latestLocation.speed} km/h`);
      console.log(`   Heading: ${latestLocation.heading}°`);
      console.log(`   Battery: ${latestLocation.batteryLevel}%`);
      testsPassed++;
    } else {
      console.log('❌ Failed to retrieve location history');
      testsFailed++;
    }

    // 4️⃣ Test WebSocket location tracking
    console.log('\n🔌 Step 4: Testing WebSocket location updates...');

    const socket: Socket = io(WS_URL, {
      path: '/tracking',
      reconnection: true,
      reconnectionDelay: 1000,
    });

    await new Promise<void>((resolve) => {
      socket.on('connect', () => {
        console.log(`✅ WebSocket connected: ${socket.id}`);
        resolve();
      });

      setTimeout(() => {
        console.log('❌ WebSocket connection timeout');
        testsFailed++;
        resolve();
      }, 5000);
    });

    // 5️⃣ Test multiple location updates with different coordinates
    console.log('\n🗺️  Step 5: Testing multiple location updates...');

    const locations = [
      { latitude: 23.8103, longitude: 90.4161, description: 'Gulshan' },
      { latitude: 23.7808, longitude: 90.4161, description: 'Dhanmondi' },
      { latitude: 23.8000, longitude: 90.4200, description: 'Banani' },
      { latitude: 23.8200, longitude: 90.4100, description: 'Mirpur' },
      { latitude: 23.7808875, longitude: 90.4161712, description: 'Precise Dhaka' },
    ];

    let updateCount = 0;
    for (const loc of locations) {
      const res = await axios.post(
        `${API_BASE_URL}/rider/update-location`,
        {
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: Math.random() * 15,
          speed: Math.random() * 40,
          heading: Math.random() * 360,
          batteryLevel: 60 + Math.random() * 40,
          isOnline: true,
        },
        {
          headers: { Authorization: `Bearer ${riderToken}` },
        },
      );

      if (res.data.success) {
        console.log(
          `✅ Location ${updateCount + 1}: ${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)} (${loc.description})`,
        );
        updateCount++;
      }
    }

    if (updateCount === locations.length) {
      console.log(`✅ All ${updateCount} location updates successful`);
      testsPassed++;
    } else {
      console.log(`❌ Only ${updateCount}/${locations.length} updates successful`);
      testsFailed++;
    }

    // 6️⃣ Test location accuracy
    console.log('\n🎯 Step 6: Testing location accuracy (decimal precision)...');

    const testCoordinates = [
      {
        lat: 23.7808875,
        lon: 90.4161712,
        name: 'High precision (your values)',
      },
      { lat: 23.810359, lon: 90.412533, name: 'Gulshan-1 Hub' },
      { lat: 23.744916, lon: 90.357558, name: 'Dhanmondi' },
      { lat: 23.777176, lon: 90.399271, name: 'Central Hub' },
    ];

    let accuracyTestsPassed = 0;
    for (const coord of testCoordinates) {
      const res = await axios.post(
        `${API_BASE_URL}/rider/update-location`,
        {
          latitude: coord.lat,
          longitude: coord.lon,
          accuracy: 5,
          isOnline: true,
        },
        {
          headers: { Authorization: `Bearer ${riderToken}` },
        },
      );

      if (res.data.success && res.data.location) {
        const returnedLat = res.data.location.latitude;
        const returnedLon = res.data.location.longitude;

        // Check if coordinates match (within floating point tolerance)
        const latMatches = Math.abs(returnedLat - coord.lat) < 0.0001;
        const lonMatches = Math.abs(returnedLon - coord.lon) < 0.0001;

        if (latMatches && lonMatches) {
          console.log(`✅ ${coord.name}: Precision OK`);
          accuracyTestsPassed++;
        } else {
          console.log(
            `❌ ${coord.name}: Precision loss detected`,
          );
          console.log(`   Expected: ${coord.lat}, ${coord.lon}`);
          console.log(`   Returned: ${returnedLat}, ${returnedLon}`);
        }
      }
    }

    if (accuracyTestsPassed === testCoordinates.length) {
      console.log(
        `✅ All ${accuracyTestsPassed} precision tests passed`,
      );
      testsPassed++;
    } else {
      console.log(
        `❌ Only ${accuracyTestsPassed}/${testCoordinates.length} precision tests passed`,
      );
      testsFailed++;
    }

    // 7️⃣ Test database storage
    console.log('\n💾 Step 7: Verifying database storage...');

    const finalHistoryRes = await axios.get(
      `${API_BASE_URL}/rider/location-history?limit=20`,
      {
        headers: { Authorization: `Bearer ${riderToken}` },
      },
    );

    if (
      finalHistoryRes.data.success &&
      finalHistoryRes.data.locations.length >= 5
    ) {
      console.log(
        `✅ Database storage verified (${finalHistoryRes.data.locations.length} records stored)`,
      );
      
      // Show sample records
      console.log('\n   Sample stored records:');
      finalHistoryRes.data.locations.slice(0, 3).forEach((loc: any, idx: number) => {
        console.log(
          `   ${idx + 1}. Lat: ${loc.latitude}, Lon: ${loc.longitude} | Accuracy: ${loc.accuracy}m | Time: ${new Date(loc.timestamp).toISOString()}`,
        );
      });
      
      testsPassed++;
    } else {
      console.log('❌ Database storage verification failed');
      testsFailed++;
    }

    // 8️⃣ Test WebSocket location broadcast
    console.log('\n📡 Step 8: Testing WebSocket location broadcast...');

    // Subscribe to a test shipment
    socket.emit(
      'subscribe-tracking',
      { awb: 'TEST-GPS-001' },
      (response: any) => {
        console.log(`✅ Subscribed to tracking: ${response.message}`);
      },
    );

    // Send location update
    const wsLocationRes = await axios.post(
      `${API_BASE_URL}/rider/update-location`,
      {
        latitude: 23.8103,
        longitude: 90.4161712,
        accuracy: 8,
        shipmentAwb: 'TEST-GPS-001',
        isOnline: true,
      },
      {
        headers: { Authorization: `Bearer ${riderToken}` },
      },
    );

    if (wsLocationRes.data.success) {
      console.log('✅ Location update via WebSocket prepared');
      testsPassed++;
    } else {
      console.log('❌ WebSocket location update failed');
      testsFailed++;
    }

    // 9️⃣ Test coordinate bounds
    console.log('\n🧭 Step 9: Testing coordinate bounds validation...');

    const boundsTests = [
      { lat: 23.8103, lon: 90.4161712, valid: true, desc: 'Valid Dhaka' },
      { lat: 0, lon: 0, valid: true, desc: 'Equator/Meridian' },
      { lat: 90, lon: 180, valid: true, desc: 'North Pole/Date Line' },
      { lat: -90, lon: -180, valid: true, desc: 'South Pole' },
    ];

    let boundsTestsPassed = 0;
    for (const test of boundsTests) {
      try {
        const res = await axios.post(
          `${API_BASE_URL}/rider/update-location`,
          {
            latitude: test.lat,
            longitude: test.lon,
            accuracy: 5,
            isOnline: true,
          },
          {
            headers: { Authorization: `Bearer ${riderToken}` },
          },
        );

        if (test.valid && res.data.success) {
          console.log(`✅ ${test.desc}: Accepted`);
          boundsTestsPassed++;
        } else if (!test.valid && !res.data.success) {
          console.log(`✅ ${test.desc}: Correctly rejected`);
          boundsTestsPassed++;
        }
      } catch (err) {
        if (!test.valid) {
          console.log(`✅ ${test.desc}: Correctly rejected`);
          boundsTestsPassed++;
        }
      }
    }

    console.log(`✅ Bounds validation: ${boundsTestsPassed}/${boundsTests.length} passed`);
    if (boundsTestsPassed === boundsTests.length) {
      testsPassed++;
    } else {
      testsFailed++;
    }

    socket.disconnect();

  } catch (error: any) {
    console.error('❌ Test error:', error.response?.data || error.message);
    testsFailed++;
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(
    `📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`,
  );
  console.log('='.repeat(50));

  if (testsFailed === 0) {
    console.log('🎉 All GPS tracking tests passed! Your system is working properly.');
  } else {
    console.log('⚠️  Some tests failed. Please review the issues above.');
  }

  process.exit(testsFailed === 0 ? 0 : 1);
}

// Run tests
testGPSTracking();

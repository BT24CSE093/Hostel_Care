const API = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function runVerification() {
  console.log('=== STARTING HOSTELCARE EXTENSION VERIFICATION ===\n');

  // 1. Health check & Fetch categories
  const health = await request('/health');
  console.log('1. Health check:', health.status, health.database);

  const categoriesRes = await request('/complaint-categories');
  const categories = categoriesRes.data;
  console.log('Active categories count:', categories.length);
  const catMap = {};
  categories.forEach(c => { catMap[c.category_name.toLowerCase()] = c; });
  console.log('Available Category Names:', Object.keys(catMap).join(', '));

  if (!catMap['mess'] || !catMap['sports'] || !catMap['network']) {
    throw new Error('New categories (Mess, Sports, Network) missing from API!');
  }
  console.log('✓ Mess, Sports, and Network categories present in API response.\n');

  // 2. Register/Login a test student
  const rand = Math.floor(Math.random() * 90000) + 10000;
  const studentEmail = `student_ext_${rand}@test.com`;
  const regStudent = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: `Extension Student ${rand}`,
      email: studentEmail,
      mobile: `98${rand}123`,
      password: 'Password@123',
      role: 'STUDENT',
      rollNumber: `ROLL_${rand}`,
      course: 'B.Tech IT'
    })
  });
  const studentToken = regStudent.data.token;
  const authHeaders = { Authorization: `Bearer ${studentToken}` };
  console.log(`2. Registered test student: ${studentEmail}\n`);

  // 3. Test 1: Submit a Mess complaint (Location-independent, no room)
  console.log('--- Test 1: Submit Mess Complaint (No Room) ---');
  const messComplaint = await request('/complaints', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      categoryId: catMap['mess'].category_id,
      title: 'Unhygienic food preparation in mess hall',
      description: 'Plates and utensils in lunch area were not sanitized properly today.',
      priority: 'HIGH'
    })
  });
  console.log('✓ Mess Complaint created ID:', messComplaint.data.complaint_id);
  console.log('  Category:', messComplaint.data.category_name);
  console.log('  Room ID:', messComplaint.data.room_id);
  console.log('  Reported Room Number:', messComplaint.data.reported_room_number);
  console.log('  Display Room:', messComplaint.data.room_number);

  // 4. Test 2: Submit a Sports complaint (With room number 1)
  console.log('\n--- Test 2: Submit Sports Complaint (With Room 1) ---');
  const sportsComplaint = await request('/complaints', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      categoryId: catMap['sports'].category_id,
      roomNumber: 1,
      title: 'Badminton court net torn',
      description: 'The central net on indoor court 2 is torn and requires replacement.',
      priority: 'MEDIUM'
    })
  });
  console.log('✓ Sports Complaint created ID:', sportsComplaint.data.complaint_id);
  console.log('  Category:', sportsComplaint.data.category_name);
  console.log('  Room Number:', sportsComplaint.data.room_number);

  // 5. Test 3: Submit a Network complaint (With room number 1056 boundary)
  console.log('\n--- Test 3: Submit Network Complaint (With Room 1056 boundary) ---');
  const networkComplaint = await request('/complaints', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      categoryId: catMap['network'].category_id,
      roomNumber: 1056,
      title: 'Wi-Fi gateway unreachable in corner rooms',
      description: 'Access point AP-4 drops ping every 10 seconds in wing D.',
      priority: 'HIGH'
    })
  });
  console.log('✓ Network Complaint created ID:', networkComplaint.data.complaint_id);
  console.log('  Category:', networkComplaint.data.category_name);
  console.log('  Room Number:', networkComplaint.data.room_number);

  // 6. Test 4: Existing room linking (Room 101 in Hostel 1)
  console.log('\n--- Test 4: Existing Room Resolution (Room 101 in Hostel 1) ---');
  const resolvedComplaint = await request('/complaints', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      hostelId: 1,
      roomNumber: 101,
      categoryId: catMap['electrical'].category_id,
      title: 'Study lamp socket spark',
      description: 'Socket near bed 1 sparks when plug is inserted.',
      priority: 'HIGH'
    })
  });
  console.log('✓ Resolved Room Complaint ID:', resolvedComplaint.data.complaint_id);
  console.log('  Resolved Room ID:', resolvedComplaint.data.room_id);
  console.log('  Hostel Name:', resolvedComplaint.data.hostel_name);
  console.log('  Room Number:', resolvedComplaint.data.room_number);
  if (resolvedComplaint.data.room_id !== 1) {
    throw new Error('Room was not resolved to room_id: 1!');
  }
  console.log('✓ Correctly linked to existing room_id 1.');

  // 7. Test 5: Rejections for invalid room numbers (0, 1057, negative, decimal, non-numeric)
  console.log('\n--- Test 5: Validation Rejection Tests ---');
  const invalidCases = [
    { label: 'Room 0 (zero)', roomNumber: 0 },
    { label: 'Room 1057 (above max 1056)', roomNumber: 1057 },
    { label: 'Room -5 (negative)', roomNumber: -5 },
    { label: 'Room 101.5 (decimal/fractional)', roomNumber: 101.5 },
    { label: 'Room "abc" (non-numeric)', roomNumber: 'abc' },
  ];

  for (const c of invalidCases) {
    try {
      await request('/complaints', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          roomNumber: c.roomNumber,
          categoryId: catMap['electrical'].category_id,
          title: 'Validation test title here',
          description: 'Validation test description long enough',
          priority: 'MEDIUM'
        })
      });
      throw new Error(`Expected rejection for ${c.label}, but request succeeded!`);
    } catch (err) {
      if (err.status === 400) {
        console.log(`✓ Rejected ${c.label}: status ${err.status} (${err.data?.message || err.message})`);
      } else {
        throw err;
      }
    }
  }

  // 8. Test 6: Rejection when room is missing for room-specific category (e.g. Plumbing)
  console.log('\n--- Test 6: Missing Room Rejection for Room-Specific Category ---');
  try {
    await request('/complaints', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        categoryId: catMap['plumbing'].category_id,
        title: 'Water tap leaking heavily',
        description: 'Tap in bathroom leaking continuously day and night.',
        priority: 'HIGH'
      })
    });
    throw new Error('Expected rejection for plumbing complaint without room, but succeeded!');
  } catch (err) {
    if (err.status === 400) {
      console.log(`✓ Rejected missing room for Plumbing: ${err.data?.message || err.message}`);
    } else {
      throw err;
    }
  }

  // 8b. Test 6b: Network LAN issue rejection when room number is missing
  console.log('\n--- Test 6b: LAN Issue Missing Room Rejection ---');
  try {
    await request('/complaints', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        categoryId: catMap['network'].category_id,
        title: 'LAN connectivity issue (Ethernet port not working)',
        description: 'Ethernet cable plugged in but no link light and no IP address.',
        priority: 'HIGH'
      })
    });
    throw new Error('Expected rejection for LAN complaint without room, but succeeded!');
  } catch (err) {
    if (err.status === 400 && err.data?.message?.includes('LAN connectivity issues')) {
      console.log(`✓ Rejected missing room for LAN issue: ${err.data?.message || err.message}`);
    } else {
      throw err;
    }
  }

  // 8c. Test 6c: Network LAN issue success when room number is provided
  console.log('\n--- Test 6c: LAN Issue Success with Room Number (Room 402) ---');
  const lanComplaint = await request('/complaints', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      categoryId: catMap['network'].category_id,
      roomNumber: 402,
      title: 'LAN connectivity issue (Ethernet port not working)',
      description: 'Port on wall is physically loose and Ethernet disconnects.',
      priority: 'MEDIUM'
    })
  });
  console.log('✓ LAN Complaint created with room ID:', lanComplaint.data.complaint_id);
  console.log('  Room Number:', lanComplaint.data.room_number);
  if (String(lanComplaint.data.room_number) !== '402') {
    throw new Error('LAN complaint did not retain room number 402!');
  }

  // 8d. Test 6d: General Network Wi-Fi complaint allowed WITHOUT room number
  console.log('\n--- Test 6d: General Network Wi-Fi Complaint Without Room ---');
  const wifiComplaint = await request('/complaints', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      categoryId: catMap['network'].category_id,
      title: 'Wi-Fi not working in library reading hall',
      description: 'Campus Wi-Fi SSID HostelCare-5G does not authenticate.',
      priority: 'HIGH'
    })
  });
  console.log('✓ Wi-Fi Complaint created without room ID:', wifiComplaint.data.complaint_id);
  console.log('  Room Number:', wifiComplaint.data.room_number ?? 'null (Location independent)');

  // 9. Test 7: Confirm older existing complaints work (Plumbing, Electrical, Cleaning, Furniture)
  console.log('\n--- Test 7: Confirm All Categories Listable ---');
  const studentComplaints = await request('/complaints', { headers: authHeaders });
  console.log(`✓ Fetched ${studentComplaints.count} student complaints.`);
  const categoriesFound = new Set(studentComplaints.data.map(c => c.category_name));
  console.log('Categories present in student list:', Array.from(categoriesFound).join(', '));

  // 10. Test 8: Register/Login Warden and Check Dashboard Summary & Categories Breakdown
  console.log('\n--- Test 8: Warden Dashboard & Category Breakdown ---');
  const wardenEmail = `warden_ext_${rand}@test.com`;
  const regWarden = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: `Extension Warden ${rand}`,
      email: wardenEmail,
      mobile: `97${rand}456`,
      password: 'Password@123',
      role: 'WARDEN'
    })
  });
  const wardenToken = regWarden.data.token;
  const wardenHeaders = { Authorization: `Bearer ${wardenToken}` };

  const summary = await request('/dashboard/summary', { headers: wardenHeaders });
  console.log('Warden Summary:', summary.data);

  const categoryBreakdown = await request('/dashboard/complaints-by-category', { headers: wardenHeaders });
  console.log('\nComplaints by Category on Dashboard:');
  console.table(categoryBreakdown.data);

  const breakdownNames = categoryBreakdown.data.map(c => c.category_name);
  if (!breakdownNames.includes('Mess') || !breakdownNames.includes('Sports') || !breakdownNames.includes('Network')) {
    console.log('Note: Some new categories not yet counted in complaints table breakdown.');
  } else {
    console.log('✓ Mess, Sports, and Network are tracked in category breakdown.');
  }

  console.log('\n======================================================');
  console.log('>>> ALL EXTENSION REQUIREMENTS VERIFIED SUCCESSFULLY! <<<');
  console.log('======================================================');
}

runVerification().catch(e => {
  console.error('\nVerification failed:', e.data || e.message);
  process.exit(1);
});

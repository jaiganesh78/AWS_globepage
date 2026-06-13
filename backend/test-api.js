import assert from "assert";

const BASE_URL = "http://localhost:5000";

async function runTests() {
  console.log("Starting backend verification tests...");

  // 1. Health check
  console.log("Testing health check...");
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  assert.strictEqual(healthRes.status, 200);
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.success, true);
  assert.strictEqual(healthData.status, "ok");

  // 2. Fetch categories
  console.log("Testing fetch categories...");
  const catsRes = await fetch(`${BASE_URL}/api/categories`);
  assert.strictEqual(catsRes.status, 200);
  const catsData = await catsRes.json();
  assert.strictEqual(catsData.success, true);
  assert.ok(Array.isArray(catsData.data));
  assert.ok(catsData.data.length > 0);
  // Check displayOrder is sorted ascending
  for (let i = 1; i < catsData.data.length; i++) {
    assert.ok(catsData.data[i].displayOrder >= catsData.data[i - 1].displayOrder);
  }
  const categoryId = catsData.data[0].id;

  // 3. Fetch regions
  console.log("Testing fetch regions...");
  const regsRes = await fetch(`${BASE_URL}/api/regions`);
  assert.strictEqual(regsRes.status, 200);
  const regsData = await regsRes.json();
  assert.strictEqual(regsData.success, true);
  assert.ok(Array.isArray(regsData.data));
  const initialCount = regsData.data.length;

  // 4. Create new region
  console.log("Testing create region...");
  const randomSuffix = Math.floor(Math.random() * 1000000).toString();
  const testAwsRegionCode = `eu-west-test-${randomSuffix}`;
  const newRegionPayload = {
    awsRegionCode: testAwsRegionCode,
    name: "Europe (Paris New)",
    regionCode: "FR",
    flag: "🇫🇷",
    latitude: 48.8566,
    longitude: 2.3522,
    categoryId: categoryId,
    infrastructureDescription: "Testing new region creation.",
    availabilityZones: 3,
    launchYear: 2026,
    primaryLocation: "Paris",
    compliance: "ISO, GDPR",
    totalServices: "180+",
    aimlServices: "20+",
    analyticsServices: "25+",
    networkingServices: "15+",
    edgeLocations: "5+",
    directConnect: "Available",
    reach: "Europe",
    latency: "Under 10ms local",
    services: ["Amazon EC2", "AWS Lambda"],
    benefits: ["Low carbon footprint", "Local compliance"]
  };

  const createRes = await fetch(`${BASE_URL}/api/regions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newRegionPayload)
  });
  assert.strictEqual(createRes.status, 201);
  const createData = await createRes.json();
  assert.strictEqual(createData.success, true);
  assert.strictEqual(createData.data.awsRegionCode, testAwsRegionCode);
  assert.strictEqual(createData.data.name, "Europe (Paris New)");
  assert.deepStrictEqual(createData.data.services, ["Amazon EC2", "AWS Lambda"]);
  const createdDbId = createData.data.id;

  // 5. Try creating duplicate awsRegionCode (us-east-1 or eu-west-4)
  console.log("Testing duplicate check (409 Conflict)...");
  const duplicateRes = await fetch(`${BASE_URL}/api/regions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newRegionPayload)
  });
  assert.strictEqual(duplicateRes.status, 409);
  const duplicateData = await duplicateRes.json();
  assert.strictEqual(duplicateData.success, false);

  // 6. Test Coordinate Range Validator (latitude out of bounds)
  console.log("Testing coordinate range bounds...");
  const invalidCoordsPayload = {
    ...newRegionPayload,
    awsRegionCode: "invalid-coords",
    latitude: 105.0 // Invalid!
  };
  const invalidCoordsRes = await fetch(`${BASE_URL}/api/regions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invalidCoordsPayload)
  });
  assert.strictEqual(invalidCoordsRes.status, 400);
  const invalidCoordsData = await invalidCoordsRes.json();
  assert.strictEqual(invalidCoordsData.success, false);
  assert.ok(invalidCoordsData.errors.some(e => e.field === "latitude"));

  // 7. Test Character Length Constraints (Name > 80 chars)
  console.log("Testing character length limits...");
  const longNamePayload = {
    ...newRegionPayload,
    awsRegionCode: "long-name-code",
    name: "A".repeat(81) // Invalid! Max is 80
  };
  const longNameRes = await fetch(`${BASE_URL}/api/regions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(longNamePayload)
  });
  assert.strictEqual(longNameRes.status, 400);
  const longNameData = await longNameRes.json();
  assert.strictEqual(longNameData.success, false);
  assert.ok(longNameData.errors.some(e => e.field === "name"));

  // 8. Test Region Update
  console.log("Testing update region...");
  const updatePayload = {
    name: "Europe (Paris Updated)",
    services: ["Amazon EC2", "AWS Lambda", "Amazon S3"]
  };
  const updateRes = await fetch(`${BASE_URL}/api/regions/${createdDbId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatePayload)
  });
  assert.strictEqual(updateRes.status, 200);
  const updateData = await updateRes.json();
  assert.strictEqual(updateData.success, true);
  assert.strictEqual(updateData.data.name, "Europe (Paris Updated)");
  assert.deepStrictEqual(updateData.data.services, ["Amazon EC2", "AWS Lambda", "Amazon S3"]);

  // 9. Soft Delete
  console.log("Testing delete (soft delete)...");
  const deleteRes = await fetch(`${BASE_URL}/api/regions/${createdDbId}`, {
    method: "DELETE"
  });
  assert.strictEqual(deleteRes.status, 200);
  const deleteData = await deleteRes.json();
  assert.strictEqual(deleteData.success, true);

  // 10. Verify region is filtered out of GET /api/regions
  console.log("Verifying soft-deleted region is filtered out of public queries...");
  const regsAfterRes = await fetch(`${BASE_URL}/api/regions`);
  assert.strictEqual(regsAfterRes.status, 200);
  const regsAfterData = await regsAfterRes.json();
  assert.strictEqual(regsAfterData.success, true);
  assert.strictEqual(regsAfterData.data.length, initialCount);
  assert.ok(!regsAfterData.data.some((r) => r.dbId === createdDbId));

  console.log("\nAll verification tests completed successfully!");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

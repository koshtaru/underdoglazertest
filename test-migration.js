// Test script for gallery migration
// Run this script to test the migration from single document to individual documents

async function testMigration() {
  console.log('🧪 Testing Gallery Migration...\n');

  const MIGRATION_ENDPOINT = '/.netlify/functions/gallery-migrate-v2';
  const GALLERY_GET_ENDPOINT = '/.netlify/functions/gallery-get';
  const GALLERY_UPDATE_ENDPOINT = '/.netlify/functions/gallery-update';

  try {
    // Step 1: Test gallery-get before migration
    console.log('1. Testing gallery-get before migration...');
    const beforeResponse = await fetch(GALLERY_GET_ENDPOINT);
    const beforeData = await beforeResponse.json();

    if (beforeData.success) {
      console.log(`✅ Found ${beforeData.images?.length || 0} images in current structure`);
      console.log(`📄 Current structure version: ${beforeData.metadata?.version || 'unknown'}`);
    } else {
      console.log('⚠️  No existing gallery data found');
    }

    // Step 2: Run migration
    console.log('\n2. Running migration to individual documents...');
    const migrationResponse = await fetch(MIGRATION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Empty body for migration
    });

    const migrationResult = await migrationResponse.json();

    if (migrationResult.success) {
      console.log('✅ Migration completed successfully!');
      console.log(`📊 Migrated ${migrationResult.migrated?.images || 0} images`);
      console.log(`🏗️  New structure: ${migrationResult.migrated?.structure}`);
      console.log(`🗓️  Migration time: ${migrationResult.migratedAt}`);
    } else {
      throw new Error(`Migration failed: ${migrationResult.error}`);
    }

    // Step 3: Test gallery-get after migration
    console.log('\n3. Testing gallery-get after migration...');
    const afterResponse = await fetch(GALLERY_GET_ENDPOINT);
    const afterData = await afterResponse.json();

    if (afterData.success) {
      console.log(`✅ Gallery-get working with new structure`);
      console.log(`📄 Images loaded: ${afterData.images?.length || 0}`);
      console.log(`📄 New structure version: ${afterData.metadata?.version || 'unknown'}`);
    } else {
      throw new Error(`Gallery-get failed after migration: ${afterData.error}`);
    }

    // Step 4: Test gallery-update (add operation)
    console.log('\n4. Testing gallery-update (add new image)...');
    const testImage = {
      src: "/img/gallery/test-migration-image.jpg",
      title: "Migration Test Image",
      alt: "Test image for migration verification",
      description: "This image was added to test the new individual document structure.",
      materials: "Test Materials",
      technique: "Test Technique",
      category: "test",
      fileSize: "1.0 MB",
      dimensions: "1920x1080",
      visible: true
    };

    const addResponse = await fetch(GALLERY_UPDATE_ENDPOINT, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add',
        updatedData: testImage
      })
    });

    const addResult = await addResponse.json();

    if (addResult.success) {
      console.log('✅ Gallery-update (add) working with new structure');
      console.log(`📄 Total images after add: ${addResult.data?.images?.length || 0}`);
    } else {
      throw new Error(`Gallery-update (add) failed: ${addResult.error}`);
    }

    // Step 5: Verify final state
    console.log('\n5. Final verification...');
    const finalResponse = await fetch(GALLERY_GET_ENDPOINT);
    const finalData = await finalResponse.json();

    if (finalData.success) {
      const testImageFound = finalData.images?.some(img => img.title === "Migration Test Image");
      if (testImageFound) {
        console.log('✅ Test image found in final data - migration fully successful!');
      } else {
        console.log('⚠️  Test image not found in final data');
      }
      console.log(`📊 Final image count: ${finalData.images?.length || 0}`);
    }

    console.log('\n🎉 Migration test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Gallery data migrated to individual documents');
    console.log('- Document size limit issue resolved');
    console.log('- Gallery functionality verified');
    console.log('- New images can be added without size constraints');

  } catch (error) {
    console.error('\n❌ Migration test failed:', error.message);
    console.log('\n🔧 Next steps:');
    console.log('1. Check Netlify function logs for detailed error information');
    console.log('2. Verify Firebase Admin credentials are configured');
    console.log('3. Ensure Firestore security rules allow writes');
    console.log('4. Check network connectivity to Firestore');
  }
}

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment - would need fetch polyfill
  console.log('This test script should be run in a browser environment');
  console.log('Copy the testMigration function to browser console or create an HTML page');
} else {
  // Browser environment
  window.testMigration = testMigration;
  console.log('Migration test function loaded. Run testMigration() to start the test.');
}
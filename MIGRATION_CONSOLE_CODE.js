/**
 * Gallery Migration Console Code
 * 
 * Instructions:
 * 1. Go to /admin/gallery and make sure you're logged in
 * 2. Open browser console (F12 → Console tab)
 * 3. Copy and paste this entire file content into the console
 * 4. Press Enter to run the migration
 * 5. Wait for "Migration successful!" message
 * 6. Refresh the page to see all 20 images
 */

async function migrateGalleryToFirestore() {
  try {
    console.log('🚀 Starting gallery migration to Firestore...');
    
    // Complete gallery data with all 20 images
    const galleryData = {
      "images": [
        {
          "id": 1,
          "src": "/img/gallery/corporate-underdog-business-card.jpg",
          "title": "Underdog Lazer Business Card",
          "alt": "Underdog Lazer business card with logo engraving",
          "description": "Professional business card featuring precision laser-engraved logo and contact information. Clean, modern design with excellent contrast and readability.",
          "materials": "Black Anodized Metal",
          "technique": "Precision Laser Engraving",
          "category": "corporate",
          "uploadDate": "2024-01-15",
          "fileSize": "2.4 MB",
          "dimensions": "1920x1080",
          "visible": true
        },
        {
          "id": 2,
          "src": "/img/gallery/corporate-logo-01.jpg",
          "title": "Corporate Logo Design",
          "alt": "Corporate logo laser engraving",
          "description": "Custom corporate logo engraving with precise detail work. Professional branding solution for business applications.",
          "materials": "Various Materials",
          "technique": "Logo Engraving",
          "category": "corporate",
          "uploadDate": "2024-01-14",
          "fileSize": "1.9 MB",
          "dimensions": "1600x1200",
          "visible": true
        },
        {
          "id": 3,
          "src": "/img/gallery/corporate-logo-02.jpg",
          "title": "Business Branding",
          "alt": "Business branding laser work",
          "description": "Professional business branding with laser precision. Clean lines and consistent quality for corporate identity.",
          "materials": "Metal & Acrylic",
          "technique": "Corporate Branding",
          "category": "corporate",
          "uploadDate": "2024-01-13",
          "fileSize": "2.1 MB",
          "dimensions": "1800x1200",
          "visible": true
        },
        {
          "id": 4,
          "src": "/img/gallery/corporate-logo-03.jpg",
          "title": "Company Identification",
          "alt": "Company identification engraving",
          "description": "Durable company identification marking with professional finish. Perfect for corporate environments and professional applications.",
          "materials": "Stainless Steel",
          "technique": "Industrial Marking",
          "category": "corporate",
          "uploadDate": "2024-01-12",
          "fileSize": "2.3 MB",
          "dimensions": "1920x1280",
          "visible": true
        },
        {
          "id": 5,
          "src": "/img/gallery/apparel-degrave-electric-hat.jpg",
          "title": "Degrave Electric Branded Hat",
          "alt": "Custom branded trucker hat with laser-cut patch",
          "description": "Professional trucker hat featuring custom laser-cut leather patch with company branding. High-quality construction with durable materials.",
          "materials": "Leather Patch on Canvas",
          "technique": "Laser Cutting & Engraving",
          "category": "apparel",
          "uploadDate": "2024-01-11",
          "fileSize": "1.8 MB",
          "dimensions": "1600x1200",
          "visible": true
        },
        {
          "id": 6,
          "src": "/img/gallery/apparel-blank-hats.jpg",
          "title": "Custom Hat Collection",
          "alt": "Collection of custom branded hats",
          "description": "Various styles of custom hats ready for personalization. Quality blanks prepared for logo application and custom branding.",
          "materials": "Cotton & Mesh",
          "technique": "Custom Branding Prep",
          "category": "apparel",
          "uploadDate": "2024-01-10",
          "fileSize": "2.5 MB",
          "dimensions": "1920x1080",
          "visible": true
        },
        {
          "id": 7,
          "src": "/img/gallery/apparel-hat-02.jpg",
          "title": "Custom Embroidered Cap",
          "alt": "Custom embroidered baseball cap",
          "description": "Professional embroidered cap with precision stitching and quality materials. Perfect for corporate uniforms and promotional wear.",
          "materials": "Cotton Twill",
          "technique": "Embroidery & Finishing",
          "category": "apparel",
          "uploadDate": "2024-01-09",
          "fileSize": "1.7 MB",
          "dimensions": "1600x1080",
          "visible": true
        },
        {
          "id": 8,
          "src": "/img/gallery/apparel-hat-03.jpg",
          "title": "Branded Trucker Hat",
          "alt": "Branded trucker hat with mesh back",
          "description": "Classic trucker style with custom branding. Comfortable fit with breathable mesh backing and professional logo placement.",
          "materials": "Cotton & Mesh",
          "technique": "Logo Application",
          "category": "apparel",
          "uploadDate": "2024-01-08",
          "fileSize": "2.0 MB",
          "dimensions": "1800x1200",
          "visible": true
        },
        {
          "id": 9,
          "src": "/img/gallery/apparel-hat-04.jpg",
          "title": "Professional Work Cap",
          "alt": "Professional work cap with logo",
          "description": "Durable work cap designed for professional environments. Features reinforced construction and clear logo visibility.",
          "materials": "Heavy Cotton",
          "technique": "Industrial Embroidery",
          "category": "apparel",
          "uploadDate": "2024-01-07",
          "fileSize": "1.9 MB",
          "dimensions": "1600x1200",
          "visible": true
        },
        {
          "id": 10,
          "src": "/img/gallery/apparel-hat-05.jpg",
          "title": "Custom Team Hat",
          "alt": "Custom team or group hat",
          "description": "Team or group identification hat with custom design elements. Perfect for uniforms, teams, or company events.",
          "materials": "Polyester Blend",
          "technique": "Custom Design Application",
          "category": "apparel",
          "uploadDate": "2024-01-06",
          "fileSize": "2.2 MB",
          "dimensions": "1920x1280",
          "visible": true
        },
        {
          "id": 11,
          "src": "/img/gallery/promotional-woodville-water-bottle.jpg",
          "title": "Woodville Construction Water Bottle",
          "alt": "Custom laser-engraved water bottle for Woodville Construction",
          "description": "High-quality insulated water bottle with precision laser engraving. Features company logo and contact information with excellent durability.",
          "materials": "Stainless Steel",
          "technique": "Laser Engraving",
          "category": "promotional",
          "uploadDate": "2024-01-05",
          "fileSize": "3.1 MB",
          "dimensions": "1800x1200",
          "visible": true
        },
        {
          "id": 12,
          "src": "/img/gallery/promotional-woodville-koozie.jpg",
          "title": "Woodville Construction Koozie",
          "alt": "Custom branded koozie with Woodville Construction logo",
          "description": "Custom insulated beverage holder featuring laser-engraved company branding. Perfect for outdoor events and promotional giveaways.",
          "materials": "Neoprene",
          "technique": "Laser Engraving",
          "category": "promotional",
          "uploadDate": "2024-01-04",
          "fileSize": "2.4 MB",
          "dimensions": "1920x1440",
          "visible": true
        },
        {
          "id": 13,
          "src": "/img/gallery/promotional-drinkware-01.jpg",
          "title": "Custom Drinkware Collection",
          "alt": "Custom promotional drinkware",
          "description": "Professional promotional drinkware with custom branding. Durable construction suitable for corporate gifts and marketing campaigns.",
          "materials": "Various Materials",
          "technique": "Multi-Surface Engraving",
          "category": "promotional",
          "uploadDate": "2024-01-03",
          "fileSize": "2.8 MB",
          "dimensions": "1600x1200",
          "visible": true
        },
        {
          "id": 14,
          "src": "/img/gallery/promotional-drinkware-02.jpg",
          "title": "Branded Travel Mug",
          "alt": "Custom branded travel mug",
          "description": "Insulated travel mug with precision laser engraving. Perfect for corporate gifts, employee recognition, or promotional campaigns.",
          "materials": "Stainless Steel",
          "technique": "Precision Engraving",
          "category": "promotional",
          "uploadDate": "2024-01-02",
          "fileSize": "2.6 MB",
          "dimensions": "1920x1080",
          "visible": true
        },
        {
          "id": 15,
          "src": "/img/gallery/promotional-drinkware-03.jpg",
          "title": "Professional Tumbler",
          "alt": "Professional custom tumbler",
          "description": "High-quality tumbler with professional engraving. Excellent for corporate branding and premium promotional items.",
          "materials": "Insulated Steel",
          "technique": "Corporate Engraving",
          "category": "promotional",
          "uploadDate": "2024-01-01",
          "fileSize": "2.3 MB",
          "dimensions": "1800x1350",
          "visible": true
        },
        {
          "id": 16,
          "src": "/img/gallery/gifts-happier-with-you-koozie.jpg",
          "title": "Personal Photo Koozie",
          "alt": "Custom photo engraved koozie with personal message",
          "description": "Personalized koozie featuring custom photo engraving and heartfelt message. Perfect for anniversaries, gifts, and special memories.",
          "materials": "Wood-finish Neoprene",
          "technique": "Photo Engraving",
          "category": "gifts",
          "uploadDate": "2023-12-31",
          "fileSize": "2.7 MB",
          "dimensions": "1920x1440",
          "visible": true
        },
        {
          "id": 17,
          "src": "/img/gallery/gifts-custom-item-01.jpg",
          "title": "Custom Memorial Piece",
          "alt": "Custom memorial or keepsake item",
          "description": "Thoughtful memorial or keepsake item with personalized engraving. Crafted with care for lasting memories and special occasions.",
          "materials": "Premium Materials",
          "technique": "Memorial Engraving",
          "category": "gifts",
          "uploadDate": "2023-12-30",
          "fileSize": "1.8 MB",
          "dimensions": "1600x1200",
          "visible": false
        },
        {
          "id": 18,
          "src": "/img/gallery/gifts-custom-item-02.jpg",
          "title": "Personalized Gift Item",
          "alt": "Personalized custom gift",
          "description": "Unique personalized gift with custom engraving. Perfect for special occasions, holidays, and meaningful presents.",
          "materials": "Mixed Materials",
          "technique": "Personalization",
          "category": "gifts",
          "uploadDate": "2023-12-29",
          "fileSize": "2.2 MB",
          "dimensions": "1800x1200",
          "visible": true
        },
        {
          "id": 19,
          "src": "/img/gallery/gifts-custom-item-03.jpg",
          "title": "Special Occasion Gift",
          "alt": "Special occasion custom gift",
          "description": "Custom gift designed for special occasions. Features personalized elements and quality craftsmanship for memorable presents.",
          "materials": "Quality Materials",
          "technique": "Custom Engraving",
          "category": "gifts",
          "uploadDate": "2023-12-28",
          "fileSize": "2.1 MB",
          "dimensions": "1920x1280",
          "visible": true
        },
        {
          "id": 20,
          "src": "/img/gallery/gifts-photoroom-item.jpg",
          "title": "Custom Photo Item",
          "alt": "Custom item with photo engraving",
          "description": "Unique item featuring custom photo engraving with professional finish. Perfect for preserving memories and creating lasting keepsakes.",
          "materials": "Specialty Materials",
          "technique": "Photo Transfer Engraving",
          "category": "gifts",
          "uploadDate": "2023-12-27",
          "fileSize": "3.2 MB",
          "dimensions": "1920x1440",
          "visible": false
        }
      ],
      "metadata": {
        "lastModified": Date.now(),
        "version": "1.0.0",
        "migratedFrom": "gallery-data.json"
      }
    };

    console.log(`📊 Migrating ${galleryData.images.length} images to Firestore...`);
    
    const response = await fetch('/.netlify/functions/gallery-migrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'migrate',
        data: galleryData
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log('✅ Migration completed successfully!');
      console.log(`📸 Migrated ${result.count} images to Firestore`);
      console.log('🎉 Your gallery should now show all images');
      console.log('🔄 Refresh the page to see the changes');
      
      // Optional: Auto-refresh the page after 2 seconds
      setTimeout(() => {
        console.log('🔄 Auto-refreshing page...');
        window.location.reload();
      }, 2000);
      
      return result;
    } else {
      throw new Error(result.error || 'Migration failed');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n💡 If migration failed, you can:');
    console.log('1. Check that you are logged in as admin');
    console.log('2. Try refreshing the page and running again');
    console.log('3. Use manual upload at /admin/gallery');
    throw error;
  }
}

// Auto-run the migration
console.log('🚀 Starting gallery migration...');
migrateGalleryToFirestore();
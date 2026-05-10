// Run once to create the two Razorpay plans. Save the output IDs to your .env file.
// Usage: node backend/scripts/createRazorpayPlans.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function main() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error('ERROR: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env');
        process.exit(1);
    }

    console.log('Creating Razorpay plans...\n');

    const monthly = await razorpay.plans.create({
        period: 'monthly',
        interval: 1,
        item: {
            name: 'MeriKaksha Pro Monthly',
            amount: 34900,
            currency: 'INR',
            description: 'MeriKaksha Pro — monthly billing',
        },
        notes: { internal_ref: 'pro_monthly_v1' },
    });

    const annual = await razorpay.plans.create({
        period: 'yearly',
        interval: 1,
        item: {
            name: 'MeriKaksha Pro Annual',
            amount: 299900,
            currency: 'INR',
            description: 'MeriKaksha Pro — annual billing (save 28%)',
        },
        notes: { internal_ref: 'pro_annual_v1' },
    });

    console.log('✓ Monthly plan created');
    console.log(`  RAZORPAY_PLAN_MONTHLY=${monthly.id}\n`);
    console.log('✓ Annual plan created');
    console.log(`  RAZORPAY_PLAN_ANNUAL=${annual.id}\n`);
    console.log('Add both IDs to your .env file.');
}

main().catch((err) => {
    console.error('Failed to create plans:', err.error || err.message);
    process.exit(1);
});

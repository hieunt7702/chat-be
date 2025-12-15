import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;

async function showDatabase() {
    try {
        // Kết nối MongoDB
        await mongoose.connect(uri); // Mongoose 7+ không cần options
        console.log('✅ MongoDB connected');

        // Lấy danh sách collection
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('\n📋 Collections in DB:');
        collections.forEach(c => console.log('-', c.name));

        // Lấy dữ liệu trong từng collection
        for (const c of collections) {
            const docs = await db.collection(c.name).find({}).toArray();
            console.log(`\n📄 Data in collection "${c.name}": `);
            if (docs.length === 0) {
                console.log('  (empty)');
            } else {
                docs.forEach(doc => console.log(' ', JSON.stringify(doc, null, 2)));
            }
        }

        // Ngắt kết nối
        await mongoose.disconnect();
        console.log('\n✅ Done.');

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

showDatabase();

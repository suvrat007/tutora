const mongoose = require('mongoose');
try {
    const originalObjectId = new mongoose.Types.ObjectId();
    console.log("Original:", originalObjectId);
    
    const wrapper = new mongoose.Types.ObjectId(originalObjectId);
    console.log("Wrapped works:", wrapper);
} catch (e) {
    console.error("Error wrapping ObjectId:", e.message);
}

try {
    const originalObjectId = new mongoose.Types.ObjectId();
    const strAdminId = originalObjectId.toString();
    const strWrapper = new mongoose.Types.ObjectId(strAdminId);
    console.log("String Wrapper works:", strWrapper);
} catch (e) {
    console.error("Error wrapping String:", e.message);
}

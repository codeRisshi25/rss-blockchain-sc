const admin = require('firebase-admin');
const crypto = require('crypto');
const serviceAccount = require('./project-charak-firebase-adminsdk-fbsvc-d9521be673.json'); // Replace with your service account path

// Initialize Firebase Admin

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Function to generate userID in format NHM001, NHM002, etc.
function generateUserId(index) {
    return `NHM${String(index).padStart(3, '0')}`;
}

// Function to hash userID + password
function hashCredentials(userId, password) {
    return crypto.createHash('sha256')
        .update(userId + password)
        .digest('hex')
        .substring(0,10);
}

// Doctor blockchain data
const doctorBlockchainData = [
    {
        "name": "Rajesh Sharma",
        "address": "0x6bB6ad9d94433DA182f196603100C0B85d06907C",
        "privateKey": "0x452b433837b3d96d5ad7820165781f5db71349a438395048013b07781192bd82"
    },
    {
        "name": "Priya Patel",
        "address": "0xb662F4083766D3B1eEACE96B3960fa09C9C12aA3",
        "privateKey": "0xe38b9a3f447e11157610f8ca9b9386ee2416a619b937349be4c25c2bdcff3159"
    },
    {
        "name": "Amit Verma",
        "address": "0xA4CB0C8ceF499228B4f6427426d51C926355617D",
        "privateKey": "0x9afae662803d9a60e0282987e1009efa467ac7c54e5c34207864054f9eb791a1"
    },
    {
        "name": "Sneha Gupta",
        "address": "0x0B811FA25cDb1FB7aD8b61a83F0B5f9BAB8562Ae",
        "privateKey": "0x445d4b35c1c4c1455d6ce053fde351f16f1c682800a9202e69b33a83c55da34f"
    },
    {
        "name": "Vikram Singh",
        "address": "0xc58Ad6065082Af7F1E75dC8E3f7B903b592Dcabc",
        "privateKey": "0x81a61fc6474f9bae2ada18071c48682d1d49c4239a5b859352d15178e09ac44f"
    }
];

// Generate mock data for doctors
const generateDoctorData = (index, blockchainData) => {
    const userId = generateUserId(index + 1);
    const password = crypto.createHash('sha256')
        .update('12345678')
        .digest('hex');
    const docId = hashCredentials(userId, '12345678');
    
    const departments = ["Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Dermatology"];
    const hospitals = [
        "Apollo Hospital", 
        "AIIMS", 
        "Fortis Healthcare", 
        "Max Super Speciality Hospital", 
        "Medanta"
    ];
    
    // Stock doctor profile images
    const profileImages = [
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d",
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2",
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d",
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f",
        "https://images.unsplash.com/photo-1651008376811-b90baee60c1f"
    ];
    const genders = ["Male", "Female"];
    
    return {
        id: docId,
        data: {
            // Credentials
            userId: userId,
            password: password, // In a real app, store hashed passwords
            
            // Personal info
            name: `Dr. ${blockchainData.name}`,
            gender: genders[index % genders.length],
            dob: `${1960 + (index * 2)}-${(index % 12) + 1}-${(index % 28) + 1}`,
            phone: `+91 98765 ${10000 + index * 111}`,
            email: `doctor${index+1}@medical.com`,
            address: `${index+1}${["A", "B", "C", "D", "E"][index]} Medical Lane, Healthcare City, 1000${index+1}`,
            photoUrl: profileImages[index % profileImages.length],
            
            // Professional info
            license_number: `MCI-${100000 + (index * 237)}`,
            department: departments[index % departments.length],
            hospital_affiliation: hospitals[index % hospitals.length],
            years_of_experience: 5 + (index * 2),
            specialization: `${departments[index % departments.length]} Specialist`,
            qualification: `MD ${departments[index % departments.length]}`,
            
            // Blockchain info
            walletAddress: blockchainData.address,
            // Note: Never store private keys in a database in a real application
            // This is just for your development environment
            privateKey: blockchainData.privateKey
        }
    };
};

// Upload doctors to Firestore
async function uploadDoctorsToFirestore() {
    try {
        const batch = db.batch();
        
        for (let i = 0; i < doctorBlockchainData.length; i++) {
            const doctorData = generateDoctorData(i, doctorBlockchainData[i]);
            const docRef = db.collection('doctors').doc(doctorData.id);
            batch.set(docRef, doctorData.data);
            console.log(`Prepared doctor with ID: ${doctorData.id}`);
        }
        
        await batch.commit();
        console.log('All doctors uploaded successfully!');
    } catch (error) {
        console.error('Error uploading doctors:', error);
    }
}

// Execute the upload function
uploadDoctorsToFirestore()
    .then(() => {
        console.log('Doctor registration complete.');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error in doctor registration process:', err);
        process.exit(1);
    });
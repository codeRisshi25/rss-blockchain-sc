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
      "name": "Dr. Aarav Sharma",
      "address": "0x5510450bB7C42359AB433A08a2e69e5DA1A1BF2B",
      "privateKey": "0x3174c9805e510c591676afdc429f7835c0fce1635223ed8b701cdc2e6d4b992c"
    },
    {
      "name": "Dr. Ananya Gupta",
      "address": "0x28152458Aa57793E36E889AA12A3235120b88006",
      "privateKey": "0xa816139b385ff117a2ef6a64cf96c8870642842ea1a1d34c6118bbd1659d83db"
    },
    {
      "name": "Dr. Vihaan Patel",
      "address": "0x8235594c4CD6DB7026e228bb4ed95F05f6592d18",
      "privateKey": "0x4acb1adca9f5bfc5faa5744c68ef57fa475477fc3cab6f31af524ea87e305310"
    },
    {
      "name": "Dr. Siya Reddy",
      "address": "0x68B7aDdF72F3653840A8A7761b1Da4fa8dBE282b",
      "privateKey": "0x3adaf1b1e3d496697b85c964b737bd46748367085e55876bead1d20d1fcee2ba"
    },
    {
      "name": "Dr. Kabir Mehta",
      "address": "0x99561260614dcA6AB61c8531152509c910aBb0fa",
      "privateKey": "0x5a96cdfac83fca8ef5f2067653f1ce477742e371e953e2756af77d4d7c57d00e"
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
            privateKey: blockchainData.privateKey,
            patients : []
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
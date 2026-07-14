// Temporary sample data used only to populate the frontend UI.
// This is NOT a database and holds no real persistence or business logic.

const equipmentList = [
  {
    id: 1,
    assetCode: "EQ-1001",
    name: "Canon EOS 90D DSLR Camera",
    category: "Photography",
    location: "Media Store Room A",
    status: "Available",
    condition: "Excellent",
    description: "24.2MP APS-C DSLR camera with 4K video recording, ideal for photography and videography assignments.",
    image: "/img/equipment-placeholder.svg"
  },
  {
    id: 2,
    assetCode: "EQ-1002",
    name: "Dell XPS 15 Laptop",
    category: "Computing",
    location: "IT Equipment Cage",
    status: "Reserved",
    condition: "Good",
    description: "15-inch laptop with Intel i7, 16GB RAM, dedicated GPU. Suitable for development and design work.",
    image: "/img/equipment-placeholder.svg"
  },
  {
    id: 3,
    assetCode: "EQ-1003",
    name: "Bose L1 Pro8 PA System",
    category: "Audio",
    location: "Audio Visual Store",
    status: "Borrowed",
    condition: "Good",
    description: "Portable line array PA system for events, presentations and performances.",
    image: "/img/equipment-placeholder.svg"
  },
  {
    id: 4,
    assetCode: "EQ-1004",
    name: "Epson EB-2250U Projector",
    category: "Presentation",
    location: "Media Store Room B",
    status: "Maintenance",
    condition: "Fair",
    description: "Full HD WUXGA 3LCD projector with 5000 lumens brightness for lecture halls and large rooms.",
    image: "/img/equipment-placeholder.svg"
  },
  {
    id: 5,
    assetCode: "EQ-1005",
    name: "GoPro Hero 12 Action Camera",
    category: "Photography",
    location: "Media Store Room A",
    status: "Available",
    condition: "Excellent",
    description: "Compact waterproof action camera for field recording and sports footage.",
    image: "/img/equipment-placeholder.svg"
  },
  {
    id: 6,
    assetCode: "EQ-1006",
    name: "DJI Mavic 3 Drone",
    category: "Photography",
    location: "Secure Equipment Locker",
    status: "Damaged",
    condition: "Poor",
    description: "Professional drone with 4/3 CMOS Hasselblad camera, currently awaiting repair.",
    image: "/img/equipment-placeholder.svg"
  },
  {
    id: 7,
    assetCode: "EQ-1007",
    name: "Yamaha MG10XU Mixer",
    category: "Audio",
    location: "Audio Visual Store",
    status: "Available",
    condition: "Good",
    description: "10-channel mixing console with built-in effects, suited for small events and recordings.",
    image: "/img/equipment-placeholder.svg"
  },
  {
    id: 8,
    assetCode: "EQ-1008",
    name: "Meta Quest 3 VR Headset",
    category: "Computing",
    location: "IT Equipment Cage",
    status: "Reserved",
    condition: "Excellent",
    description: "Standalone VR headset used for immersive learning and prototyping projects.",
    image: "/img/equipment-placeholder.svg"
  },
  {
    id: 9,
    assetCode: "EQ-1009",
    name: "Sony A7 IV Mirrorless Camera",
    category: "Photography",
    location: "Media Store Room A",
    status: "Available",
    condition: "Excellent",
    description: "Full-frame mirrorless camera with 33MP sensor, well suited for studio and location shoots.",
    image: "/img/equipment-placeholder.svg"
  },
  {
    id: 10,
    assetCode: "EQ-1010",
    name: "Logitech MeetUp Conference Cam",
    category: "Computing",
    location: "IT Equipment Cage",
    status: "Available",
    condition: "Good",
    description: "All-in-one video conferencing camera with speakers and mic, ideal for group presentations.",
    image: "/img/equipment-placeholder.svg"
  }
];

const reservationList = [
  {
    id: 101,
    equipmentName: "Dell XPS 15 Laptop",
    borrowerName: "Ng Wei Ling",
    startDate: "2026-07-15",
    endDate: "2026-07-18",
    purpose: "Final year project development",
    status: "Approved"
  },
  {
    id: 102,
    equipmentName: "Bose L1 Pro8 PA System",
    borrowerName: "Arjun Kumar",
    startDate: "2026-07-10",
    endDate: "2026-07-12",
    purpose: "Campus orientation event",
    status: "Borrowed"
  },
  {
    id: 103,
    equipmentName: "Meta Quest 3 VR Headset",
    borrowerName: "Tan Jia Hui",
    startDate: "2026-07-20",
    endDate: "2026-07-22",
    purpose: "VR interaction research prototype",
    status: "Pending"
  },
  {
    id: 104,
    equipmentName: "Epson EB-2250U Projector",
    borrowerName: "Muhammad Haziq",
    startDate: "2026-07-02",
    endDate: "2026-07-06",
    purpose: "Guest lecture presentation",
    status: "Overdue"
  },
  {
    id: 105,
    equipmentName: "Sony A7 IV Mirrorless Camera",
    borrowerName: "Chen Xun",
    startDate: "2026-06-25",
    endDate: "2026-06-30",
    purpose: "Campus photography shoot",
    status: "Overdue"
  },
  {
    id: 106,
    equipmentName: "Canon EOS 90D DSLR Camera",
    borrowerName: "Priya Sharma",
    startDate: "2026-07-21",
    endDate: "2026-07-23",
    purpose: "Student club promotional video",
    status: "Pending"
  },
  {
    id: 107,
    equipmentName: "Logitech MeetUp Conference Cam",
    borrowerName: "Farah Aisyah",
    startDate: "2026-07-16",
    endDate: "2026-07-17",
    purpose: "Industry partner video meeting",
    status: "Approved"
  },
  {
    id: 108,
    equipmentName: "GoPro Hero 12 Action Camera",
    borrowerName: "Lucas Tan",
    startDate: "2026-07-08",
    endDate: "2026-07-09",
    purpose: "Sports day event coverage",
    status: "Borrowed"
  }
];

// Distinct status vocabularies for the two entities shown in the UI.
const equipmentStatusOptions = ["Available", "Reserved", "Borrowed", "Maintenance", "Damaged"];
const reservationStatusOptions = ["Pending", "Approved", "Borrowed", "Overdue"];

module.exports = {
  equipmentList,
  reservationList,
  equipmentStatusOptions,
  reservationStatusOptions
};

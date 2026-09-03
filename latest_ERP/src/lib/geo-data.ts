/**
 * Address hierarchy used by the student registration form:
 * Country -> State -> District -> Taluk -> Village.
 *
 * Karnataka (the primary deployment state) is covered district + taluk wide.
 * Other Indian states list their districts; taluks/villages fall back to the
 * free-text "Other" entry so no address is ever un-enterable.
 */

export type Option = { value: string; label: string };

export const OTHER = "Other";

const opt = (v: string): Option => ({ value: v, label: v });
export const toOptions = (values: string[]): Option[] => values.map(opt);

export const COUNTRY_LIST = [
  "India",
  "Nepal",
  "Sri Lanka",
  "Bangladesh",
  "United Arab Emirates",
  "United States",
  "United Kingdom",
  OTHER,
];

/** state -> districts */
export const DISTRICTS: Record<string, string[]> = {
  Karnataka: [
    "Bagalkot",
    "Ballari",
    "Belagavi",
    "Bengaluru Rural",
    "Bengaluru Urban",
    "Bidar",
    "Chamarajanagar",
    "Chikkaballapur",
    "Chikkamagaluru",
    "Chitradurga",
    "Dakshina Kannada",
    "Davanagere",
    "Dharwad",
    "Gadag",
    "Hassan",
    "Haveri",
    "Kalaburagi",
    "Kodagu",
    "Kolar",
    "Koppal",
    "Mandya",
    "Mysuru",
    "Raichur",
    "Ramanagara",
    "Shivamogga",
    "Tumakuru",
    "Udupi",
    "Uttara Kannada",
    "Vijayanagara",
    "Vijayapura",
    "Yadgir",
  ],
  "Andhra Pradesh": [
    "Anantapur",
    "Chittoor",
    "East Godavari",
    "Guntur",
    "Krishna",
    "Kurnool",
    "Nellore",
    "Prakasam",
    "Srikakulam",
    "Visakhapatnam",
    "Vizianagaram",
    "West Godavari",
    "YSR Kadapa",
  ],
  Telangana: [
    "Adilabad",
    "Hyderabad",
    "Karimnagar",
    "Khammam",
    "Mahbubnagar",
    "Medak",
    "Nalgonda",
    "Nizamabad",
    "Rangareddy",
    "Warangal",
  ],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Dharmapuri",
    "Erode",
    "Kanchipuram",
    "Madurai",
    "Salem",
    "Thanjavur",
    "Tiruchirappalli",
    "Tirunelveli",
    "Vellore",
  ],
  Kerala: [
    "Alappuzha",
    "Ernakulam",
    "Idukki",
    "Kannur",
    "Kasaragod",
    "Kollam",
    "Kottayam",
    "Kozhikode",
    "Malappuram",
    "Palakkad",
    "Pathanamthitta",
    "Thiruvananthapuram",
    "Thrissur",
    "Wayanad",
  ],
  Maharashtra: [
    "Ahmednagar",
    "Aurangabad",
    "Kolhapur",
    "Mumbai City",
    "Mumbai Suburban",
    "Nagpur",
    "Nashik",
    "Pune",
    "Sangli",
    "Satara",
    "Solapur",
    "Thane",
  ],
  Goa: ["North Goa", "South Goa"],
};

export const STATE_LIST = [
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
  "Tamil Nadu",
  "Kerala",
  "Maharashtra",
  "Goa",
  "Delhi",
  "Gujarat",
  "Madhya Pradesh",
  "Rajasthan",
  "Uttar Pradesh",
  "West Bengal",
  OTHER,
];

/** district -> taluks (Karnataka coverage) */
export const TALUKS: Record<string, string[]> = {
  "Bengaluru Urban": ["Bengaluru North", "Bengaluru South", "Bengaluru East", "Anekal"],
  "Bengaluru Rural": ["Devanahalli", "Doddaballapur", "Hoskote", "Nelamangala"],
  Mysuru: [
    "Mysuru",
    "Hunsur",
    "Krishnarajanagara",
    "Nanjangud",
    "Periyapatna",
    "Tirumakudalu Narasipura",
    "Heggadadevanakote",
  ],
  Mandya: [
    "Mandya",
    "Maddur",
    "Malavalli",
    "Krishnarajapet",
    "Nagamangala",
    "Pandavapura",
    "Srirangapatna",
  ],
  Hassan: [
    "Hassan",
    "Arsikere",
    "Alur",
    "Belur",
    "Channarayapatna",
    "Holenarasipura",
    "Sakleshpur",
    "Arakalgud",
  ],
  Tumakuru: [
    "Tumakuru",
    "Chikkanayakanahalli",
    "Gubbi",
    "Kunigal",
    "Koratagere",
    "Madhugiri",
    "Pavagada",
    "Sira",
    "Tiptur",
    "Turuvekere",
  ],
  Belagavi: [
    "Belagavi",
    "Athani",
    "Bailhongal",
    "Chikkodi",
    "Gokak",
    "Hukkeri",
    "Khanapur",
    "Raybag",
    "Ramdurg",
    "Saundatti",
  ],
  Kalaburagi: ["Kalaburagi", "Afzalpur", "Aland", "Chincholi", "Chitapur", "Jevargi", "Sedam"],
  "Dakshina Kannada": ["Mangaluru", "Bantwal", "Belthangady", "Puttur", "Sullia"],
  Udupi: ["Udupi", "Karkala", "Kundapura", "Byndoor", "Kaup"],
  Shivamogga: ["Shivamogga", "Bhadravati", "Hosanagara", "Sagar", "Shikaripura", "Soraba", "Tirthahalli"],
  Ballari: ["Ballari", "Sandur", "Siruguppa", "Kampli", "Kurugodu"],
  Vijayanagara: ["Hosapete", "Hagaribommanahalli", "Harapanahalli", "Kottur", "Kudligi"],
  Davanagere: ["Davanagere", "Channagiri", "Harihar", "Honnali", "Jagalur"],
  Chitradurga: ["Chitradurga", "Challakere", "Hiriyur", "Holalkere", "Hosadurga", "Molakalmuru"],
  Kolar: ["Kolar", "Bangarapet", "Malur", "Mulbagal", "Srinivaspur"],
  Chikkaballapur: ["Chikkaballapur", "Bagepalli", "Chintamani", "Gauribidanur", "Gudibande", "Sidlaghatta"],
  Ramanagara: ["Ramanagara", "Channapatna", "Kanakapura", "Magadi"],
  Chamarajanagar: ["Chamarajanagar", "Gundlupet", "Kollegal", "Yelandur"],
  Chikkamagaluru: ["Chikkamagaluru", "Kadur", "Koppa", "Mudigere", "Narasimharajapura", "Sringeri", "Tarikere"],
  Kodagu: ["Madikeri", "Somwarpet", "Virajpet"],
  Dharwad: ["Dharwad", "Hubballi", "Kalghatgi", "Kundgol", "Navalgund"],
  Gadag: ["Gadag", "Mundargi", "Nargund", "Ron", "Shirhatti"],
  Haveri: ["Haveri", "Byadgi", "Hangal", "Hirekerur", "Ranebennur", "Savanur", "Shiggaon"],
  Bagalkot: ["Bagalkot", "Badami", "Bilagi", "Hungund", "Jamkhandi", "Mudhol"],
  Vijayapura: ["Vijayapura", "Basavana Bagevadi", "Indi", "Muddebihal", "Sindagi"],
  Bidar: ["Bidar", "Aurad", "Basavakalyan", "Bhalki", "Humnabad"],
  Raichur: ["Raichur", "Devadurga", "Lingsugur", "Manvi", "Sindhanur"],
  Koppal: ["Koppal", "Gangavathi", "Kushtagi", "Yelbarga"],
  Yadgir: ["Yadgir", "Shahapur", "Shorapur"],
  "Uttara Kannada": ["Karwar", "Bhatkal", "Honnavar", "Kumta", "Sirsi", "Siddapur", "Yellapur", "Haliyal"],
};

/** taluk -> villages (indicative list; "Other" always available) */
export const VILLAGES: Record<string, string[]> = {
  Mysuru: ["Bogadi", "Hootagalli", "Ilwala", "Kadakola", "Srirampura", "Varuna"],
  Nanjangud: ["Badanavalu", "Hediyala", "Kalale", "Tagadur", "Thandavapura"],
  Hunsur: ["Bilikere", "Chilkunda", "Gavadagere", "Hanagodu", "Kattemalalavadi"],
  Mandya: ["Basaralu", "Duddagere", "Keelara", "Kothathi", "Tubinakere"],
  Maddur: ["Chikkarasinakere", "Kestur", "Koppa", "Sivapura"],
  Hassan: ["Anagalli", "Dudda", "Gorur", "Kattaya", "Shantigrama"],
  Tumakuru: ["Bellavi", "Gulur", "Hebbur", "Kora", "Urdigere"],
  "Bengaluru North": ["Bagalur", "Chikkajala", "Jala", "Yelahanka"],
  "Bengaluru South": ["Begur", "Kengeri", "Uttarahalli", "Tavarekere"],
  Anekal: ["Attibele", "Chandapura", "Jigani", "Sarjapura"],
  Mangaluru: ["Bajpe", "Gurupura", "Moodabidri", "Surathkal", "Ullal"],
  Udupi: ["Brahmavar", "Hiriadka", "Kaup", "Shirva"],
  Shivamogga: ["Ayanur", "Holehonnur", "Kumsi", "Nidige"],
  Belagavi: ["Bastwad", "Kakati", "Marihal", "Uchagaon"],
  Kalaburagi: ["Farhatabad", "Kamalapur", "Mahagaon", "Nandur"],
};

export function districtsFor(state: string): Option[] {
  return toOptions([...(DISTRICTS[state] ?? []), OTHER]);
}

export function taluksFor(district: string): Option[] {
  return toOptions([...(TALUKS[district] ?? []), OTHER]);
}

export function villagesFor(taluk: string): Option[] {
  return toOptions([...(VILLAGES[taluk] ?? []), OTHER]);
}

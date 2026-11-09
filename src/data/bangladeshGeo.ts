export interface BangladeshDivision {
  name: string;
  districts: {
    name: string;
    upazilas: string[];
  }[];
}

export class BangladeshGeoData {
  static divisions: BangladeshDivision[] = [
    {
      name: "Dhaka (ঢাকা)",
      districts: [
        {
          name: "Dhaka (ঢাকা)",
          upazilas: ["Dhamrai", "Dohar", "Keraniganj", "Nawabganj", "Savar", "Mirpur", "Gulshan", "Dhanmondi", "Uttara", "Tejgaon", "Mohammadpur", "Badda", "Jatrabari", "Lalbagh", "Shahbagh", "Ramna", "Adabor", "Paltan", "Khilgaon", "Demra", "Kadamtali", "Kallyanpur", "Sutrapur", "Hazaribagh", "Kotwali", "Wari", "Gendaria", "Motijheel", "Sabujbagh", "Turag", "Uttar Khan", "Dakshinkhan", "Kafrul", "Cantonment", "Bhashantek", "Pallabi", "Rupnagar", "Darussalam", "Shah Ali", "Banonai", "Bhatara", "New Market", "Kalabagan", "Sher-e-Bangla Nagar", "Hatirjheel", "Kamrangirchar"]
        },
        {
          name: "Gazipur (গাজীপুর)",
          upazilas: ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur", "Tongi", "Pubail", "Gacha", "Konabari", "Bason"]
        },
        {
          name: "Narayanganj (নারায়ণগঞ্জ)",
          upazilas: ["Araihazar", "Bandar", "Narayanganj Sadar", "Rupganj", "Sonargaon", "Siddhirganj", "Fatullah"]
        },
        {
          name: "Tangail (টাঙ্গাইল)",
          upazilas: ["Basail", "Bhuapur", "Delduar", "Dhanbari", "Ghatail", "Gopalpur", "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur", "Tangail Sadar", "Kashil", "Jossore"]
        },
        {
          name: "Narsingdi (নরসিংদী)",
          upazilas: ["Belabo", "Monohardi", "Narsingdi Sadar", "Palash", "Raipura", "Shibpur", "Madhabdi"]
        },
        {
          name: "Kishoreganj (কিশোরগঞ্জ)",
          upazilas: ["Austagram", "Bajitpur", "Bhairab", "Hossainpur", "Itna", "Karimganj", "Katiadi", "Kishoreganj Sadar", "Kuliarchar", "Mithamain", "Nikli", "Pakundia", "Tarail", "Kotiadi"]
        },
        {
          name: "Manikganj (মানিকগঞ্জ)",
          upazilas: ["Daulatpur", "Gheor", "Harirampur", "Manikganj Sadar", "Saturia", "Shivalaya", "Singair"]
        },
        {
          name: "Munshiganj (মুন্সীগঞ্জ)",
          upazilas: ["Gazaria", "Lohajang", "Munshiganj Sadar", "Sirajdikhan", "Sreenagar", "Tongibari"]
        },
        {
          name: "Faridpur (ফরিদপুর)",
          upazilas: ["Alfadanga", "Bhanga", "Boalmari", "Charbhadrashen", "Faridpur Sadar", "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha"]
        },
        {
          name: "Gopalganj (গোপালগঞ্জ)",
          upazilas: ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"]
        },
        {
          name: "Madaripur (মাদারীপুর)",
          upazilas: ["Rajoir", "Madaripur Sadar", "Kalkini", "Shibchar", "Dasar"]
        },
        {
          name: "Rajbari (রাজবাড়ী)",
          upazilas: ["Baliakandi", "Goalandaghat", "Pangsha", "Rajbari Sadar", "Kalukhali"]
        },
        {
          name: "Shariatpur (শরীয়তপুর)",
          upazilas: ["Bhedarganj", "Damudya", "Gosairhat", "Naria", "Shariatpur Sadar", "Zajira"]
        }
      ]
    },
    {
      name: "Chattogram (চট্টগ্রাম)",
      districts: [
        {
          name: "Chattogram (চট্টগ্রাম)",
          upazilas: ["Anwara", "Banshkhali", "Boalkhali", "Chandanaish", "Fatikchhari", "Hathazari", "Karnaphuli", "Lohagara", "Mirsarai", "Patiya", "Panchlaish", "Rangunia", "Raozan", "Sadar", "Sandwip", "Satkania", "Sitakunda", "Double Mooring", "Chandgaon", "Bandar", "Pahartali", "Kotwali", "Bakalia", "Bayazid", "Patenga", "Halishahar", "Akbar Shah", "EPZ"]
        },
        {
          name: "Cox's Bazar (কক্সবাজার)",
          upazilas: ["Chakaria", "Cox's Bazar Sadar", "Kutubdia", "Maheshkhali", "Pekua", "Ramu", "Teknaf", "Ukhiya", "Eidgaon", "St. Martin"]
        },
        {
          name: "Cumilla (কুমিল্লা)",
          upazilas: ["Barura", "Brahmanpara", "Burichang", "Chandina", "Chouddagram", "Daudkandi", "Debidwar", "Homna", "Laksam", "Muradnagar", "Nangalkot", "Cumilla Sadar", "Titas", "Monohargonj", "Meghna", "Lalmai"]
        },
        {
          name: "Chandpur (চাঁদপুর)",
          upazilas: ["Chandpur Sadar", "Faridganj", "Haimchar", "Hajiganj", "Kachua", "Matlab North", "Matlab South", "Shahrasti"]
        },
        {
          name: "Feni (ফেনী)",
          upazilas: ["Chhagalnaiya", "Daganbhuiyan", "Feni Sadar", "Fulgazi", "Parshuram", "Sonagazi"]
        },
        {
          name: "Noakhali (নোয়াখালী)",
          upazilas: ["Begumganj", "Chatkhil", "Companiganj", "Hatiya", "Kabirhat", "Senbagh", "Sonaimuri", "Subarnachar", "Noakhali Sadar"]
        },
        {
          name: "Lakshmipur (লক্ষ্মীপুর)",
          upazilas: ["Kamalnagar", "Lakshmipur Sadar", "Raipur", "Ramganj", "Ramgati"]
        },
        {
          name: "Brahmanbaria (ব্রাহ্মণবাড়িয়া)",
          upazilas: ["Akhaura", "Bancharampur", "Brahmanbaria Sadar", "Kasba", "Nabinagar", "Nasirnagar", "Sarail", "Ashuganj", "Bijoynagar"]
        },
        {
          name: "Khagrachhari (খাগড়াছড়ি)",
          upazilas: ["Dighinala", "Khagrachhari Sadar", "Lakshmichhari", "Mahalchhari", "Manikchhari", "Matiranga", "Panchhari", "Ramgarh", "Guimara"]
        },
        {
          name: "Rangamati (রাঙ্গামাটি)",
          upazilas: ["Bagaichhari", "Barkal", "Kawkhali", "Langadu", "Naniarchar", "Rajasthali", "Rangamati Sadar", "Juraichhari", "Belaichhari", "Kaptai"]
        },
        {
          name: "Bandarban (বান্দরবান)",
          upazilas: ["Ali Kadam", "Bandarban Sadar", "Lama", "Naikhongchhari", "Rowangchhari", "Ruma", "Thanchi"]
        }
      ]
    },
    {
      name: "Rajshahi (রাজশাহী)",
      districts: [
        {
          name: "Rajshahi (রাজশাহী)",
          upazilas: ["Bagha", "Bagmara", "Charghat", "Durgapur", "Godagari", "Mohanpur", "Paba", "Puthia", "Tanore", "Boalia", "Rajshahi Sadar", "Shah Mokhdum", "Motihar", "Rajpara"]
        },
        {
          name: "Bogura (বগুড়া)",
          upazilas: ["Adamdighi", "Bogura Sadar", "Dhunat", "Dhupchanchia", "Gabtali", "Kahaloo", "Nandigram", "Sariakandi", "Shajahanpur", "Sherpur", "Shibganj", "Sonatala"]
        },
        {
          name: "Pabna (পাবনা)",
          upazilas: ["Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Santhia", "Sujanagar", "Pabna Sadar"]
        },
        {
          name: "Sirajganj (সিরাজগঞ্জ)",
          upazilas: ["Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Rayganj", "Shahjadpur", "Sirajganj Sadar", "Tarash", "Ullapara"]
        },
        {
          name: "Naogaon (নওগাঁ)",
          upazilas: ["Atrai", "Badalgachhi", "Dhamoirhat", "Manda", "Mahadevbpur", "Naogaon Sadar", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar"]
        },
        {
          name: "Natore (নাটোর)",
          upazilas: ["Bagatipara", "Baraigram", "Gurudaspur", "Lalpur", "Natore Sadar", "Singra", "Naldanga"]
        },
        {
          name: "Joypurhat (জয়পুরহাট)",
          upazilas: ["Akkelpur", "Joypurhat Sadar", "Kalai", "Khetlal", "Panchbibi"]
        },
        {
          name: "Chapainawabganj (চাঁপাইনবাবগঞ্জ)",
          upazilas: ["Bholahat", "Chapainawabganj Sadar", "Gomastapur", "Nachole", "Shibganj"]
        }
      ]
    },
    {
      name: "Khulna (খুলনা)",
      districts: [
        {
          name: "Khulna (খুলনা)",
          upazilas: ["Batiaghata", "Dacope", "Dumuria", "Dighalia", "Koyra", "Paikgachha", "Phultala", "Rupsha", "Terokhada", "Khulna Sadar", "Sonadanga", "Khalishpur", "Daulatpur", "Khan Jahan Ali"]
        },
        {
          name: "Jashore (যশোর)",
          upazilas: ["Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Jashore Sadar", "Manirampur", "Sharsha", "Benapole"]
        },
        {
          name: "Kushtia (কুষ্টিয়া)",
          upazilas: ["Bheramara", "Daulatpur", "Khoksa", "Kumarkhali", "Kushtia Sadar", "Mirpur"]
        },
        {
          name: "Satkhira (সাতক্ষীরা)",
          upazilas: ["Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Satkhira Sadar", "Shyamnagar", "Tala"]
        },
        {
          name: "Bagerhat (বাগেরহাট)",
          upazilas: ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"]
        },
        {
          name: "Jhenaidah (ঝিনাইদহ)",
          upazilas: ["Harinakunda", "Jhenaidah Sadar", "Kaliganj", "Kotchandpur", "Maheshpur", "Shailkupa"]
        },
        {
          name: "Chuadanga (চুয়াডাঙ্গা)",
          upazilas: ["Alamdanga", "Chuadanga Sadar", "Damurhuda", "Jibannagar"]
        },
        {
          name: "Magura (মাগুরা)",
          upazilas: ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"]
        },
        {
          name: "Meherpur (মেহেরপুর)",
          upazilas: ["Gangni", "Meherpur Sadar", "Mujibnagar"]
        },
        {
          name: "Narail (নড়াইল)",
          upazilas: ["Kalia", "Lohagara", "Narail Sadar"]
        }
      ]
    },
    {
      name: "Barishal (বরিশাল)",
      districts: [
        {
          name: "Barishal (বরিশাল)",
          upazilas: ["Agailjhara", "Babuganj", "Bakerganj", "Banaripara", "Gaurnadi", "Hizla", "Barishal Sadar", "Mehendiganj", "Muladi", "Wazirpur", "Airport", "Kotwali"]
        },
        {
          name: "Bhola (ভোলা)",
          upazilas: ["Bhola Sadar", "Burhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"]
        },
        {
          name: "Patuakhali (পটুয়াখালী)",
          upazilas: ["Bauftal", "Galachipa", "Kalapara", "Mirzaganj", "Patuakhali Sadar", "Rangabali", "Dumki", "Dashmina"]
        },
        {
          name: "Pirojpur (পিরোজপুর)",
          upazilas: ["Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur", "Nesarabad", "Pirojpur Sadar", "Indurkani"]
        },
        {
          name: "Jhalokati (ঝালকাঠি)",
          upazilas: ["Jhalokati Sadar", "Kathalia", "Nalchhiti", "Rajapur"]
        },
        {
          name: "Barguna (বরগুনা)",
          upazilas: ["Amtali", "Barguna Sadar", "Betagi", "Bamna", "Patharghata", "Taltali"]
        }
      ]
    },
    {
      name: "Sylhet (সিলেট)",
      districts: [
        {
          name: "Sylhet (সিলেট)",
          upazilas: ["Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Sylhet Sadar", "Zakiganj", "South Surma", "Osmani Nagar", "Shah Poran"]
        },
        {
          name: "Moulvibazar (মৌলভীবাজার)",
          upazilas: ["Barlekha", "Juri", "Kamalganj", "Kulaura", "Moulvibazar Sadar", "Rajnagar", "Sreemangal"]
        },
        {
          name: "Habiganj (হবিগঞ্জ)",
          upazilas: ["Ajmiriganj", "Bahubal", "Baniyachong", "Chunarughat", "Habiganj Sadar", "Lakhai", "Madhabpur", "Nabiganj", "Shayestaganj"]
        },
        {
          name: "Sunamganj (সুনামগঞ্জ)",
          upazilas: ["Bishwamambharpur", "Chhatak", "Derai", "Dharamapasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Sullah", "Sunamganj Sadar", "Tahirpur", "Shantiganj", "Middlenagar"]
        }
      ]
    },
    {
      name: "Rangpur (রংপুর)",
      districts: [
        {
          name: "Rangpur (রংপুর)",
          upazilas: ["Badarganj", "Gangachara", "Kaunia", "Rangpur Sadar", "Mithapukur", "Pirgachha", "Pirganj", "Taraganj", "Kotwali"]
        },
        {
          name: "Dinajpur (দিনাজপুর)",
          upazilas: ["Birampur", "Birganj", "Biral", "Bochaganj", "Chirirbandar", "Phulbari", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Dinajpur Sadar", "Nawabganj", "Birol"]
        },
        {
          name: "Gaibandha (গাইবান্ধা)",
          upazilas: ["Fulchhari", "Gaibandha Sadar", "Gobindaganj", "Palashbari", "Sadullapur", "Saghata", "Sundarganj"]
        },
        {
          name: "Kurigram (কুড়িগ্রাম)",
          upazilas: ["Bhurungamari", "Char Rajibpur", "Chilmari", "Phulbari", "Kurigram Sadar", "Nageshwari", "Rajarhat", "Raomari", "Ulipur"]
        },
        {
          name: "Lalmonirhat (লালমনিরহাট)",
          upazilas: ["Aditmari", "Hatibandha", "Kaliganj", "Lalmonirhat Sadar", "Patgram"]
        },
        {
          name: "Nilphamari (নীলফামারী)",
          upazilas: ["Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Nilphamari Sadar", "Saidpur"]
        },
        {
          name: "Panchagarh (পঞ্চগড়)",
          upazilas: ["Atwari", "Boda", "Debiganj", "Panchagarh Sadar", "Tetulia"]
        },
        {
          name: "Thakurgaon (ঠাকুরগাঁও)",
          upazilas: ["Baliadangi", "Haripur", "Pirganj", "Ranisankail", "Thakurgaon Sadar"]
        }
      ]
    },
    {
      name: "Mymensingh (ময়মনসিংহ)",
      districts: [
        {
          name: "Mymensingh (ময়মনসিংহ)",
          upazilas: ["Bhaluka", "Dhobaura", "Fulbaria", "Gafargaon", "Gauripur", "Haluaghat", "Ishwarganj", "Mymensingh Sadar", "Muktagachha", "Nandail", "Phulpur", "Trishal", "TaraKanda", "Kotwali"]
        },
        {
          name: "Jamalpur (জামালপুর)",
          upazilas: ["Baksiganj", "Dewanganj", "Isampur", "Jamalpur Sadar", "Madarganj", "Melandahn", "Sarishabari"]
        },
        {
          name: "Netrokona (নেত্রকোণা)",
          upazilas: ["Atpara", "Barhatta", "Durgapur", "Khaliajuri", "Kalmakanda", "Kendua", "Madan", "Mohanganj", "Netrokona Sadar", "Purbadhala"]
        },
        {
          name: "Sherpur (শেরপুর)",
          upazilas: ["Jhenaigati", "Nakla", "Nalitabari", "Sherpur Sadar", "Sreebardi"]
        }
      ]
    }
  ];
}

// Dynamically clean up Bengali characters to ensure exclusively professional English
BangladeshGeoData.divisions.forEach(div => {
  div.name = div.name.replace(/\s*\([\u0980-\u09FF]+\)/g, "").trim();
  div.districts.forEach(dist => {
    dist.name = dist.name.replace(/\s*\([\u0980-\u09FF]+\)/g, "").trim();
  });
});

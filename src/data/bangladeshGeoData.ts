export interface DistrictData {
  name: string;
  bnName: string;
  upazilas: string[];
}

export interface DivisionData {
  id: string;
  name: string;
  bnName: string;
  districts: DistrictData[];
}

export const BANGLADESH_DIVISIONS: DivisionData[] = [
  {
    id: 'dhaka',
    name: 'Dhaka',
    bnName: 'ঢাকা',
    districts: [
      { name: 'Dhaka', bnName: 'ঢাকা', upazilas: ['Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Mohammadpur', 'Badda', 'Khilgaon', 'Motijheel', 'Old Dhaka', 'Savara', 'Dhamrai', 'Keraniganj', 'Nawabganj'] },
      { name: 'Gazipur', bnName: 'গাজীপুর', upazilas: ['Gazipur Sadar', 'Kaliakair', 'Kapasia', 'Sreepur', 'Kaliganj'] },
      { name: 'Narayanganj', bnName: 'নারায়ণগঞ্জ', upazilas: ['Narayanganj Sadar', 'Araihazar', 'Bandar', 'Rupganj', 'Sonargaon'] },
      { name: 'Tangail', bnName: 'টাঙ্গাইল', upazilas: ['Tangail Sadar', 'Gopalpur', 'Ghatail', 'Madhupur', 'Mirzapur', 'Kalihati', 'Sakhipur', 'Delduar', 'Bhuapur', 'Dhanbari'] },
      { name: 'Faridpur', bnName: 'ফরিদপুর', upazilas: ['Faridpur Sadar', 'Boalmari', 'Alfadanga', 'Bhanga', 'Nagarkanda', 'Sadarpur'] },
      { name: 'Manikganj', bnName: 'মানিকগঞ্জ', upazilas: ['Manikganj Sadar', 'Singair', 'Saturia', 'Shibalaya', 'Ghior', 'Harirampur'] },
      { name: 'Munshiganj', bnName: 'মুন্সীগঞ্জ', upazilas: ['Munshiganj Sadar', 'Sreenagar', 'Sirajdikhan', 'Tongibari', 'Louhajang', 'Gazaria'] },
      { name: 'Narsingdi', bnName: 'নরসিংদী', upazilas: ['Narsingdi Sadar', 'Palash', 'Shibpur', 'Belabo', 'Monohardi', 'Raipura'] },
      { name: 'Rajbari', bnName: 'রাজবাড়ী', upazilas: ['Rajbari Sadar', 'Goalanda', 'Pangsha', 'Baliakandi', 'Kalukhali'] },
      { name: 'Gopalganj', bnName: 'গোপালগঞ্জ', upazilas: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'] },
      { name: 'Madaripur', bnName: 'মাদারীপুর', upazilas: ['Madaripur Sadar', 'Kalkini', 'Rajoir', 'Shibchar'] },
      { name: 'Shariatpur', bnName: 'শরীয়তপুর', upazilas: ['Shariatpur Sadar', 'Naria', 'Zajira', 'Gosairhat', 'Damudya', 'Bhedarganj'] },
      { name: 'Kishoreganj', bnName: 'কিশোরগঞ্জ', upazilas: ['Kishoreganj Sadar', 'Bhairab', 'Bajitpur', 'Katiadi', 'Kuliarchar', 'Pakundia', 'Nikli', 'Itna', 'Mithamain', 'Ashtagram'] }
    ]
  },
  {
    id: 'chattogram',
    name: 'Chattogram',
    bnName: 'চট্টগ্রাম',
    districts: [
      { name: 'Chattogram', bnName: 'চট্টগ্রাম', upazilas: ['Panchlaish', 'Double Mooring', 'Kotwali', 'Halishahar', 'Agrabad', 'Hathazari', 'Sitakunda', 'Raozan', 'Rangunia', 'Patiya', 'Anwara', 'Boalkhali', 'Banshkhali', 'Chandanai', 'Fatikchhari', 'Lohagara', 'Mirsarai', 'Satkania'] },
      { name: 'Cox\'s Bazar', bnName: 'কক্সবাজার', upazilas: ['Cox\'s Bazar Sadar', 'Teknaf', 'Ukhiya', 'Chakaria', 'Ramu', 'Maheshkhali', 'Pekua', 'Kutubdia'] },
      { name: 'Cumilla', bnName: 'কুমিল্লা', upazilas: ['Cumilla Sadar', 'Daudkandi', 'Chandina', 'Debidwar', 'Homna', 'Laksam', 'Monohargonj', 'Muradnagar', 'Nangalkot', 'Titas', 'Burichang', 'Barura', 'Chauddagram'] },
      { name: 'Feni', bnName: 'ফেনী', upazilas: ['Feni Sadar', 'Chhagalnaiya', 'Daganbhuiyan', 'Parshuram', 'Fulgazi', 'Sonavazi'] },
      { name: 'Noakhali', bnName: 'নোয়াখালী', upazilas: ['Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Senbagh', 'Subarnachar', 'Kabirhat', 'Sonaimuri'] },
      { name: 'Brahmanbaria', bnName: 'ব্রাহ্মণবাড়িয়া', upazilas: ['Brahmanbaria Sadar', 'Ashuganj', 'Bancharampur', 'Kasba', 'Nabinagar', 'Nasirnagar', 'Sarail', 'Akhaura', 'Bijoynagar'] },
      { name: 'Chandpur', bnName: 'চাঁদপুর', upazilas: ['Chandpur Sadar', 'Faridganj', 'Haimchar', 'Hajiganj', 'Kachua', 'Matlab North', 'Matlab South', 'Shahrasti'] },
      { name: 'Lakshmipur', bnName: 'লক্ষ্মীপুর', upazilas: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar'] },
      { name: 'Khagrachhari', bnName: 'খাগড়াছড়ি', upazilas: ['Khagrachhari Sadar', 'Dighinala', 'Panchhari', 'Mahalchhari', 'Matiranga', 'Ramgarh', 'Manikchhari', 'Guimara'] },
      { name: 'Rangamati', bnName: 'রাঙ্গামাটি', upazilas: ['Rangamati Sadar', 'Kaptai', 'Kawkhali', 'Baghaichhari', 'Barkal', 'Langadu', 'Rajasthali', 'Belaichhari', 'Juraichhari', 'Naniarchar'] },
      { name: 'Bandarban', bnName: 'বান্দরবান', upazilas: ['Bandarban Sadar', 'Thanchi', 'Lama', 'Ruma', 'Rrowangchhari', 'Ali Kadam', 'Naikhongchhari'] }
    ]
  },
  {
    id: 'rajshahi',
    name: 'Rajshahi',
    bnName: 'রাজশাহী',
    districts: [
      { name: 'Rajshahi', bnName: 'রাজশাহী', upazilas: ['Boalia', 'Rajpara', 'Motihar', 'Shah Makhdum', 'Godagari', 'Tanore', 'Paba', 'Puthia', 'Bagha', 'Charghat', 'Durgapur', 'Bagmara', 'Mohanpur'] },
      { name: 'Bogra', bnName: 'বগুড়া', upazilas: ['Bogra Sadar', 'Adamdighi', 'Shajahanpur', 'Sherpur', 'Dhunat', 'Dhubchanchia', 'Gabatali', 'Kahaloo', 'Nandigram', 'Sariakandi', 'Sonatola', 'Shibganj'] },
      { name: 'Pabna', bnName: 'পাবনা', upazilas: ['Pabna Sadar', 'Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Ishwardi', 'Santhia', 'Sujanagar'] },
      { name: 'Sirajganj', bnName: 'সিরাজগঞ্জ', upazilas: ['Sirajganj Sadar', 'Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Rayganj', 'Shahjadpur', 'Tarash', 'Ullapara'] },
      { name: 'Naogaon', bnName: 'নওগাঁ', upazilas: ['Naogaon Sadar', 'Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda', 'Mahadevpur', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar'] },
      { name: 'Natore', bnName: 'নাটোর', upazilas: ['Natore Sadar', 'Baraigram', 'Bagatipara', 'Gurudaspur', 'Lalpur', 'Singra', 'Naldanga'] },
      { name: 'Chapai Nawabganj', bnName: 'চাঁপাইনবাবগঞ্জ', upazilas: ['Chapai Nawabganj Sadar', 'Bholahat', 'Gomastapur', 'Nachole', 'Shibganj'] },
      { name: 'Joypurhat', bnName: 'জয়পুরহাট', upazilas: ['Joypurhat Sadar', 'Akkelpur', 'Kalai', 'Khetlal', 'Panchbibi'] }
    ]
  },
  {
    id: 'khulna',
    name: 'Khulna',
    bnName: 'খুলনা',
    districts: [
      { name: 'Khulna', bnName: 'খুলনা', upazilas: ['Khulna Sadar', 'Sonadanga', 'Khalishpur', 'Daulatpur', 'Khan Jahan Ali', 'Batiaghata', 'Dacope', 'Dumuria', 'Dighalia', 'Koyra', 'Paikgachha', 'Phultala', 'Rupsha', 'Terokhada'] },
      { name: 'Jessore', bnName: 'যশোর', upazilas: ['Jessore Sadar', 'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargachha', 'Keshabpur', 'Manirampur', 'Sharsha'] },
      { name: 'Kushtia', bnName: 'কুষ্টিয়া', upazilas: ['Kushtia Sadar', 'Kumarkhali', 'Khoksa', 'Mirpur', 'Daulatpur', 'Bheramara'] },
      { name: 'Satkhira', bnName: 'সাতক্ষীরা', upazilas: ['Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Shyamnagar', 'Tala'] },
      { name: 'Bagerhat', bnName: 'বাগেরহাট', upazilas: ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'] },
      { name: 'Jhenaidah', bnName: 'ঝিনাইদহ', upazilas: ['Jhenaidah Sadar', 'Harakunda', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa'] },
      { name: 'Chuadanga', bnName: 'চুয়াডাঙ্গা', upazila: ['Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar'] } as unknown as DistrictData,
      { name: 'Magura', bnName: 'মাগুরা', upazilas: ['Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur'] },
      { name: 'Meherpur', bnName: 'মেহেরপুর', upazilas: ['Meherpur Sadar', 'Gangni', 'Mujibnagar'] },
      { name: 'Narail', bnName: 'নড়াইল', upazilas: ['Narail Sadar', 'Kalia', 'Lohagara'] }
    ]
  },
  {
    id: 'sylhet',
    name: 'Sylhet',
    bnName: 'সিলেট',
    districts: [
      { name: 'Sylhet', bnName: 'সিলেট', upazilas: ['Sylhet Sadar', 'Beanibazar', 'Bishwanath', 'Companiganj', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Zakiganj', 'South Surma', 'Osmani Nagar'] },
      { name: 'Moulvibazar', bnName: 'মৌলভীবাজার', upazilas: ['Moulvibazar Sadar', 'Barlekha', 'Juri', 'Kamalganj', 'Kulaura', 'Rajnagar', 'Sreemangal'] },
      { name: 'Habiganj', bnName: 'হবিগঞ্জ', upazilas: ['Habiganj Sadar', 'Ajmiriganj', 'Bahubal', 'Baniyachong', 'Chhatak', 'Chunarughat', 'Nabiganj', 'Madhabpur', 'Lakhai'] },
      { name: 'Sunamganj', bnName: 'সুনামগঞ্জ', upazilas: ['Sunamganj Sadar', 'Bishwamambharpur', 'Chhatak', 'Derai', 'Dharamapasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Sullah', 'Tahirpur', 'South Sunamganj'] }
    ]
  },
  {
    id: 'barishal',
    name: 'Barishal',
    bnName: 'বরিশাল',
    districts: [
      { name: 'Barishal', bnName: 'বরিশাল', upazilas: ['Barishal Sadar', 'Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara', 'Gaurnadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur'] },
      { name: 'Bhola', bnName: 'ভোলা', upazilas: ['Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin'] },
      { name: 'Patuakhali', bnName: 'পটুয়াখালী', upazilas: ['Patuakhali Sadar', 'Bauphal', 'Dashmina', 'Galachipa', 'Kalapara', 'Mirzaganj', 'Rangabali', 'Dumki'] },
      { name: 'Pirojpur', bnName: 'পিরোজপুর', upazilas: ['Pirojpur Sadar', 'Bhandaria', 'Kawkhali', 'Mathbaria', 'Nazirpur', 'Nesarabad', 'Zianagar'] },
      { name: 'Barguna', bnName: 'বরগুনা', upazilas: ['Barguna Sadar', 'Amtali', 'Bamna', 'Betagi', 'Patharghata', 'Taltali'] },
      { name: 'Jhalokathi', bnName: 'ঝালকাঠি', upazilas: ['Jhalokathi Sadar', 'Kathalia', 'Nalchhiti', 'Rajapur'] }
    ]
  },
  {
    id: 'rangpur',
    name: 'Rangpur',
    bnName: 'রংপুর',
    districts: [
      { name: 'Rangpur', bnName: 'রংপুর', upazilas: ['Rangpur Sadar', 'Badarganj', 'Gangachhara', 'Kaunia', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Taraganj'] },
      { name: 'Dinajpur', bnName: 'দিনাজপুর', upazilas: ['Dinajpur Sadar', 'Birampur', 'Birganj', 'Biral', 'Bochaganj', 'Chirirbandar', 'Phulbari', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khansama', 'Nawabganj', 'Parbatipur'] },
      { name: 'Gaibandha', bnName: 'গাইবান্ধা', upazilas: ['Gaibandha Sadar', 'Fulchhari', 'Gobindaganj', 'Palashbari', 'Sadullapur', 'Saghata', 'Sundarganj'] },
      { name: 'Kurigram', bnName: 'কুড়িগ্রাম', upazilas: ['Kurigram Sadar', 'Bhurungamari', 'Char Rajibpur', 'Chilmari', 'Phulbari', 'Nageshwari', 'Rajarhat', 'Raomari', 'Ulipur'] },
      { name: 'Nilphamari', bnName: 'নীলফামারী', upazilas: ['Nilphamari Sadar', 'Jaldhaka', 'Kishoreganj', 'Domar', 'Dimla', 'Saidpur'] },
      { name: 'Panchagarh', bnName: 'পঞ্চগড়', upazilas: ['Panchagarh Sadar', 'Atwari', 'Boda', 'Debiganj', 'Tetulia'] },
      { name: 'Thakurgaon', bnName: 'ঠাকুরগাঁও', upazilas: ['Thakurgaon Sadar', 'Baliadangi', 'Haripur', 'Ranisankail', 'Pirganj'] },
      { name: 'Lalmonirhat', bnName: 'লালমনিরহাট', upazilas: ['Lalmonirhat Sadar', 'Aditmari', 'Hatibandha', 'Kaliganj', 'Patgram'] }
    ]
  },
  {
    id: 'mymensingh',
    name: 'Mymensingh',
    bnName: 'ময়মনসিংহ',
    districts: [
      { name: 'Mymensingh', bnName: 'ময়মনসিংহ', upazilas: ['Mymensingh Sadar', 'Bhaluka', 'Trishal', 'Gafargaon', 'Muktagachha', 'Fulbaria', 'Ishwarganj', 'Nandail', 'Gouripur', 'Phulpur', 'Haluaghat', 'Dhobaura', 'TaraKanda'] },
      { name: 'Jamalpur', bnName: 'জামালপুর', upazilas: ['Jamalpur Sadar', 'Baksiganj', 'Dewanganj', 'Isampur', 'Madarganj', 'Melandaha', 'Sarishabari'] },
      { name: 'Netrokona', bnName: 'নেত্রকোণা', upazilas: ['Netrokona Sadar', 'Atpara', 'Barhatta', 'Durgapur', 'Khaliajuri', 'Kalmakanda', 'Kendra', 'Madan', 'Mohanganj', 'Purbadhala'] },
      { name: 'Sherpur', bnName: 'শেরপুর', upazilas: ['Sherpur Sadar', 'Jhenaigati', 'Nakla', 'Nalitabari', 'Sreebardi'] }
    ]
  }
];

"use client";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";

const PI={"Vegetables":"🥬","Fruits":"🍎","Meat":"🥩","Eggs":"🥚","Cheese":"🧀","Honey":"🍯","Baked Goods":"🍞","Herbs":"🌿","Flowers":"💐","Seafood":"🦐","Peaches":"🍑","Nuts":"🥜","Jams":"🫙","Wine":"🍷","Lavender":"💜","Tamales":"🫔","Microgreens":"🌱","Chile Peppers":"🌶️","Pecans":"🌰","Citrus":"🍊","Watermelon":"🍉","Goat":"🐐","Dairy":"🥛"};
const ic=p=>PI[p]||"🧺";
const TS={"Farmers Market":{emoji:"🏪",c:"#5a7c3e",bg:"#e8efd8"},"Farm":{emoji:"🌾",c:"#a07c3e",bg:"#f5ecd6"},"Farm Stand":{emoji:"🛒",c:"#8a6a3e",bg:"#f0e4cc"}};

const Logo=({size=48})=>(<svg width={size} height={size*0.67} viewBox="0 0 120 80" style={{borderRadius:5,filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.15))"}}>
  <rect width="120" height="80" rx="6" fill="#fff"/><rect x="0" y="0" width="40" height="80" fill="#002868" rx="6"/><rect x="6" y="0" width="34" height="80" fill="#002868"/><rect x="40" y="0" width="80" height="40" fill="#BF0A30"/><rect x="40" y="40" width="80" height="40" fill="#fff"/>
  <g transform="translate(20,40)"><ellipse cx="0" cy="6" rx="5" ry="4" fill="#8B6914" opacity=".9"/><path d="M0,4C0,-2-1,-10 0,-20" stroke="#5a7c3e" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M-1,-12C-10,-18-14,-12-8,-8C-4,-6-1,-10-1,-12Z" fill="#7ba657"/><path d="M1,-16C8,-24 14,-18 8,-13C4,-10 1,-14 1,-16Z" fill="#5a7c3e"/><path d="M0,-20C-3,-24-1,-26 0,-23C1,-26 3,-24 0,-20Z" fill="#9bc77b"/></g>
  <rect width="120" height="80" rx="6" fill="none" stroke="#000" strokeWidth="1.5" opacity=".1"/></svg>);

// White/cream version of logo for dark backgrounds
const LogoLight=({size=80})=>(<svg width={size} height={size*0.67} viewBox="0 0 120 80">
  <rect width="120" height="80" rx="6" fill="#fefcf7" opacity="0.15"/>
  <g transform="translate(60,42)"><ellipse cx="0" cy="6" rx="6" ry="5" fill="#f5ecd6" opacity=".9"/><path d="M0,4C0,-2-1,-12 0,-24" stroke="#fefcf7" strokeWidth="3" fill="none" strokeLinecap="round"/><path d="M-1,-14C-12,-22-17,-14-10,-9C-5,-7-1,-12-1,-14Z" fill="#fefcf7"/><path d="M1,-18C10,-28 17,-21 10,-15C5,-12 1,-16 1,-18Z" fill="#f5ecd6"/><path d="M0,-24C-3,-28-1,-30 0,-27C1,-30 3,-28 0,-24Z" fill="#fefcf7"/></g>
</svg>);

const FARMS=[
  {id:1,name:"Urban Harvest Farmers Market",type:"Farmers Market",city:"Houston",region:"Gulf Coast",lat:29.7355,lng:-95.3885,address:"2752 Buffalo Speedway, Houston, TX 77098",schedule:"Saturdays 8AM–12PM",season:"Year-round",products:["Vegetables","Fruits","Herbs","Eggs","Honey","Baked Goods"],phone:"(713) 880-4540",website:"urbanharvest.org",accepts:["Cash","Credit Card","SNAP/EBT"],description:"60+ local vendors with fresh produce, artisan goods, and live music every Saturday.",rating:4.7},
  {id:2,name:"Rice Village Farmers Market",type:"Farmers Market",city:"Houston",region:"Gulf Coast",lat:29.7158,lng:-95.4128,address:"Rice Village, Houston, TX 77005",schedule:"Tuesdays 3:30–7PM",season:"Year-round",products:["Vegetables","Fruits","Meat","Cheese","Flowers"],phone:"(713) 533-9990",website:"",accepts:["Cash","Credit Card"],description:"Fresh local produce every Tuesday afternoon.",rating:4.3},
  {id:3,name:"Canino Produce",type:"Farm Stand",city:"Houston",region:"Gulf Coast",lat:29.7925,lng:-95.3645,address:"2520 Airline Dr, Houston, TX 77009",schedule:"Daily 6AM–6PM",season:"Year-round",products:["Vegetables","Fruits","Herbs","Nuts"],phone:"(713) 862-4027",website:"",accepts:["Cash","Credit Card"],description:"Houston institution since 1958 with wholesale prices direct to the public.",rating:4.5},
  {id:4,name:"Atkinson Farms",type:"Farm",city:"Spring",region:"Gulf Coast",lat:30.0454,lng:-95.3831,address:"5000 Spring Stuebner Rd, Spring, TX 77389",schedule:"Saturdays 9AM–1PM",season:"Mar–Nov",products:["Vegetables","Fruits","Eggs","Honey"],phone:"(281) 353-1662",website:"atkinsonfarms.com",accepts:["Cash","Credit Card"],description:"Family-owned for 30+ years with sustainable produce.",rating:4.6},
  {id:5,name:"East End Farmers Market",type:"Farmers Market",city:"Houston",region:"Gulf Coast",lat:29.7489,lng:-95.3393,address:"2000 Canal St, Houston, TX 77003",schedule:"Sundays 10AM–2PM",season:"Year-round",products:["Vegetables","Fruits","Tamales","Baked Goods","Herbs"],phone:"",website:"",accepts:["Cash","SNAP/EBT"],description:"Culturally diverse offerings in the vibrant East End.",rating:4.4},
  {id:6,name:"Froberg's Farm",type:"Farm",city:"Alvin",region:"Gulf Coast",lat:29.3834,lng:-95.2785,address:"3601 Hwy 6, Alvin, TX 77511",schedule:"Daily 8AM–6PM",season:"Year-round",products:["Fruits","Vegetables","Jams","Baked Goods","Honey"],phone:"(281) 585-3531",website:"frobergsfarm.com",accepts:["Cash","Credit Card"],description:"U-pick strawberries, country store, and bakery.",rating:4.8},
  {id:7,name:"Sugar Land Town Square",type:"Farmers Market",city:"Sugar Land",region:"Gulf Coast",lat:29.6197,lng:-95.6349,address:"15958 City Walk, Sugar Land, TX 77479",schedule:"Saturdays 9AM–1PM",season:"Year-round",products:["Vegetables","Fruits","Baked Goods","Flowers","Cheese"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Curated vendors and artisan food producers.",rating:4.5},
  {id:8,name:"Bay Area Farmers Market",type:"Farmers Market",city:"League City",region:"Gulf Coast",lat:29.5074,lng:-95.0949,address:"1001 W Walker St, League City, TX 77573",schedule:"Sundays 9AM–1PM",season:"Year-round",products:["Vegetables","Fruits","Seafood","Eggs"],phone:"(281) 554-1018",website:"",accepts:["Cash","Credit Card"],description:"Coastal market with Gulf seafood and farm produce.",rating:4.2},
  {id:9,name:"Galveston's Own Farmers Market",type:"Farmers Market",city:"Galveston",region:"Gulf Coast",lat:29.3013,lng:-94.7977,address:"2508 Post Office St, Galveston, TX 77550",schedule:"Sundays 9AM–12PM",season:"Year-round",products:["Vegetables","Fruits","Seafood","Honey","Herbs"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Island market with fresh Gulf shrimp and local produce.",rating:4.1},
  {id:10,name:"Beaumont Farmers Market",type:"Farmers Market",city:"Beaumont",region:"Gulf Coast",lat:30.0860,lng:-94.1018,address:"700 Crockett St, Beaumont, TX 77701",schedule:"Saturdays 8AM–12PM",season:"Mar–Nov",products:["Vegetables","Fruits","Eggs","Honey","Baked Goods"],phone:"",website:"",accepts:["Cash","SNAP/EBT"],description:"Cajun-influenced products and bayou specialties.",rating:4.0},
  {id:11,name:"The Heights Farmers Market",type:"Farmers Market",city:"Houston",region:"Gulf Coast",lat:29.7900,lng:-95.4000,address:"540 W 19th St, Houston, TX 77008",schedule:"Saturdays 9AM–1PM",season:"Year-round",products:["Vegetables","Fruits","Eggs","Baked Goods","Flowers"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Heights neighborhood market with local artisans.",rating:4.4},
  {id:12,name:"Animal Farm",type:"Farm",city:"Cat Spring",region:"Gulf Coast",lat:29.8485,lng:-96.3686,address:"Cat Spring, TX 78933",schedule:"By appointment",season:"Year-round",products:["Vegetables","Eggs","Meat","Herbs"],phone:"(979) 992-3400",website:"",accepts:["Cash","Credit Card"],description:"Heritage breed animals and biodynamic veggies.",rating:4.7},
  {id:13,name:"Memorial Villages Farmers Market",type:"Farmers Market",city:"Houston",region:"Gulf Coast",lat:29.7665,lng:-95.4933,address:"10840 Beinhorn Rd, Houston, TX 77024",schedule:"Saturdays 9AM–1PM",season:"Year-round",products:["Vegetables","Fruits","Cheese","Baked Goods"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Upscale neighborhood market in west Houston.",rating:4.3},
  {id:14,name:"Dallas Farmers Market",type:"Farmers Market",city:"Dallas",region:"North Texas",lat:32.7725,lng:-96.7867,address:"920 S Harwood St, Dallas, TX 75201",schedule:"Sat & Sun 8AM–5PM",season:"Year-round",products:["Vegetables","Fruits","Meat","Cheese","Baked Goods","Flowers","Honey"],phone:"(214) 664-9110",website:"dallasfarmersmarket.org",accepts:["Cash","Credit Card","SNAP/EBT"],description:"150+ years of tradition — the heart of Dallas food culture.",rating:4.6},
  {id:15,name:"Cowtown Farmers Market",type:"Farmers Market",city:"Fort Worth",region:"North Texas",lat:32.7467,lng:-97.3308,address:"3821 Southwest Blvd, Fort Worth, TX 76116",schedule:"Saturdays 8AM–12PM",season:"Year-round",products:["Vegetables","Fruits","Meat","Eggs","Honey","Herbs"],phone:"(817) 763-0193",website:"cowtownfarmersmarket.com",accepts:["Cash","Credit Card","SNAP/EBT"],description:"Farm-fresh under covered pavilions.",rating:4.5},
  {id:16,name:"Lemley's Farm",type:"Farm",city:"Denton",region:"North Texas",lat:33.2289,lng:-97.1428,address:"Hwy 377 S, Denton, TX 76210",schedule:"Fri–Sun 9AM–6PM",season:"Apr–Jul",products:["Fruits","Vegetables"],phone:"(940) 382-9890",website:"",accepts:["Cash"],description:"U-pick strawberries and blackberries since 1977.",rating:4.4},
  {id:17,name:"McKinney Farmers Market",type:"Farmers Market",city:"McKinney",region:"North Texas",lat:33.1972,lng:-96.6397,address:"315 S Chestnut St, McKinney, TX 75069",schedule:"Saturdays 8AM–12PM",season:"Apr–Nov",products:["Vegetables","Fruits","Eggs","Baked Goods","Honey","Flowers"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Historic Chestnut Square with live acoustic music.",rating:4.3},
  {id:18,name:"Profound Microfarms",type:"Farm",city:"Lucas",region:"North Texas",lat:33.0837,lng:-96.5575,address:"1370 Brockdale Park Rd, Lucas, TX 75002",schedule:"By appointment",season:"Year-round",products:["Vegetables","Herbs","Microgreens"],phone:"(972) 727-1235",website:"profoundmicrofarms.com",accepts:["Cash","Credit Card"],description:"Regenerative microgreens — the future of farming.",rating:4.7},
  {id:19,name:"Plano Farmers Market",type:"Farmers Market",city:"Plano",region:"North Texas",lat:33.0198,lng:-96.6989,address:"1901 18th St, Plano, TX 75074",schedule:"Saturdays 8AM–12PM",season:"Year-round",products:["Vegetables","Fruits","Meat","Eggs","Baked Goods","Flowers"],phone:"",website:"",accepts:["Cash","Credit Card","SNAP/EBT"],description:"40+ vendors every Saturday morning.",rating:4.3},
  {id:20,name:"Weatherford Farmers Market",type:"Farmers Market",city:"Weatherford",region:"North Texas",lat:32.7593,lng:-97.7973,address:"100 Church St, Weatherford, TX 76086",schedule:"Saturdays 8AM–1PM",season:"Apr–Oct",products:["Vegetables","Fruits","Peaches","Eggs","Honey","Meat"],phone:"",website:"",accepts:["Cash"],description:"Parker County Peach Capital with famous local peaches.",rating:4.2},
  {id:21,name:"Cleburne Farmers Market",type:"Farmers Market",city:"Cleburne",region:"North Texas",lat:32.3476,lng:-97.3867,address:"Cleburne Conference Center, Cleburne, TX",schedule:"Saturdays 8AM–12PM",season:"May–Oct",products:["Vegetables","Fruits","Eggs","Honey","Baked Goods"],phone:"",website:"",accepts:["Cash"],description:"Rural community market in Johnson County.",rating:4.0},
  {id:22,name:"Coppell Farmers Market",type:"Farmers Market",city:"Coppell",region:"North Texas",lat:32.9546,lng:-97.0150,address:"768 W Main St, Coppell, TX 75019",schedule:"Saturdays 8AM–12PM",season:"Apr–Nov",products:["Vegetables","Fruits","Eggs","Cheese","Baked Goods","Flowers"],phone:"",website:"coppellfarmersmarket.org",accepts:["Cash","Credit Card","SNAP/EBT"],description:"Beloved suburban market with rotating vendors.",rating:4.6},
  {id:23,name:"Frisco Fresh Market",type:"Farmers Market",city:"Frisco",region:"North Texas",lat:33.1507,lng:-96.8236,address:"9215 John W Elliott Dr, Frisco, TX 75033",schedule:"Sat & Sun 9AM–4PM",season:"Year-round",products:["Vegetables","Fruits","Meat","Cheese","Baked Goods","Flowers"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Open-air market with 30+ vendors weekly.",rating:4.5},
  {id:24,name:"Grapevine Farmers Market",type:"Farmers Market",city:"Grapevine",region:"North Texas",lat:32.9343,lng:-97.0780,address:"325 S Main St, Grapevine, TX 76051",schedule:"Saturdays 9AM–1PM",season:"May–Oct",products:["Vegetables","Fruits","Wine","Honey","Baked Goods"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Charming downtown market in wine country.",rating:4.3},
  {id:25,name:"Eden Hill Farm",type:"Farm",city:"Pilot Point",region:"North Texas",lat:33.3956,lng:-96.9594,address:"Pilot Point, TX 76258",schedule:"Saturdays 9AM–2PM",season:"Mar–Nov",products:["Vegetables","Eggs","Flowers"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Organic farm with weekly CSA program.",rating:4.6},
  {id:26,name:"White Rock Local Market",type:"Farmers Market",city:"Dallas",region:"North Texas",lat:32.8260,lng:-96.7420,address:"702 N Buckner Blvd, Dallas, TX 75218",schedule:"2nd Saturdays 9AM–2PM",season:"Mar–Dec",products:["Vegetables","Fruits","Eggs","Honey","Baked Goods"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"East Dallas community market by White Rock Lake.",rating:4.4},
  {id:27,name:"SFC Farmers Market",type:"Farmers Market",city:"Austin",region:"Central Texas",lat:30.264,lng:-97.7476,address:"422 Guadalupe St, Austin, TX 78701",schedule:"Saturdays 9AM–1PM",season:"Year-round",products:["Vegetables","Fruits","Meat","Eggs","Cheese","Baked Goods","Flowers"],phone:"(512) 236-0074",website:"sfcfarmersmarket.org",accepts:["Cash","Credit Card","SNAP/EBT","WIC"],description:"Austin's flagship — 60+ local vendors.",rating:4.8},
  {id:28,name:"Hope Farms",type:"Farm",city:"Austin",region:"Central Texas",lat:30.2283,lng:-97.7145,address:"7405 Burleson Rd, Austin, TX 78744",schedule:"Wed & Sat 9AM–1PM",season:"Year-round",products:["Vegetables","Herbs","Eggs"],phone:"(512) 276-2790",website:"hopefarmstx.org",accepts:["Cash","Credit Card","SNAP/EBT"],description:"Urban teaching farm for the community.",rating:4.6},
  {id:29,name:"Boggy Creek Farm",type:"Farm",city:"Austin",region:"Central Texas",lat:30.2561,lng:-97.7167,address:"3414 Lyons Rd, Austin, TX 78702",schedule:"Wed & Sat 8AM–1PM",season:"Year-round",products:["Vegetables","Herbs","Eggs","Flowers"],phone:"(512) 926-4650",website:"boggycreekfarm.com",accepts:["Cash"],description:"Five acres of organic goodness since 1992.",rating:4.7},
  {id:30,name:"Barton Creek Farmers Market",type:"Farmers Market",city:"Austin",region:"Central Texas",lat:30.2601,lng:-97.8059,address:"2901 Capital of TX Hwy, Austin, TX 78746",schedule:"Sundays 9AM–1PM",season:"Year-round",products:["Vegetables","Fruits","Meat","Cheese","Baked Goods"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Curated Sunday market in southwest Austin.",rating:4.4},
  {id:31,name:"Jester King Brewery Farm",type:"Farm",city:"Dripping Springs",region:"Central Texas",lat:30.2345,lng:-98.0284,address:"13187 Fitzhugh Rd, Austin, TX 78736",schedule:"Fri–Sun 12PM–8PM",season:"Year-round",products:["Vegetables","Herbs","Meat"],phone:"(512) 537-5100",website:"jesterkingbrewery.com",accepts:["Credit Card"],description:"Working farmstead brewery and on-site kitchen.",rating:4.5},
  {id:32,name:"Waco Downtown Market",type:"Farmers Market",city:"Waco",region:"Central Texas",lat:31.5493,lng:-97.1467,address:"500 Washington Ave, Waco, TX 76701",schedule:"Saturdays 9AM–1PM",season:"Year-round",products:["Vegetables","Fruits","Eggs","Meat","Baked Goods","Honey"],phone:"(254) 750-5798",website:"wacofarmersmarket.com",accepts:["Cash","Credit Card","SNAP/EBT"],description:"Local farmers and food entrepreneurs in downtown Waco.",rating:4.3},
  {id:33,name:"Georgetown Farmers Market",type:"Farmers Market",city:"Georgetown",region:"Central Texas",lat:30.6327,lng:-97.6780,address:"San Gabriel Park, Georgetown, TX",schedule:"Thursdays 3:30–6:30PM",season:"Apr–Nov",products:["Vegetables","Fruits","Eggs","Herbs","Honey","Baked Goods"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"River-side market in the historic district.",rating:4.2},
  {id:34,name:"Round Rock Farmers Market",type:"Farmers Market",city:"Round Rock",region:"Central Texas",lat:30.5083,lng:-97.6789,address:"221 E Main St, Round Rock, TX 78664",schedule:"Saturdays 8AM–12PM",season:"Year-round",products:["Vegetables","Fruits","Meat","Eggs","Baked Goods","Flowers"],phone:"",website:"",accepts:["Cash","Credit Card","SNAP/EBT"],description:"30+ local vendors every Saturday.",rating:4.4},
  {id:35,name:"Mueller Farmers Market",type:"Farmers Market",city:"Austin",region:"Central Texas",lat:30.2999,lng:-97.7041,address:"4550 Mueller Blvd, Austin, TX 78723",schedule:"Sundays 10AM–2PM",season:"Year-round",products:["Vegetables","Fruits","Meat","Eggs","Baked Goods"],phone:"",website:"",accepts:["Cash","Credit Card","SNAP/EBT"],description:"Sunday market in Austin's Mueller neighborhood.",rating:4.5},
  {id:36,name:"Texas Farmers Market at Lakeline",type:"Farmers Market",city:"Cedar Park",region:"Central Texas",lat:30.5058,lng:-97.8203,address:"11200 Lakeline Mall Dr, Austin, TX 78717",schedule:"Saturdays 9AM–1PM",season:"Year-round",products:["Vegetables","Fruits","Meat","Cheese","Baked Goods"],phone:"",website:"",accepts:["Cash","Credit Card","SNAP/EBT"],description:"Family-friendly market in north Austin.",rating:4.5},
  {id:37,name:"Johnson's Backyard Garden",type:"Farm",city:"Austin",region:"Central Texas",lat:30.2010,lng:-97.6360,address:"9515 Hergotz Ln, Austin, TX 78742",schedule:"Mon-Fri (CSA pickup)",season:"Year-round",products:["Vegetables","Herbs","Microgreens"],phone:"(512) 386-5273",website:"jbgorganic.com",accepts:["Credit Card"],description:"Largest organic CSA in Texas — fresh boxes weekly.",rating:4.6},
  {id:38,name:"Temple Farmers Market",type:"Farmers Market",city:"Temple",region:"Central Texas",lat:31.0982,lng:-97.3428,address:"2 S Main St, Temple, TX 76501",schedule:"Tuesdays 3PM–6PM",season:"Apr–Oct",products:["Vegetables","Fruits","Eggs","Honey","Baked Goods"],phone:"",website:"",accepts:["Cash"],description:"Bell County growers in downtown Temple.",rating:4.0},
  {id:39,name:"Pearl Farmers Market",type:"Farmers Market",city:"San Antonio",region:"South Texas",lat:29.4428,lng:-98.4805,address:"312 Pearl Pkwy, San Antonio, TX 78215",schedule:"Sat & Sun 9AM–1PM",season:"Year-round",products:["Vegetables","Fruits","Meat","Cheese","Baked Goods","Honey","Flowers"],phone:"(210) 212-7260",website:"atpearl.com",accepts:["Cash","Credit Card","SNAP/EBT"],description:"Pearl Brewery — 35+ vendors and chef demonstrations.",rating:4.8},
  {id:40,name:"Granadilla Fresh Farm",type:"Farm",city:"Elmendorf",region:"South Texas",lat:29.2571,lng:-98.3294,address:"12925 FM 327, Elmendorf, TX 78112",schedule:"Saturdays 8AM–12PM",season:"Year-round",products:["Vegetables","Herbs","Eggs","Honey"],phone:"(210) 870-3312",website:"",accepts:["Cash"],description:"Small family farm with seasonal vegetables.",rating:4.1},
  {id:41,name:"The Quarry Farmers Market",type:"Farmers Market",city:"San Antonio",region:"South Texas",lat:29.4638,lng:-98.4732,address:"7550 Barlite Blvd, San Antonio, TX",schedule:"Saturdays 9AM–1PM",season:"Year-round",products:["Vegetables","Fruits","Eggs","Baked Goods","Meat"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Quarry-area market with local growers and artisans.",rating:4.2},
  {id:42,name:"Boerne Market Days",type:"Farmers Market",city:"Boerne",region:"South Texas",lat:29.7947,lng:-98.7320,address:"Main Plaza, Boerne, TX 78006",schedule:"2nd Sat of month",season:"Year-round",products:["Vegetables","Fruits","Honey","Baked Goods","Herbs","Flowers"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Monthly market plus Hill Country artisans.",rating:4.5},
  {id:43,name:"Yard Bar Farmers Market",type:"Farmers Market",city:"San Antonio",region:"South Texas",lat:29.5350,lng:-98.4810,address:"15614 Huebner Rd, San Antonio, TX",schedule:"Sundays 11AM–3PM",season:"Year-round",products:["Vegetables","Fruits","Eggs","Cheese","Honey"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Sunday market with food trucks and live music.",rating:4.3},
  {id:44,name:"New Life Farms",type:"Farm",city:"Lytle",region:"South Texas",lat:29.2333,lng:-98.7958,address:"Lytle, TX 78052",schedule:"Saturdays 8AM–12PM",season:"Mar–Nov",products:["Vegetables","Eggs","Goat","Dairy"],phone:"",website:"",accepts:["Cash"],description:"Goat dairy and pasture-raised farm products.",rating:4.4},
  {id:45,name:"Fredericksburg Market",type:"Farmers Market",city:"Fredericksburg",region:"Hill Country",lat:30.2752,lng:-98.872,address:"100 W Main St, Fredericksburg, TX 78624",schedule:"Thursdays 4–7PM",season:"Apr–Nov",products:["Vegetables","Fruits","Peaches","Honey","Lavender","Baked Goods","Wine"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Peaches, lavender, and German-Texan baked goods.",rating:4.6},
  {id:46,name:"Jenschke Orchards",type:"Farm",city:"Fredericksburg",region:"Hill Country",lat:30.2841,lng:-98.8145,address:"8372 US-290 E, Fredericksburg, TX",schedule:"Daily 9AM–5:30PM",season:"May–Aug",products:["Peaches","Fruits","Vegetables","Jams"],phone:"(830) 997-6153",website:"jenschkeorchards.com",accepts:["Cash","Credit Card"],description:"Fourth-generation peach orchard since 1929.",rating:4.7},
  {id:47,name:"New Braunfels Market",type:"Farmers Market",city:"New Braunfels",region:"Hill Country",lat:29.7030,lng:-98.1245,address:"186 S Castell Ave, New Braunfels, TX",schedule:"Saturdays 9AM–1PM",season:"Year-round",products:["Vegetables","Fruits","Meat","Eggs","Honey","Baked Goods"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Hill Country farm-fresh goods and artisan foods.",rating:4.3},
  {id:48,name:"Wimberley Market Days",type:"Farmers Market",city:"Wimberley",region:"Hill Country",lat:29.9974,lng:-98.0986,address:"Lions Field, Wimberley, TX 78676",schedule:"1st Sat of month",season:"Mar–Dec",products:["Vegetables","Fruits","Herbs","Honey","Baked Goods","Flowers"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Legendary monthly market with thousands of visitors.",rating:4.5},
  {id:49,name:"Kerrville Farmers Market",type:"Farmers Market",city:"Kerrville",region:"Hill Country",lat:30.0474,lng:-99.1404,address:"501 Water St, Kerrville, TX 78028",schedule:"Saturdays 8:30AM–12PM",season:"Year-round",products:["Vegetables","Fruits","Meat","Eggs","Honey","Herbs"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Riverside market — ranchers, growers, beekeepers.",rating:4.2},
  {id:50,name:"Becker Vineyards",type:"Farm",city:"Stonewall",region:"Hill Country",lat:30.2358,lng:-98.6708,address:"464 Becker Farms Rd, Stonewall, TX",schedule:"Daily 10AM–6PM",season:"Year-round",products:["Wine","Lavender","Fruits"],phone:"(830) 644-2681",website:"beckervineyards.com",accepts:["Credit Card"],description:"Texas wine country with lavender fields.",rating:4.6},
  {id:51,name:"Vogel Orchard",type:"Farm",city:"Stonewall",region:"Hill Country",lat:30.2367,lng:-98.6586,address:"12862 US-290, Stonewall, TX 78671",schedule:"Daily 9AM–6PM",season:"May–Aug",products:["Peaches","Fruits","Jams"],phone:"(830) 644-2404",website:"",accepts:["Cash","Credit Card"],description:"Famous Hill Country peach grower on Highway 290.",rating:4.7},
  {id:52,name:"Hye Market",type:"Farm Stand",city:"Hye",region:"Hill Country",lat:30.2489,lng:-98.5631,address:"10261 W US Hwy 290, Hye, TX 78635",schedule:"Daily 10AM–6PM",season:"Year-round",products:["Vegetables","Fruits","Cheese","Wine"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Quaint country store on the Hill Country wine trail.",rating:4.4},
  {id:53,name:"Bandera Saturday Market",type:"Farmers Market",city:"Bandera",region:"Hill Country",lat:29.7269,lng:-99.0739,address:"Main St, Bandera, TX 78003",schedule:"Saturdays 9AM–1PM",season:"Apr–Oct",products:["Vegetables","Fruits","Eggs","Honey"],phone:"",website:"",accepts:["Cash"],description:"Cowboy capital with weekly farmers market.",rating:4.1},
  {id:54,name:"Tyler Rose Garden Market",type:"Farmers Market",city:"Tyler",region:"East Texas",lat:32.3471,lng:-95.2895,address:"1900 W Front St, Tyler, TX 75702",schedule:"Saturdays 7AM–12PM",season:"Apr–Nov",products:["Vegetables","Fruits","Eggs","Honey","Flowers","Baked Goods"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Pine country farms near the famous rose gardens.",rating:4.2},
  {id:55,name:"Nacogdoches Farmers Market",type:"Farmers Market",city:"Nacogdoches",region:"East Texas",lat:31.6035,lng:-94.6556,address:"100 S Pecan St, Nacogdoches, TX",schedule:"Saturdays 8AM–12PM",season:"May–Oct",products:["Vegetables","Fruits","Eggs","Baked Goods","Herbs","Pecans"],phone:"",website:"",accepts:["Cash"],description:"Oldest town in Texas with deep farming traditions.",rating:4.0},
  {id:56,name:"Lufkin Farmers Market",type:"Farmers Market",city:"Lufkin",region:"East Texas",lat:31.3382,lng:-94.7291,address:"100 N First St, Lufkin, TX 75901",schedule:"Tue & Sat 7AM–12PM",season:"May–Oct",products:["Vegetables","Fruits","Eggs","Honey","Baked Goods","Pecans"],phone:"",website:"",accepts:["Cash"],description:"Piney Woods market with heirloom tomatoes and pecans.",rating:3.9},
  {id:57,name:"Texarkana Farmers Market",type:"Farmers Market",city:"Texarkana",region:"East Texas",lat:33.4251,lng:-94.0477,address:"305 W Front St, Texarkana, TX",schedule:"Saturdays 7AM–11AM",season:"May–Sep",products:["Vegetables","Fruits","Eggs","Honey"],phone:"",website:"",accepts:["Cash"],description:"Border city market with regional growers.",rating:4.0},
  {id:58,name:"Marshall Farmers Market",type:"Farmers Market",city:"Marshall",region:"East Texas",lat:32.5448,lng:-94.3674,address:"Downtown Square, Marshall, TX",schedule:"Saturdays 8AM–12PM",season:"May–Oct",products:["Vegetables","Fruits","Eggs","Honey","Baked Goods"],phone:"",website:"",accepts:["Cash"],description:"Historic East Texas square market.",rating:3.9},
  {id:59,name:"Athens Farmers Market",type:"Farmers Market",city:"Athens",region:"East Texas",lat:32.2046,lng:-95.8552,address:"100 N Palestine St, Athens, TX",schedule:"Saturdays 8AM–12PM",season:"Apr–Oct",products:["Vegetables","Fruits","Eggs","Honey"],phone:"",website:"",accepts:["Cash"],description:"Black-eyed pea capital of the world.",rating:4.0},
  {id:60,name:"El Paso Downtown Market",type:"Farmers Market",city:"El Paso",region:"West Texas",lat:31.7594,lng:-106.487,address:"Downtown Arts District, El Paso, TX",schedule:"Saturdays 9AM–1PM",season:"Year-round",products:["Vegetables","Fruits","Chile Peppers","Honey","Baked Goods"],phone:"(915) 351-4188",website:"",accepts:["Cash","Credit Card","SNAP/EBT"],description:"Hatch green chiles and desert produce.",rating:4.3},
  {id:61,name:"Midland Farmers Market",type:"Farmers Market",city:"Midland",region:"West Texas",lat:31.9973,lng:-102.0779,address:"4610 N Garfield St, Midland, TX",schedule:"Saturdays 8AM–12PM",season:"Jun–Oct",products:["Vegetables","Fruits","Eggs","Honey","Meat"],phone:"",website:"",accepts:["Cash"],description:"Permian Basin produce in West Texas oil country.",rating:3.8},
  {id:62,name:"Odessa Downtown Market",type:"Farmers Market",city:"Odessa",region:"West Texas",lat:31.8457,lng:-102.3676,address:"Downtown, Odessa, TX",schedule:"Saturdays 8AM–12PM",season:"May–Oct",products:["Vegetables","Fruits","Eggs","Honey"],phone:"",website:"",accepts:["Cash"],description:"West Texas community market.",rating:3.8},
  {id:63,name:"Alpine Farmers Market",type:"Farmers Market",city:"Alpine",region:"West Texas",lat:30.3585,lng:-103.6612,address:"Downtown, Alpine, TX 79830",schedule:"Saturdays 9AM–12PM",season:"May–Sep",products:["Vegetables","Fruits","Honey","Baked Goods"],phone:"",website:"",accepts:["Cash"],description:"High desert market in the Big Bend region.",rating:4.1},
  {id:64,name:"Marfa Farm Stand",type:"Farm Stand",city:"Marfa",region:"West Texas",lat:30.3093,lng:-104.0203,address:"Marfa, TX 79843",schedule:"Saturdays 10AM–2PM",season:"Apr–Oct",products:["Vegetables","Herbs","Eggs"],phone:"",website:"",accepts:["Cash"],description:"Artsy desert town with small-batch produce.",rating:4.2},
  {id:65,name:"Edinburg Farmers Market",type:"Farmers Market",city:"Edinburg",region:"Rio Grande Valley",lat:26.3017,lng:-98.1633,address:"602 W University Dr, Edinburg, TX",schedule:"Saturdays 8AM–12PM",season:"Oct–May",products:["Vegetables","Fruits","Citrus","Herbs","Honey"],phone:"(956) 383-5661",website:"",accepts:["Cash","SNAP/EBT"],description:"Valley citrus and winter vegetables.",rating:4.1},
  {id:66,name:"McAllen Farmers Market",type:"Farmers Market",city:"McAllen",region:"Rio Grande Valley",lat:26.2034,lng:-98.2300,address:"Archer Park, McAllen, TX 78501",schedule:"Saturdays 9AM–1PM",season:"Oct–Jun",products:["Vegetables","Fruits","Citrus","Honey","Herbs"],phone:"",website:"",accepts:["Cash","SNAP/EBT"],description:"Citrus, peppers, and tropical fruits.",rating:4.0},
  {id:67,name:"Brownsville Farmers Market",type:"Farmers Market",city:"Brownsville",region:"Rio Grande Valley",lat:25.9017,lng:-97.4975,address:"Linear Park, Brownsville, TX",schedule:"Saturdays 8AM–12PM",season:"Oct–May",products:["Vegetables","Fruits","Citrus","Herbs","Honey"],phone:"",website:"",accepts:["Cash","SNAP/EBT"],description:"Southernmost market with subtropical produce.",rating:3.9},
  {id:68,name:"Harlingen Farmers Market",type:"Farmers Market",city:"Harlingen",region:"Rio Grande Valley",lat:26.1906,lng:-97.6961,address:"Jackson St, Harlingen, TX",schedule:"Saturdays 8AM–12PM",season:"Oct–May",products:["Vegetables","Fruits","Citrus","Honey"],phone:"",website:"",accepts:["Cash","SNAP/EBT"],description:"Valley market with seasonal citrus.",rating:4.0},
  {id:69,name:"Yturria Land & Cattle",type:"Farm",city:"Raymondville",region:"Rio Grande Valley",lat:26.4756,lng:-97.7805,address:"Raymondville, TX 78580",schedule:"By appointment",season:"Year-round",products:["Meat","Citrus","Watermelon"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Historic ranch with grass-fed beef and citrus.",rating:4.3},
  {id:70,name:"Lubbock Downtown Market",type:"Farmers Market",city:"Lubbock",region:"Panhandle",lat:33.5779,lng:-101.8552,address:"Depot District, Lubbock, TX 79401",schedule:"Saturdays 9AM–12PM",season:"Jun–Oct",products:["Vegetables","Fruits","Meat","Eggs","Honey","Watermelon"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Panhandle farms and ranches in the Depot District.",rating:4.1},
  {id:71,name:"Amarillo Community Market",type:"Farmers Market",city:"Amarillo",region:"Panhandle",lat:35.222,lng:-101.8313,address:"1000 S Polk St, Amarillo, TX 79101",schedule:"Saturdays 8AM–12:30PM",season:"Jun–Oct",products:["Vegetables","Fruits","Meat","Eggs","Honey","Baked Goods"],phone:"",website:"",accepts:["Cash","Credit Card","SNAP/EBT"],description:"High Plains ranchers and regional produce.",rating:4.1},
  {id:72,name:"Canyon Farmers Market",type:"Farmers Market",city:"Canyon",region:"Panhandle",lat:34.9803,lng:-101.9188,address:"Courthouse Square, Canyon, TX",schedule:"Saturdays 8AM–12PM",season:"Jun–Sep",products:["Vegetables","Fruits","Eggs","Honey"],phone:"",website:"",accepts:["Cash"],description:"Small-town Panhandle market near Palo Duro Canyon.",rating:4.0},
  {id:73,name:"Plainview Farmers Market",type:"Farmers Market",city:"Plainview",region:"Panhandle",lat:34.1848,lng:-101.7068,address:"Broadway St, Plainview, TX",schedule:"Saturdays 8AM–12PM",season:"Jun–Oct",products:["Vegetables","Fruits","Meat","Eggs"],phone:"",website:"",accepts:["Cash"],description:"Cotton country produce market.",rating:3.9},
  {id:74,name:"Corpus Christi Market",type:"Farmers Market",city:"Corpus Christi",region:"Coastal Bend",lat:27.7998,lng:-97.3964,address:"100 N Shoreline Blvd, Corpus Christi, TX",schedule:"Wednesdays 5–8PM",season:"Year-round",products:["Vegetables","Fruits","Seafood","Baked Goods","Honey"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Farm produce meets Gulf seafood.",rating:4.2},
  {id:75,name:"Rockport Farmers Market",type:"Farmers Market",city:"Rockport",region:"Coastal Bend",lat:28.0206,lng:-97.0544,address:"Rockport Harbor, Rockport, TX",schedule:"Saturdays 9AM–1PM",season:"Nov–Apr",products:["Vegetables","Fruits","Seafood","Honey","Herbs"],phone:"",website:"",accepts:["Cash"],description:"Quaint harbor-side market in the art colony.",rating:4.0},
  {id:76,name:"Port Aransas Farmers Market",type:"Farmers Market",city:"Port Aransas",region:"Coastal Bend",lat:27.8336,lng:-97.0611,address:"Port Aransas, TX 78373",schedule:"Wednesdays 9AM–1PM",season:"Oct–Apr",products:["Vegetables","Fruits","Seafood","Baked Goods"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Beach-town market with fresh Gulf catches.",rating:4.1},
  {id:77,name:"Kingsville Farmers Market",type:"Farmers Market",city:"Kingsville",region:"Coastal Bend",lat:27.5158,lng:-97.8561,address:"Downtown, Kingsville, TX",schedule:"Saturdays 8AM–12PM",season:"Year-round",products:["Vegetables","Fruits","Eggs","Meat"],phone:"",website:"",accepts:["Cash"],description:"King Ranch country market.",rating:4.0},
  {id:78,name:"Victoria Farmers Market",type:"Farmers Market",city:"Victoria",region:"Coastal Bend",lat:28.8053,lng:-97.0036,address:"Memorial Square, Victoria, TX",schedule:"Saturdays 8AM–12PM",season:"Apr–Oct",products:["Vegetables","Fruits","Eggs","Honey","Baked Goods"],phone:"",website:"",accepts:["Cash","Credit Card"],description:"Coastal plains regional market.",rating:4.0},
  {id:79,name:"Lavaca Bay Farms",type:"Farm",city:"Port Lavaca",region:"Coastal Bend",lat:28.6147,lng:-96.6261,address:"Port Lavaca, TX 77979",schedule:"Saturdays 9AM–1PM",season:"Mar–Oct",products:["Vegetables","Seafood","Eggs"],phone:"",website:"",accepts:["Cash"],description:"Bay-side farm with shrimp and produce.",rating:4.2},
  {id:80,name:"Bee County Farms",type:"Farm",city:"Beeville",region:"Coastal Bend",lat:28.4011,lng:-97.7475,address:"Beeville, TX 78102",schedule:"Saturdays 8AM–12PM",season:"Year-round",products:["Vegetables","Honey","Eggs"],phone:"",website:"",accepts:["Cash"],description:"Bee County honey and seasonal produce.",rating:4.0},
];

const REGIONS=["All Regions","Gulf Coast","North Texas","Central Texas","South Texas","Hill Country","East Texas","West Texas","Panhandle","Rio Grande Valley","Coastal Bend"];
const TYPES=["All Types","Farmers Market","Farm","Farm Stand"];
const PRODUCTS=["Vegetables","Fruits","Meat","Eggs","Cheese","Honey","Baked Goods","Herbs","Flowers","Seafood","Peaches","Citrus","Wine","Pecans"];
const hav=(a,b,c,e)=>{const R=3959,x=(c-a)*Math.PI/180,y=(e-b)*Math.PI/180;const s=Math.sin(x/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(y/2)**2;return R*2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s));};

const Stars=({r,s})=>(<div style={{display:"flex",alignItems:"center",gap:1}}>{[0,1,2,3,4].map(i=><span key={i} style={{fontSize:s?11:13,opacity:i<Math.floor(r)?1:i<r?.6:.25}}>⭐</span>)}<span style={{fontSize:s?10:11,color:"#8a7a5a",marginLeft:3,fontWeight:700}}>{r}</span></div>);
const Chip=({name})=>(<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:20,background:"#fefcf7",border:"1.5px solid #e8dcc8",fontSize:11,fontWeight:600,color:"#5a4a30",whiteSpace:"nowrap"}}><span style={{fontSize:14}}>{ic(name)}</span>{name}</span>);

// ════════════════════════════════════
// LANDING PAGE — cinematic video hero
// ════════════════════════════════════
const Landing = ({ onEnter }) => {
  const [videoReady, setVideoReady] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTextVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      width: "100%", height: "100vh", position: "relative",
      overflow: "hidden", background: "#1a1410",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>

      {/* Image background — Pexels farmers market photo */}
      <img
        src="https://images.pexels.com/photos/8540180/pexels-photo-8540180.jpeg?auto=compress&cs=tinysrgb&w=1600"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />

      {/* Subtle warm tint fallback */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, #2d3a1e 0%, #4a5a35 40%, #6b7c4a 100%)",
        zIndex: -1,
      }}/>

      {/* Dark overlay for text legibility */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(20,15,10,0.4) 0%, rgba(20,15,10,0.5) 50%, rgba(20,15,10,0.75) 100%)",
        zIndex: 2,
      }}/>

      {/* Subtle grain texture */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
        opacity: 0.06,
      }}/>

      {/* Top nav */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center",
        opacity: textVisible ? 1 : 0,
        transition: "opacity 1.2s ease 0.3s",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Logo size={44}/>
          <span style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:600,color:"#fefcf7",letterSpacing:"-0.3px"}}>Lone Star Farms</span>
        </div>
        <div style={{display:"flex",gap:32,fontFamily:"'Inter',sans-serif",fontSize:13,color:"rgba(254,252,247,0.85)",fontWeight:500,letterSpacing:"0.5px"}}>
          <span style={{cursor:"pointer"}}>About</span>
          <span style={{cursor:"pointer"}}>Farms</span>
          <span style={{cursor:"pointer"}}>List Yours</span>
          <span style={{cursor:"pointer"}}>Contact</span>
        </div>
      </div>

      {/* Hero content centered */}
      <div style={{
        position: "relative", zIndex: 10,
        height: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "0 24px",
        textAlign: "center",
      }}>
        {/* Tag line */}
        <div style={{
          fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#d4c4a8",
          letterSpacing: "4px", textTransform: "uppercase", marginBottom: 20,
          fontWeight: 500,
          opacity: textVisible ? 1 : 0,
          transform: textVisible ? "translateY(0)" : "translateY(10px)",
          transition: "all 1s ease",
        }}>
          ✦ Farm-to-Table, Texas-Style ✦
        </div>

        {/* Main heading */}
        <h1 style={{
          fontFamily: "'Fraunces',Georgia,serif",
          fontSize: "clamp(48px, 8vw, 96px)",
          fontWeight: 400,
          color: "#fefcf7",
          margin: "0 0 16px",
          lineHeight: 1.05,
          letterSpacing: "-2px",
          maxWidth: 1000,
          opacity: textVisible ? 1 : 0,
          transform: textVisible ? "translateY(0)" : "translateY(30px)",
          transition: "all 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.2s",
        }}>
          Discover Texas's<br/>
          <em style={{fontFamily:"'Fraunces',serif",fontStyle:"italic",fontWeight:300,color:"#e8dcc8"}}>finest harvest</em>
        </h1>

        {/* Subheading */}
        <p style={{
          fontFamily: "'Inter',sans-serif",
          fontSize: "clamp(15px, 1.3vw, 18px)",
          color: "rgba(254,252,247,0.85)",
          maxWidth: 580, margin: "0 0 48px",
          lineHeight: 1.7, fontWeight: 300,
          opacity: textVisible ? 1 : 0,
          transform: textVisible ? "translateY(0)" : "translateY(20px)",
          transition: "all 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.4s",
        }}>
          From Hill Country peaches to Gulf Coast greens — connect with the farmers and markets growing fresh, real food across the Lone Star State.
        </p>

        {/* CTA Button */}
        <button
          onClick={onEnter}
          style={{
            background: "#fefcf7",
            color: "#1a1410",
            border: "none",
            borderRadius: 100,
            padding: "18px 44px",
            fontSize: 15,
            fontWeight: 600,
            fontFamily: "'Inter',sans-serif",
            letterSpacing: "0.5px",
            cursor: "pointer",
            outline: "none",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            opacity: textVisible ? 1 : 0,
            transform: textVisible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
            transition: "all 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.6s, transform 0.2s ease",
          }}
          onMouseEnter={(e)=>{e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow="0 14px 50px rgba(0,0,0,0.4)"}}
          onMouseLeave={(e)=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 10px 40px rgba(0,0,0,0.3)"}}
        >
          Explore the Map
          <span style={{display:"inline-block",fontSize:18,marginTop:-1}}>→</span>
        </button>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: "clamp(32px, 6vw, 80px)",
          marginTop: 80, color: "rgba(254,252,247,0.9)",
          opacity: textVisible ? 1 : 0,
          transform: textVisible ? "translateY(0)" : "translateY(20px)",
          transition: "all 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.8s",
        }}>
          {[
            {n:"80+",l:"Local Farms"},
            {n:"10",l:"Texas Regions"},
            {n:"100%",l:"Farm Direct"},
          ].map((s,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:"clamp(28px, 3vw, 36px)",fontWeight:500,color:"#fefcf7",lineHeight:1}}>{s.n}</div>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,letterSpacing:"2px",textTransform:"uppercase",color:"rgba(254,252,247,0.6)",marginTop:6,fontWeight:500}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: 30, left: "50%",
        transform: "translateX(-50%)", zIndex: 10,
        color: "rgba(254,252,247,0.5)",
        fontFamily: "'Inter',sans-serif", fontSize: 10,
        letterSpacing: "3px", textTransform: "uppercase",
        textAlign: "center", fontWeight: 500,
        opacity: textVisible ? 1 : 0,
        transition: "opacity 1.4s ease 1.2s",
      }}>
        <div>Browse Farms</div>
        <div style={{
          marginTop: 8, width: 1, height: 30, background: "rgba(254,252,247,0.3)",
          margin: "8px auto 0",
        }}/>
      </div>
    </div>
  );
};

// ════════════════════════════════════
// TEXAS MAP
// ════════════════════════════════════
const TexasMapD3 = ({ farms, selected, onSelect, filteredIds }) => {
  const [dims, setDims] = useState({ w: 380, h: 340 });
  const [tooltip, setTooltip] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setDims({ w: width, h: height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const texasGeo = useMemo(() => ({
    type: "Feature", geometry: { type: "Polygon", coordinates: [[
      [-106.65,31.87],[-106.51,31.75],[-106.31,31.62],[-106.21,31.47],[-105.77,31.17],[-105.55,30.99],
      [-105.4,30.85],[-105.0,30.64],[-104.85,30.39],[-104.69,30.12],[-104.57,29.88],[-104.53,29.67],
      [-104.4,29.56],[-104.21,29.48],[-104.08,29.33],[-103.8,29.27],[-103.55,29.16],[-103.29,29.0],
      [-103.1,28.97],[-102.87,29.21],[-102.7,29.39],[-102.51,29.75],[-102.38,29.76],[-102.15,29.79],
      [-101.76,29.78],[-101.4,29.77],[-101.04,29.64],[-100.7,29.1],[-100.3,28.66],[-100.0,28.15],
      [-99.7,27.73],[-99.48,27.48],[-99.3,27.2],[-99.1,26.87],[-99.0,26.68],[-98.82,26.44],
      [-98.6,26.24],[-98.38,26.15],[-98.17,26.06],[-97.86,26.06],[-97.54,25.96],[-97.38,25.84],
      [-97.17,25.96],[-97.02,26.06],[-97.02,26.37],[-96.98,26.63],[-97.03,27.0],[-97.17,27.42],
      [-97.17,27.83],[-96.85,28.12],[-96.56,28.31],[-96.29,28.46],[-96.02,28.59],[-95.77,28.73],
      [-95.36,28.86],[-95.02,29.07],[-94.81,29.26],[-94.69,29.35],[-94.48,29.36],[-94.33,29.43],
      [-94.1,29.48],[-93.94,29.57],[-93.84,29.69],[-93.82,29.86],[-93.73,29.94],[-93.72,30.05],
      [-93.69,30.11],[-93.68,30.24],[-93.73,30.38],[-93.76,30.55],[-93.71,30.74],[-93.66,30.88],
      [-93.61,31.08],[-93.53,31.18],[-93.53,31.36],[-93.6,31.49],[-93.68,31.56],[-93.67,31.73],
      [-93.69,31.87],[-93.72,32.0],[-93.79,32.12],[-93.82,32.25],[-93.85,32.38],[-93.84,32.5],
      [-94.04,33.01],[-94.04,33.27],[-94.08,33.57],[-94.18,33.59],[-94.38,33.57],[-94.48,33.64],
      [-94.65,33.69],[-94.82,33.74],[-94.97,33.83],[-95.15,33.94],[-95.29,33.88],[-95.56,33.93],
      [-95.84,33.86],[-96.31,33.77],[-96.59,33.84],[-96.83,33.87],[-97.08,33.74],[-97.22,33.9],
      [-97.46,33.86],[-97.69,33.99],[-97.86,33.86],[-98.08,34.0],[-98.29,34.13],[-98.47,34.08],
      [-98.77,34.14],[-99.06,34.2],[-99.27,34.37],[-99.39,34.57],[-99.69,34.57],[-99.99,34.56],
      [-100.0,36.5],[-103.04,36.5],[-103.04,32.0],[-106.62,32.0],[-106.65,31.87]
    ]]}
  }), []);

  const projection = useMemo(() => d3.geoAlbers().center([0, 31.2]).rotate([99.5, 0]).parallels([27, 35]).translate([dims.w/2, dims.h/2]).scale(Math.min(dims.w, dims.h) * 3.8), [dims]);
  const pathGen = useMemo(() => d3.geoPath().projection(projection), [projection]);

  return (
    <div ref={containerRef} style={{ width:"100%", height:"100%", position:"relative", background:"linear-gradient(180deg, #f0eadf 0%, #e8e0d0 40%)" }}>
      <svg width={dims.w} height={dims.h} style={{display:"block"}}>
        <rect width={dims.w} height={dims.h} fill="#f0eadf"/>
        <path d={pathGen(texasGeo)} fill="#fefcf7" stroke="#c4b89a" strokeWidth="1.2"/>
        <defs><pattern id="mg" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30,0 L0,0 0,30" fill="none" stroke="#d4c4a8" strokeWidth="0.3" opacity="0.4"/></pattern></defs>
        <path d={pathGen(texasGeo)} fill="url(#mg)"/>
        {farms.map(f => {
          const [x, y] = projection([f.lng, f.lat]) || [0, 0];
          const vis = filteredIds.has(f.id);
          const sel2 = selected?.id === f.id;
          const tc = TS[f.type] || {};
          if (x < 0 || x > dims.w || y < 0 || y > dims.h) return null;
          return (
            <g key={f.id} style={{cursor:"pointer", opacity: vis ? 1 : 0.12}}
              onClick={() => onSelect(f)}
              onMouseEnter={() => setTooltip({...f, x, y})}
              onMouseLeave={() => setTooltip(null)}>
              <ellipse cx={x} cy={y+2} rx={sel2?5:2.5} ry={sel2?2:1.2} fill="rgba(0,0,0,0.18)"/>
              <path d={`M${x},${y} C${x-(sel2?7:4)},${y-(sel2?10:7)} ${x-(sel2?7:4)},${y-(sel2?17:12)} ${x},${y-(sel2?20:13)} C${x+(sel2?7:4)},${y-(sel2?17:12)} ${x+(sel2?7:4)},${y-(sel2?10:7)} ${x},${y}Z`}
                fill={sel2?"#c0392b":tc.c} stroke="#fff" strokeWidth={sel2?2:1.2}/>
              <circle cx={x} cy={y-(sel2?13:9)} r={sel2?3:2} fill="#fff" opacity="0.9"/>
              {sel2 && <circle cx={x} cy={y-13} r="8" fill="none" stroke="#c0392b" strokeWidth="1.5" opacity="0.4">
                <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite"/>
              </circle>}
            </g>
          );
        })}
      </svg>
      {tooltip && (
        <div style={{position:"absolute", left:tooltip.x, top:tooltip.y-44, transform:"translateX(-50%)", background:"#1a1410", color:"#fefcf7", padding:"6px 12px", borderRadius:6, fontSize:11, fontWeight:500, whiteSpace:"nowrap", zIndex:30, pointerEvents:"none", boxShadow:"0 4px 16px rgba(0,0,0,0.2)", fontFamily:"'Inter',sans-serif"}}>
          {TS[tooltip.type]?.emoji} {tooltip.name}
          <div style={{fontSize:9, color:"#b8a88a", marginTop:1}}>{tooltip.city}, TX</div>
          <div style={{position:"absolute", bottom:-5, left:"50%", transform:"translateX(-50%)", width:0, height:0, borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderTop:"5px solid #1a1410"}}/>
        </div>
      )}
      <div style={{position:"absolute", bottom:10, left:10, background:"rgba(254,252,247,0.95)", padding:"8px 12px", borderRadius:6, border:"1px solid #d4c4a8", fontSize:10, color:"#5a4a2f", zIndex:10, fontFamily:"'Inter',sans-serif", fontWeight:500}}>
        {Object.entries(TS).map(([t, s]) => (
          <div key={t} style={{display:"flex", alignItems:"center", gap:6, marginBottom:t!=="Farm Stand"?3:0}}>
            <div style={{width:8, height:8, borderRadius:"50%", background:s.c}}/>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
};

const DD=({value:v,options:o,onChange})=>{const[open,setOpen]=useState(false);const ref=useRef(null);useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);const a=v!==o[0];return(
  <div ref={ref} style={{position:"relative"}}><button onClick={()=>setOpen(!open)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 13px",borderRadius:100,background:a?"#1a1410":"#fefcf7",color:a?"#fefcf7":"#1a1410",border:a?"1.5px solid #1a1410":"1.5px solid #d4c4a8",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:600,whiteSpace:"nowrap",outline:"none",letterSpacing:"0.2px"}}>{v}<span style={{fontSize:8,opacity:0.6}}>▼</span></button>
    {open&&<div style={{position:"absolute",top:"calc(100% + 4px)",left:0,zIndex:1000,background:"#fefcf7",border:"1px solid #d4c4a8",borderRadius:10,boxShadow:"0 12px 32px rgba(0,0,0,0.08)",overflow:"hidden",minWidth:160,maxHeight:240,overflowY:"auto"}}>{o.map(x=><button key={x} onClick={()=>{onChange(x);setOpen(false)}} style={{display:"block",width:"100%",padding:"9px 14px",border:"none",background:x===v?"#f5ecd6":"transparent",color:"#1a1410",cursor:"pointer",textAlign:"left",fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:x===v?600:400,borderBottom:"1px solid #f5efe3",outline:"none"}}>{x}</button>)}</div>}</div>);};

// ════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════
function Dashboard({ onBack }) {
  const[search,setSearch]=useState("");const[region,setRegion]=useState("All Regions");const[type,setType]=useState("All Types");const[sp,setSp]=useState([]);const[sel,setSel]=useState(null);const[favs,setFavs]=useState(new Set());const[sf,setSf]=useState(false);const[ul,setUl]=useState(null);const[sort,setSort]=useState("name");const[loc,setLoc]=useState(false);

  const tp=p=>setSp(v=>v.includes(p)?v.filter(x=>x!==p):[...v,p]);
  const tf=id=>setFavs(v=>{const n=new Set(v);n.has(id)?n.delete(id):n.add(id);return n;});
  const fm=useCallback(()=>{if(!navigator.geolocation)return;setLoc(true);navigator.geolocation.getCurrentPosition(p=>{setUl({lat:p.coords.latitude,lng:p.coords.longitude});setLoc(false);setSort("distance");},()=>setLoc(false),{enableHighAccuracy:true,timeout:10000});},[]);

  const filtered=useMemo(()=>{let r=FARMS.filter(f=>{if(search&&!f.name.toLowerCase().includes(search.toLowerCase())&&!f.city.toLowerCase().includes(search.toLowerCase()))return false;if(region!=="All Regions"&&f.region!==region)return false;if(type!=="All Types"&&f.type!==type)return false;if(sp.length>0&&!sp.some(p=>f.products.includes(p)))return false;if(sf&&!favs.has(f.id))return false;return true;});if(sort==="distance"&&ul)r.sort((a,b)=>hav(ul.lat,ul.lng,a.lat,a.lng)-hav(ul.lat,ul.lng,b.lat,b.lng));else if(sort==="rating")r.sort((a,b)=>b.rating-a.rating);else r.sort((a,b)=>a.name.localeCompare(b.name));return r;},[search,region,type,sp,sf,favs,sort,ul]);

  const fids=useMemo(()=>new Set(filtered.map(f=>f.id)),[filtered]);
  const gd=f=>ul?hav(ul.lat,ul.lng,f.lat,f.lng):null;
  const hs=useCallback(f=>setSel(p=>p?.id===f.id?null:f),[]);
  const ca=()=>{setSearch("");setRegion("All Regions");setType("All Types");setSp([]);setSf(false);};
  const hf=search||region!=="All Regions"||type!=="All Types"||sp.length>0||sf;

  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:"#faf6ee",fontFamily:"'Inter',sans-serif",animation:"fadeIn 0.6s ease"}}>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      {/* HEADER — Modern minimal */}
      <header style={{background:"#fefcf7",padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,flexShrink:0,borderBottom:"1px solid #ede5d5"}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:14,background:"none",border:"none",cursor:"pointer",padding:0,outline:"none"}}>
          <Logo size={42}/>
          <div style={{textAlign:"left"}}>
            <h1 style={{margin:0,fontFamily:"'Fraunces',Georgia,serif",fontSize:20,fontWeight:600,color:"#1a1410",letterSpacing:"-0.3px"}}>Lone Star Farms</h1>
            <p style={{margin:0,fontSize:10,color:"#8a7a5a",fontWeight:500,letterSpacing:"0.5px",textTransform:"uppercase"}}>{FARMS.length} farms · {REGIONS.length-1} regions</p>
          </div>
        </button>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button style={{padding:"7px 14px",borderRadius:100,border:"1.5px solid #d4c4a8",background:"transparent",color:"#1a1410",fontSize:11,fontWeight:600,cursor:"pointer",outline:"none",fontFamily:"'Inter',sans-serif",letterSpacing:"0.3px"}}>List Your Farm</button>
          <button onClick={fm} disabled={loc} style={{padding:"7px 14px",borderRadius:100,border:`1.5px solid ${ul?"#5a7c3e":"#1a1410"}`,background:ul?"#5a7c3e":"#1a1410",color:"#fefcf7",fontSize:11,fontWeight:600,cursor:"pointer",outline:"none",fontFamily:"'Inter',sans-serif",letterSpacing:"0.3px"}}>{loc?"Locating...":ul?"📍 Near Me":"📍 Find Near Me"}</button>
        </div>
      </header>

      {/* FILTERS */}
      <div style={{background:"#fefcf7",borderBottom:"1px solid #ede5d5",padding:"12px 28px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <div style={{flex:"1 1 200px",display:"flex",alignItems:"center",gap:8,background:"#faf6ee",borderRadius:100,padding:"7px 14px",border:"1.5px solid #ede5d5",maxWidth:280}}>
            <span style={{fontSize:13}}>🔍</span><input type="text" placeholder="Search farms or cities..." value={search} onChange={e=>setSearch(e.target.value)} style={{border:"none",background:"transparent",outline:"none",fontFamily:"'Inter',sans-serif",fontSize:12,color:"#1a1410",width:"100%",fontWeight:500}}/>{search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",cursor:"pointer",color:"#8a7a5a",padding:0,outline:"none",fontSize:14}}>✕</button>}
          </div>
          <DD value={region} options={REGIONS} onChange={setRegion}/><DD value={type} options={TYPES} onChange={setType}/>
          <DD value={sort==="distance"?"📍 Nearest":sort==="rating"?"⭐ Top Rated":"A–Z"} options={["A–Z",...(ul?["📍 Nearest"]:[]),"⭐ Top Rated"]} onChange={v=>setSort(v.includes("Near")?"distance":v.includes("Top")?"rating":"name")}/>
          <button onClick={()=>setSf(!sf)} style={{padding:"7px 13px",borderRadius:100,fontSize:11,fontWeight:600,cursor:"pointer",border:sf?"1.5px solid #c0392b":"1.5px solid #d4c4a8",background:sf?"#fbe9e7":"transparent",color:sf?"#c0392b":"#1a1410",outline:"none",fontFamily:"'Inter',sans-serif"}}>♥ Saved{favs.size>0?` ${favs.size}`:""}</button>
          {hf&&<button onClick={ca} style={{padding:"7px 11px",borderRadius:100,fontSize:10,fontWeight:600,cursor:"pointer",border:"1.5px solid #c0392b",background:"transparent",color:"#c0392b",outline:"none"}}>Clear</button>}
          <span style={{fontSize:11,color:"#8a7a5a",fontWeight:500,marginLeft:"auto",fontFamily:"'Inter',sans-serif"}}>{filtered.length} of {FARMS.length}</span>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:10,alignItems:"center"}}>
          <span style={{fontSize:10,color:"#8a7a5a",fontWeight:600,marginRight:4,letterSpacing:"0.5px",textTransform:"uppercase"}}>Browse</span>
          {PRODUCTS.map(p=><button key={p} onClick={()=>tp(p)} style={{padding:"4px 10px",borderRadius:100,fontSize:11,fontWeight:500,cursor:"pointer",border:sp.includes(p)?"1.5px solid #5a7c3e":"1.5px solid #ede5d5",background:sp.includes(p)?"#e8efd8":"transparent",color:sp.includes(p)?"#3a5a1e":"#5a4a30",outline:"none",display:"flex",alignItems:"center",gap:3,fontFamily:"'Inter',sans-serif",transition:"all 0.15s"}}><span style={{fontSize:13}}>{ic(p)}</span>{p}</button>)}
        </div>
      </div>

      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        <div style={{flex:1,overflowY:"auto",padding:"20px 28px",background:"#faf6ee"}}>
          {filtered.length===0?<div style={{textAlign:"center",padding:"60px 20px",color:"#a09070"}}><div style={{fontSize:48}}>🌾</div><p style={{fontFamily:"'Fraunces',serif",fontSize:18,fontWeight:500,color:"#5a4a30"}}>No farms found</p></div>
          :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:14}}>
            {filtered.map(f=>{const tc=TS[f.type]||{};const isSel=sel?.id===f.id;const dist=gd(f);return(
              <button key={f.id} onClick={()=>hs(f)} style={{display:"block",width:"100%",textAlign:"left",background:isSel?"#fefcf7":"#fff",border:isSel?`1.5px solid ${tc.c}`:"1px solid #ede5d5",borderRadius:14,padding:"16px 18px",cursor:"pointer",transition:"all 0.2s",boxShadow:isSel?"0 6px 20px rgba(90,74,47,0.08)":"0 1px 2px rgba(0,0,0,0.02)",outline:"none",fontFamily:"'Inter',sans-serif"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}><span style={{fontSize:14}}>{tc.emoji}</span>{favs.has(f.id)&&<span style={{fontSize:10,color:"#c0392b"}}>♥</span>}<span style={{fontSize:9,padding:"2px 8px",borderRadius:100,background:tc.bg,color:tc.c,fontWeight:600,letterSpacing:"0.3px",textTransform:"uppercase"}}>{f.type}</span></div>
                    <h3 style={{margin:"4px 0 4px",fontSize:15,fontWeight:600,color:"#1a1410",fontFamily:"'Fraunces',Georgia,serif",lineHeight:1.25,letterSpacing:"-0.2px"}}>{f.name}</h3>
                    <div style={{fontSize:11,color:"#8a7a5a",fontWeight:500}}>{f.city}, TX · {f.schedule}</div>
                    {dist!==null&&<div style={{fontSize:10,color:"#5a7c3e",marginTop:3,fontWeight:600}}>{dist.toFixed(1)} mi away</div>}
                  </div>
                  <Stars r={f.rating} s/>
                </div>
                <div style={{display:"flex",gap:4,marginTop:10,paddingTop:10,borderTop:"1px solid #f5efe3"}}>{f.products.slice(0,7).map(p=><span key={p} title={p} style={{width:24,height:24,borderRadius:"50%",background:"#faf6ee",border:"1px solid #ede5d5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>{ic(p)}</span>)}{f.products.length>7&&<span style={{width:24,height:24,borderRadius:"50%",background:"#f5efe3",border:"1px solid #ede5d5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:600,color:"#8a7a5a"}}>+{f.products.length-7}</span>}</div>
              </button>);})}
          </div>}
        </div>

        <div style={{width:400,minWidth:360,flexShrink:0,display:"flex",flexDirection:"column",borderLeft:"1px solid #ede5d5",background:"#fefcf7"}}>
          <div style={{height:sel?"42%":"100%",flexShrink:0,transition:"height 0.3s"}}>
            <TexasMapD3 farms={FARMS} selected={sel} onSelect={hs} filteredIds={fids}/>
          </div>
          {sel&&(()=>{const tc=TS[sel.type]||{};const dist=gd(sel);return(
            <div style={{flex:1,overflowY:"auto",borderTop:"1px solid #ede5d5"}}>
              <div style={{background:`linear-gradient(135deg,${tc.c}f0,${tc.c}cc)`,padding:"18px 20px",position:"relative"}}>
                <button onClick={()=>setSel(null)} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,outline:"none"}}>✕</button>
                <span style={{fontSize:9,padding:"3px 10px",borderRadius:100,background:"rgba(255,255,255,0.2)",color:"#fff",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px"}}>{tc.emoji} {sel.type}</span>
                <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:500,color:"#fff",margin:"10px 0 4px",lineHeight:1.15,paddingRight:30,letterSpacing:"-0.3px"}}>{sel.name}</h2>
                <div style={{color:"rgba(255,255,255,0.85)",fontSize:11,fontWeight:500,letterSpacing:"0.3px"}}>{sel.city}, TEXAS{dist!==null?` · ${dist.toFixed(1)} MI AWAY`:""}</div>
              </div>
              <div style={{padding:"16px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <Stars r={sel.rating}/>
                  <button onClick={()=>tf(sel.id)} style={{background:favs.has(sel.id)?"#fbe9e7":"transparent",border:`1.5px solid ${favs.has(sel.id)?"#c0392b":"#d4c4a8"}`,borderRadius:100,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:600,color:favs.has(sel.id)?"#c0392b":"#1a1410",outline:"none",fontFamily:"'Inter',sans-serif"}}>{favs.has(sel.id)?"♥ Saved":"♡ Save"}</button>
                </div>
                <p style={{fontSize:13,color:"#3a3020",lineHeight:1.65,margin:"0 0 14px",fontWeight:400}}>{sel.description}</p>
                <div style={{background:"#faf6ee",borderRadius:12,padding:"14px 16px",border:"1px solid #ede5d5",marginBottom:12}}>
                  <div style={{fontSize:9,fontWeight:700,color:"#8a7a5a",letterSpacing:"1px",textTransform:"uppercase",marginBottom:8}}>What's Available</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{sel.products.map(p=><Chip key={p} name={p}/>)}</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                  {[{l:"Hours",v:sel.schedule},{l:"Season",v:sel.season},{l:"Accepts",v:sel.accepts.join(", ")},sel.phone?{l:"Phone",v:sel.phone}:null].filter(Boolean).map((item,i)=>(
                    <div key={i} style={{background:"#fff",borderRadius:8,padding:"9px 11px",border:"1px solid #ede5d5"}}><div style={{fontSize:8,fontWeight:700,color:"#8a7a5a",letterSpacing:"1px",textTransform:"uppercase",marginBottom:2}}>{item.l}</div><div style={{fontSize:11,color:"#1a1410",fontWeight:500}}>{item.v}</div></div>
                  ))}
                </div>
                <div style={{background:"#fff",borderRadius:8,padding:"10px 12px",border:"1px solid #ede5d5"}}>
                  <div style={{fontSize:8,fontWeight:700,color:"#8a7a5a",letterSpacing:"1px",textTransform:"uppercase",marginBottom:2}}>Address</div>
                  <div style={{fontSize:11,color:"#1a1410",fontWeight:500}}>{sel.address}</div>
                  {sel.website&&<div style={{fontSize:10,color:"#5a7c3e",fontWeight:600,marginTop:3}}>↗ {sel.website}</div>}
                </div>
              </div>
            </div>);})()}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════
// ROOT — toggles between landing & dashboard
// ════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("landing");

  if (page === "landing") {
    return <Landing onEnter={() => setPage("dashboard")}/>;
  }
  return <Dashboard onBack={() => setPage("landing")}/>;
}

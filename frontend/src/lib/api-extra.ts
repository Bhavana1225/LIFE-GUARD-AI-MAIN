/**
 * LifeGuard AI Extended APIs
 */

import { API_BASE, type AnalysisResult, type HealthProfile } from "./api";

export { API_BASE };


function simulate<T>(value:T, ms=700):Promise<T>{
  return new Promise((resolve)=>
    setTimeout(()=>resolve(value),ms)
  );
}


/* ================= EXPLAINABILITY ================= */


export interface Attribution {

  id:string;
  factor:string;
  contribution:number;
  direction:"raises"|"lowers";
  value:string;
  reference:string;
  status:"normal"|"borderline"|"abnormal";
  note:string;

}


export interface Explanation {

 modelVersion:string;
 confidence:number;
 dataCompleteness:number;
 attributions:Attribution[];
 caveats:string[];

}



export async function apiExplainRisk(
profile:HealthProfile,
result:AnalysisResult
):Promise<Explanation>{


const bmiDelta=Math.abs(result.bmi-22);

const symptomWords=
profile.symptoms.trim().split(/\s+/).filter(Boolean).length;



const attributions:Attribution[]=[

{
id:"bmi",
factor:"Body Mass Index",
contribution:30,
direction:bmiDelta>1?"raises":"lowers",
value:`${result.bmi}`,
reference:"18.5 - 24.9",
status:"normal",
note:"BMI contribution"
},


{
id:"symptoms",
factor:"Symptoms",
contribution:25,
direction:symptomWords>0?"raises":"lowers",
value:`${symptomWords} symptoms`,
reference:"None",
status:"normal",
note:"Symptoms influence risk"
},


{
id:"age",
factor:"Age",
contribution:20,
direction:profile.age>40?"raises":"lowers",
value:`${profile.age}`,
reference:"Age factor",
status:"normal",
note:"Age based risk"
}

];


return simulate({

modelVersion:"lifeguard-risk-v2.3",

confidence:85,

dataCompleteness:90,

attributions,

caveats:[

"AI screening only",

"Not a medical diagnosis",

"Consult doctor for decisions"

]

},500);


}





/* ================= PHARMACY ================= */



export interface Product{


id:string;

name:string;

brand:string;

category:
"medicine" |
"supplement" |
"device" |
"wellness";


price:number;

rxRequired:boolean;

rationale:string;


}





export async function apiProducts(
search:string=""
):Promise<Product[]>{


const url = `${API_BASE}/medicine/search?name=${encodeURIComponent(search)}`;



const response = await fetch(url);



if(!response.ok){

throw new Error(
"Medicine API failed"
);

}



const data = await response.json();
console.log("Medicine count:", data.count);
console.log(data.results);



if(!data.results){

return [];

}



return data.results.map(
(medicine:any,index:number)=>{


let price=50;



const text =
medicine.package_container || "";



const match =
text.match(/(\d+\.?\d*)/);



if(match){

price=Number(match[1]);

}



return{


id:String(index),


name:
medicine.brand_name ||
"Unknown Medicine",



brand:
medicine.manufacturer ||
"Unknown",



category:"medicine",



price,



rxRequired:false,



rationale:

`${medicine.generic || ""}
 |
${medicine.strength || ""}
 |
${medicine.dosage_form || ""}`


};


}

);



}






/* ================= ORDER ================= */



export interface OrderResult{

id:string;

total:number;

items:number;

eta:string;

}




export async function apiPlaceOrder(

items:{
product:Product;
qty:number;
}[]

):Promise<OrderResult>{



const total =
items.reduce(
(sum,item)=>
sum+
(item.product.price*item.qty),

0
);



return{


id:
`ord_${Date.now()}`,

total:
Math.round(total*100)/100,


items:
items.reduce(
(sum,item)=>sum+item.qty,
0
),


eta:
"2 - 3 business days"


};


} 
/* ================= NEARBY FACILITIES ================= */

export interface Facility {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  rating: number;
  distance: number;
  open: boolean;
}

export async function apiNearbyFacilities(
  place: string = ""
): Promise<Facility[]> {

  if (!place.trim()) return [];

  const response = await fetch(
    `${API_BASE}/nearby?place=${encodeURIComponent(place)}`
  );

  if (!response.ok) {
    throw new Error("Unable to load nearby hospitals");
  }

  return await response.json();
}
export const apiDoctors = async (): Promise<Doctor[]> => {
  const response = await fetch("http://localhost:8000/doctors");

  if (!response.ok) {
    throw new Error("Failed to fetch doctors");
  }

  return await response.json();
};
export const apiTriggerSos = async (
  contacts: EmergencyContact[],
  note: string
): Promise<SosResult> => {

  const response = await fetch("http://localhost:8000/sos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contacts,
      message: note,
    }),
  });

  if (!response.ok) {
    throw new Error("SOS request failed");
  }

  return await response.json();
};
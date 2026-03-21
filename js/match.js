// ================= CLEAN TEXT =================
function cleanText(text){
if(!text) return "";   // ✅ FIX: prevents undefined error
return text.toLowerCase().trim();
}

// ================= KEYWORD MATCH =================
function keywordMatch(a, b){

a = cleanText(a);
b = cleanText(b);

let wordsA = a.split(" ").filter(w => w.length > 0);
let wordsB = b.split(" ").filter(w => w.length > 0);

let count = 0;

wordsA.forEach(word=>{
if(wordsB.includes(word)){
count++;
}
});

return count;
}

// ================= FUZZY MATCH =================
function fuzzyMatch(a, b){

a = cleanText(a);
b = cleanText(b);

if(!a || !b) return 0;

let matches = 0;

for(let i=0;i<Math.min(a.length,b.length);i++){
if(a[i] === b[i]){
matches++;
}
}

return matches / Math.max(a.length,b.length);
}

// ================= LOCATION MATCH =================
function locationMatch(a, b){

a = cleanText(a);
b = cleanText(b);

if(!a || !b) return 0;

// partial match allowed
if(a.includes(b) || b.includes(a)){
return 1;
}

return 0;
}

// ================= FINAL SCORE =================
function getMatchScore(a, b){

let score = 0;

// 🔹 Exact name match (high priority)
if(cleanText(a.itemName) === cleanText(b.itemName)){
score += 5;
}

// 🔹 Keyword similarity (description)
score += keywordMatch(a.description, b.description);

// 🔹 Fuzzy similarity (handles typos)
score += fuzzyMatch(a.itemName, b.itemName) * 3;

// 🔹 Location match (very important)
if(cleanText(a.location) === cleanText(b.location)){
score += 4;
} else {
score += locationMatch(a.location, b.location) * 2;
}

// 🔹 Category match
if(cleanText(a.category) === cleanText(b.category)){
score += 2;
}

return score;
}

// ================= FIND MATCHES =================
async function findMatches(newItem){

try{

const snapshot = await db.collection("lostItems").get();

let results = [];

snapshot.forEach(doc=>{

const item = doc.data();

// ❌ Skip same user's item
if(item.userEmail === newItem.userEmail) return;

const score = getMatchScore(newItem, item);

// 🎯 Threshold (tune this if needed)
if(score > 2){
results.push({
id: doc.id,
data: item,
score: score
});
}

});

// 🔥 Sort best matches first
results.sort((a,b)=> b.score - a.score);

return results;

}catch(error){

console.error("Match error:", error);
return [];

}

}
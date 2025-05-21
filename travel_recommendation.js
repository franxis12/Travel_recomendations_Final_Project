document.getElementById("searchForm").addEventListener("submit", function (e){
    e.preventDefault();

    const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
    const resultsDiv = document.getElementById("results");

    fetch("./travel_recommendation_api.json")
    .then(res => res.json())
    .then(data => {
        resultsDiv.innerHTML = "";

        let resultToShow = [];

        if(keyword.includes("beach")){
            resultToShow = data.beaches;
        } else if (keyword.includes("temple")){
            resultToShow = data.temples;
        } else if (keyword.includes("country") || keyword.includes("countries")) {
            data.countries.forEach(country => {
                resultToShow.push(...country.cities);    
            });
        } else {
            resultsDiv.innerHTML = "<p> No matches found.</p>";
            return;
        }

        resultToShow.forEach(place => {
            const card = document.createElement("div");
            card.classList.add("cardContent");
            card.innerHTML = `
            <h2 class="cardTitle">${place.name}</h2>
            <img src="${place.imageUrl}" alt="${place.name}" class="cardImg">
            <p>${place.description}</p>
            <button class="cardBtn btnSearch">Visit</button>
            
            `;
            
            resultsDiv.appendChild(card);

        });
    })
    .catch(err => {
        resultsDiv.innerHTML = "<p>Error loading data.</p>";
        console.error(err);
    })
})

document.getElementById("clearBtn").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  document.getElementById("results").innerHTML = "";
});